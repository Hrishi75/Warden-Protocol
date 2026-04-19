"use client";

import React from "react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  centered = true,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`${centered ? "text-center" : ""} mb-12 ${className}`}>
      <div className="font-mono text-xs text-sentinel-cyan/30 tracking-[0.3em] mb-3">
        {"// "}{title.toUpperCase()}
      </div>
      <h2 className="text-2xl md:text-3xl font-bold font-mono text-white tracking-tight mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-500 text-sm font-mono max-w-2xl mx-auto tracking-wide">{subtitle}</p>
      )}
    </div>
  );
}
