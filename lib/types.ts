export type DebateRound = {
  round: number;
  pro: string;
  con: string;
};

export type DebateResponse = {
  topic: string;
  rounds: DebateRound[];
};
