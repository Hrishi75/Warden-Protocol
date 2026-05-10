"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HUDFrame } from "./HUDFrame";
import { StatusBadge } from "./StatusBadge";

type AgentStatus = "Active" | "Arrested" | "Paroled" | "Terminated";

interface ApiAgent {
  id: string;
  agentIdentity: string;
  owner: string;
  stakeAmount: string;
  status: AgentStatus;
  maxTransferLamports: string;
  maxDailyTransactions: number;
  registeredAt: string;
  violations: { violationType: string; timestamp: string }[];
}

const LAMPORTS_PER_SOL = 1_000_000_000;

function formatSol(lamports: string): string {
  const n = Number(lamports) / LAMPORTS_PER_SOL;
  return n.toFixed(2);
}

function truncate(id: string): string {
  if (id.length <= 10) return id;
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

function frameColorForStatus(status: AgentStatus): "cyan" | "orange" | "red" | "green" {
  switch (status) {
    case "Active":
      return "green";
    case "Paroled":
      return "orange";
    case "Arrested":
      return "red";
    default:
      return "cyan";
  }
}

function SkeletonCard() {
  return (
    <HUDFrame color="cyan" className="h-full">
      <div className="animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-sentinel-border/40" />
          <div className="h-4 w-16 bg-sentinel-border/40" />
        </div>
        <div className="h-3 w-full bg-sentinel-border/30 mt-6" />
        <div className="h-3 w-3/4 bg-sentinel-border/30" />
        <div className="h-3 w-1/2 bg-sentinel-border/30" />
      </div>
    </HUDFrame>
  );
}

function AgentShowcaseCard({ agent }: { agent: ApiAgent }) {
  const violations = agent.violations.length;
  return (
    <Link href={`/agents/${agent.agentIdentity}`} className="block h-full">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="h-full"
      >
        <HUDFrame color={frameColorForStatus(agent.status)} className="h-full">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-mono text-sm tracking-wider">
              {truncate(agent.agentIdentity)}
            </h3>
            <StatusBadge status={agent.status} />
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 tracking-wider">DEPOSIT</span>
              <span className="text-sentinel-cyan">{formatSol(agent.stakeAmount)} SOL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 tracking-wider">VIOLATIONS</span>
              <span className={violations > 0 ? "text-alert-red" : "text-hud-green"}>
                {violations}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 tracking-wider">MAX TRANSFER</span>
              <span className="text-gray-400">{formatSol(agent.maxTransferLamports)} SOL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 tracking-wider">OWNER</span>
              <span className="text-gray-400">{truncate(agent.owner)}</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-sentinel-border/20 font-mono text-[10px] tracking-[0.2em] text-sentinel-cyan">
            VIEW AGENT →
          </div>
        </HUDFrame>
      </motion.div>
    </Link>
  );
}

function EmptyState() {
  return (
    <HUDFrame color="cyan" className="text-center">
      <div className="py-10 space-y-4">
        <p className="font-mono text-xs tracking-[0.2em] text-gray-500 uppercase">
          No active agents yet
        </p>
        <p className="text-gray-400 text-sm">
          The protocol is live — register the first AI agent and claim the flag.
        </p>
        <Link
          href="/register"
          className="inline-block font-mono text-[11px] tracking-[0.2em] text-sentinel-cyan border border-sentinel-cyan/40 px-5 py-2 hover:bg-sentinel-cyan/10 transition-colors uppercase"
        >
          Register First Agent →
        </Link>
      </div>
    </HUDFrame>
  );
}

export function LiveAgentsShowcase() {
  const [agents, setAgents] = useState<ApiAgent[] | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/agents?status=Active&limit=3&page=1");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setAgents(data.agents ?? []);
      } catch {
        if (!cancelled) {
          setErrored(true);
          setAgents([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (agents === null) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="max-w-xl mx-auto">
        <EmptyState />
        {errored && (
          <p className="mt-4 text-center font-mono text-[10px] tracking-[0.15em] text-gray-600 uppercase">
            // Indexer offline — showing empty roster
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentShowcaseCard key={agent.agentIdentity} agent={agent} />
        ))}
      </div>
      <div className="text-center">
        <Link
          href="/dashboard"
          className="inline-block font-mono text-[11px] tracking-[0.25em] text-gray-500 hover:text-sentinel-cyan transition-colors uppercase"
        >
          See all agents →
        </Link>
      </div>
    </div>
  );
}
