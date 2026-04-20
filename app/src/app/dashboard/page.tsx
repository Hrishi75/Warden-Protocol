"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PublicKey } from "@solana/web3.js";
import { AgentCard } from "@/components/AgentCard";
import { InsurancePanel } from "@/components/InsurancePanel";
import { useProgram } from "@/lib/useProgram";
import { fetchAllAgents, fetchAllPolicies, fetchInsurancePool, getTierString, findAgentRecordPda } from "@/lib/program";
import { AuthGuard } from "@/components/AuthGuard";
import { HUDFrame } from "@/components/HUDFrame";
import { OperativeCard } from "@/components/OperativeCard";
import { RadarScan } from "@/components/RadarScan";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/providers/AuthProvider";
import { isProfileComplete } from "@/lib/auth";
import { buildSignedAuth } from "@/lib/sign-auth";
import {
  computeIndexedAgentTrust,
  formatAgentAge,
  getAgentRiskRecommendations,
  lamportsToSol,
} from "@/lib/agent-risk";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

function WithdrawalSection() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("10");
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [payoutStatus, setPayoutStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [payoutMsg, setPayoutMsg] = useState("");

  const handlePayout = async () => {
    if (!publicKey) return;
    setPayoutStatus("loading");

    try {
      const auth = await buildSignedAuth(wallet, "PAYMENT_PAYOUT");
      const res = await fetch("/api/payments/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerPublicKey: publicKey.toBase58(),
          amount: parseFloat(amount),
          currency,
          auth,
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
            <p className="font-mono text-xs text-gray-500 tracking-wider mb-1">WITHDRAW TO BANK</p>
            <p className="font-mono text-sm text-gray-400">
              Convert your on-chain earnings to fiat through Dodo Payments.
            </p>
            <p className="font-mono text-[10px] text-sentinel-orange/60 mt-1">TEST MODE ACTIVE</p>
          </div>
          <motion.button
            onClick={() => { setShowModal(true); setPayoutStatus("idle"); setPayoutMsg(""); }}
            className="btn-hud !border-sentinel-orange/30 !text-sentinel-orange hover:!bg-sentinel-orange/10 !py-2 !px-4 text-xs shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            WITHDRAW TO FIAT
          </motion.button>
        </div>
      </HUDFrame>

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
                              ? "border-sentinel-orange text-sentinel-orange bg-sentinel-orange/10"
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
                      className="flex-1 btn-hud !border-sentinel-orange/30 !text-sentinel-orange hover:!bg-sentinel-orange/10 py-3 text-xs"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {payoutStatus === "loading" ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-3 h-3 border-2 border-sentinel-orange border-t-transparent rounded-full animate-spin" />
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
  const { program, wallet } = useProgram();
  const { operative, walletAgents, walletConnectionInfo } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [agents, setAgents] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rawAgents, setRawAgents] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [policies, setPolicies] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [insurancePool, setInsurancePool] = useState<any>(null);
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
      setRawAgents(accounts);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAgents(accounts.map((a: any) => a.account));

      try {
        const [allPolicies, pool] = await Promise.all([
          fetchAllPolicies(program),
          fetchInsurancePool(program),
        ]);
        setPolicies(allPolicies);
        setInsurancePool(pool);
      } catch {
        setPolicies([]);
        setInsurancePool(null);
      }
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      setError("Failed to load safety network. Ensure DAO is initialized on devnet.");
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
    active: agents.filter((a) => "active" in a.status).length,
    arrested: agents.filter((a) => "arrested" in a.status).length,
    paroled: agents.filter((a) => "paroled" in a.status).length,
  };

  const statCards = [
    { label: "TOTAL AGENTS", value: stats.total, color: "#00E5CC", hudColor: "cyan" as const },
    { label: "ACTIVE", value: stats.active, color: "#39FF14", hudColor: "green" as const },
    { label: "SUSPENDED", value: stats.arrested, color: "#FF0033", hudColor: "red" as const },
    { label: "ON PROBATION", value: stats.paroled, color: "#FF9B26", hudColor: "orange" as const },
  ];

  const radarBlips = agents.slice(0, 8).map((a, i) => {
    const angle = (i / Math.max(agents.length, 1)) * 360;
    const dist = 30 + Math.random() * 50;
    const status = "active" in a.status ? "Active" : "arrested" in a.status ? "Arrested" : "paroled" in a.status ? "Paroled" : "Terminated";
    return {
      x: Math.cos((angle * Math.PI) / 180) * dist,
      y: Math.sin((angle * Math.PI) / 180) * dist,
      color: status === "Active" ? "#39FF14" : status === "Arrested" ? "#FF0033" : "#FF9B26",
    };
  });

  const hasGovernanceProfile = operative ? isProfileComplete(operative) : false;
  const walletOverview = walletAgents.map((agent) => {
    let insuranceTier: "Basic" | "Standard" | "Premium" | null = null;

    try {
      const [agentRecordPda] = findAgentRecordPda(new PublicKey(agent.agentIdentity));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const policy = policies.find((item: any) => item.account.agentRecord.toBase58() === agentRecordPda.toBase58() && item.account.isActive);
      insuranceTier = policy ? getTierString(policy.account.tier) : null;
    } catch {
      insuranceTier = null;
    }

    return {
      ...agent,
      insuranceTier,
      trust: computeIndexedAgentTrust(agent, { insuranceTier }),
      recommendations: getAgentRiskRecommendations(agent, { insuranceTier }),
    };
  });

  const uninsuredCount = walletOverview.filter((agent) => !agent.insuranceTier).length;
  const flaggedCount = walletOverview.filter((agent) => agent.status !== "Active" || agent.violations.length > 0).length;
  const firstFlaggedAgent = walletOverview.find((agent) => agent.status !== "Active" || agent.violations.length > 0);
  const recommendedActions = [
    walletOverview.length === 0
      ? {
          title: "Register first agent",
          detail: "Wallet-only users can deploy immediately. Profile setup stays optional.",
          href: "/register",
        }
      : null,
    uninsuredCount > 0
      ? {
          title: "Add coverage",
          detail: `${uninsuredCount} agent${uninsuredCount === 1 ? "" : "s"} still operate without insurance.`,
          href: "/dashboard",
        }
      : null,
    flaggedCount > 0
      ? {
          title: "Inspect flagged agents",
          detail: `${flaggedCount} agent${flaggedCount === 1 ? "" : "s"} need closer review or tighter controls.`,
          href: firstFlaggedAgent ? `/agents/${firstFlaggedAgent.agentIdentity}` : "/dashboard",
        }
      : null,
    !hasGovernanceProfile
      ? {
          title: "Complete governance profile",
          detail: "Add callsign and faction only when you want reviewer reputation or DAO credibility.",
          href: "/auth",
        }
      : null,
  ].filter(Boolean) as { title: string; detail: string; href: string }[];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      <motion.div className="flex items-start justify-between mb-8 gap-4 flex-wrap" variants={fadeUp}>
        <div>
          <div className="font-mono text-xs text-sentinel-cyan/50 tracking-[0.3em] mb-2">
            SENTINEL PROTOCOL
          </div>
          <h1 className="text-3xl font-bold font-mono text-white tracking-tight">
            SAFETY DASHBOARD
          </h1>
          <p className="text-gray-500 font-mono text-sm mt-1 tracking-wide">
            Connect wallet, inspect agent trust instantly, and register protection before risk spreads
          </p>
        </div>
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
      </motion.div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8" variants={fadeUp}>
        <div className="lg:col-span-2">
          <OperativeCard />
        </div>
        <div className="lg:col-span-1">
          <HUDFrame color="cyan" label="ACCOUNT STATUS" className="h-full">
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Wallet account</span>
                <span className="text-hud-green">ACTIVE</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Profile</span>
                <span className={hasGovernanceProfile ? "text-hud-green" : "text-sentinel-orange"}>
                  {hasGovernanceProfile ? "GOVERNANCE READY" : "OPTIONAL"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Connections</span>
                <span className="text-white">{walletConnectionInfo?.connectionCount ?? 1}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Owned agents</span>
                <span className="text-white">{walletOverview.length}</span>
              </div>
            </div>
          </HUDFrame>
        </div>
        <div className="hidden lg:flex items-center justify-center">
          <RadarScan size={140} blips={radarBlips} />
        </div>
      </motion.div>

      {!hasGovernanceProfile && (
        <motion.div variants={fadeUp} className="mb-8">
          <HUDFrame color="orange">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-mono text-sm text-sentinel-orange tracking-wider mb-1">
                  GOVERNANCE PROFILE IS OPTIONAL
                </p>
                <p className="font-mono text-xs text-gray-500">
                  Safety features work with wallet-only accounts. Add callsign, faction, and avatar later when you want reviewer credibility or public identity.
                </p>
              </div>
              <Link href="/auth" className="btn-hud !border-sentinel-orange/30 !text-sentinel-orange hover:!bg-sentinel-orange/10 !py-2 !px-4 text-xs">
                COMPLETE PROFILE FOR GOVERNANCE
              </Link>
            </div>
          </HUDFrame>
        </motion.div>
      )}

      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" variants={stagger}>
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <HUDFrame color={stat.hudColor} className="!p-4" label={stat.label}>
              <p className="text-3xl font-bold font-mono mt-2" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </HUDFrame>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="mb-8">
        <HUDFrame color="cyan" label="MY AGENTS RISK OVERVIEW">
          {walletOverview.length === 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 border border-sentinel-cyan/20 bg-sentinel-cyan/5 p-5">
                <div className="font-mono text-sm text-white mb-2">No agents registered yet</div>
                <p className="font-mono text-xs text-gray-500 leading-relaxed mb-4">
                  Your account was created automatically when the wallet connected. The next useful action is registering an agent or inspecting how Sentinel protects one.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link href="/register" className="btn-hud !py-2 !px-4 text-xs">
                    REGISTER FIRST AGENT
                  </Link>
                  <Link href="/docs" className="btn-hud !border-sentinel-orange/30 !text-sentinel-orange hover:!bg-sentinel-orange/10 !py-2 !px-4 text-xs">
                    HOW SENTINEL PROTECTS YOU
                  </Link>
                </div>
              </div>
              <div className="border border-sentinel-border/20 bg-sentinel-surface/20 p-5">
                <div className="font-mono text-xs text-gray-500 tracking-[0.2em] mb-2">WHY THIS FLOW</div>
                <p className="font-mono text-[11px] text-gray-400 leading-relaxed">
                  Wallet connect is account creation. Profile setup never blocks core safety, risk inspection, or agent registration.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {walletOverview.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.agentIdentity}`}
                  className="border border-sentinel-border/20 bg-sentinel-surface/20 p-5 hover:border-sentinel-cyan/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="font-mono text-sm text-white tracking-wider mb-1">
                        {agent.agentIdentity.slice(0, 6)}...{agent.agentIdentity.slice(-6)}
                      </div>
                      <div className="font-mono text-[10px] text-gray-600 tracking-[0.2em]">
                        {formatAgentAge(agent.registeredAt)}
                      </div>
                    </div>
                    <div className={`font-mono text-xs px-2 py-1 border ${
                      agent.status === "Active"
                        ? "border-hud-green/30 text-hud-green bg-hud-green/5"
                        : agent.status === "Paroled"
                        ? "border-sentinel-orange/30 text-sentinel-orange bg-sentinel-orange/5"
                        : "border-alert-red/30 text-alert-red bg-alert-red/5"
                    }`}>
                      {agent.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <div>
                      <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-1">TRUST</div>
                      <div className="font-mono text-xl font-bold" style={{ color: agent.trust.color }}>
                        {agent.trust.score}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-1">VIOLATIONS</div>
                      <div className={`font-mono text-xl ${agent.violations.length > 0 ? "text-alert-red" : "text-hud-green"}`}>
                        {agent.violations.length}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-1">INSURANCE</div>
                      <div className={`font-mono text-xs mt-2 ${agent.insuranceTier ? "text-hud-green" : "text-sentinel-orange"}`}>
                        {agent.insuranceTier ?? "NONE"}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-1">TRANSFER</div>
                      <div className="font-mono text-xs text-white mt-2">
                        {lamportsToSol(agent.maxTransferLamports).toFixed(2)} SOL
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-1">DAILY TXNS</div>
                      <div className="font-mono text-xs text-white mt-2">{agent.maxDailyTransactions}</div>
                    </div>
                  </div>

                  <div className="font-mono text-[11px] text-gray-400 leading-relaxed mb-4">
                    {agent.trust.reasons[0]}
                  </div>

                  <div className="flex items-center justify-between gap-4 flex-wrap pt-4 border-t border-sentinel-border/20">
                    <div className="font-mono text-[10px] text-gray-500">
                      NEXT: {agent.recommendations[0]?.title.toUpperCase() ?? "MONITOR"}
                    </div>
                    <div className="font-mono text-[10px] text-sentinel-cyan tracking-[0.2em]">
                      VIEW SAFETY PASSPORT
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </HUDFrame>
      </motion.div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8" variants={stagger}>
        <motion.div variants={fadeUp}>
          <HUDFrame color="orange" label="RECOMMENDED ACTIONS" className="h-full">
            <div className="space-y-3">
              {recommendedActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="block border border-sentinel-orange/20 bg-sentinel-orange/5 p-4 hover:border-sentinel-orange/40 transition-colors"
                >
                  <div className="font-mono text-xs text-sentinel-orange tracking-wider mb-1">
                    {action.title.toUpperCase()}
                  </div>
                  <p className="font-mono text-[11px] text-gray-400 leading-relaxed">
                    {action.detail}
                  </p>
                </Link>
              ))}
            </div>
          </HUDFrame>
        </motion.div>

        <motion.div variants={fadeUp}>
          <HUDFrame color="purple" label="WATCHLIST ALERTS" className="h-full">
            {flaggedCount === 0 ? (
              <div className="space-y-2">
                <p className="font-mono text-sm text-white">No urgent alerts</p>
                <p className="font-mono text-xs text-gray-500 leading-relaxed">
                  Watchlists and destination alerts are the next layer in the roadmap. Right now, trust score, violations, and coverage still give you an instant risk snapshot.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {walletOverview
                  .filter((agent) => agent.status !== "Active" || agent.violations.length > 0)
                  .slice(0, 3)
                  .map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/agents/${agent.agentIdentity}`}
                      className="block border border-alert-red/20 bg-alert-red/5 p-4 hover:border-alert-red/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="font-mono text-xs text-alert-red tracking-wider">
                          {agent.agentIdentity.slice(0, 6)}...{agent.agentIdentity.slice(-6)}
                        </span>
                        <span className="font-mono text-[10px] text-gray-500">{agent.status.toUpperCase()}</span>
                      </div>
                      <p className="font-mono text-[11px] text-gray-400 leading-relaxed">
                        {agent.trust.reasons[0]}
                      </p>
                    </Link>
                  ))}
              </div>
            )}
          </HUDFrame>
        </motion.div>
      </motion.div>

      <div className="hud-divider mb-8" />

      <WithdrawalSection />

      {loading ? (
        <motion.div className="text-center py-20" variants={fadeUp}>
          <div className="w-8 h-8 border-2 border-sentinel-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-mono text-sm tracking-wider">
            LOADING NETWORK AGENTS FROM DEVNET...
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
            <p className="text-gray-400 font-mono text-sm mb-2 tracking-wider">
              NO NETWORK AGENTS INDEXED
            </p>
            <p className="text-gray-600 text-xs font-mono mb-6">
              Register your first agent to start building the safety graph.
            </p>
            <Link href="/register" className="btn-hud">
              REGISTER FIRST AGENT
            </Link>
          </HUDFrame>
        </motion.div>
      ) : (
        <>
          <motion.div variants={fadeUp} className="mb-4">
            <div className="font-mono text-xs text-sentinel-cyan/50 tracking-[0.3em] mb-2">
              NETWORK OVERVIEW
            </div>
            <h2 className="text-2xl font-bold font-mono text-white tracking-tight">
              ALL REGISTERED AGENTS
            </h2>
            <p className="text-gray-500 font-mono text-sm mt-1 tracking-wide">
              Broader ecosystem view after your personal safety state is understood
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger}>
            {agents.map((agent, i) => {
              const [agentRecordPda] = findAgentRecordPda(agent.agentIdentity);
              const agentKey = agentRecordPda.toBase58();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const policy = policies.find((p: any) => p.account.agentRecord.toBase58() === agentKey && p.account.isActive);
              const tier = policy ? getTierString(policy.account.tier) : null;

              return (
                <motion.div key={i} variants={fadeUp}>
                  <AgentCard agent={agent} insuranceTier={tier} href={`/agents/${agent.agentIdentity.toBase58()}`} />
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}

      {!loading && agents.length > 0 && (
        <motion.div variants={fadeUp} className="mt-8">
          <InsurancePanel
            program={program}
            wallet={wallet}
            agents={rawAgents}
            policies={policies}
            pool={insurancePool}
            onRefresh={loadAgents}
          />
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
