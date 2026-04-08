"use client";

import React from "react";

interface HUDFrameProps {
  children: React.ReactNode;
  color?: "cyan" | "orange" | "red" | "green" | "purple";
  label?: string;
  className?: string;
  animated?: boolean;
}

const colorMap = {
  cyan: { border: "rgba(0, 229, 204, 0.2)", corner: "#00E5CC", label: "#00E5CC" },
  orange: { border: "rgba(255, 155, 38, 0.2)", corner: "#FF9B26", label: "#FF9B26" },
  red: { border: "rgba(255, 0, 51, 0.2)", corner: "#FF0033", label: "#FF0033" },
  green: { border: "rgba(57, 255, 20, 0.2)", corner: "#39FF14", label: "#39FF14" },
  purple: { border: "rgba(108, 92, 231, 0.2)", corner: "#6C5CE7", label: "#6C5CE7" },
};

export function HUDFrame({
  children,
  color = "cyan",
  label,
  className = "",
  animated = false,
}: HUDFrameProps) {
  const c = colorMap[color];

  return (
    <div
      className={`relative p-6 ${className}`}
      style={{
        border: `1px solid ${c.border}`,
        background: "rgba(11, 13, 26, 0.6)",
      }}
    >
      {/* Corner brackets */}
      {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => {
        const isTop = pos.includes("top");
        const isLeft = pos.includes("left");
        return (
          <div
            key={pos}
            className={animated ? "animate-neon-pulse" : ""}
            style={{
              position: "absolute",
              [isTop ? "top" : "bottom"]: "-1px",
              [isLeft ? "left" : "right"]: "-1px",
              width: "16px",
              height: "16px",
              borderColor: c.corner,
              borderStyle: "solid",
              borderWidth: `${isTop ? "2px" : "0"} ${!isLeft ? "2px" : "0"} ${!isTop ? "2px" : "0"} ${isLeft ? "2px" : "0"}`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Label */}
      {label && (
        <div
          className="absolute -top-3 left-4 px-2 font-mono text-[10px] tracking-[0.2em] uppercase"
          style={{ color: c.label, background: "var(--background)" }}
        >
          {label}
        </div>
      )}

      {children}
    </div>
  );
}
