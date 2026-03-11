import type { DebateRound } from "@/lib/types";

export function DebateColumn(props: {
  title: string;
  badge: string;
  rounds: DebateRound[];
  side: "pro" | "con";
  isLoading: boolean;
  currentTurn?: { round: number; side: "pro" | "con" } | null;
  isTyping?: boolean;
}) {
  const { title, badge, rounds, side, isLoading, currentTurn, isTyping } = props;

  const getRoundName = (round: number) => {
    switch (round) {
      case 1: return "Opening";
      case 2: return "Rebuttal";
      case 3: return "Closing";
      default: return `Round ${round}`;
    }
  };

  return (
    <div className="card">
      <div className="colTitle">
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
          <div className="sub">Side: {side.toUpperCase()}</div>
        </div>
        <span className="badge">{badge}</span>
      </div>

      {rounds.length === 0 && !isLoading && (
        <div className="sub">No debate yet. Enter a topic and start.</div>
      )}

      {isLoading && rounds.length === 0 && (
        <div className="sub">Starting debate…</div>
      )}

      {currentTurn && currentTurn.side === side && (
        <div className="turn">
          <div className="turnHeader">{getRoundName(currentTurn.round)} - {isTyping ? "Thinking..." : "Responding"}</div>
          {isTyping && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
      )}

      {rounds.map((r) => (
        <div key={`${side}-${r.round}`} className="turn">
          <div className="turnHeader">{getRoundName(r.round)}</div>
          <div className="prewrap">{side === "pro" ? r.pro : r.con}</div>
        </div>
      ))}
    </div>
  );
}
