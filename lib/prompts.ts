export type Side = "pro" | "con";

export function agentSystemPrompt(side: Side) {
  const common = `You are one of two debate agents.

Rules:
- Stay on your assigned side.
- Be rigorous, steelman the opposing side before rebutting it.
- No personal attacks.
- Keep it very concise: 60-80 words per turn.
- ALWAYS use bullet points (•) for your arguments
- Start each bullet point with a strong verb or key point
- Use 2-3 bullet points maximum per turn
- If the topic is ambiguous, state assumptions clearly and proceed.`;

  if (side === "pro") {
    return `${common}

You are the PRO agent. Argue in favor of the proposition.`;
  }
  return `${common}

You are the CON agent. Argue against the proposition.`;
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
