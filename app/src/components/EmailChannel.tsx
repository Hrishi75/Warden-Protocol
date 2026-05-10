"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/providers/AuthProvider";
import { HUDFrame } from "@/components/HUDFrame";
import {
  requestEmailOtp,
  verifyEmailOtp,
  unlinkEmail,
  updateEmailPrefs,
} from "@/lib/profile-api";
import type { NotifyPrefs } from "@/lib/auth";

const DEFAULT_PREFS: NotifyPrefs = { arrest: true, bail: true, violation: true };

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}${"•".repeat(Math.max(3, user.length - visible.length))}@${domain}`;
}

export function EmailChannel() {
  const wallet = useWallet();
  const { operative, refreshProfile } = useAuth();
  const [mode, setMode] = useState<"idle" | "entering" | "awaitingCode">("idle");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (!operative) return null;

  const linked = !!operative.email && !!operative.emailVerifiedAt;
  const prefs: NotifyPrefs = {
    ...DEFAULT_PREFS,
    ...((operative.emailNotifyPrefs ?? {}) as Partial<NotifyPrefs>),
  };

  const reset = () => {
    setMode("idle");
    setEmail("");
    setCode("");
    setError("");
    setInfo("");
  };

  const handleRequest = async () => {
    setError("");
    setInfo("");
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError("Enter a valid email address");
      return;
    }
    setBusy(true);
    const res = await requestEmailOtp(normalized, wallet);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setEmail(normalized);
    setMode("awaitingCode");
    setInfo("Verification code sent. Check your inbox.");
  };

  const handleVerify = async () => {
    setError("");
    if (!/^\d{6}$/.test(code)) {
      setError("Code must be 6 digits");
      return;
    }
    setBusy(true);
    const res = await verifyEmailOtp(code, wallet);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    await refreshProfile();
    reset();
    setInfo("Email verified and linked to your operative profile.");
  };

  const handleUnlink = async () => {
    setError("");
    setBusy(true);
    const res = await unlinkEmail(wallet);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    await refreshProfile();
    setInfo("Email unlinked.");
  };

  const togglePref = async (key: keyof NotifyPrefs) => {
    setError("");
    const next = { [key]: !prefs[key] } as Partial<NotifyPrefs>;
    setBusy(true);
    const res = await updateEmailPrefs(next, wallet);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    await refreshProfile();
  };

  return (
    <HUDFrame color="cyan" label="CONTACT CHANNEL">
      <div className="space-y-4">
        {!linked && mode === "idle" && (
          <div className="space-y-3">
            <p className="font-mono text-xs text-gray-400 leading-relaxed">
              Link an email to receive alerts when your agent is arrested, bail is resolved, or new violations are reported. Wallet remains your primary identity.
            </p>
            <motion.button
              onClick={() => setMode("entering")}
              className="btn-hud !py-2 !px-4 text-xs"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              LINK EMAIL
            </motion.button>
          </div>
        )}

        {!linked && mode === "entering" && (
          <div className="space-y-3">
            <label className="block font-mono text-xs text-gray-500 tracking-widest uppercase">
              Email Address
            </label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operative@example.com"
              className="cyber-input"
              disabled={busy}
            />
            <div className="flex gap-2">
              <motion.button
                onClick={handleRequest}
                disabled={busy}
                className="btn-hud !py-2 !px-4 text-xs disabled:opacity-40"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {busy ? "SENDING..." : "SEND CODE"}
              </motion.button>
              <motion.button
                onClick={reset}
                disabled={busy}
                className="font-mono text-[10px] text-gray-500 hover:text-gray-400 tracking-wider px-2"
              >
                CANCEL
              </motion.button>
            </div>
          </div>
        )}

        {!linked && mode === "awaitingCode" && (
          <div className="space-y-3">
            <p className="font-mono text-xs text-gray-400">
              Enter the 6-digit code sent to <span className="text-sentinel-cyan">{email}</span>
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="cyber-input tracking-[0.5em] text-center font-mono text-lg"
              disabled={busy}
            />
            <div className="flex gap-2">
              <motion.button
                onClick={handleVerify}
                disabled={busy || code.length !== 6}
                className="btn-hud !py-2 !px-4 text-xs disabled:opacity-40"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {busy ? "VERIFYING..." : "VERIFY"}
              </motion.button>
              <motion.button
                onClick={reset}
                disabled={busy}
                className="font-mono text-[10px] text-gray-500 hover:text-gray-400 tracking-wider px-2"
              >
                START OVER
              </motion.button>
            </div>
          </div>
        )}

        {linked && operative.email && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-hud-green/30 bg-hud-green/5">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-[10px] tracking-widest text-hud-green bg-hud-green/10 px-2 py-0.5 shrink-0">
                  VERIFIED
                </span>
                <span className="font-mono text-xs text-gray-300 truncate">
                  {maskEmail(operative.email)}
                </span>
              </div>
              <motion.button
                onClick={handleUnlink}
                disabled={busy}
                className="font-mono text-[10px] text-alert-red/70 hover:text-alert-red tracking-wider shrink-0 ml-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                UNLINK
              </motion.button>
            </div>

            <div>
              <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-2">
                Notification Preferences
              </div>
              <div className="space-y-2">
                {(["arrest", "bail", "violation"] as (keyof NotifyPrefs)[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => togglePref(key)}
                    disabled={busy}
                    className="w-full flex items-center justify-between p-2 border border-sentinel-border/20 bg-sentinel-bg/40 hover:bg-sentinel-bg/60 transition disabled:opacity-50"
                  >
                    <div className="text-left">
                      <div className="font-mono text-xs text-gray-300 capitalize">
                        {key} alerts
                      </div>
                      <div className="font-mono text-[10px] text-gray-600">
                        {key === "arrest" && "When an agent you own is arrested"}
                        {key === "bail" && "When a bail review concludes"}
                        {key === "violation" && "When new violations are recorded"}
                      </div>
                    </div>
                    <span
                      className={`font-mono text-[10px] tracking-widest px-2 py-0.5 ${
                        prefs[key]
                          ? "text-hud-green bg-hud-green/10"
                          : "text-gray-500 bg-gray-500/10"
                      }`}
                    >
                      {prefs[key] ? "ON" : "OFF"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="font-mono text-xs text-alert-red bg-alert-red/10 border border-alert-red/30 p-2"
            >
              {error}
            </motion.div>
          )}
          {info && !error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="font-mono text-xs text-hud-green bg-hud-green/10 border border-hud-green/30 p-2"
            >
              {info}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </HUDFrame>
  );
}
