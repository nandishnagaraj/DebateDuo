export type DebateRound = {
  round: number;
  pro: string;
  con: string;
};

export type DebateResponse = {
  topic: string;
  rounds: DebateRound[];
};

export type DebateStyle = "academic" | "aggressive" | "diplomatic";

export type DebateParameters = {
  rounds: number;
  responseLength: number;
  temperature: number;
  style: DebateStyle;
};
