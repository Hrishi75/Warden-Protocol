"use client";

import React from "react";

interface XPBarProps {
  current: number;
  required: number;
  progress: number;
  className?: string;
}

export function XPBar({ current, required, progress, className = "" }: XPBarProps) {
  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] text-gray-500 tracking-wider">XP</span>
        <span className="font-mono text-[10px] text-gray-500">
          {current} / {required}
        </span>
      </div>
      <div className="h-1 bg-warden-border/50 overflow-hidden">
        <div
          className="h-full transition-all duration-1000 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #00E5CC, #FF9B26)",
            boxShadow: "0 0 8px rgba(0, 229, 204, 0.3)",
          }}
        />
      </div>
    </div>
  );
}
