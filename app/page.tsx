"use client";

import { useMemo, useState } from "react";
import type { DebateResponse } from "@/lib/types";
import { DebateColumn } from "@/components/DebateColumn";

export default function Page() {
  const [topic, setTopic] = useState<string>(
    "Should organizations adopt a 4-day workweek as the default?"
  );
  const [data, setData] = useState<DebateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<{ round: number; side: "pro" | "con" } | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const rounds = useMemo(() => data?.rounds ?? [], [data]);

  async function startDebate() {
    setError(null);
    setData(null);
    setCurrentTurn(null);
    setIsLoading(true);

    try {
      // Start turn-by-turn simulation
      for (let round = 1; round <= 3; round++) {
        // Pro turn
        setCurrentTurn({ round, side: "pro" });
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thinking
        
        const proResponse = await fetch("/api/debate/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            topic, 
            round, 
            side: "pro",
            priorRounds: data?.rounds?.slice(0, round - 1) || []
          })
        });
        
        if (!proResponse.ok) {
          const msg = await proResponse.text();
          throw new Error(msg || `Pro turn failed: ${proResponse.status}`);
        }
        
        const proResult = await proResponse.json();
        setIsTyping(false);
        
        // Update data with pro turn
        setData(prevData => {
          const newRounds = [...(prevData?.rounds || [])];
          if (!newRounds[round - 1]) {
            newRounds[round - 1] = { round, pro: "", con: "" };
          }
          newRounds[round - 1].pro = proResult.content;
          return { topic, rounds: newRounds };
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
        
        // Con turn
        setCurrentTurn({ round, side: "con" });
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thinking
        
        const conResponse = await fetch("/api/debate/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            topic, 
            round, 
            side: "con",
            priorRounds: data?.rounds?.slice(0, round - 1) || []
          })
        });
        
        if (!conResponse.ok) {
          const msg = await conResponse.text();
          throw new Error(msg || `Con turn failed: ${conResponse.status}`);
        }
        
        const conResult = await conResponse.json();
        setIsTyping(false);
        
        // Update data with con turn
        setData(prevData => {
          const newRounds = [...(prevData?.rounds || [])];
          if (!newRounds[round - 1]) {
            newRounds[round - 1] = { round, pro: "", con: "" };
          }
          newRounds[round - 1].con = conResult.content;
          return { topic, rounds: newRounds };
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between rounds
      }
      
      setCurrentTurn(null);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setCurrentTurn(null);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="header">
        <div>
          <div className="h1">Debate Duo</div>
          <div className="sub">
            Two AI agents debate topics with real-time turn-based interaction.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Debate topic</div>
            <textarea
              className="textarea"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic or a proposition…"
            />
            <div className="sub" style={{ marginTop: 8 }}>
              Tip: provide a clear proposition (e.g., “X should Y”).
            </div>
          </div>

          <button
            className="btn"
            onClick={startDebate}
            disabled={isLoading || topic.trim().length < 8}
            title={topic.trim().length < 8 ? "Enter a longer topic" : ""}
          >
            {isLoading ? "Debating…" : "Start debate"}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 10, color: "#fca5a5" }}>
            <b>Error:</b> {error}
          </div>
        )}
      </div>

      <div className="grid">
        <DebateColumn
          title="Agent A"
          badge="FOR"
          rounds={rounds}
          side="pro"
          isLoading={isLoading}
          currentTurn={currentTurn}
          isTyping={isTyping}
        />
        <DebateColumn
          title="Agent B"
          badge="AGAINST"
          rounds={rounds}
          side="con"
          isLoading={isLoading}
          currentTurn={currentTurn}
          isTyping={isTyping}
        />
      </div>
    </main>
  );
}
