"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrustScoreResult } from "@/lib/fraudScore";

interface ThreatScoreProps {
  result: TrustScoreResult;
}

export function ThreatScore({ result }: ThreatScoreProps) {
  const { score, grade, color, factors } = result;

  // SVG circular gauge
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Circular Gauge */}
      <div className="relative w-36 h-36 shrink-0">
        <svg viewBox="0 0 128 128" className="w-full h-full">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          {/* Score arc */}
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="butt"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            transform="rotate(-90 64 64)"
            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold font-mono"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {grade}
          </motion.span>
          <motion.span
            className="text-xs font-mono text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {score}/100
          </motion.span>
        </div>
      </div>

      {/* Factors */}
      <div className="flex-1 space-y-2 w-full">
        <div className="font-mono text-xs text-gray-500 tracking-widest mb-3">
          RISK FACTORS
        </div>
        {factors.map((factor, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-start gap-2 font-mono text-xs"
          >
            <span style={{ color }} className="mt-0.5 shrink-0">
              {score >= 70 ? "+" : "!"}
            </span>
            <span className="text-gray-300">{factor}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
