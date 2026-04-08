"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { FACTION_INFO, AVATAR_STYLES, getAvatarUrl, Faction, getXPForNextLevel } from "@/lib/auth";
import { AuthGuard } from "@/components/AuthGuard";
import { HUDFrame } from "@/components/HUDFrame";
import { ClearanceBadge } from "@/components/ClearanceBadge";
import { XPBar } from "@/components/XPBar";
import { ThreatScore } from "@/components/ThreatScore";
import { computeTrustScore, TrustScoreResult } from "@/lib/fraudScore";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { getProvider, getProgram, fetchAgent } from "@/lib/program";
import { PublicKey } from "@solana/web3.js";

const CLEARANCE_LABELS: Record<number, string> = {
  1: "RECRUIT",
  2: "OPERATIVE",
  3: "AGENT",
  4: "COMMANDER",
  5: "DIRECTOR",
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

function ProfileContent() {
  const { operative, updateProfile, signOut, linkWallet, unlinkWallet } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editCallsign, setEditCallsign] = useState("");
  const [editFaction, setEditFaction] = useState<Faction>("sentinel");
  const [editAvatarStyle, setEditAvatarStyle] = useState("bottts");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // On-chain agent data
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [trustScore, setTrustScore] = useState<TrustScoreResult | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState("");

  // Wallet linking state
  const [linkingWallet, setLinkingWallet] = useState(false);
  const [linkError, setLinkError] = useState("");

  // Fetch on-chain agent data for trust score
  useEffect(() => {
    if (!anchorWallet || !operative) return;
    let cancelled = false;

    async function loadAgent() {
      setAgentLoading(true);
      setAgentError("");
      try {
        const provider = getProvider(connection, anchorWallet!);
        const program = getProgram(provider);
        const agent = await fetchAgent(program, new PublicKey(operative!.walletAddress));
        if (!cancelled) {
          setTrustScore(computeTrustScore(agent));
        }
      } catch {
        if (!cancelled) {
          setTrustScore(null);
          setAgentError("NO AGENT DEPLOYED");
        }
      } finally {
        if (!cancelled) setAgentLoading(false);
      }
    }

    loadAgent();
    return () => { cancelled = true; };
  }, [anchorWallet, connection, operative]);

  const handleLinkWallet = async () => {
    setLinkError("");
    setLinkingWallet(true);
    try {
      await linkWallet();
    } catch (err: unknown) {
      setLinkError(err instanceof Error ? err.message : "Failed to link wallet");
    } finally {
      setLinkingWallet(false);
    }
  };

  if (!operative) return null;

  const factionInfo = FACTION_INFO[operative.faction];
  const xpInfo = getXPForNextLevel(operative.xp);

  const startEditing = () => {
    setEditCallsign(operative.callsign);
    setEditFaction(operative.faction);
    setEditAvatarStyle(operative.avatarStyle || "bottts");
    setEditing(true);
    setError("");
    setSaved(false);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError("");
  };

  const saveChanges = () => {
    if (!editCallsign.trim()) {
      setError("Callsign required");
      return;
    }
    if (editCallsign.length < 3 || editCallsign.length > 20) {
      setError("Callsign must be 3-20 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(editCallsign)) {
      setError("Callsign: alphanumeric, hyphens, underscores only");
      return;
    }

    updateProfile({
      callsign: editCallsign,
      faction: editFaction,
      avatarStyle: editAvatarStyle,
    });

    setEditing(false);
    setError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const registeredDate = new Date(operative.registeredAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // The seed for DiceBear — use callsign for deterministic avatars
  const avatarSeed = operative.callsign;
  const editAvatarSeed = editCallsign || operative.callsign;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-start justify-between mb-8 gap-4" variants={fadeUp}>
        <div>
          <div className="font-mono text-xs text-warden-cyan/50 tracking-[0.3em] mb-2">
            IDENTITY TERMINAL
          </div>
          <h1 className="text-3xl font-bold font-mono text-white tracking-tight">
            OPERATIVE DOSSIER
          </h1>
          <p className="text-gray-600 font-mono text-sm mt-1 tracking-wide">
            View and manage your operative identity
          </p>
        </div>
        {!editing && (
          <motion.button
            onClick={startEditing}
            className="btn-hud !py-2 !px-4 text-xs"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            EDIT PROFILE
          </motion.button>
        )}
      </motion.div>

      {/* Success toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-3 border border-hud-green/30 bg-hud-green/10 font-mono text-sm text-hud-green"
          >
            PROFILE UPDATED SUCCESSFULLY
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {editing ? (
          /* ===== EDIT MODE ===== */
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <HUDFrame color="orange" label="EDIT IDENTITY" className="scanline-overlay">
              <div className="space-y-6">
                {/* Callsign */}
                <div>
                  <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2 uppercase">
                    Operative Callsign
                  </label>
                  <input
                    type="text"
                    value={editCallsign}
                    onChange={(e) => setEditCallsign(e.target.value)}
                    className="cyber-input text-lg"
                    maxLength={20}
                    autoFocus
                  />
                </div>

                {/* Faction */}
                <div>
                  <label className="block font-mono text-xs text-gray-500 tracking-widest mb-3 uppercase">
                    Faction
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(FACTION_INFO) as Faction[]).map((f) => {
                      const info = FACTION_INFO[f];
                      const isSelected = editFaction === f;
                      return (
                        <motion.button
                          key={f}
                          onClick={() => setEditFaction(f)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 text-left transition-all duration-200 border ${
                            isSelected
                              ? "border-opacity-60"
                              : "border-warden-border hover:border-opacity-40"
                          }`}
                          style={{
                            borderColor: isSelected ? info.color : undefined,
                            backgroundColor: isSelected ? `${info.color}10` : "rgba(11, 13, 26, 0.6)",
                            boxShadow: isSelected ? `0 0 20px ${info.color}15` : undefined,
                          }}
                        >
                          <div className="font-mono text-sm font-bold tracking-wider mb-1" style={{ color: info.color }}>
                            {info.name}
                          </div>
                          <div className="text-gray-500 text-xs leading-relaxed">
                            {info.description}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Avatar Style Picker */}
                <div>
                  <label className="block font-mono text-xs text-gray-500 tracking-widest mb-3 uppercase">
                    Operative Avatar
                  </label>

                  {/* Preview */}
                  <div className="flex items-center gap-5 mb-5 p-4 border border-warden-cyan/20 bg-warden-cyan/5">
                    <div
                      className="w-24 h-24 shrink-0 border-2 avatar-glow overflow-hidden"
                      style={{
                        borderColor: `${factionInfo.color}60`,
                        ["--glow-color" as string]: `${factionInfo.color}40`,
                        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getAvatarUrl(editAvatarStyle, editAvatarSeed, 128)}
                        alt="Avatar preview"
                        className="w-full h-full"
                      />
                    </div>
                    <div>
                      <div className="font-mono text-sm text-warden-cyan tracking-wider mb-1">
                        {AVATAR_STYLES.find(s => s.id === editAvatarStyle)?.label || "MECH"}
                      </div>
                      <div className="font-mono text-xs text-gray-500">
                        {AVATAR_STYLES.find(s => s.id === editAvatarStyle)?.desc || ""}
                      </div>
                      <div className="font-mono text-[10px] text-gray-600 mt-1">
                        SEED: {editAvatarSeed}
                      </div>
                    </div>
                  </div>

                  {/* Style Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AVATAR_STYLES.map((style) => {
                      const isSelected = editAvatarStyle === style.id;
                      return (
                        <motion.button
                          key={style.id}
                          onClick={() => setEditAvatarStyle(style.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`avatar-card ${isSelected ? "avatar-card-selected" : ""}`}
                        >
                          <div className="w-16 h-16 mb-2 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getAvatarUrl(style.id, editAvatarSeed, 80)}
                              alt={style.label}
                              className="w-full h-full"
                            />
                          </div>
                          <div className={`font-mono text-[10px] tracking-wider ${isSelected ? "text-warden-cyan" : "text-gray-500"}`}>
                            {style.label}
                          </div>
                          <div className="font-mono text-[9px] text-gray-600 mt-0.5">
                            {style.desc}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="font-mono text-sm text-alert-red bg-alert-red/10 border border-alert-red/30 p-3"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={saveChanges}
                    className="btn-hud flex-1 py-3 text-sm"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    SAVE CHANGES
                  </motion.button>
                  <motion.button
                    onClick={cancelEditing}
                    className="btn-secondary flex-1 py-3 text-sm font-mono tracking-wider"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    CANCEL
                  </motion.button>
                </div>
              </div>
            </HUDFrame>
          </motion.div>
        ) : (
          /* ===== VIEW MODE ===== */
          <motion.div
            key="view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Identity Card */}
            <HUDFrame color="cyan" label="IDENTITY">
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div
                  className="w-24 h-24 shrink-0 border-2 avatar-glow overflow-hidden"
                  style={{
                    borderColor: `${factionInfo.color}60`,
                    ["--glow-color" as string]: `${factionInfo.color}40`,
                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getAvatarUrl(operative.avatarStyle || "bottts", avatarSeed, 128)}
                    alt={operative.callsign}
                    className="w-full h-full"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Callsign */}
                  <h2 className="text-2xl font-bold font-mono text-white tracking-wider mb-1">
                    {operative.callsign}
                  </h2>

                  {/* Faction + Clearance */}
                  <div className="flex items-center gap-4 mb-3">
                    <span className="font-mono text-xs tracking-[0.2em]" style={{ color: factionInfo.color }}>
                      {factionInfo.name}
                    </span>
                    <ClearanceBadge level={operative.clearanceLevel} />
                    <span className="font-mono text-xs text-gray-600 tracking-wider">
                      {CLEARANCE_LABELS[operative.clearanceLevel]}
                    </span>
                  </div>

                  {/* XP */}
                  <XPBar current={xpInfo.current} required={xpInfo.required} progress={xpInfo.progress} />
                </div>
              </div>
            </HUDFrame>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HUDFrame color="cyan" label="WALLET" className="!p-4">
                <div className="font-mono text-xs text-gray-500 tracking-wider mb-1">ADDRESS</div>
                <div className="font-mono text-sm text-warden-cyan break-all">
                  {operative.walletAddress}
                </div>
              </HUDFrame>

              <HUDFrame color="cyan" label="REGISTRATION" className="!p-4">
                <div className="font-mono text-xs text-gray-500 tracking-wider mb-1">ENROLLED</div>
                <div className="font-mono text-sm text-white">
                  {registeredDate}
                </div>
              </HUDFrame>
            </div>

            {/* Connected Wallets */}
            <HUDFrame color="cyan" label={`CONNECTED WALLETS (${1 + operative.linkedWallets.length})`}>
              <div className="space-y-3">
                {/* Primary wallet */}
                <div className="flex items-center justify-between p-3 border border-warden-cyan/20 bg-warden-cyan/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-[10px] tracking-widest text-warden-cyan bg-warden-cyan/10 px-2 py-0.5 shrink-0">
                      PRIMARY
                    </span>
                    <span className="font-mono text-xs text-gray-300 truncate">
                      {operative.walletAddress}
                    </span>
                  </div>
                </div>

                {/* Linked wallets */}
                {operative.linkedWallets.map((w) => (
                  <div
                    key={w.address}
                    className="flex items-center justify-between p-3 border border-warden-border/30 bg-warden-bg/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[10px] tracking-widest text-gray-500 bg-gray-500/10 px-2 py-0.5 shrink-0">
                        LINKED
                      </span>
                      <span className="font-mono text-xs text-gray-300 truncate">
                        {w.address}
                      </span>
                    </div>
                    <motion.button
                      onClick={() => unlinkWallet(w.address)}
                      className="font-mono text-[10px] text-alert-red/70 hover:text-alert-red tracking-wider shrink-0 ml-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      UNLINK
                    </motion.button>
                  </div>
                ))}

                {/* Link wallet button */}
                <div className="pt-2">
                  <motion.button
                    onClick={handleLinkWallet}
                    disabled={linkingWallet}
                    className="btn-hud !py-2 !px-4 text-xs w-full disabled:opacity-40"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {linkingWallet ? "SIGNING..." : "LINK CURRENT WALLET"}
                  </motion.button>
                  <p className="font-mono text-[10px] text-gray-600 mt-2 text-center">
                    Switch to a different wallet in your adapter, then click to link it
                  </p>
                </div>

                <AnimatePresence>
                  {linkError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="font-mono text-xs text-alert-red bg-alert-red/10 border border-alert-red/30 p-2"
                    >
                      {linkError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </HUDFrame>

            {/* Threat Assessment / Trust Score */}
            <HUDFrame color={trustScore ? (trustScore.score >= 70 ? "cyan" : "orange") : "cyan"} label="THREAT ASSESSMENT">
              {agentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="font-mono text-xs text-gray-500 tracking-widest animate-pulse">
                    SCANNING AGENT RECORD...
                  </div>
                </div>
              ) : trustScore ? (
                <ThreatScore result={trustScore} />
              ) : (
                <div className="flex flex-col items-center py-6 gap-3">
                  <div className="font-mono text-sm text-gray-500 tracking-wider">
                    {agentError || "NO AGENT DEPLOYED"}
                  </div>
                  <p className="font-mono text-[10px] text-gray-600 text-center max-w-xs">
                    Deploy an agent on-chain to generate your threat assessment score.
                    Your score is computed from violations, status, and parole history.
                  </p>
                </div>
              )}
            </HUDFrame>

            {/* Stats */}
            <HUDFrame color="cyan" label="STATS" className="!p-0">
              {[
                { label: "Clearance Level", value: `L${operative.clearanceLevel} — ${CLEARANCE_LABELS[operative.clearanceLevel]}` },
                { label: "Experience Points", value: `${operative.xp} XP` },
                { label: "Faction", value: factionInfo.name },
                { label: "Avatar Style", value: AVATAR_STYLES.find(s => s.id === operative.avatarStyle)?.label || "MECH" },
                { label: "Signature", value: `${operative.signature.slice(0, 8)}...${operative.signature.slice(-8)}` },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  className={`flex justify-between items-center px-5 py-3 ${
                    i < arr.length - 1 ? "border-b border-warden-border/20" : ""
                  }`}
                >
                  <span className="text-gray-500 font-mono text-xs tracking-wider">{item.label}</span>
                  <span className="text-white font-mono text-xs font-bold">{item.value}</span>
                </div>
              ))}
            </HUDFrame>

            {/* Danger Zone */}
            <HUDFrame color="red" label="DANGER ZONE" className="!p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-white mb-1">Delete Operative Identity</p>
                  <p className="font-mono text-xs text-gray-600">
                    This will remove your profile. You can re-register anytime.
                  </p>
                </div>
                <motion.button
                  onClick={signOut}
                  className="btn-hud-danger px-4 py-2 text-xs font-mono tracking-wider border border-alert-red/40 shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  DELETE IDENTITY
                </motion.button>
              </div>
            </HUDFrame>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
