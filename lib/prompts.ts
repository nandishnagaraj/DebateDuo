import type { DebateStyle } from "./types";

export type Side = "pro" | "con";

export function agentSystemPrompt(side: Side, style: DebateStyle = "academic") {
  const baseRules = `You are one of two debate agents.

Rules:
- Stay on your assigned side.
- Be rigorous, steelman the opposing side before rebutting.
- No personal attacks.
- Use bullet points (•) for your arguments
- Start each bullet point with a strong verb or key point
- If the topic is ambiguous, state assumptions clearly and proceed.
- NEVER include reference links, URLs, citations, or source attributions.`;

  const styleInstructions = {
    academic: {
      tone: "academic",
      guidelines: "- Use evidence-based reasoning without citing specific sources\n- Reference studies and frameworks generally without URLs or citations\n- Maintain formal, scholarly tone\n- Focus on policy implications\n- Use precise terminology\n- NO reference links, URLs, or citations"
    },
    aggressive: {
      tone: "aggressive",
      guidelines: "- Use strong, persuasive language\n- Challenge opponent's assumptions directly\n- Emphasize urgency and consequences\n- Use rhetorical questions\n- Focus on winning the argument\n- NO reference links, URLs, or citations"
    },
    diplomatic: {
      tone: "diplomatic",
      guidelines: "- Use respectful, measured tone\n- Acknowledge valid points from opposition\n- Focus on common ground and compromise\n- Use collaborative language\n- Emphasize mutual benefits\n- NO reference links, URLs, or citations"
    }
  };

  const selectedStyle = styleInstructions[style];
  const wordCount = style === "academic" ? "80-100" : style === "aggressive" ? "60-80" : "70-90";

  const common = `${baseRules}
- Keep it very concise: ${wordCount} words per turn.
- Use 2-3 bullet points maximum per turn.
- Debate style: ${selectedStyle.tone}
${selectedStyle.guidelines}`;

  if (side === "pro") {
    return `${common}

You are the PRO agent. Argue in favor of the proposition with ${selectedStyle.tone} approach.`;
  }
  
  return `${common}

You are the CON agent. Argue against the proposition with ${selectedStyle.tone} approach.`;
}

export function roundInstruction(round: number) {
  switch (round) {
    case 1:
      return "Round 1 (Opening): Present 2-3 bullet points with your main arguments.";
    case 2:
      return "Round 2 (Rebuttal): Use 2-3 bullet points to counter opponent's arguments.";
    case 3:
      return "Round 3 (Closing): Use 2-3 bullet points for your final summary.";
    default:
      return `Round ${round}: Continue with bullet points.`;
  }
}

export function buildAgentUserPrompt(args: {
  topic: string;
  round: number;
  priorPro: string[];
  priorCon: string[];
}) {
  const { topic, round, priorPro, priorCon } = args;

  const proHistory = priorPro.map((t, i) => `PRO R${i + 1}: ${t}`).join("\n\n");
  const conHistory = priorCon.map((t, i) => `CON R${i + 1}: ${t}`).join("\n\n");

  return `Debate topic (user):
"""
${topic.trim()}
"""

${roundInstruction(round)}

Debate so far:
${proHistory || "(none)"}

${conHistory || "(none)"}

IMPORTANT: Format your response as bullet points using • symbol.
Output only your bullet points (no labels or preamble).`;
}
