"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { FACTION_INFO, getAvatarUrl, getXPForNextLevel, isProfileComplete } from "@/lib/auth";
import { ClearanceBadge } from "./ClearanceBadge";
import { XPBar } from "./XPBar";
import Link from "next/link";

interface OperativeCardProps {
  compact?: boolean;
  className?: string;
}

export function OperativeCard({ compact = false, className = "" }: OperativeCardProps) {
  const { operative } = useAuth();
  if (!operative) return null;

  const hasProfile = isProfileComplete(operative);
  const displayName = operative.callsign ?? `${operative.walletAddress.slice(0, 4)}...${operative.walletAddress.slice(-4)}`;
  const faction = operative.faction;
  const factionInfo = faction ? FACTION_INFO[faction] : null;
  const factionColor = factionInfo?.color ?? "#6B7280";
  const xpInfo = getXPForNextLevel(operative.xp);
  const avatarSeed = operative.callsign ?? operative.walletAddress;
  const avatarStyle = operative.avatarStyle ?? "bottts";
  const avatarUrl = getAvatarUrl(avatarStyle, avatarSeed, compact ? 32 : 48);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div
          className="w-6 h-6 shrink-0 overflow-hidden border"
          style={{
            borderColor: `${factionColor}50`,
            clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt={displayName ?? "avatar"} className="w-full h-full" />
        </div>
        <span className="font-mono text-sm text-white tracking-wider">
          {displayName}
        </span>
        <ClearanceBadge level={operative.clearanceLevel} />
      </div>
    );
  }

  return (
    <div
      className={`p-4 border ${className}`}
      style={{
        borderColor: `${factionColor}30`,
        background: `${factionColor}08`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 shrink-0 overflow-hidden border"
          style={{
            borderColor: `${factionColor}40`,
            clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt={displayName ?? "avatar"} className="w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-sm font-bold text-white tracking-wider">
              {displayName}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            {factionInfo ? (
              <span
                className="font-mono text-[10px] tracking-[0.2em]"
                style={{ color: factionColor }}
              >
                {factionInfo.name}
              </span>
            ) : (
              <Link href="/auth" className="font-mono text-[10px] tracking-[0.2em] text-gray-500 hover:text-sentinel-cyan transition-colors">
                OPTIONAL PROFILE
              </Link>
            )}
            <ClearanceBadge level={operative.clearanceLevel} />
          </div>
          {hasProfile && (
            <XPBar current={xpInfo.current} required={xpInfo.required} progress={xpInfo.progress} />
          )}
          <div className="font-mono text-[10px] text-gray-600 mt-1.5 truncate">
            {operative.walletAddress.slice(0, 4)}...{operative.walletAddress.slice(-4)}
          </div>
        </div>
      </div>
    </div>
  );
}
