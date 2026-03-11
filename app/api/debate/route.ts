import OpenAI from "openai";
import { NextResponse } from "next/server";
import { agentSystemPrompt, buildAgentUserPrompt } from "@/lib/prompts";
import type { DebateRound, DebateResponse } from "@/lib/types";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_API_BASE}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': '2024-12-01-preview' }
});

function assertEnv() {
  if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_API_BASE || !process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
    throw new Error(
      "Missing Azure OpenAI configuration. Set AZURE_OPENAI_API_KEY, AZURE_OPENAI_API_BASE, and AZURE_OPENAI_DEPLOYMENT_NAME in .env file."
    );
  }
}

function safeModel() {
  // Use Azure OpenAI deployment name
  return process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4";
}

async function generateTurn(args: {
  side: "pro" | "con";
  topic: string;
  round: number;
  priorPro: string[];
  priorCon: string[];
}) {
  const { side, topic, round, priorPro, priorCon } = args;

  const system = agentSystemPrompt(side);
  const user = buildAgentUserPrompt({ topic, round, priorPro, priorCon });

  const resp = await client.chat.completions.create({
    model: safeModel(),
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    // Keep outputs reasonably bounded.
    max_tokens: 380
  });

  return resp.choices[0]?.message?.content?.trim() || "";
}

export async function POST(req: Request) {
  try {
    assertEnv();

    const body = (await req.json()) as { topic?: string };
    const topic = (body.topic || "").trim();

    if (topic.length < 8) {
      return new NextResponse("Topic is too short.", { status: 400 });
    }

    const rounds: DebateRound[] = [];
    const priorPro: string[] = [];
    const priorCon: string[] = [];

    // 3 rounds: opening, rebuttal, closing
    for (let round = 1; round <= 3; round++) {
      const [pro, con] = await Promise.all([
        generateTurn({ side: "pro", topic, round, priorPro, priorCon }),
        generateTurn({ side: "con", topic, round, priorPro, priorCon })
      ]);

      priorPro.push(pro);
      priorCon.push(con);
      rounds.push({ round, pro, con });
    }

    const out: DebateResponse = { topic, rounds };
    return NextResponse.json(out);
  } catch (err: any) {
    const message = err?.message || "Server error";
    return new NextResponse(message, { status: 500 });
  }
}
