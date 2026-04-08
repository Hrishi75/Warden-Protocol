"use client";

import React from "react";
import { HUDFrame } from "./HUDFrame";

const violationTypeLabels: Record<string, string> = {
  exceededTransferLimit: "EXCEEDED TRANSFER CEILING",
  unauthorizedProgram: "UNAUTHORIZED PROGRAM",
  rateLimitBreached: "RATE LIMIT BREACHED",
  paroleViolation: "PAROLE VIOLATION",
  other: "OTHER",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getViolationLabel(violationType: any): string {
  for (const key of Object.keys(violationType)) {
    if (violationTypeLabels[key]) return violationTypeLabels[key];
  }
  return "UNKNOWN";
}

interface RapSheetProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  violations: any[];
}

export function RapSheet({ violations }: RapSheetProps) {
  if (violations.length === 0) {
    return (
      <div className="text-gray-600 text-xs font-mono py-4 text-center tracking-wider">
        CLEAN RECORD — NO INCIDENTS
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-white font-mono text-xs tracking-[0.2em]">
        INCIDENT LOG ({violations.length})
      </h3>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {violations.map((v: any, i: number) => (
        <HUDFrame
          key={i}
          color="red"
          className="!p-3 animate-slide-up"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-alert-red font-mono text-[10px] tracking-wider font-bold">
              {getViolationLabel(v.violationType)}
            </span>
            <span className="text-gray-600 font-mono text-[10px]">
              {new Date(v.timestamp.toNumber() * 1000).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-400 text-xs font-mono">{v.description}</p>
        </HUDFrame>
      ))}
    </div>
  );
}
