"use client";

import React, { useState, useCallback } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { HUDFrame } from "./HUDFrame";
import {
  buyCoverage,
  fileClaim,
  cancelCoverage,
  getTierString,
  getStatusString,
  findAgentRecordPda,
} from "@/lib/program";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Agent = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Policy = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pool = any;

interface InsurancePanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  program: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallet: any;
  agents: Agent[];
  policies: Policy[];
  pool: Pool | null;
  onRefresh: () => void;
}

const tierConfig = {
  Basic: {
    color: "#00E5CC",
    premiumPct: "5%",
    coveragePct: "50%",
    label: "BASIC",
    description: "Essential coverage for low-risk agents",
  },
  Standard: {
    color: "#FF9B26",
    premiumPct: "10%",
    coveragePct: "100%",
    label: "STANDARD",
    description: "Full stake coverage for active agents",
  },
  Premium: {
    color: "#6C5CE7",
    premiumPct: "18%",
    coveragePct: "150%",
    label: "PREMIUM",
    description: "Maximum protection with bonus coverage",
  },
};

export function InsurancePanel({
  program,
  wallet,
  agents,
  policies,
  pool,
  onRefresh,
}: InsurancePanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Map policies by agent record pubkey for lookup
  const policyMap = new Map<string, Policy>();
  policies.forEach((p: Policy) => {
    if (p.account.isActive) {
      policyMap.set(p.account.agentRecord.toBase58(), p);
    }
  });

  const userAgents = agents.filter(
    (a: Agent) => a.account.owner.toBase58() === wallet?.publicKey?.toBase58()
  );

  const handleBuyCoverage = useCallback(
    async (agent: Agent, tierKey: string) => {
      if (!program || !wallet?.publicKey) return;
      setLoading(`buy-${agent.account.agentIdentity.toBase58()}`);
      setError(null);
      try {
        const tierEnum =
          tierKey === "Basic"
            ? { basic: {} }
            : tierKey === "Standard"
            ? { standard: {} }
            : { premium: {} };
        await buyCoverage(
          program,
          wallet.publicKey,
          agent.account.agentIdentity,
          tierEnum
        );
        setShowModal(false);
        setSelectedAgent(null);
        onRefresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to buy coverage");
      } finally {
        setLoading(null);
      }
    },
    [program, wallet, onRefresh]
  );

  const handleFileClaim = useCallback(
    async (agent: Agent) => {
      if (!program || !wallet?.publicKey) return;
      setLoading(`claim-${agent.account.agentIdentity.toBase58()}`);
      setError(null);
      try {
        await fileClaim(program, wallet.publicKey, agent.account.agentIdentity);
        onRefresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to file claim");
      } finally {
        setLoading(null);
      }
    },
    [program, wallet, onRefresh]
  );

  const handleCancel = useCallback(
    async (agent: Agent) => {
      if (!program || !wallet?.publicKey) return;
      setLoading(`cancel-${agent.account.agentIdentity.toBase58()}`);
      setError(null);
      try {
        const [agentRecord] = findAgentRecordPda(agent.account.agentIdentity);
        await cancelCoverage(program, wallet.publicKey, agentRecord);
        onRefresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to cancel policy");
      } finally {
        setLoading(null);
      }
    },
    [program, wallet, onRefresh]
  );

  return (
    <HUDFrame color="purple" label="COVERAGE SHIELD" className="mt-6">
      {/* Pool Stats */}
      {pool && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "POOL BALANCE",
              value: `${(pool.totalDeposits.toNumber() - pool.totalClaimsPaid.toNumber()) / LAMPORTS_PER_SOL} SOL`,
              color: "#6C5CE7",
            },
            {
              label: "ACTIVE POLICIES",
              value: pool.activePolicies.toString(),
              color: "#00E5CC",
            },
            {
              label: "TOTAL PREMIUMS",
              value: `${(pool.totalDeposits.toNumber() / LAMPORTS_PER_SOL).toFixed(2)} SOL`,
              color: "#FF9B26",
            },
            {
              label: "CLAIMS PAID",
              value: `${(pool.totalClaimsPaid.toNumber() / LAMPORTS_PER_SOL).toFixed(2)} SOL`,
              color: "#FF0033",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 border border-sentinel-border/30 bg-sentinel-surface/30"
            >
              <div className="font-mono text-[10px] tracking-[0.2em] text-gray-500 mb-1">
                {stat.label}
              </div>
              <div
                className="font-mono text-lg font-bold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 border border-alert-red/30 bg-alert-red/5 font-mono text-xs text-alert-red">
          {error}
        </div>
      )}

      {/* Agent Insurance Table */}
      <div className="font-mono text-[10px] tracking-[0.2em] text-gray-500 mb-3">
        YOUR AGENTS
      </div>

      {userAgents.length === 0 ? (
        <div className="text-center py-8 font-mono text-xs text-gray-600">
          No agents registered. Register an agent to buy insurance coverage.
        </div>
      ) : (
        <div className="space-y-2">
          {userAgents.map((agent: Agent) => {
            const agentKey = agent.publicKey.toBase58();
            const policy = policyMap.get(agentKey);
            const status = getStatusString(agent.account.status);
            const isTerminated = status === "Terminated";
            const hasPolicy = !!policy;
            const canClaim =
              isTerminated && hasPolicy && !policy.account.claimed;
            const canBuy = status === "Active" && !hasPolicy;
            const agentId = agent.account.agentIdentity
              .toBase58()
              .slice(0, 12);
            const stakeSOL = (
              agent.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL
            ).toFixed(3);

            return (
              <div
                key={agentKey}
                className="flex items-center justify-between p-3 border border-sentinel-border/20 bg-sentinel-surface/20 hover:bg-sentinel-surface/40 transition"
              >
                {/* Agent info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div>
                    <div className="font-mono text-xs text-gray-300">
                      {agentId}...
                    </div>
                    <div className="font-mono text-[10px] text-gray-600">
                      STAKE: {stakeSOL} SOL
                    </div>
                  </div>
                </div>

                {/* Policy status */}
                <div className="flex items-center gap-3">
                  {hasPolicy ? (
                    <InsuranceTierBadge
                      tier={getTierString(policy.account.tier)}
                    />
                  ) : (
                    <span className="font-mono text-[10px] text-gray-600 tracking-wider">
                      UNINSURED
                    </span>
                  )}

                  {/* Actions */}
                  {canBuy && (
                    <button
                      onClick={() => {
                        setSelectedAgent(agent);
                        setShowModal(true);
                        setError(null);
                      }}
                      className="px-3 py-1.5 border border-sentinel-purple/40 text-sentinel-purple font-mono text-[10px] tracking-wider hover:bg-sentinel-purple/10 transition"
                    >
                      BUY COVERAGE
                    </button>
                  )}
                  {canClaim && (
                    <button
                      onClick={() => handleFileClaim(agent)}
                      disabled={loading !== null}
                      className="px-3 py-1.5 border border-sentinel-orange/40 text-sentinel-orange font-mono text-[10px] tracking-wider hover:bg-sentinel-orange/10 transition disabled:opacity-50"
                    >
                      {loading ===
                      `claim-${agent.account.agentIdentity.toBase58()}`
                        ? "FILING..."
                        : "FILE CLAIM"}
                    </button>
                  )}
                  {hasPolicy && !isTerminated && (
                    <button
                      onClick={() => handleCancel(agent)}
                      disabled={loading !== null}
                      className="px-3 py-1.5 border border-gray-700 text-gray-500 font-mono text-[10px] tracking-wider hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      {loading ===
                      `cancel-${agent.account.agentIdentity.toBase58()}`
                        ? "..."
                        : "CANCEL"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Buy Coverage Modal */}
      {showModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-sentinel-navy border border-sentinel-purple/30 max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-mono text-[10px] tracking-[0.3em] text-sentinel-purple/60 mb-1">
                  SELECT COVERAGE TIER
                </div>
                <div className="font-mono text-sm text-gray-300">
                  Agent:{" "}
                  {selectedAgent.account.agentIdentity
                    .toBase58()
                    .slice(0, 16)}
                  ...
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedAgent(null);
                  setError(null);
                }}
                className="text-gray-500 hover:text-white transition font-mono text-lg"
              >
                x
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["Basic", "Standard", "Premium"] as const).map((tierKey) => {
                const tier = tierConfig[tierKey];
                const stakeAmount =
                  selectedAgent.account.stakeAmount.toNumber();
                const premiumBps =
                  tierKey === "Basic"
                    ? 500
                    : tierKey === "Standard"
                    ? 1000
                    : 1800;
                const coverageBps =
                  tierKey === "Basic"
                    ? 5000
                    : tierKey === "Standard"
                    ? 10000
                    : 15000;
                const premiumSOL =
                  (stakeAmount * premiumBps) / 10000 / LAMPORTS_PER_SOL;
                const coverageSOL =
                  (stakeAmount * coverageBps) / 10000 / LAMPORTS_PER_SOL;
                const isLoading =
                  loading ===
                  `buy-${selectedAgent.account.agentIdentity.toBase58()}`;

                return (
                  <button
                    key={tierKey}
                    onClick={() => handleBuyCoverage(selectedAgent, tierKey)}
                    disabled={loading !== null}
                    className="p-4 border text-left transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={{
                      borderColor: `${tier.color}40`,
                      background: `${tier.color}05`,
                    }}
                  >
                    <div
                      className="font-mono text-xs font-bold tracking-[0.2em] mb-2"
                      style={{ color: tier.color }}
                    >
                      {tier.label}
                    </div>
                    <div className="text-gray-500 text-[11px] mb-4">
                      {tier.description}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-gray-600">PREMIUM</span>
                        <span style={{ color: tier.color }}>
                          {tier.premiumPct} ({premiumSOL.toFixed(4)} SOL)
                        </span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-gray-600">COVERAGE</span>
                        <span style={{ color: tier.color }}>
                          {tier.coveragePct} ({coverageSOL.toFixed(4)} SOL)
                        </span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-gray-600">PERIOD</span>
                        <span className="text-gray-400">30 DAYS</span>
                      </div>
                    </div>
                    <div
                      className="mt-4 py-2 text-center font-mono text-[10px] tracking-[0.2em] border"
                      style={{
                        borderColor: `${tier.color}60`,
                        color: tier.color,
                      }}
                    >
                      {isLoading ? "PROCESSING..." : "SELECT"}
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-4 p-3 border border-alert-red/30 bg-alert-red/5 font-mono text-xs text-alert-red">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </HUDFrame>
  );
}

// Tier badge sub-component
export function InsuranceTierBadge({ tier }: { tier: "Basic" | "Standard" | "Premium" }) {
  const config = tierConfig[tier];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.15em]"
      style={{
        color: config.color,
        background: `${config.color}12`,
        border: `1px solid ${config.color}40`,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
      </svg>
      {config.label}
    </span>
  );
}
