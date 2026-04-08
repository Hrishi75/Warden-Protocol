"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentCard } from "@/components/AgentCard";
import { useProgram } from "@/lib/useProgram";
import { fetchAllAgents, getStatusString } from "@/lib/program";
import { AuthGuard } from "@/components/AuthGuard";
import { HUDFrame } from "@/components/HUDFrame";
import { OperativeCard } from "@/components/OperativeCard";
import { RadarScan } from "@/components/RadarScan";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

function WithdrawalSection() {
  const { publicKey } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("10");
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [payoutStatus, setPayoutStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [payoutMsg, setPayoutMsg] = useState("");

  const handlePayout = async () => {
    if (!publicKey) return;
    setPayoutStatus("loading");

    try {
      const res = await fetch("/api/payments/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerPublicKey: publicKey.toBase58(),
          amount: parseFloat(amount),
          currency,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Payout failed");
      }

      const data = await res.json();
      setPayoutStatus("success");
      setPayoutMsg(`Payout ${data.payoutId} submitted`);
    } catch (err: unknown) {
      setPayoutStatus("error");
      setPayoutMsg(err instanceof Error ? err.message : "Payout request failed");
    }
  };

  return (
    <>
      <HUDFrame color="orange" label="TREASURY & WITHDRAWALS" className="mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-xs text-gray-500 tracking-wider mb-1">FIAT OFF-RAMP</p>
            <p className="font-mono text-sm text-gray-400">
              Withdraw staking yield and slash rewards to fiat (INR/USD) via Dodo Payments.
            </p>
            <p className="font-mono text-[10px] text-warden-orange/60 mt-1">TEST MODE ACTIVE</p>
          </div>
          <motion.button
            onClick={() => { setShowModal(true); setPayoutStatus("idle"); setPayoutMsg(""); }}
            className="btn-hud !border-warden-orange/30 !text-warden-orange hover:!bg-warden-orange/10 !py-2 !px-4 text-xs shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            WITHDRAW TO FIAT
          </motion.button>
        </div>
      </HUDFrame>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <HUDFrame color="orange" label="PAYOUT REQUEST" className="!p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2 uppercase">
                      Amount
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={payoutStatus === "loading"}
                      className="cyber-input"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2 uppercase">
                      Currency
                    </label>
                    <div className="flex gap-2">
                      {(["USD", "INR"] as const).map((c) => (
                        <button
                          key={c}
                          onClick={() => setCurrency(c)}
                          className={`flex-1 py-2 font-mono text-xs tracking-wider border transition-all ${
                            currency === c
                              ? "border-warden-orange text-warden-orange bg-warden-orange/10"
                              : "border-gray-700 text-gray-500 hover:border-gray-600"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {payoutStatus === "success" && (
                    <HUDFrame color="green" className="!p-3">
                      <p className="font-mono text-xs text-hud-green">{payoutMsg}</p>
                    </HUDFrame>
                  )}

                  {payoutStatus === "error" && (
                    <HUDFrame color="red" className="!p-3">
                      <p className="font-mono text-xs text-alert-red">{payoutMsg}</p>
                    </HUDFrame>
                  )}

                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3 font-mono text-xs tracking-wider border border-gray-700 text-gray-500 hover:text-gray-400 transition-all"
                      whileTap={{ scale: 0.98 }}
                    >
                      CANCEL
                    </motion.button>
                    <motion.button
                      onClick={handlePayout}
                      disabled={payoutStatus === "loading" || payoutStatus === "success"}
                      className="flex-1 btn-hud !border-warden-orange/30 !text-warden-orange hover:!bg-warden-orange/10 py-3 text-xs"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {payoutStatus === "loading" ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-3 h-3 border-2 border-warden-orange border-t-transparent rounded-full animate-spin" />
                          PROCESSING...
                        </span>
                      ) : payoutStatus === "success" ? (
                        "SUBMITTED"
                      ) : (
                        "REQUEST PAYOUT"
                      )}
                    </motion.button>
                  </div>
                </div>
              </HUDFrame>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function DashboardContent() {
  const { program } = useProgram();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAgents = useCallback(async () => {
    if (!program) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const accounts = await fetchAllAgents(program);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAgents(accounts.map((a: any) => a.account));
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      setError("Failed to load assets. Ensure DAO is initialized on devnet.");
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const stats = {
    total: agents.length,
    active: agents.filter((a) => getStatusString(a.status) === "Active").length,
    arrested: agents.filter((a) => getStatusString(a.status) === "Arrested").length,
    paroled: agents.filter((a) => getStatusString(a.status) === "Paroled").length,
  };

  const statCards = [
    { label: "DEPLOYED ASSETS", value: stats.total, color: "#00E5CC", hudColor: "cyan" as const },
    { label: "OPERATIONAL", value: stats.active, color: "#39FF14", hudColor: "green" as const },
    { label: "CONTAINED", value: stats.arrested, color: "#FF0033", hudColor: "red" as const },
    { label: "RESTRICTED", value: stats.paroled, color: "#FF9B26", hudColor: "orange" as const },
  ];

  const radarBlips = agents.slice(0, 8).map((a, i) => {
    const status = getStatusString(a.status);
    const angle = (i / Math.max(agents.length, 1)) * 360;
    const dist = 30 + Math.random() * 50;
    return {
      x: Math.cos((angle * Math.PI) / 180) * dist,
      y: Math.sin((angle * Math.PI) / 180) * dist,
      color: status === "Active" ? "#39FF14" : status === "Arrested" ? "#FF0033" : "#FF9B26",
    };
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      {/* Header */}
      <motion.div className="flex items-start justify-between mb-8 gap-4" variants={fadeUp}>
        <div>
          <div className="font-mono text-xs text-warden-cyan/50 tracking-[0.3em] mb-2">
            SENTINEL PROTOCOL
          </div>
          <h1 className="text-3xl font-bold font-mono text-white tracking-tight">
            COMMAND CENTER
          </h1>
          <p className="text-gray-600 font-mono text-sm mt-1 tracking-wide">
            Monitor and manage all deployed AI operatives
          </p>
        </div>
        <div className="flex items-center gap-3">
          {program && (
            <motion.button
              onClick={loadAgents}
              className="btn-hud !py-2 !px-4 text-xs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              REFRESH
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Operative Profile + Radar */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8" variants={fadeUp}>
        <div className="lg:col-span-3">
          <OperativeCard />
        </div>
        <div className="hidden lg:flex items-center justify-center">
          <RadarScan size={140} blips={radarBlips} />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        variants={stagger}
      >
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <HUDFrame
              color={stat.hudColor}
              className="!p-4"
              label={stat.label}
            >
              <p
                className="text-3xl font-bold font-mono mt-2"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
            </HUDFrame>
          </motion.div>
        ))}
      </motion.div>

      <div className="hud-divider mb-8" />

      {/* Treasury & Withdrawals */}
      <WithdrawalSection />

      {/* Agent Grid */}
      {loading ? (
        <motion.div className="text-center py-20" variants={fadeUp}>
          <div className="w-8 h-8 border-2 border-warden-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-mono text-sm tracking-wider">
            SCANNING DEVNET FOR ASSETS...
          </p>
        </motion.div>
      ) : error ? (
        <motion.div variants={fadeUp}>
          <HUDFrame color="red" className="text-center py-12">
            <p className="text-alert-red font-mono text-sm mb-2">{error}</p>
            <p className="text-gray-600 text-xs font-mono">
              Connect wallet and verify program deployment.
            </p>
          </HUDFrame>
        </motion.div>
      ) : agents.length === 0 ? (
        <motion.div variants={fadeUp}>
          <HUDFrame color="cyan" className="text-center py-16">
            <div className="text-4xl mb-4 opacity-20">⬡</div>
            <p className="text-gray-400 font-mono text-sm mb-2 tracking-wider">
              NO ASSETS DEPLOYED
            </p>
            <p className="text-gray-600 text-xs font-mono mb-6">
              {program
                ? "Initiate first operative deployment."
                : "Connect wallet to access deployment systems."}
            </p>
            <Link href="/register" className="btn-hud">
              DEPLOY FIRST OPERATIVE
            </Link>
          </HUDFrame>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={stagger}
        >
          {agents.map((agent, i) => (
            <motion.div key={i} variants={fadeUp}>
              <AgentCard agent={agent} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
