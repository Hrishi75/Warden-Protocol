"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { StatusBadge, getStatusFromAccount } from "./StatusBadge";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface AgentCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agent: any;
  insuranceTier?: "Basic" | "Standard" | "Premium" | null;
  onClick?: () => void;
  href?: string;
}

const statusBorderColors: Record<string, string> = {
  Active: "rgba(57, 255, 20, 0.3)",
  Arrested: "rgba(255, 0, 51, 0.3)",
  Paroled: "rgba(255, 155, 38, 0.3)",
  Terminated: "rgba(107, 114, 128, 0.2)",
};

const tierColors: Record<string, string> = {
  Basic: "#00E5CC",
  Standard: "#FF9B26",
  Premium: "#6C5CE7",
};

export function AgentCard({ agent, insuranceTier, onClick, href }: AgentCardProps) {
  const status = getStatusFromAccount(agent.status);
  const identity = agent.agentIdentity.toBase58();
  const borderColor = statusBorderColors[status] || "rgba(0, 229, 204, 0.2)";
  const content = (
    <motion.div
      onClick={onClick}
      className="relative p-5 transition-colors duration-300 cursor-pointer group"
      style={{
        border: `1px solid ${borderColor}`,
        background: "rgba(11, 13, 26, 0.6)",
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Corner brackets */}
      {["top-left", "bottom-right"].map((pos) => {
        const isTop = pos === "top-left";
        return (
          <div
            key={pos}
            style={{
              position: "absolute",
              [isTop ? "top" : "bottom"]: "-1px",
              [isTop ? "left" : "right"]: "-1px",
              width: "12px",
              height: "12px",
              borderColor: "#00E5CC",
              borderStyle: "solid",
              borderWidth: `${isTop ? "2px" : "0"} ${!isTop ? "2px" : "0"} ${!isTop ? "2px" : "0"} ${isTop ? "2px" : "0"}`,
              pointerEvents: "none",
              opacity: 0.5,
            }}
          />
        );
      })}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-mono text-sm tracking-wider">
            {identity.slice(0, 4)}...{identity.slice(-4)}
          </h3>
          {insuranceTier && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wider"
              style={{
                color: tierColors[insuranceTier],
                border: `1px solid ${tierColors[insuranceTier]}40`,
                background: `${tierColors[insuranceTier]}10`,
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
              </svg>
              {insuranceTier.toUpperCase()}
            </span>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Stats */}
      <div className="space-y-2.5 font-mono text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600 tracking-wider">DEPOSIT</span>
          <span className="text-sentinel-cyan">
            {(agent.stakeAmount.toNumber() / LAMPORTS_PER_SOL).toFixed(2)} SOL
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 tracking-wider">VIOLATIONS</span>
          <span
            className={
              agent.violations.length > 0
                ? "text-alert-red"
                : "text-hud-green"
            }
          >
            {agent.violations.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 tracking-wider">MAX TRANSFER</span>
          <span className="text-gray-400">
            {(
              agent.permissions.maxTransferLamports.toNumber() /
              LAMPORTS_PER_SOL
            ).toFixed(2)}{" "}
            SOL
          </span>
        </div>
        {agent.paroleTerms && (
          <div className="flex justify-between">
            <span className="text-gray-600 tracking-wider">STRIKES LEFT</span>
            <span className="text-sentinel-orange font-bold">
              {agent.paroleTerms.strikesRemaining}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-sentinel-border/20 font-mono text-[10px] tracking-[0.2em] text-sentinel-cyan group-hover:text-white transition-colors">
        VIEW SAFETY PASSPORT
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
