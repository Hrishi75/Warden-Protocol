"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { PublicKey } from "@solana/web3.js";
import { AuthGuard } from "@/components/AuthGuard";
import { HUDFrame } from "@/components/HUDFrame";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/providers/AuthProvider";
import { isProfileComplete } from "@/lib/auth";
import { useProgram } from "@/lib/useProgram";
import { fetchAgent, fetchAllPolicies, findAgentRecordPda, getTierString } from "@/lib/program";
import { computeTrustScore } from "@/lib/fraudScore";
import {
  IndexedAgentLike,
  computeIndexedAgentTrust,
  formatAgentAge,
  formatCompactWallet,
  formatIndexedTimestamp,
  getAgentRiskRecommendations,
  lamportsToSol,
} from "@/lib/agent-risk";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
};

interface IndexedAgentResponse extends IndexedAgentLike {
  id: string;
  lastIndexedSlot: string;
}

function AgentSafetyPassport() {
  const params = useParams<{ id: string }>();
  const { operative } = useAuth();
  const { program } = useProgram();
  const [agent, setAgent] = useState<IndexedAgentResponse | null>(null);
  const [insuranceTier, setInsuranceTier] = useState<"Basic" | "Standard" | "Premium" | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [onChainAgent, setOnChainAgent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chainError, setChainError] = useState("");

  useEffect(() => {
    const agentId = params?.id;
    if (!agentId) return;

    let cancelled = false;

    async function loadAgentRecord() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/agents/${encodeURIComponent(agentId)}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Agent not found");
        }

        const data = (await res.json()) as IndexedAgentResponse;
        if (!cancelled) {
          setAgent(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load agent safety passport");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAgentRecord();
    return () => {
      cancelled = true;
    };
  }, [params]);

  useEffect(() => {
    if (!program || !agent) return;

    let cancelled = false;

    async function enrichAgentRecord() {
      try {
        setChainError("");
        const agentPublicKey = new PublicKey(agent!.agentIdentity);
        const [chainAgent, policies] = await Promise.all([
          fetchAgent(program, agentPublicKey),
          fetchAllPolicies(program),
        ]);

        if (cancelled) return;

        setOnChainAgent(chainAgent);

        const [agentRecordPda] = findAgentRecordPda(agentPublicKey);
        const policy = policies.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) => item.account.agentRecord.toBase58() === agentRecordPda.toBase58() && item.account.isActive
        );
        setInsuranceTier(policy ? getTierString(policy.account.tier) : null);
      } catch (err) {
        if (!cancelled) {
          setChainError(err instanceof Error ? err.message : "Unable to enrich on-chain agent data");
          setOnChainAgent(null);
          setInsuranceTier(null);
        }
      }
    }

    enrichAgentRecord();
    return () => {
      cancelled = true;
    };
  }, [program, agent]);

  if (loading) {
    return (
      <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="w-8 h-8 border-2 border-sentinel-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-sm text-gray-500 tracking-wider">LOADING SAFETY PASSPORT...</p>
      </motion.div>
    );
  }

  if (error || !agent) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <HUDFrame color="red" className="text-center py-14">
          <p className="font-mono text-sm text-alert-red mb-2">{error || "Agent not found"}</p>
          <Link href="/dashboard" className="btn-hud inline-block mt-4">
            BACK TO DASHBOARD
          </Link>
        </HUDFrame>
      </motion.div>
    );
  }

  const fallbackTrust = computeIndexedAgentTrust(agent, { insuranceTier });
  const trustScore = onChainAgent ? computeTrustScore(onChainAgent) : null;
  const recommendations = getAgentRiskRecommendations(agent, { insuranceTier });
  const allowedPrograms = onChainAgent?.permissions?.allowedPrograms ?? [];
  const strikesRemaining = onChainAgent?.paroleTerms?.strikesRemaining ?? null;
  const hasGovernanceProfile = operative ? isProfileComplete(operative) : false;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-6xl mx-auto">
      <motion.div className="flex items-start justify-between gap-4 mb-8 flex-wrap" variants={fadeUp}>
        <div>
          <div className="font-mono text-xs text-sentinel-cyan/50 tracking-[0.3em] mb-2">
            AGENT SAFETY PASSPORT
          </div>
          <h1 className="text-3xl font-bold font-mono text-white tracking-tight">
            {formatCompactWallet(agent.agentIdentity)}
          </h1>
          <p className="text-gray-500 font-mono text-sm mt-1 tracking-wide">
            Interpretable trust, permissions, history, and protection posture for this agent
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={agent.status as "Active" | "Arrested" | "Paroled" | "Terminated"} />
          <Link href="/dashboard" className="btn-hud !py-2 !px-4 text-xs">
            BACK TO DASHBOARD
          </Link>
        </div>
      </motion.div>

      {chainError && (
        <motion.div variants={fadeUp} className="mb-6">
          <HUDFrame color="orange" className="!p-4">
            <p className="font-mono text-xs text-sentinel-orange">
              Live on-chain enrichment is unavailable right now. Showing indexed safety data instead.
            </p>
          </HUDFrame>
        </motion.div>
      )}

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8" variants={stagger}>
        <motion.div variants={fadeUp}>
          <HUDFrame color="cyan" label="TRUST SCORE" className="h-full">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div
                  className="font-mono text-5xl font-bold leading-none"
                  style={{ color: trustScore?.color ?? fallbackTrust.color }}
                >
                  {trustScore?.score ?? fallbackTrust.score}
                </div>
                <div className="font-mono text-xs tracking-[0.2em] mt-3 text-gray-500">
                  {trustScore ? `GRADE ${trustScore.grade}` : `${fallbackTrust.label.toUpperCase()} TRUST`}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] text-gray-500 tracking-wider">STATUS</div>
                <div className="font-mono text-sm text-white mt-1">{agent.status.toUpperCase()}</div>
              </div>
            </div>
            <div className="hud-divider my-4" />
            <div className="space-y-2">
              {(trustScore?.factors ?? fallbackTrust.reasons).slice(0, 3).map((reason) => (
                <div key={reason} className="font-mono text-xs text-gray-400 leading-relaxed">
                  {reason}
                </div>
              ))}
            </div>
          </HUDFrame>
        </motion.div>

        <motion.div variants={fadeUp}>
          <HUDFrame color="cyan" label="PROTECTION STATUS" className="h-full">
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Insurance</span>
                <span className={insuranceTier ? "text-hud-green" : "text-alert-red"}>
                  {insuranceTier ? `${insuranceTier.toUpperCase()} COVERAGE` : "NO COVERAGE"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Agent Age</span>
                <span className="text-white">{formatAgentAge(agent.registeredAt)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Bond</span>
                <span className="text-white">{lamportsToSol(agent.stakeAmount).toFixed(2)} SOL</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Transfer Cap</span>
                <span className="text-white">{lamportsToSol(agent.maxTransferLamports).toFixed(2)} SOL</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Daily Txn Cap</span>
                <span className="text-white">{agent.maxDailyTransactions}</span>
              </div>
            </div>
          </HUDFrame>
        </motion.div>

        <motion.div variants={fadeUp}>
          <HUDFrame color="orange" label="RECOMMENDED ACTIONS" className="h-full">
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((recommendation) => (
                <div key={recommendation.title} className="border border-sentinel-orange/20 bg-sentinel-orange/5 p-3">
                  <div className="font-mono text-xs text-sentinel-orange tracking-wider mb-1">
                    {recommendation.title.toUpperCase()}
                  </div>
                  <p className="font-mono text-[11px] text-gray-400 leading-relaxed">
                    {recommendation.detail}
                  </p>
                </div>
              ))}
            </div>
          </HUDFrame>
        </motion.div>
      </motion.div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8" variants={stagger}>
        <motion.div variants={fadeUp}>
          <HUDFrame color="cyan" label="SAFETY PASSPORT" className="h-full !p-0">
            {[
              { label: "Owner Wallet", value: agent.owner, desc: "Wallet currently accountable for this agent." },
              { label: "Agent Identity", value: agent.agentIdentity, desc: "Permanent on-chain agent public key." },
              { label: "Registered", value: formatIndexedTimestamp(agent.registeredAt), desc: "First indexed registration time." },
              { label: "Last Indexed Slot", value: agent.lastIndexedSlot, desc: "Most recent slot mirrored into the safety index." },
            ].map((item, index, all) => (
              <div
                key={item.label}
                className={`px-5 py-4 ${index < all.length - 1 ? "border-b border-sentinel-border/20" : ""}`}
              >
                <div className="flex justify-between gap-4 items-start">
                  <span className="font-mono text-xs text-gray-500 tracking-wider">{item.label}</span>
                  <span className="font-mono text-xs text-white text-right break-all max-w-[60%]">{item.value}</span>
                </div>
                <p className="font-mono text-[10px] text-gray-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </HUDFrame>
        </motion.div>

        <motion.div variants={fadeUp}>
          <HUDFrame color="cyan" label="PERMISSIONS & LIMITS" className="h-full">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-sentinel-border/20 bg-sentinel-surface/20 p-3">
                  <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-1">MAX TRANSFER</div>
                  <div className="font-mono text-lg text-white">
                    {lamportsToSol(agent.maxTransferLamports).toFixed(2)} SOL
                  </div>
                </div>
                <div className="border border-sentinel-border/20 bg-sentinel-surface/20 p-3">
                  <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-1">DAILY TXNS</div>
                  <div className="font-mono text-lg text-white">{agent.maxDailyTransactions}</div>
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] text-gray-500 tracking-[0.2em] mb-2">
                  ALLOWED PROGRAMS
                </div>
                {allowedPrograms.length > 0 ? (
                  <div className="space-y-2">
                    {allowedPrograms.map((programKey: PublicKey) => {
                      const value = programKey.toBase58();
                      return (
                        <div
                          key={value}
                          className="border border-sentinel-cyan/20 bg-sentinel-cyan/5 p-3 font-mono text-xs text-gray-300 break-all"
                        >
                          {value}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border border-sentinel-border/20 bg-sentinel-surface/20 p-3 font-mono text-xs text-gray-500">
                    No explicit allowlist is visible for this agent yet.
                  </div>
                )}
              </div>
            </div>
          </HUDFrame>
        </motion.div>
      </motion.div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8" variants={stagger}>
        <motion.div variants={fadeUp}>
          <HUDFrame color="purple" label="ACTIVITY & VIOLATIONS TIMELINE" className="h-full">
            {agent.violations.length === 0 ? (
              <p className="font-mono text-xs text-gray-500">No indexed violations recorded for this agent.</p>
            ) : (
              <div className="space-y-3">
                {agent.violations.map((violation) => (
                  <div key={violation.id ?? `${violation.violationType}-${violation.timestamp}`} className="border border-alert-red/20 bg-alert-red/5 p-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-mono text-xs text-alert-red tracking-wider mb-1">
                          {violation.violationType}
                        </div>
                        <p className="font-mono text-[11px] text-gray-400 leading-relaxed">
                          {violation.description || "Violation captured by the indexed safety feed."}
                        </p>
                      </div>
                      <div className="font-mono text-[10px] text-gray-600 shrink-0">
                        {violation.timestamp ? formatIndexedTimestamp(violation.timestamp) : "Indexed"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </HUDFrame>
        </motion.div>

        <motion.div variants={fadeUp}>
          <HUDFrame color="orange" label="INSURANCE & GOVERNANCE" className="h-full">
            <div className="space-y-4">
              <div className="border border-sentinel-border/20 bg-sentinel-surface/20 p-4">
                <div className="font-mono text-xs text-gray-500 tracking-wider mb-1">COVERAGE</div>
                <div className={`font-mono text-sm ${insuranceTier ? "text-hud-green" : "text-sentinel-orange"}`}>
                  {insuranceTier ? `${insuranceTier.toUpperCase()} PLAN ACTIVE` : "UNINSURED"}
                </div>
                <p className="font-mono text-[10px] text-gray-600 mt-2">
                  {insuranceTier
                    ? "Coverage is active and improves visible trust for wallet-first users."
                    : "Insurance is still missing, so users must rely on limits and historical behavior alone."}
                </p>
              </div>

              <div className="border border-sentinel-border/20 bg-sentinel-surface/20 p-4">
                <div className="font-mono text-xs text-gray-500 tracking-wider mb-1">CASE HISTORY</div>
                <div className="font-mono text-sm text-white">
                  {agent.status === "Active" ? "No active enforcement case" : `${agent.status} history detected`}
                </div>
                <p className="font-mono text-[10px] text-gray-600 mt-2">
                  {strikesRemaining !== null
                    ? `${strikesRemaining} parole strike(s) remaining before harsher action.`
                    : "Governance history becomes more credible when reviewers have completed profiles."}
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Link href="/dashboard" className="btn-hud !py-2 !px-4 text-xs">
                  OPEN COVERAGE SHIELD
                </Link>
                <Link
                  href={hasGovernanceProfile ? "/dao" : "/auth?next=/dao"}
                  className="btn-hud !border-sentinel-orange/30 !text-sentinel-orange hover:!bg-sentinel-orange/10 !py-2 !px-4 text-xs"
                >
                  {hasGovernanceProfile ? "OPEN GOVERNANCE" : "COMPLETE PROFILE FOR GOVERNANCE"}
                </Link>
              </div>
            </div>
          </HUDFrame>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function AgentSafetyPassportPage() {
  return (
    <AuthGuard>
      <AgentSafetyPassport />
    </AuthGuard>
  );
}
