"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { WalletButton } from "@/components/WalletButton";
import { FACTION_INFO, AVATAR_STYLES, getAvatarUrl, Faction } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function AuthPage() {
  const { isAuthenticated, walletConnected, signIn, isLoading } = useAuth();
  const router = useRouter();

  const [callsign, setCallsign] = useState("");
  const [faction, setFaction] = useState<Faction>("sentinel");
  const [avatarStyle, setAvatarStyle] = useState("bottts");
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Terminal boot sequence
  useEffect(() => {
    const lines = [
      "> SENTINEL PROTOCOL v1.0.0",
      "> Initializing secure connection...",
      "> Neural link established",
      "> OPERATIVE REGISTRATION TERMINAL",
      "> Awaiting identity authorization...",
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setTerminalLines((prev) => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async () => {
    if (!callsign.trim()) {
      setError("Callsign required");
      return;
    }
    if (callsign.length < 3 || callsign.length > 20) {
      setError("Callsign must be 3-20 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(callsign)) {
      setError("Callsign: alphanumeric, hyphens, underscores only");
      return;
    }

    setError("");
    setSigning(true);

    try {
      await signIn(callsign, faction, avatarStyle);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authorization failed");
      setSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-warden-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-8">
      <motion.div
        className="w-full max-w-2xl"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Terminal Header */}
        <div className="mb-6 font-mono text-xs space-y-1">
          <AnimatePresence>
            {terminalLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={
                  i === terminalLines.length - 1
                    ? "text-warden-cyan"
                    : "text-gray-600"
                }
              >
                {line}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Main Auth Card */}
        <motion.div
          className="hud-frame scanline-overlay"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Title Bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-warden-cyan font-mono text-xs tracking-[0.3em] mb-1">
                SENTINEL PROTOCOL
              </div>
              <h1 className="text-2xl font-bold text-white">
                Operative Registration
              </h1>
            </div>
            <div className="text-right">
              <div
                className={`text-xs font-mono tracking-wider ${
                  walletConnected ? "text-hud-green" : "text-alert-red"
                }`}
              >
                {walletConnected ? "● UPLINK ACTIVE" : "○ NO UPLINK"}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!walletConnected ? (
              /* Wallet Connection Required */
              <motion.div
                key="connect"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-6 opacity-30">⬡</div>
                <p className="text-gray-400 mb-6 font-mono text-sm">
                  CONNECT WALLET TO ESTABLISH NEURAL LINK
                </p>
                <div className="flex justify-center">
                  <WalletButton />
                </div>
              </motion.div>
            ) : (
              /* Registration Form */
              <motion.div
                key="form"
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="space-y-8"
              >
                {/* Callsign Input */}
                <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                  <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2 uppercase">
                    Operative Callsign
                  </label>
                  <input
                    type="text"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    placeholder="Enter callsign..."
                    className="cyber-input text-lg"
                    maxLength={20}
                    autoFocus
                  />
                </motion.div>

                {/* Faction Selection */}
                <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                  <label className="block font-mono text-xs text-gray-500 tracking-widest mb-3 uppercase">
                    Select Faction
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(FACTION_INFO) as Faction[]).map((f) => {
                      const info = FACTION_INFO[f];
                      const isSelected = faction === f;
                      return (
                        <motion.button
                          key={f}
                          onClick={() => setFaction(f)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 text-left transition-all duration-200 border ${
                            isSelected
                              ? "border-opacity-60 bg-opacity-10"
                              : "border-warden-border hover:border-opacity-40"
                          }`}
                          style={{
                            borderColor: isSelected ? info.color : undefined,
                            backgroundColor: isSelected
                              ? `${info.color}10`
                              : "rgba(11, 13, 26, 0.6)",
                            boxShadow: isSelected
                              ? `0 0 20px ${info.color}15, inset 0 0 20px ${info.color}05`
                              : undefined,
                          }}
                        >
                          <div
                            className="font-mono text-sm font-bold tracking-wider mb-1"
                            style={{ color: info.color }}
                          >
                            {info.name}
                          </div>
                          <div className="text-gray-500 text-xs leading-relaxed">
                            {info.description}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Avatar Style Selection */}
                <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                  <label className="block font-mono text-xs text-gray-500 tracking-widest mb-3 uppercase">
                    Operative Avatar
                  </label>

                  {/* Preview */}
                  <div className="flex items-center gap-4 mb-4 p-3 border border-warden-cyan/20 bg-warden-cyan/5">
                    <div
                      className="w-16 h-16 shrink-0 border overflow-hidden"
                      style={{
                        borderColor: "rgba(0, 229, 204, 0.4)",
                        clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getAvatarUrl(avatarStyle, callsign || "operative", 80)}
                        alt="Avatar preview"
                        className="w-full h-full"
                      />
                    </div>
                    <div>
                      <div className="font-mono text-xs text-warden-cyan tracking-wider">
                        {AVATAR_STYLES.find(s => s.id === avatarStyle)?.label || "MECH"}
                      </div>
                      <div className="font-mono text-[10px] text-gray-600 mt-0.5">
                        {callsign ? `SEED: ${callsign}` : "Enter callsign to preview"}
                      </div>
                    </div>
                  </div>

                  {/* Style Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AVATAR_STYLES.map((style) => {
                      const isSelected = avatarStyle === style.id;
                      return (
                        <motion.button
                          key={style.id}
                          onClick={() => setAvatarStyle(style.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`avatar-card ${isSelected ? "avatar-card-selected" : ""}`}
                        >
                          <div className="w-14 h-14 mb-2 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getAvatarUrl(style.id, callsign || "operative", 64)}
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
                </motion.div>

                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="font-mono text-sm text-alert-red bg-alert-red/10 border border-alert-red/30 p-3"
                    >
                      ⚠ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.div className="pt-2" variants={fadeUp} transition={{ duration: 0.5 }}>
                  <motion.button
                    onClick={handleSignIn}
                    disabled={signing || !callsign.trim()}
                    className="btn-hud w-full py-4 text-base"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {signing ? (
                      <span className="flex items-center justify-center gap-3">
                        <span className="w-4 h-4 border-2 border-warden-cyan border-t-transparent rounded-full animate-spin" />
                        AUTHORIZING...
                      </span>
                    ) : (
                      "AUTHORIZE IDENTITY"
                    )}
                  </motion.button>
                  <p className="text-center text-gray-600 text-xs font-mono mt-3 tracking-wider">
                    WALLET SIGNATURE REQUIRED FOR VERIFICATION
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Info */}
        <motion.div className="mt-6 text-center" variants={fadeUp}>
          <div className="hud-divider mb-4" />
          <p className="text-gray-600 text-xs font-mono tracking-wider">
            SENTINEL PROTOCOL // SOLANA DEVNET // SECURE CHANNEL
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
