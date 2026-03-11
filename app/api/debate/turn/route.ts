import OpenAI from "openai";
import { NextResponse } from "next/server";
import { agentSystemPrompt, buildAgentUserPrompt } from "@/lib/prompts";
import type { DebateRound, DebateStyle } from "@/lib/types";

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
  responseLength?: number;
  temperature?: number;
  style?: DebateStyle;
}) {
  const { side, topic, round, priorPro, priorCon, responseLength = 380, temperature = 0.7, style = "academic" } = args;

  const system = agentSystemPrompt(side, style);
  const user = buildAgentUserPrompt({ topic, round, priorPro, priorCon });

  const resp = await client.chat.completions.create({
    model: safeModel(),
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    max_tokens: responseLength,
    temperature: temperature
  });

  return resp.choices[0]?.message?.content?.trim() || "";
}

export async function POST(req: Request) {
  try {
    assertEnv();

    const body = (await req.json()) as { 
      topic?: string; 
      round?: number; 
      side?: "pro" | "con";
      priorRounds?: DebateRound[];
      responseLength?: number;
      temperature?: number;
      style?: DebateStyle;
      maxRounds?: number;
    };
    
    const { 
      topic, 
      round = 1, 
      side = "pro", 
      priorRounds = [], 
      responseLength = 380,
      temperature = 0.7,
      style = "academic",
      maxRounds = 3
    } = body;
    
    const trimmedTopic = (topic || "").trim();

    if (trimmedTopic.length < 8) {
      return new NextResponse("Topic is too short.", { status: 400 });
    }

    if (!side || !["pro", "con"].includes(side)) {
      return new NextResponse("Invalid side. Must be 'pro' or 'con'.", { status: 400 });
    }

    if (!round || round < 1 || round > maxRounds) {
      return new NextResponse(`Invalid round. Must be between 1 and ${maxRounds}.`, { status: 400 });
    }

    if (responseLength && (responseLength < 100 || responseLength > 1000)) {
      return new NextResponse("Response length must be between 100 and 1000 tokens.", { status: 400 });
    }

    if (temperature && (temperature < 0 || temperature > 2)) {
      return new NextResponse("Temperature must be between 0 and 2.", { status: 400 });
    }

    if (style && !["academic", "aggressive", "diplomatic"].includes(style)) {
      return new NextResponse("Style must be 'academic', 'aggressive', or 'diplomatic'.", { status: 400 });
    }

    // Extract prior arguments from previous rounds
    const priorPro = priorRounds.map(r => r.pro).filter(Boolean);
    const priorCon = priorRounds.map(r => r.con).filter(Boolean);

    const content = await generateTurn({ 
      side, 
      topic: trimmedTopic, 
      round, 
      priorPro, 
      priorCon,
      responseLength,
      temperature,
      style
    });

    return NextResponse.json({ content });
  } catch (err: any) {
    const message = err?.message || "Server error";
    return new NextResponse(message, { status: 500 });
  }
}
