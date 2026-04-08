"use client";

import React, { useEffect, useState, useRef } from "react";

const events = [
  { type: "register", msg: "Operative 7xK2...mP9q deployed with 2.5 SOL bond", color: "#39FF14" },
  { type: "monitor", msg: "Operative 3fR1...yN4w completed 5 operations", color: "#00E5CC" },
  { type: "violation", msg: "ALERT: Operative 9aB5...kL2d exceeded transfer ceiling", color: "#FF0033" },
  { type: "arrest", msg: "CONTAINMENT: Operative 9aB5...kL2d frozen on-chain", color: "#FF0033" },
  { type: "bail", msg: "Extraction fee posted: 0.8 SOL for Operative 9aB5...kL2d", color: "#FF9B26" },
  { type: "vote", msg: "Council 4pQ8...vR3s voted PAROLE", color: "#FF9B26" },
  { type: "vote", msg: "Council 2nT6...wX1a voted PAROLE — threshold met", color: "#FF9B26" },
  { type: "parole", msg: "Operative 9aB5...kL2d released — RESTRICTED status", color: "#FF9B26" },
  { type: "register", msg: "Operative 5mC4...hJ7e deployed with 1.0 SOL bond", color: "#39FF14" },
  { type: "reinstate", msg: "Operative 6dW3...pT8f probation complete — OPERATIONAL", color: "#39FF14" },
  { type: "monitor", msg: "Operative 7xK2...mP9q within operational parameters", color: "#00E5CC" },
  { type: "violation", msg: "ALERT: Operative 1bF9...qS5g unauthorized program call", color: "#FF0033" },
];

const icons: Record<string, string> = {
  register: "▸",
  monitor: "◉",
  violation: "⚠",
  arrest: "◈",
  bail: "◇",
  vote: "⬡",
  parole: "◎",
  reinstate: "✓",
};

export function ActivityFeed() {
  const [visibleEvents, setVisibleEvents] = useState<{ id: number; event: typeof events[0] }[]>([]);
  const idxRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % events.length;
      setVisibleEvents((vEvents) => {
        const updated = [{ id: Date.now(), event: events[idxRef.current] }, ...vEvents];
        return updated.slice(0, 5);
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="max-w-xl mx-auto overflow-hidden border"
      style={{
        borderColor: "rgba(0, 229, 204, 0.15)",
        background: "rgba(11, 13, 26, 0.6)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(0, 229, 204, 0.1)" }}>
        <span
          className="w-1.5 h-1.5 rounded-full bg-warden-cyan"
          style={{ animation: "statusBlink 1.5s ease-in-out infinite" }}
        />
        <span className="font-mono text-[10px] text-warden-cyan tracking-[0.2em]">COMMS INTERCEPT</span>
        <span className="ml-auto font-mono text-[10px] text-gray-700 tracking-wider">DEVNET</span>
      </div>

      {/* Events */}
      <div className="h-[200px] relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[rgba(11,13,26,0.95)] to-transparent z-10 pointer-events-none" />
        <div className="p-3 space-y-0.5">
          {visibleEvents.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2 px-2 py-1.5 transition-all duration-500"
              style={{
                animation: "fadeSlideIn 0.5s ease-out forwards",
              }}
            >
              <span
                className="text-[10px] mt-0.5 shrink-0 font-mono"
                style={{ color: item.event.color }}
              >
                {icons[item.event.type] || "·"}
              </span>
              <span className="text-[11px] leading-relaxed font-mono" style={{ color: `${item.event.color}CC` }}>
                {item.event.msg}
              </span>
            </div>
          ))}
          {visibleEvents.length === 0 && (
            <div className="text-center py-8 text-gray-700 text-xs font-mono tracking-wider">
              AWAITING TRANSMISSIONS...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
