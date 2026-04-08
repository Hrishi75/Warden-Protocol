"use client";

import React from "react";
import { motion } from "framer-motion";
import { StatusBadge, getStatusFromAccount } from "./StatusBadge";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface AgentCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agent: any;
  onClick?: () => void;
}

const statusBorderColors: Record<string, string> = {
  Active: "rgba(57, 255, 20, 0.3)",
  Arrested: "rgba(255, 0, 51, 0.3)",
  Paroled: "rgba(255, 155, 38, 0.3)",
  Terminated: "rgba(107, 114, 128, 0.2)",
};

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const status = getStatusFromAccount(agent.status);
  const identity = agent.agentIdentity.toBase58();
  const borderColor = statusBorderColors[status] || "rgba(0, 229, 204, 0.2)";

  return (
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
        <h3 className="text-white font-mono text-sm tracking-wider">
          {identity.slice(0, 4)}...{identity.slice(-4)}
        </h3>
        <StatusBadge status={status} />
      </div>

      {/* Stats */}
      <div className="space-y-2.5 font-mono text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600 tracking-wider">BOND</span>
          <span className="text-warden-cyan">
            {(agent.stakeAmount.toNumber() / LAMPORTS_PER_SOL).toFixed(2)} SOL
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 tracking-wider">INCIDENTS</span>
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
          <span className="text-gray-600 tracking-wider">TRANSFER CEILING</span>
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
            <span className="text-warden-orange font-bold">
              {agent.paroleTerms.strikesRemaining}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
