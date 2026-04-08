"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: "glass" | "hud";
  glow?: "cyan" | "orange" | "purple" | "coral";
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = "",
  hover = false,
  variant = "glass",
  glow,
  onClick,
}: GlassCardProps) {
  const glowClass = glow ? `shadow-glow-${glow}` : "";
  const hoverClass = hover
    ? "hover:scale-[1.02] hover:shadow-glow-cyan transition-all duration-300 cursor-pointer"
    : "transition-all duration-300";

  if (variant === "hud") {
    return (
      <div
        onClick={onClick}
        className={`hud-frame ${hoverClass} ${glowClass} ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`glass-card ${hoverClass} ${glowClass} ${className}`}
    >
      {children}
    </div>
  );
}
