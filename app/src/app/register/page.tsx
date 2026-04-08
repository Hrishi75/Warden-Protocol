"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { motion, AnimatePresence } from "framer-motion";
import { useProgram } from "@/lib/useProgram";
import { registerAgent } from "@/lib/program";
import { AuthGuard } from "@/components/AuthGuard";
import { HUDFrame } from "@/components/HUDFrame";
import { useSearchParams } from "next/navigation";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

type FlowStatus = "idle" | "paying" | "awaiting_payment" | "registering" | "success" | "error";

const STEPS = [
  { label: "CONFIGURE", num: 1 },
  { label: "PAY", num: 2 },
  { label: "DEPLOY", num: 3 },
];

function getActiveStep(status: FlowStatus): number {
  switch (status) {
    case "idle": return 1;
    case "paying":
    case "awaiting_payment": return 2;
    case "registering":
    case "success":
    case "error": return 3;
    default: return 1;
  }
}

function RegisterContent() {
  const { publicKey } = useWallet();
  const { program } = useProgram();
  const searchParams = useSearchParams();
  const [stakeAmount, setStakeAmount] = useState("1");
  const [maxTransfer, setMaxTransfer] = useState("0.1");
  const [maxDailyTxns, setMaxDailyTxns] = useState("10");
  const [agentKeypair] = useState(() => Keypair.generate());
  const [status, setStatus] = useState<FlowStatus>("idle");
  const [txSig, setTxSig] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentId, setPaymentId] = useState("");

  // Check for payment redirect
  useEffect(() => {
    const paymentStatus = searchParams.get("payment_status");
    const pid = searchParams.get("payment_id");

    if (paymentStatus === "success" && pid) {
      setPaymentId(pid);
      setStatus("awaiting_payment");
    }
  }, [searchParams]);

  // Poll payment status when awaiting
  const pollPaymentStatus = useCallback(async () => {
    if (!paymentId || status !== "awaiting_payment") return;

    try {
      const res = await fetch(`/api/payments/status?payment_id=${paymentId}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.status === "succeeded") {
        // Payment confirmed — proceed to on-chain registration
        if (data.stakeAmount) setStakeAmount(data.stakeAmount);
        if (data.maxTransfer) setMaxTransfer(data.maxTransfer);
        if (data.maxDailyTxns) setMaxDailyTxns(data.maxDailyTxns);
        setStatus("registering");
      } else if (data.status === "failed") {
        setStatus("error");
        setErrorMsg("Payment was declined. Please try again.");
      }
    } catch {
      // Keep polling
    }
  }, [paymentId, status]);

  useEffect(() => {
    if (status !== "awaiting_payment") return;
    const interval = setInterval(pollPaymentStatus, 2000);
    // Also run immediately
    pollPaymentStatus();
    return () => clearInterval(interval);
  }, [status, pollPaymentStatus]);

  // Auto-register after payment confirmed
  useEffect(() => {
    if (status !== "registering" || !publicKey || !program) return;

    (async () => {
      try {
        const permissions = {
          maxTransferLamports: new BN(Math.floor(parseFloat(maxTransfer) * LAMPORTS_PER_SOL)),
          allowedPrograms: [],
          maxDailyTransactions: parseInt(maxDailyTxns),
        };
        const stake = new BN(Math.floor(parseFloat(stakeAmount) * LAMPORTS_PER_SOL));

        const sig = await registerAgent(program, publicKey, agentKeypair, permissions, stake);
        setStatus("success");
        setTxSig(sig);
      } catch (err: unknown) {
        console.error("Registration failed:", err);
        setErrorMsg(err instanceof Error ? err.message : "On-chain registration failed");
        setStatus("error");
      }
    })();
  }, [status, publicKey, program, agentKeypair, stakeAmount, maxTransfer, maxDailyTxns]);

  const handleProceedToPayment = async () => {
    if (!publicKey) return;

    setStatus("paying");
    setErrorMsg("");

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentPublicKey: agentKeypair.publicKey.toBase58(),
          ownerPublicKey: publicKey.toBase58(),
          stakeAmount,
          maxTransfer,
          maxDailyTxns,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create checkout session");
      }

      const data = await res.json();
      setPaymentId(data.paymentId);

      // Redirect to Dodo checkout
      if (data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        setStatus("awaiting_payment");
      }
    } catch (err: unknown) {
      console.error("Payment initiation failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Payment failed");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setErrorMsg("");
    setTxSig("");
    setPaymentId("");
  };

  const activeStep = getActiveStep(status);

  return (
    <motion.div
      className="max-w-3xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* Header */}
      <motion.div className="mb-8" variants={fadeUp}>
        <div className="font-mono text-xs text-warden-cyan/50 tracking-[0.3em] mb-2">
          DEPLOYMENT TERMINAL
        </div>
        <h1 className="text-3xl font-bold font-mono text-white tracking-tight">
          DEPLOY NEW OPERATIVE
        </h1>
        <p className="text-gray-600 font-mono text-sm mt-1 tracking-wide">
          Onboard an AI agent with accountability bond and permission scope
        </p>
      </motion.div>

      {/* Step Indicator */}
      <motion.div className="mb-6" variants={fadeUp}>
        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 flex items-center justify-center font-mono text-xs border transition-all duration-300 ${
                    activeStep >= step.num
                      ? "border-warden-cyan text-warden-cyan bg-warden-cyan/10"
                      : "border-gray-700 text-gray-600"
                  }`}
                >
                  {activeStep > step.num ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 6L5 9L10 3" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`font-mono text-xs tracking-wider ${
                    activeStep >= step.num ? "text-warden-cyan" : "text-gray-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[1px] mx-2 transition-all duration-300 ${
                    activeStep > step.num ? "bg-warden-cyan/40" : "bg-gray-800"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <HUDFrame color="cyan" label="AGENT CONFIGURATION" className="scanline-overlay">
          <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="visible">
            {/* Agent Identity */}
            <motion.div variants={fadeUp}>
              <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2 uppercase">
                Agent Identity [Auto-Generated]
              </label>
              <div className="bg-warden-navy/80 border border-warden-border/50 px-4 py-3 font-mono text-xs text-warden-cyan/60 break-all">
                {agentKeypair.publicKey.toBase58()}
              </div>
            </motion.div>

            <div className="hud-divider" />

            {/* Stake Amount */}
            <motion.div variants={fadeUp}>
              <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2 uppercase">
                Accountability Bond (SOL)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                disabled={status !== "idle"}
                className="cyber-input text-lg"
              />
              <p className="text-gray-600 text-xs font-mono mt-1.5 tracking-wider">
                LOCKED ON-CHAIN. SLASHED ON NEUTRALIZATION.
              </p>
            </motion.div>

            {/* Max Transfer */}
            <motion.div variants={fadeUp}>
              <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2 uppercase">
                Transfer Ceiling (SOL)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={maxTransfer}
                onChange={(e) => setMaxTransfer(e.target.value)}
                disabled={status !== "idle"}
                className="cyber-input"
              />
            </motion.div>

            {/* Max Daily Transactions */}
            <motion.div variants={fadeUp}>
              <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2 uppercase">
                Daily Op Limit
              </label>
              <input
                type="number"
                min="1"
                value={maxDailyTxns}
                onChange={(e) => setMaxDailyTxns(e.target.value)}
                disabled={status !== "idle"}
                className="cyber-input"
              />
            </motion.div>

            <div className="hud-divider" />

            {/* Test Card Info */}
            <motion.div variants={fadeUp}>
              <HUDFrame color="orange" className="!p-3">
                <p className="font-mono text-xs text-warden-orange/80 mb-1">TEST MODE ACTIVE</p>
                <p className="font-mono text-[10px] text-gray-500 leading-relaxed">
                  Use test card: <span className="text-gray-400">4242 4242 4242 4242</span> &bull; Exp: <span className="text-gray-400">06/32</span> &bull; CVV: <span className="text-gray-400">123</span>
                </p>
              </HUDFrame>
            </motion.div>

            {/* Action Button */}
            <motion.div variants={fadeUp}>
              {status === "idle" && (
                <motion.button
                  onClick={handleProceedToPayment}
                  disabled={!publicKey}
                  className="w-full btn-hud py-4 text-base"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {!publicKey ? "CONNECT WALLET TO DEPLOY" : "PROCEED TO PAYMENT"}
                </motion.button>
              )}

              {status === "paying" && (
                <div className="w-full py-4 text-center">
                  <span className="flex items-center justify-center gap-3 font-mono text-sm text-warden-cyan">
                    <span className="w-4 h-4 border-2 border-warden-cyan border-t-transparent rounded-full animate-spin" />
                    REDIRECTING TO PAYMENT...
                  </span>
                </div>
              )}

              {status === "awaiting_payment" && (
                <div className="w-full py-4 text-center">
                  <span className="flex items-center justify-center gap-3 font-mono text-sm text-warden-orange">
                    <span className="w-4 h-4 border-2 border-warden-orange border-t-transparent rounded-full animate-spin" />
                    AWAITING PAYMENT CONFIRMATION...
                  </span>
                  <p className="font-mono text-[10px] text-gray-600 mt-2">
                    Payment ID: {paymentId}
                  </p>
                </div>
              )}

              {status === "registering" && (
                <div className="w-full py-4 text-center">
                  <span className="flex items-center justify-center gap-3 font-mono text-sm text-warden-cyan">
                    <span className="w-4 h-4 border-2 border-warden-cyan border-t-transparent rounded-full animate-spin" />
                    DEPLOYING ON-CHAIN...
                  </span>
                </div>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <HUDFrame color="green" className="!p-4">
                    <p className="font-mono text-hud-green text-sm mb-1">
                      PAYMENT CONFIRMED + OPERATIVE DEPLOYED
                    </p>
                    <p className="font-mono text-xs text-gray-500 break-all">
                      TX: {txSig}
                    </p>
                  </HUDFrame>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <HUDFrame color="red" className="!p-4">
                    <p className="font-mono text-alert-red text-sm mb-1">
                      DEPLOYMENT FAILED
                    </p>
                    <p className="font-mono text-xs text-gray-500 mb-3">{errorMsg}</p>
                    <motion.button
                      onClick={handleReset}
                      className="btn-hud !py-2 !px-4 text-xs"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      RETRY
                    </motion.button>
                  </HUDFrame>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </HUDFrame>
      </motion.div>
    </motion.div>
  );
}

export default function RegisterAgent() {
  return (
    <AuthGuard>
      <RegisterContent />
    </AuthGuard>
  );
}
