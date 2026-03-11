"use client";

import { useMemo, useState } from "react";
import type { DebateResponse, DebateParameters, DebateStyle } from "@/lib/types";
import { DebateColumn } from "@/components/DebateColumn";

export default function Page() {
  const [topic, setTopic] = useState<string>(
    "Should organizations adopt a 4-day workweek as default?"
  );
  const [data, setData] = useState<DebateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<{ round: number; side: "pro" | "con" } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // Debate parameters
  const [parameters, setParameters] = useState<DebateParameters>({
    rounds: 3,
    responseLength: 380,
    temperature: 0.7,
    style: "academic"
  });

  const rounds = useMemo(() => data?.rounds ?? [], [data]);

  async function startDebate() {
    setError(null);
    setData(null);
    setCurrentTurn(null);
    setIsLoading(true);

    try {
      // Start turn-by-turn simulation with configurable rounds
      for (let round = 1; round <= parameters.rounds; round++) {
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
            priorRounds: data?.rounds?.slice(0, round - 1) || [],
            responseLength: parameters.responseLength,
            temperature: parameters.temperature,
            style: parameters.style,
            maxRounds: parameters.rounds
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
            priorRounds: data?.rounds?.slice(0, round - 1) || [],
            responseLength: parameters.responseLength,
            temperature: parameters.temperature,
            style: parameters.style,
            maxRounds: parameters.rounds
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

      {/* Debate Parameters */}
      <div className="card" style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Debate Parameters</div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 16 
        }}>
          {/* Number of Rounds */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
              🔁 Number of rounds: {parameters.rounds}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={parameters.rounds}
              onChange={(e) => setParameters(prev => ({ ...prev, rounds: parseInt(e.target.value) }))}
              style={{ width: '100%', marginBottom: 4 }}
              disabled={isLoading}
            />
            <div className="sub">1-5 rounds</div>
          </div>

          {/* Response Length */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
              📏 Response length: {parameters.responseLength} tokens
            </label>
            <input
              type="range"
              min="100"
              max="800"
              step="50"
              value={parameters.responseLength}
              onChange={(e) => setParameters(prev => ({ ...prev, responseLength: parseInt(e.target.value) }))}
              style={{ width: '100%', marginBottom: 4 }}
              disabled={isLoading}
            />
            <div className="sub">100-800 tokens</div>
          </div>

          {/* Temperature */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
              🌡 Temperature: {parameters.temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={parameters.temperature}
              onChange={(e) => setParameters(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              style={{ width: '100%', marginBottom: 4 }}
              disabled={isLoading}
            />
            <div className="sub">0.0 (focused) - 2.0 (creative)</div>
          </div>

          {/* Debate Style */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
              🧠 Debate style
            </label>
            <select
              value={parameters.style}
              onChange={(e) => setParameters(prev => ({ ...prev, style: e.target.value as DebateStyle }))}
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'rgba(3, 7, 18, 0.55)',
                color: 'var(--text)',
                fontSize: '14px'
              }}
              disabled={isLoading}
            >
              <option value="academic">🎓 Academic</option>
              <option value="aggressive">⚔️ Aggressive</option>
              <option value="diplomatic">🤝 Diplomatic</option>
            </select>
            <div className="sub">
              {parameters.style === "academic" && "Evidence-based, formal tone"}
              {parameters.style === "aggressive" && "Strong, persuasive language"}
              {parameters.style === "diplomatic" && "Respectful, collaborative approach"}
            </div>
          </div>
        </div>
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
          totalRounds={parameters.rounds}
        />
        <DebateColumn
          title="Agent B"
          badge="AGAINST"
          rounds={rounds}
          side="con"
          isLoading={isLoading}
          currentTurn={currentTurn}
          isTyping={isTyping}
          totalRounds={parameters.rounds}
        />
      </div>

      {/* Footer */}
      <footer className="footer">
        <div style={{ textAlign: 'center', opacity: 0.7, fontSize: '11px' }}>
          Developed by <a href="https://github.com/nandishnagaraj" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>nandishnagaraj</a>
        </div>
      </footer>
    </main>
  );
}
