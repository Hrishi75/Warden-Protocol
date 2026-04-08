"use client";

import React from "react";

interface ClearanceBadgeProps {
  level: number;
  className?: string;
}

const levelConfig: Record<number, { color: string; glow: string }> = {
  1: { color: "#6B7280", glow: "rgba(107, 114, 128, 0.3)" },
  2: { color: "#39FF14", glow: "rgba(57, 255, 20, 0.3)" },
  3: { color: "#00E5CC", glow: "rgba(0, 229, 204, 0.3)" },
  4: { color: "#FF9B26", glow: "rgba(255, 155, 38, 0.3)" },
  5: { color: "#FF0033", glow: "rgba(255, 0, 51, 0.3)" },
};

export function ClearanceBadge({ level, className = "" }: ClearanceBadgeProps) {
  const config = levelConfig[level] || levelConfig[1];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs tracking-widest ${className}`}
      style={{
        color: config.color,
        textShadow: `0 0 8px ${config.glow}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: config.color,
          boxShadow: `0 0 6px ${config.glow}`,
        }}
      />
      LEVEL {level}
    </span>
  );
}
