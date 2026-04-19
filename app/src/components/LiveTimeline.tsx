"use client";

import React, { useEffect, useState, useRef } from "react";

const timelineSteps = [
  { label: "DEPLOY", status: "active", color: "#39FF14", desc: "Operative posts 1 SOL bond" },
  { label: "MONITOR", status: "active", color: "#00E5CC", desc: "Within operational parameters" },
  { label: "INCIDENT", status: "arrested", color: "#FF0033", desc: "0.5 SOL transfer — 5x ceiling" },
  { label: "CONTAIN", status: "arrested", color: "#FF0033", desc: "Frozen by Sentinel system" },
  { label: "BAIL", status: "arrested", color: "#FF9B26", desc: "Owner posts extraction fee" },
  { label: "TRIBUNAL", status: "paroled", color: "#FF9B26", desc: "2/3 council votes Parole" },
  { label: "RESTRICT", status: "paroled", color: "#FF9B26", desc: "Reduced perms, 3 strikes" },
  { label: "REINSTATE", status: "active", color: "#39FF14", desc: "Probation complete" },
];

export function LiveTimeline() {
  const [activeStep, setActiveStep] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    let step = -1;
    const interval = setInterval(() => {
      step++;
      if (step >= timelineSteps.length) {
        step = -1;
        setActiveStep(-1);
        setTimeout(() => {
          step = 0;
          setActiveStep(0);
        }, 1500);
        return;
      }
      setActiveStep(step);
    }, 1800);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div ref={ref} className="w-full max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="relative h-[2px] bg-sentinel-border/30 mb-8 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
          style={{
            width: activeStep >= 0 ? `${((activeStep + 1) / timelineSteps.length) * 100}%` : "0%",
            background: activeStep >= 0 ? `linear-gradient(90deg, #00E5CC, ${timelineSteps[activeStep]?.color || "#00E5CC"})` : "transparent",
            boxShadow: activeStep >= 0 ? `0 0 12px ${timelineSteps[activeStep]?.color || "#00E5CC"}40` : "none",
          }}
        />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {timelineSteps.map((step, i) => {
          const isActive = i === activeStep;
          const isPast = i < activeStep;
          return (
            <div
              key={i}
              className={`text-center transition-all duration-500 ${
                isActive ? "scale-110" : isPast ? "opacity-60" : "opacity-25"
              }`}
            >
              <div className="flex justify-center mb-2">
                <div
                  className="w-2.5 h-2.5 transition-all duration-500"
                  style={{
                    backgroundColor: isPast || isActive ? step.color : "#1E2140",
                    boxShadow: isActive ? `0 0 12px ${step.color}, 0 0 24px ${step.color}40` : "none",
                  }}
                />
              </div>
              <p
                className="font-mono text-[10px] font-bold tracking-wider transition-colors duration-300"
                style={{ color: isActive ? step.color : isPast ? step.color + "99" : "#2A2D45" }}
              >
                {step.label}
              </p>
              <p
                className={`text-[9px] font-mono mt-1 transition-all duration-300 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                style={{ color: step.color + "cc" }}
              >
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <span
          className="w-1.5 h-1.5 rounded-full bg-sentinel-cyan"
          style={{ animation: "statusBlink 1.5s ease-in-out infinite" }}
        />
        <span className="font-mono text-[10px] text-gray-600 tracking-[0.2em]">LIVE SIMULATION</span>
      </div>
    </div>
  );
}
