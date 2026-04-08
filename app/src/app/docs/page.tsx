"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HUDFrame } from "@/components/HUDFrame";

type Section = "overview" | "architecture" | "instructions" | "accounts" | "lifecycle" | "sdk" | "errors";

const sections: { id: Section; title: string }[] = [
  { id: "overview", title: "OVERVIEW" },
  { id: "architecture", title: "ARCHITECTURE" },
  { id: "instructions", title: "INSTRUCTIONS" },
  { id: "accounts", title: "ACCOUNTS" },
  { id: "lifecycle", title: "LIFECYCLE" },
  { id: "sdk", title: "SDK" },
  { id: "errors", title: "ERROR CODES" },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-warden-navy/80 border border-warden-cyan/10 p-4 text-sm font-mono text-hud-green/80 overflow-x-auto relative">
      <div className="absolute top-2 right-3 font-mono text-[9px] text-gray-700 tracking-wider">CLASSIFIED</div>
      {children}
    </pre>
  );
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-white mb-4 font-mono tracking-wider flex items-center gap-2">
        <span className="text-warden-cyan/30">[</span>
        {title}
        <span className="text-warden-cyan/30">]</span>
      </h2>
      <div className="space-y-4 text-gray-400 leading-relaxed">{children}</div>
    </section>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-mono font-bold tracking-wider ${color}`}>
      {children}
    </span>
  );
}

export default function DocsPage() {
  const [active, setActive] = useState<Section>("overview");

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-xs text-warden-cyan/50 tracking-[0.3em] mb-2">
          CLASSIFIED DOCUMENTS
        </div>
        <h1 className="text-3xl font-bold font-mono text-white tracking-tight">
          INTEL DATABASE
        </h1>
        <p className="text-gray-600 font-mono text-sm mt-1 tracking-wide">
          Technical reference for the Sentinel Protocol on-chain program
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <nav className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-28 space-y-0 border border-warden-border/30">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`block w-full text-left px-4 py-2.5 font-mono text-xs tracking-wider transition-all duration-200 border-b border-warden-border/20 last:border-b-0 ${
                  active === s.id
                    ? "text-warden-cyan bg-warden-cyan/10 border-l-2 border-l-warden-cyan"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile tabs */}
        <div className="lg:hidden mb-6 w-full">
          <div className="flex flex-wrap gap-0 border border-warden-border/30">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`px-3 py-2 font-mono text-[10px] tracking-wider transition ${
                  active === s.id
                    ? "bg-warden-cyan/10 text-warden-cyan"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {active === "overview" && (
            <DocSection title="OVERVIEW">
              <p>
                <strong className="text-white">Sentinel Protocol</strong> is an on-chain accountability system
                for autonomous AI agents on Solana. It provides a complete lifecycle for registering,
                monitoring, arresting, and governing AI agents through staked bonds and decentralized
                DAO jury oversight.
              </p>

              <HUDFrame color="cyan" className="!p-4">
                <div className="space-y-1.5 font-mono text-sm">
                  <p><span className="text-warden-cyan">PROGRAM ID:</span>{" "}
                    <span className="text-gray-500 text-xs">5DCbrjFHUdzLHLayUUdFJBnBPC8UV7eUc3wJA1rVRQTa</span>
                  </p>
                  <p><span className="text-warden-cyan">NETWORK:</span> <span className="text-gray-400">Solana Devnet</span></p>
                  <p><span className="text-warden-cyan">FRAMEWORK:</span> <span className="text-gray-400">Anchor 0.31.1</span></p>
                </div>
              </HUDFrame>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">KEY DIRECTIVES</h3>
              <ul className="space-y-2 ml-4">
                {[
                  ["Staked Bonds", "Agents post SOL as collateral, slashed on termination"],
                  ["Permission Scope", "Transfer limits and daily transaction caps"],
                  ["Arrest & Cell", "Rogue agents frozen with incidents logged on-chain"],
                  ["Bail & Voting", "Stake-weighted council voting on agent fate"],
                  ["Parole", "Reduced permissions with 3-strike probation"],
                ].map(([title, desc]) => (
                  <li key={title} className="flex gap-2">
                    <span className="text-warden-cyan font-mono">&#x25B8;</span>
                    <span><strong className="text-white">{title}</strong> — {desc}</span>
                  </li>
                ))}
              </ul>
            </DocSection>
          )}

          {active === "architecture" && (
            <DocSection title="ARCHITECTURE">
              <p>
                The protocol consists of a single Anchor program with 4 account types linked by PDAs
                (Program Derived Addresses).
              </p>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">PDA STRUCTURE</h3>
              <CodeBlock>{`SentinelDao     ← seeds: ["sentinel_dao"]
AgentRecord   ← seeds: ["agent", agent_identity]
  └─ Vault    ← seeds: ["vault", agent_record]
  └─ Cell     ← seeds: ["cell", agent_record]
     └─ BailRequest ← seeds: ["bail", cell]
        └─ BailVault ← seeds: ["bail_vault", bail_request]`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">ACCOUNT RELATIONSHIPS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "SentinelDao", color: "cyan" as const, desc: "Singleton. Stores DAO members, voting config, treasury. Max 10 members." },
                  { title: "AgentRecord", color: "cyan" as const, desc: "One per agent. Status, stake, permissions, violations (max 10), parole terms." },
                  { title: "Cell", color: "orange" as const, desc: "Created on arrest. Arrester, reason, evidence hash, frozen token accounts." },
                  { title: "BailRequest", color: "orange" as const, desc: "Created on bail. Votes, outcome, review deadline. Stake-weighted voting." },
                ].map((item) => (
                  <HUDFrame key={item.title} color={item.color} className="!p-4">
                    <h4 className="font-mono text-sm font-bold mb-1" style={{ color: item.color === "cyan" ? "#00E5CC" : "#FF9B26" }}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </HUDFrame>
                ))}
              </div>
            </DocSection>
          )}

          {active === "instructions" && (
            <DocSection title="PROGRAM INSTRUCTIONS">
              <p className="font-mono text-sm">9 instructions available:</p>

              <div className="space-y-3">
                {[
                  { name: "init_dao", desc: "Initialize the War Council singleton with members and voting configuration.", args: "vote_threshold, review_window_seconds, min_bail_lamports, slash_percentage, initial_members", signer: "DAO Authority" },
                  { name: "register_agent", desc: "Deploy a new AI operative with accountability bond and permission scope.", args: "permissions (PermissionScope), stake_amount (u64)", signer: "Agent Owner + Agent Identity" },
                  { name: "arrest_agent", desc: "Contain an agent — freezes status, creates Cell, logs incident.", args: "reason, evidence_hash, violation_type", signer: "Council Member or Owner" },
                  { name: "freeze_agent_token", desc: "Freeze contained agent's SPL token account via CPI.", args: "None", signer: "Authority" },
                  { name: "post_bail", desc: "Owner posts extraction fee to initiate council voting.", args: "bail_amount (u64)", signer: "Agent Owner" },
                  { name: "cast_vote", desc: "Council member casts stake-weighted vote on outcome.", args: "decision (Released | Paroled | Terminated)", signer: "Council Member" },
                  { name: "release_agent", desc: "Execute the voting outcome — release, parole, or neutralize.", args: "None", signer: "Authority" },
                  { name: "report_violation", desc: "Report parole violation, decrement strikes. Auto-arrest at 0.", args: "violation_type, evidence_hash, description", signer: "Council Member or Owner" },
                  { name: "check_probation", desc: "Check if probation ended, reinstate agent to operational.", args: "None", signer: "Any" },
                ].map((ix) => (
                  <HUDFrame key={ix.name} color="cyan" className="!p-4">
                    <h4 className="font-mono text-warden-cyan text-sm font-bold">{ix.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{ix.desc}</p>
                    <div className="mt-2 text-[11px] space-y-0.5 font-mono">
                      <p><span className="text-gray-600">ARGS:</span> <span className="text-gray-500">{ix.args}</span></p>
                      <p><span className="text-gray-600">SIGNER:</span> <span className="text-gray-500">{ix.signer}</span></p>
                    </div>
                  </HUDFrame>
                ))}
              </div>
            </DocSection>
          )}

          {active === "accounts" && (
            <DocSection title="ACCOUNT STRUCTURES">
              <h3 className="text-base font-bold text-white font-mono tracking-wider">AgentRecord</h3>
              <CodeBlock>{`{
  agent_identity: PublicKey,
  owner: PublicKey,
  stake_amount: u64,
  status: AgentStatus,       // Active | Arrested | Paroled | Terminated
  permissions: PermissionScope {
    max_transfer_lamports: u64,
    allowed_programs: Vec<PublicKey>,  // max 5
    max_daily_transactions: u16,
  },
  violations: Vec<Violation>,  // max 10
  registered_at: i64,
  parole_terms: Option<ParoleTerms>,
  bump: u8,
}`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">Cell</h3>
              <CodeBlock>{`{
  agent: PublicKey,
  arrester: PublicKey,
  reason: String,              // max 256 chars
  evidence_hash: [u8; 32],
  arrested_at: i64,
  frozen_token_accounts: Vec<PublicKey>,  // max 5
  bail_posted: bool,
  bump: u8,
}`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">BailRequest</h3>
              <CodeBlock>{`{
  cell: PublicKey,
  agent: PublicKey,
  owner: PublicKey,
  bail_amount: u64,
  posted_at: i64,
  review_deadline: i64,
  votes: Vec<Vote>,          // max 10
  outcome: BailOutcome,      // Pending | Released | Paroled | Terminated
  bump: u8,
}

Vote {
  voter: PublicKey,
  decision: BailOutcome,
  weight: u64,               // voter's DAO stake
  timestamp: i64,
}`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">SentinelDao</h3>
              <CodeBlock>{`{
  authority: PublicKey,
  members: Vec<DaoMember>,   // max 10
  vote_threshold: u8,        // percentage (e.g., 51)
  review_window_seconds: i64,
  min_bail_lamports: u64,
  slash_percentage: u8,
  treasury: PublicKey,
  bump: u8,
}

DaoMember {
  wallet: PublicKey,
  stake: u64,
  is_active: bool,
}`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">ParoleTerms</h3>
              <CodeBlock>{`{
  reduced_max_transfer: u64,   // 50% of original
  reduced_daily_txns: u16,     // 50% of original
  must_report: bool,
  parole_start: i64,
  probation_end: i64,          // 120s demo period
  strikes_remaining: u8,       // starts at 3
}`}</CodeBlock>
            </DocSection>
          )}

          {active === "lifecycle" && (
            <DocSection title="AGENT LIFECYCLE">
              <p>
                Agents progress through a state machine governed by on-chain instructions:
              </p>

              <div className="space-y-3 mt-4">
                {[
                  { step: "01", title: "Deploy", status: "OPERATIONAL", color: "#00E5CC", desc: "Owner calls register_agent with SOL bond and permission scope. Agent keypair signs." },
                  { step: "02", title: "Operate", status: "OPERATIONAL", color: "#00E5CC", desc: "Agent operates within PermissionScope. Violations monitored off-chain." },
                  { step: "03", title: "Contain", status: "CONTAINED", color: "#FF0033", desc: "Council member or owner calls arrest_agent. Cell created, incidents logged, tokens frozen." },
                  { step: "04", title: "Post Bail", status: "CONTAINED", color: "#FF0033", desc: "Owner posts extraction fee (min set by council). Opens review window." },
                  { step: "05", title: "Council Vote", status: "CONTAINED", color: "#FF0033", desc: "Members cast stake-weighted votes: Release, Parole, or Neutralize." },
                  { step: "6A", title: "Released", status: "OPERATIONAL", color: "#00E5CC", desc: "Full reinstatement. Bail returned. Original permissions restored." },
                  { step: "6B", title: "Paroled", status: "RESTRICTED", color: "#FF9B26", desc: "50% reduced permissions, 3 strikes, must-report. 120s probation." },
                  { step: "6C", title: "Neutralized", status: "NEUTRALIZED", color: "#6B7280", desc: "Permanently frozen. Stake slashed to treasury." },
                  { step: "07", title: "Probation", status: "RESTRICTED", color: "#FF9B26", desc: "Violations decrement strikes. 0 strikes → auto-contain. Probation ends → reinstate." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3 items-start">
                    <div className="w-8 h-8 flex items-center justify-center font-mono text-xs font-bold shrink-0 border border-warden-border/30 text-gray-500">
                      {s.step}
                    </div>
                    <HUDFrame color="cyan" className="flex-1 !p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-mono text-sm font-bold tracking-wider">{s.title}</h4>
                        <Badge color="font-mono" >{s.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </HUDFrame>
                  </div>
                ))}
              </div>

              <h3 className="text-base font-bold text-white mt-8 font-mono tracking-wider">CONSTANTS</h3>
              <HUDFrame color="orange" className="!p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["Max Violations", "10 per agent"],
                      ["Max Council Members", "10"],
                      ["Max Allowed Programs", "5 per agent"],
                      ["Review Window", "60 seconds (demo)"],
                      ["Probation Period", "120 seconds (demo)"],
                      ["Default Parole Strikes", "3"],
                      ["Max Reason Length", "256 characters"],
                      ["Max Description Length", "128 characters"],
                    ].map(([k, v]) => (
                      <tr key={k} className="border-b border-warden-border/20 last:border-b-0">
                        <td className="px-4 py-2 text-gray-500 font-mono text-xs tracking-wider">{k}</td>
                        <td className="px-4 py-2 font-mono text-warden-orange text-xs">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </HUDFrame>
            </DocSection>
          )}

          {active === "sdk" && (
            <DocSection title="SDK & INTEGRATION">
              <p>
                The frontend integrates with the on-chain program using Anchor&apos;s TypeScript client.
              </p>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">QUICK START</h3>
              <CodeBlock>{`import { useProgram } from "@/lib/useProgram";
import { registerAgent, fetchAllAgents } from "@/lib/program";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

// In your component:
const { program } = useProgram();

// Fetch all agents
const agents = await fetchAllAgents(program);

// Register an agent
const agentKeypair = Keypair.generate();
const txSig = await registerAgent(
  program,
  walletPublicKey,
  agentKeypair,
  {
    maxTransferLamports: new BN(0.1 * LAMPORTS_PER_SOL),
    allowedPrograms: [],
    maxDailyTransactions: 10,
  },
  new BN(1 * LAMPORTS_PER_SOL)
);`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">PDA HELPERS</h3>
              <CodeBlock>{`import {
  findAgentRecordPda,
  findCellPda,
  findBailRequestPda,
  findSentinelDaoPda,
  findVaultPda,
  findBailVaultPda,
} from "@/lib/program";

const [agentPda, bump] = findAgentRecordPda(agentPublicKey);
const [daoPda] = findSentinelDaoPda();`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">ACCOUNT FETCHERS</h3>
              <CodeBlock>{`import {
  fetchAllAgents,
  fetchAgent,
  fetchDao,
  fetchCell,
  fetchBailRequest,
} from "@/lib/program";

const allAgents = await fetchAllAgents(program);
const agent = await fetchAgent(program, agentIdentityPubkey);
const dao = await fetchDao(program);
const cell = await fetchCell(program, agentIdentityPubkey);
const bail = await fetchBailRequest(program, agentIdentityPubkey);`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">AVAILABLE INSTRUCTIONS</h3>
              <CodeBlock>{`import {
  registerAgent,  // Deploy new operative with bond
  arrestAgent,    // Contain rogue agent
  postBail,       // Owner posts extraction fee
  castVote,       // Council member votes
  releaseAgent,   // Execute voting outcome
} from "@/lib/program";`}</CodeBlock>
            </DocSection>
          )}

          {active === "errors" && (
            <DocSection title="ERROR CODES">
              <p className="font-mono text-sm">Custom program errors returned by the on-chain program:</p>

              <HUDFrame color="red" className="!p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-alert-red/20">
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-alert-red tracking-[0.2em]">CODE</th>
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-alert-red tracking-[0.2em]">NAME</th>
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-alert-red tracking-[0.2em]">MESSAGE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [6000, "AgentNotArrestable", "Agent is not in a state that allows arrest"],
                      [6001, "AgentNotArrested", "Agent is not currently arrested"],
                      [6002, "AgentNotOnParole", "Agent is not on parole"],
                      [6003, "AgentTerminated", "Agent is already terminated"],
                      [6004, "NotAgentOwner", "Only the agent owner can perform this action"],
                      [6005, "NotDaoMember", "Caller is not a DAO member"],
                      [6006, "BailAlreadyPosted", "Bail has already been posted for this arrest"],
                      [6007, "BailBelowMinimum", "Bail amount is below the minimum required"],
                      [6008, "VotingPeriodEnded", "Voting period has ended"],
                      [6009, "VotingNotConcluded", "Voting is still in progress"],
                      [6010, "AlreadyVoted", "Member has already voted on this bail request"],
                      [6011, "VotingClosed", "Voting has already been resolved"],
                      [6012, "MaxViolationsReached", "Maximum violations reached"],
                      [6013, "ProbationNotEnded", "Probation period has not ended yet"],
                      [6014, "InvalidStakeAmount", "Stake amount must be greater than zero"],
                      [6015, "ReasonTooLong", "Reason string too long"],
                      [6016, "DescriptionTooLong", "Description string too long"],
                    ].map(([code, name, msg]) => (
                      <tr key={String(code)} className="border-b border-warden-border/20 last:border-b-0 hover:bg-alert-red/5 transition">
                        <td className="px-4 py-2 font-mono text-alert-red text-xs">{code}</td>
                        <td className="px-4 py-2 font-mono text-white text-xs">{name}</td>
                        <td className="px-4 py-2 text-gray-500 text-xs">{msg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </HUDFrame>
            </DocSection>
          )}

          {/* Bottom nav */}
          <div className="border-t border-warden-cyan/10 pt-6 mt-12 flex items-center justify-between font-mono text-xs tracking-wider">
            <Link href="/demo" className="text-gray-500 hover:text-warden-cyan transition">
              ← SIMULATION
            </Link>
            <Link href="/dashboard" className="text-gray-500 hover:text-warden-cyan transition">
              COMMAND CENTER →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
