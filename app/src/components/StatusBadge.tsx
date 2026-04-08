"use client";

import React from "react";

type Status = "Active" | "Arrested" | "Paroled" | "Terminated";

const statusConfig: Record<Status, { color: string; bg: string; label: string; borderColor: string }> = {
  Active: {
    color: "#39FF14",
    bg: "rgba(57, 255, 20, 0.08)",
    label: "OPERATIONAL",
    borderColor: "rgba(57, 255, 20, 0.3)",
  },
  Arrested: {
    color: "#FF0033",
    bg: "rgba(255, 0, 51, 0.08)",
    label: "CONTAINED",
    borderColor: "rgba(255, 0, 51, 0.3)",
  },
  Paroled: {
    color: "#FF9B26",
    bg: "rgba(255, 155, 38, 0.08)",
    label: "RESTRICTED",
    borderColor: "rgba(255, 155, 38, 0.3)",
  },
  Terminated: {
    color: "#6B7280",
    bg: "rgba(107, 114, 128, 0.08)",
    label: "NEUTRALIZED",
    borderColor: "rgba(107, 114, 128, 0.3)",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.15em]"
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === "Active" ? "animate-pulse" : ""}`}
        style={{
          backgroundColor: config.color,
          boxShadow: status !== "Terminated" ? `0 0 6px ${config.borderColor}` : undefined,
        }}
      />
      {config.label}
    </span>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getStatusFromAccount(status: any): Status {
  if ("active" in status) return "Active";
  if ("arrested" in status) return "Arrested";
  if ("paroled" in status) return "Paroled";
  if ("terminated" in status) return "Terminated";
  return "Active";
}
