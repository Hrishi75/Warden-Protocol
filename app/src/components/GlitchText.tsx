"use client";

import React, { useState, useEffect } from "react";

interface GlitchTextProps {
  children: string;
  intensity?: "low" | "medium" | "high";
  interval?: number;
  className?: string;
}

const intensityConfig = {
  low: { duration: 150, frequency: 8000 },
  medium: { duration: 200, frequency: 4000 },
  high: { duration: 300, frequency: 2000 },
};

export function GlitchText({
  children,
  intensity = "low",
  interval,
  className = "",
}: GlitchTextProps) {
  const [active, setActive] = useState(false);
  const config = intensityConfig[intensity];
  const freq = interval || config.frequency;

  useEffect(() => {
    const trigger = setInterval(() => {
      setActive(true);
      setTimeout(() => setActive(false), config.duration);
    }, freq);
    return () => clearInterval(trigger);
  }, [freq, config.duration]);

  return (
    <span
      className={`glitch-text ${active ? "active" : ""} ${className}`}
      data-text={children}
    >
      {children}
    </span>
  );
}
