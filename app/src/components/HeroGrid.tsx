"use client";

import React from "react";

export function HeroGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated perspective grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 229, 204, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 204, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 70%)",
        }}
      />

      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-px opacity-[0.06]"
        style={{
          background: "linear-gradient(90deg, transparent, #00E5CC 30%, #FF9B26 70%, transparent)",
          animation: "scanLine 6s ease-in-out infinite",
        }}
      />

      {/* Glowing intersection dots */}
      {[
        { x: "20%", y: "25%", delay: "0s", size: 3 },
        { x: "80%", y: "30%", delay: "2s", size: 2 },
        { x: "35%", y: "70%", delay: "4s", size: 2 },
        { x: "65%", y: "20%", delay: "1s", size: 3 },
        { x: "50%", y: "55%", delay: "3s", size: 2 },
        { x: "15%", y: "50%", delay: "5s", size: 2 },
        { x: "85%", y: "65%", delay: "2.5s", size: 3 },
      ].map((dot, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-sentinel-cyan"
          style={{
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            animation: `statusBlink 3s ease-in-out infinite ${dot.delay}`,
            boxShadow: "0 0 8px rgba(0, 229, 204, 0.5)",
          }}
        />
      ))}
    </div>
  );
}
