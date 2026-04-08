"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { FACTION_INFO, getAvatarUrl, getXPForNextLevel } from "@/lib/auth";
import { ClearanceBadge } from "./ClearanceBadge";
import { XPBar } from "./XPBar";

interface OperativeCardProps {
  compact?: boolean;
  className?: string;
}

export function OperativeCard({ compact = false, className = "" }: OperativeCardProps) {
  const { operative } = useAuth();
  if (!operative) return null;

  const factionInfo = FACTION_INFO[operative.faction];
  const xpInfo = getXPForNextLevel(operative.xp);
  const avatarUrl = getAvatarUrl(operative.avatarStyle || "bottts", operative.callsign, compact ? 32 : 48);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div
          className="w-6 h-6 shrink-0 overflow-hidden border"
          style={{
            borderColor: `${factionInfo.color}50`,
            clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt={operative.callsign} className="w-full h-full" />
        </div>
        <span className="font-mono text-sm text-white tracking-wider">
          {operative.callsign}
        </span>
        <ClearanceBadge level={operative.clearanceLevel} />
      </div>
    );
  }

  return (
    <div
      className={`p-4 border ${className}`}
      style={{
        borderColor: `${factionInfo.color}30`,
        background: `${factionInfo.color}08`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 shrink-0 overflow-hidden border"
          style={{
            borderColor: `${factionInfo.color}40`,
            clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt={operative.callsign} className="w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-sm font-bold text-white tracking-wider">
              {operative.callsign}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className="font-mono text-[10px] tracking-[0.2em]"
              style={{ color: factionInfo.color }}
            >
              {factionInfo.name}
            </span>
            <ClearanceBadge level={operative.clearanceLevel} />
          </div>
          <XPBar current={xpInfo.current} required={xpInfo.required} progress={xpInfo.progress} />
          <div className="font-mono text-[10px] text-gray-600 mt-1.5 truncate">
            {operative.walletAddress.slice(0, 4)}...{operative.walletAddress.slice(-4)}
          </div>
        </div>
      </div>
    </div>
  );
}
