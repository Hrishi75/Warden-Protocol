"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { WalletButton } from "@/components/WalletButton";
import { FACTION_INFO, AVATAR_STYLES, getAvatarUrl, Faction, isProfileComplete } from "@/lib/auth";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function AuthPageContent() {
  const { operative, walletConnected, signIn, updateProfile, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [callsign, setCallsign] = useState("");
  const [faction, setFaction] = useState<Faction>("sentinel");
  const [avatarStyle, setAvatarStyle] = useState("bottts");
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  const nextPath = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    if (operative) {
      if (operative.callsign) setCallsign(operative.callsign);
      if (operative.faction) setFaction(operative.faction);
      if (operative.avatarStyle) setAvatarStyle(operative.avatarStyle);
    }
  }, [operative]);

  useEffect(() => {
    const lines = [
      "> SENTINEL PROTOCOL v1.0.0",
      "> Wallet account already active",
      "> Governance channel available",
      "> OPTIONAL PROFILE TERMINAL",
      "> Add public identity when trust features matter",
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

  const handleSave = async () => {
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
      if (operative?.signature) {
        updateProfile({ callsign, faction, avatarStyle });
      } else {
        await signIn(callsign, faction, avatarStyle);
      }
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
      setSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sentinel-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const alreadyComplete = operative && isProfileComplete(operative);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-8">
      <motion.div className="w-full max-w-2xl" initial="hidden" animate="visible" variants={stagger}>
        <div className="mb-6 font-mono text-xs space-y-1">
          <AnimatePresence>
            {terminalLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={i === terminalLines.length - 1 ? "text-sentinel-cyan" : "text-gray-600"}
              >
                {line}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          className="hud-frame scanline-overlay"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-sentinel-cyan font-mono text-xs tracking-[0.3em] mb-1">
                SENTINEL PROTOCOL
              </div>
              <h1 className="text-2xl font-bold text-white">
                {alreadyComplete ? "Edit Governance Profile" : "Optional Governance Profile"}
              </h1>
              <p className="text-gray-500 font-mono text-[10px] mt-1 leading-relaxed">
                {alreadyComplete
                  ? "Update your callsign, faction, or avatar"
                  : "Customize identity for governance, reviewer credibility, and public trust"}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-xs font-mono tracking-wider ${walletConnected ? "text-hud-green" : "text-alert-red"}`}>
                {walletConnected ? "WALLET CONNECTED" : "NO WALLET"}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!walletConnected ? (
              <motion.div
                key="connect"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <p className="text-gray-400 mb-6 font-mono text-sm">
                  Connect wallet to create your account first
                </p>
                <div className="flex justify-center">
                  <WalletButton />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="space-y-8"
              >
                <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                  <label className="block font-mono text-xs text-gray-500 tracking-widest mb-1 uppercase">
                    Callsign
                  </label>
                  <p className="text-gray-600 font-mono text-[10px] mb-2 leading-relaxed">
                    Public display name used in governance reviews and social trust signals.
                  </p>
                  <input
                    type="text"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    placeholder="Enter your name..."
                    className="cyber-input text-lg"
                    maxLength={20}
                    autoFocus
                  />
                </motion.div>

                <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                  <label className="block font-mono text-xs text-gray-500 tracking-widest mb-1 uppercase">
                    Select Your Role
                  </label>
                  <p className="text-gray-600 font-mono text-[10px] mb-3 leading-relaxed">
                    Factions only matter when you want governance credibility, public identity, or reviewer status.
                  </p>
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
                              : "border-sentinel-border hover:border-opacity-40"
                          }`}
                          style={{
                            borderColor: isSelected ? info.color : undefined,
                            backgroundColor: isSelected ? `${info.color}10` : "rgba(11, 13, 26, 0.6)",
                            boxShadow: isSelected ? `0 0 20px ${info.color}15, inset 0 0 20px ${info.color}05` : undefined,
                          }}
                        >
                          <div className="font-mono text-sm font-bold tracking-wider mb-1" style={{ color: info.color }}>
                            {info.name}
                          </div>
                          <div className="text-gray-500 text-xs leading-relaxed mb-1">
                            {info.description}
                          </div>
                          <div className="text-gray-600 text-[10px] leading-relaxed">
                            {info.plainDescription}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                  <label className="block font-mono text-xs text-gray-500 tracking-widest mb-3 uppercase">
                    Choose Your Avatar
                  </label>

                  <div className="flex items-center gap-4 mb-4 p-3 border border-sentinel-cyan/20 bg-sentinel-cyan/5">
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
                      <div className="font-mono text-xs text-sentinel-cyan tracking-wider">
                        {AVATAR_STYLES.find((s) => s.id === avatarStyle)?.label || "MECH"}
                      </div>
                      <div className="font-mono text-[10px] text-gray-600 mt-0.5">
                        {callsign ? `SEED: ${callsign}` : "Enter callsign to preview"}
                      </div>
                    </div>
                  </div>

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
                          <div className={`font-mono text-[10px] tracking-wider ${isSelected ? "text-sentinel-cyan" : "text-gray-500"}`}>
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

                <motion.div className="pt-2 space-y-3" variants={fadeUp} transition={{ duration: 0.5 }}>
                  <motion.button
                    onClick={handleSave}
                    disabled={signing || !callsign.trim()}
                    className="btn-hud w-full py-4 text-base"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {signing ? (
                      <span className="flex items-center justify-center gap-3">
                        <span className="w-4 h-4 border-2 border-sentinel-cyan border-t-transparent rounded-full animate-spin" />
                        SAVING...
                      </span>
                    ) : alreadyComplete ? (
                      "UPDATE PROFILE"
                    ) : (
                      "SAVE GOVERNANCE PROFILE"
                    )}
                  </motion.button>
                  {!alreadyComplete && (
                    <motion.button
                      onClick={() => router.push("/dashboard")}
                      className="w-full py-3 font-mono text-xs tracking-wider text-gray-500 hover:text-gray-400 border border-gray-800 hover:border-gray-700 transition-all"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      SKIP AND USE DASHBOARD
                    </motion.button>
                  )}
                  <p className="text-center text-gray-600 text-xs font-mono leading-relaxed">
                    {operative?.signature
                      ? "Profile updates are saved instantly."
                      : "Your wallet signs a message only if you choose to save this profile. No funds are spent."}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

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

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sentinel-cyan border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
