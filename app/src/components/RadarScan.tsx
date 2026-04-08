"use client";

import React from "react";

interface RadarScanProps {
  size?: number;
  blips?: { x: number; y: number; color?: string; label?: string }[];
  className?: string;
}

export function RadarScan({ size = 200, blips = [], className = "" }: RadarScanProps) {
  const center = size / 2;
  const radius = size / 2 - 10;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background */}
        <circle cx={center} cy={center} r={radius} fill="rgba(0, 229, 204, 0.02)" stroke="rgba(0, 229, 204, 0.15)" strokeWidth="1" />
        <circle cx={center} cy={center} r={radius * 0.66} fill="none" stroke="rgba(0, 229, 204, 0.1)" strokeWidth="0.5" />
        <circle cx={center} cy={center} r={radius * 0.33} fill="none" stroke="rgba(0, 229, 204, 0.1)" strokeWidth="0.5" />

        {/* Cross hair */}
        <line x1={center} y1={10} x2={center} y2={size - 10} stroke="rgba(0, 229, 204, 0.08)" strokeWidth="0.5" />
        <line x1={10} y1={center} x2={size - 10} y2={center} stroke="rgba(0, 229, 204, 0.08)" strokeWidth="0.5" />

        {/* Center dot */}
        <circle cx={center} cy={center} r="2" fill="#00E5CC" opacity="0.5" />

        {/* Blips */}
        {blips.map((blip, i) => {
          const bx = center + (blip.x / 100) * radius;
          const by = center + (blip.y / 100) * radius;
          return (
            <g key={i}>
              <circle cx={bx} cy={by} r="3" fill={blip.color || "#00E5CC"} opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
              </circle>
              <circle cx={bx} cy={by} r="6" fill="none" stroke={blip.color || "#00E5CC"} strokeWidth="0.5" opacity="0.3">
                <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Sweep line */}
      <div
        className="absolute top-0 left-0 w-full h-full animate-radar-sweep"
        style={{ transformOrigin: "center center" }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="sweep" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(0, 229, 204, 0.3)" />
            </linearGradient>
          </defs>
          <path
            d={`M ${center} ${center} L ${center} ${10} A ${radius} ${radius} 0 0 1 ${center + radius * Math.sin(Math.PI / 6)} ${center - radius * Math.cos(Math.PI / 6)} Z`}
            fill="url(#sweep)"
          />
        </svg>
      </div>
    </div>
  );
}
