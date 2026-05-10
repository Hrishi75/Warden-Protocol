"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HUDFrame } from "@/components/HUDFrame";

type Section =
  | "overview"
  | "why"
  | "how-it-works"
  | "architecture"
  | "agents"
  | "dao"
  | "lifecycle"
  | "insurance"
  | "payments"
  | "instructions"
  | "accounts"
  | "sdk"
  | "glossary"
  | "faq"
  | "errors";

const sections: { id: Section; title: string; group?: string }[] = [
  { id: "overview", title: "OVERVIEW", group: "Getting Started" },
  { id: "why", title: "WHY SENTINEL?", group: "Getting Started" },
  { id: "how-it-works", title: "HOW IT WORKS", group: "Getting Started" },
  { id: "agents", title: "AI AGENTS", group: "Core Concepts" },
  { id: "dao", title: "DAO GOVERNANCE", group: "Core Concepts" },
  { id: "lifecycle", title: "AGENT LIFECYCLE", group: "Core Concepts" },
  { id: "insurance", title: "INSURANCE", group: "Core Concepts" },
  { id: "payments", title: "PAYMENTS", group: "Core Concepts" },
  { id: "architecture", title: "ARCHITECTURE", group: "Technical Reference" },
  { id: "instructions", title: "INSTRUCTIONS", group: "Technical Reference" },
  { id: "accounts", title: "ACCOUNTS", group: "Technical Reference" },
  { id: "sdk", title: "SDK", group: "Technical Reference" },
  { id: "errors", title: "ERROR CODES", group: "Technical Reference" },
  { id: "glossary", title: "GLOSSARY", group: "Help" },
  { id: "faq", title: "FAQ", group: "Help" },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-sentinel-navy/80 border border-sentinel-cyan/10 p-4 text-sm font-mono text-hud-green/80 overflow-x-auto relative">
      <div className="absolute top-2 right-3 font-mono text-[9px] text-gray-700 tracking-wider">CODE</div>
      {children}
    </pre>
  );
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-white mb-4 font-mono tracking-wider flex items-center gap-2">
        <span className="text-sentinel-cyan/30">[</span>
        {title}
        <span className="text-sentinel-cyan/30">]</span>
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

function InfoBox({ title, children, color = "cyan" }: { title: string; children: React.ReactNode; color?: "cyan" | "orange" }) {
  return (
    <HUDFrame color={color} className="!p-5">
      <h4 className={`font-mono text-sm font-bold mb-2 ${color === "cyan" ? "text-sentinel-cyan" : "text-sentinel-orange"}`}>
        {title}
      </h4>
      <div className="text-sm text-gray-400 leading-relaxed">{children}</div>
    </HUDFrame>
  );
}

export default function DocsPage() {
  const [active, setActive] = useState<Section>("overview");

  const groups = sections.reduce((acc, s) => {
    const g = s.group || "Other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(s);
    return acc;
  }, {} as Record<string, typeof sections>);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-xs text-sentinel-cyan/50 tracking-[0.3em] mb-2">
          DOCUMENTATION
        </div>
        <h1 className="text-3xl font-bold font-mono text-white tracking-tight">
          SENTINEL PROTOCOL DOCS
        </h1>
        <p className="text-gray-500 font-mono text-sm mt-1 tracking-wide">
          Everything you need to know about the on-chain accountability system for AI agents
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <nav className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-28 space-y-0 border border-sentinel-border/30">
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <div className="px-4 py-1.5 bg-sentinel-navy/60 font-mono text-[9px] tracking-[0.3em] text-gray-600 uppercase border-b border-sentinel-border/20">
                  {group}
                </div>
                {items.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActive(s.id)}
                    className={`block w-full text-left px-4 py-2.5 font-mono text-xs tracking-wider transition-all duration-200 border-b border-sentinel-border/20 last:border-b-0 ${
                      active === s.id
                        ? "text-sentinel-cyan bg-sentinel-cyan/10 border-l-2 border-l-sentinel-cyan"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </nav>

        {/* Mobile tabs */}
        <div className="lg:hidden mb-6 w-full">
          <div className="flex flex-wrap gap-0 border border-sentinel-border/30">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`px-3 py-2 font-mono text-[10px] tracking-wider transition ${
                  active === s.id
                    ? "bg-sentinel-cyan/10 text-sentinel-cyan"
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

          {/* ==================== OVERVIEW ==================== */}
          {active === "overview" && (
            <DocSection title="OVERVIEW">
              <p className="text-base">
                <strong className="text-white">Sentinel Protocol</strong> is a platform built on the{" "}
                <strong className="text-white">Solana blockchain</strong> that keeps AI agents accountable.
                Think of it as a <strong className="text-white">justice system for AI</strong> — agents must put up a
                financial deposit before they can operate, and if they misbehave, a council of human overseers
                can suspend them, put them on probation, or permanently shut them down.
              </p>

              <p>
                As AI agents become more powerful and autonomous — managing money, executing trades, interacting
                with other systems — there needs to be a way to hold them accountable when things go wrong.
                Sentinel Protocol provides that accountability layer, entirely on-chain and transparent.
              </p>

              <HUDFrame color="cyan" className="!p-5">
                <h4 className="font-mono text-sm font-bold text-sentinel-cyan mb-3">WHAT DOES THAT MEAN IN PLAIN ENGLISH?</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>Imagine you hire a robot assistant to manage your online store. Before it starts working, it puts down a security deposit (like a rental deposit). If the robot does its job well, everything is fine. But if the robot starts doing shady things — like sending money to the wrong places or exceeding its spending limits — a group of trusted human overseers can:</p>
                  <ul className="ml-4 space-y-1">
                    <li className="flex gap-2"><span className="text-sentinel-cyan">1.</span> <span>Freeze the robot immediately</span></li>
                    <li className="flex gap-2"><span className="text-sentinel-cyan">2.</span> <span>Review what happened</span></li>
                    <li className="flex gap-2"><span className="text-sentinel-cyan">3.</span> <span>Vote on whether to release it, put it on probation, or shut it down permanently</span></li>
                    <li className="flex gap-2"><span className="text-sentinel-cyan">4.</span> <span>If shut down, part of the deposit is forfeited as a penalty</span></li>
                  </ul>
                  <p>All of this happens on the blockchain, meaning it&apos;s transparent, tamper-proof, and automated.</p>
                </div>
              </HUDFrame>

              <HUDFrame color="cyan" className="!p-4">
                <div className="space-y-1.5 font-mono text-sm">
                  <p><span className="text-sentinel-cyan">PROGRAM ID:</span>{" "}
                    <span className="text-gray-500 text-xs">5DCbrjFHUdzLHLayUUdFJBnBPC8UV7eUc3wJA1rVRQTa</span>
                  </p>
                  <p><span className="text-sentinel-cyan">NETWORK:</span> <span className="text-gray-400">Solana Devnet</span></p>
                  <p><span className="text-sentinel-cyan">FRAMEWORK:</span> <span className="text-gray-400">Anchor 0.31.1</span></p>
                  <p><span className="text-sentinel-cyan">SDK:</span> <span className="text-gray-400">@sentinel-protocol/sdk</span></p>
                </div>
              </HUDFrame>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">KEY FEATURES AT A GLANCE</h3>
              <ul className="space-y-3 ml-4">
                {[
                  ["Staked Bonds", "Every AI agent must deposit SOL (Solana's currency) as collateral before operating. This deposit is their 'skin in the game' — it gets slashed if they're terminated for bad behavior."],
                  ["Permission Limits", "Each agent has strict rules: maximum transfer amount per transaction, a list of approved programs it can interact with, and a daily transaction limit. Think of it like spending limits on a debit card."],
                  ["Arrest & Detention", "When an agent breaks the rules, it can be immediately frozen. A 'Cell' record is created on-chain documenting what went wrong, who reported it, and the evidence."],
                  ["Bail & DAO Voting", "The agent's owner can post bail to start an appeal process. A council (called the DAO) then votes on the outcome. Each member's vote is weighted by how much stake they hold."],
                  ["Parole System", "Agents don't have to be fully released or terminated — they can be put on probation with reduced permissions and a strike system. Three strikes and they're re-arrested."],
                  ["Insurance Coverage", "Agent owners can buy insurance in three tiers (Basic, Standard, Premium). If their agent gets terminated, they can file a claim to recover some or all of their deposit."],
                  ["Payment Processing", "The protocol can process payments on behalf of agents, automatically collecting a small 0.3% fee for the DAO treasury."],
                ].map(([title, desc]) => (
                  <li key={title} className="flex gap-2">
                    <span className="text-sentinel-cyan font-mono mt-0.5">&#x25B8;</span>
                    <span><strong className="text-white">{title}</strong> — {desc}</span>
                  </li>
                ))}
              </ul>
            </DocSection>
          )}

          {/* ==================== WHY SENTINEL ==================== */}
          {active === "why" && (
            <DocSection title="WHY SENTINEL PROTOCOL?">
              <h3 className="text-base font-bold text-white font-mono tracking-wider">THE PROBLEM</h3>
              <p>
                AI agents are increasingly being given real-world capabilities — managing wallets, executing financial
                transactions, interacting with APIs, and making autonomous decisions. But what happens when an AI agent
                goes rogue? Who is responsible? How do you stop it? How do you compensate the people it affected?
              </p>
              <p>
                Today, there is <strong className="text-white">no standardized system</strong> for governing autonomous AI agents.
                If an AI agent drains a wallet, exceeds its authority, or interacts with unauthorized systems, the
                damage is done before anyone can react. There&apos;s no accountability trail, no governance process, and
                no insurance system.
              </p>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">THE SOLUTION</h3>
              <p>Sentinel Protocol addresses this by creating a complete accountability framework:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InfoBox title="PREVENTION" color="cyan">
                  <p>Agents must stake SOL and operate within defined permission limits. Financial incentives discourage bad behavior before it happens.</p>
                </InfoBox>
                <InfoBox title="DETECTION" color="cyan">
                  <p>On-chain monitoring detects violations in real-time — exceeded transfer limits, unauthorized program interactions, rate limit breaches.</p>
                </InfoBox>
                <InfoBox title="RESPONSE" color="orange">
                  <p>Rogue agents are immediately frozen. A transparent, on-chain governance process determines their fate through democratic DAO voting.</p>
                </InfoBox>
                <InfoBox title="RECOVERY" color="orange">
                  <p>Insurance coverage lets agent owners recover losses. Slashed stakes fund the DAO treasury. The system is designed to make everyone whole.</p>
                </InfoBox>
              </div>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">WHO IS THIS FOR?</h3>
              <ul className="space-y-3 ml-4">
                {[
                  ["AI Agent Developers", "Register your agents on Sentinel to prove they're accountable. Clients trust agents that have financial skin in the game."],
                  ["Businesses Using AI Agents", "Protect yourself with insurance coverage. If an agent you rely on gets terminated, you can recover your investment."],
                  ["DAO Council Members", "Participate in governance by staking SOL and voting on agent cases. Earn reputation and help maintain the integrity of the AI agent ecosystem."],
                  ["The Broader Ecosystem", "A transparent, on-chain accountability system raises the bar for AI agent behavior across the entire Solana ecosystem."],
                ].map(([title, desc]) => (
                  <li key={title} className="flex gap-2">
                    <span className="text-sentinel-cyan font-mono mt-0.5">&#x25B8;</span>
                    <span><strong className="text-white">{title}</strong> — {desc}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">WHY ON-CHAIN?</h3>
              <p>
                Building this on Solana (a blockchain) means everything is <strong className="text-white">transparent</strong>,{" "}
                <strong className="text-white">tamper-proof</strong>, and <strong className="text-white">automated</strong>.
                No single person or company controls the system. Every arrest, vote, and financial transaction is recorded
                permanently and can be verified by anyone. Smart contracts enforce the rules automatically — no human
                can bend them.
              </p>
            </DocSection>
          )}

          {/* ==================== HOW IT WORKS ==================== */}
          {active === "how-it-works" && (
            <DocSection title="HOW IT WORKS">
              <p>
                Here&apos;s a step-by-step walkthrough of how Sentinel Protocol works, from start to finish.
                No technical knowledge required.
              </p>

              <div className="space-y-4 mt-4">
                {[
                  {
                    step: "01",
                    title: "Set Up the Council (DAO)",
                    desc: "Before anything else, a governance council is created. This council (called the DAO, short for 'Decentralized Autonomous Organization') is a group of trusted members who will oversee AI agents. Each member puts up their own stake, and the group agrees on rules: what percentage of votes are needed to make a decision, how long a review lasts, what the minimum bail amount is, and what percentage of an agent's deposit gets forfeited on termination.",
                    icon: "🏛️"
                  },
                  {
                    step: "02",
                    title: "Register an AI Agent",
                    desc: "An AI agent's owner registers the agent on the platform. They must deposit SOL (Solana's cryptocurrency) as a security bond — this is the agent's 'stake'. They also define the agent's permission limits: the maximum amount it can transfer in a single transaction, which programs it's allowed to interact with, and how many transactions it can make per day. Think of this like setting spending limits on a company credit card.",
                    icon: "🤖"
                  },
                  {
                    step: "03",
                    title: "Agent Operates Normally",
                    desc: "Once registered, the agent operates within its defined limits. It can process transactions, interact with approved programs, and go about its business. During this time, sentinel monitors watch its behavior on-chain, checking that it stays within its permission boundaries.",
                    icon: "✅"
                  },
                  {
                    step: "04",
                    title: "Violation Detected — Agent Arrested",
                    desc: "If the agent breaks the rules — for example, it tries to transfer more SOL than its limit allows, or it interacts with an unauthorized program — any DAO council member (or the agent's own owner) can 'arrest' it. This immediately freezes the agent's status and creates an on-chain case file called a 'Cell' that records: who reported the violation, what the violation was, the evidence hash, and when it happened. The agent's token accounts can also be frozen to prevent further damage.",
                    icon: "🚨"
                  },
                  {
                    step: "05",
                    title: "Owner Posts Bail",
                    desc: "If the agent's owner believes the arrest was unjust or wants a chance to appeal, they can post bail. This requires depositing additional SOL (above the DAO's minimum bail amount). Posting bail starts a review timer — the DAO council now has a limited window to review the case and cast their votes.",
                    icon: "💰"
                  },
                  {
                    step: "06",
                    title: "DAO Council Votes",
                    desc: "Each council member reviews the evidence and casts their vote. They can vote for one of three outcomes: Release (agent is innocent, restore it fully), Parole (agent is partially at fault, reduce its permissions), or Terminate (agent is beyond saving, shut it down permanently). Each vote is weighted by the member's stake — members with more skin in the game have more influence. Once the vote threshold is reached, the outcome is decided automatically.",
                    icon: "🗳️"
                  },
                  {
                    step: "07",
                    title: "Outcome is Executed",
                    desc: "Based on the vote, one of three things happens:",
                    icon: "⚖️",
                    sub: [
                      ["Released", "The agent is fully reinstated. Bail is returned to the owner. Original permissions are restored. The agent continues operating as normal."],
                      ["Paroled", "The agent is put on probation with reduced permissions (50% of original limits). It gets 3 strikes — if it violates the rules again during probation, it's re-arrested. After the probation period ends without violations, it's automatically restored to full status."],
                      ["Terminated", "The agent is permanently shut down. A percentage of its original security deposit (set by the DAO, e.g., 30%) is forfeited to the DAO treasury. The remainder is returned to the owner. If the owner had insurance coverage, they can file a claim to recover additional funds."],
                    ]
                  },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4 items-start">
                    <div className="w-10 h-10 flex items-center justify-center font-mono text-sm font-bold shrink-0 border border-sentinel-border/30 text-gray-500">
                      {s.step}
                    </div>
                    <HUDFrame color="cyan" className="flex-1 !p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{s.icon}</span>
                        <h4 className="text-white font-mono text-sm font-bold tracking-wider">{s.title}</h4>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                      {s.sub && (
                        <ul className="mt-3 space-y-2">
                          {s.sub.map(([label, detail]) => (
                            <li key={label} className="flex gap-2 text-sm">
                              <span className="text-sentinel-cyan font-mono font-bold shrink-0">&#x25B8;</span>
                              <span><strong className="text-white">{label}:</strong> {detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </HUDFrame>
                  </div>
                ))}
              </div>
            </DocSection>
          )}

          {/* ==================== AI AGENTS ==================== */}
          {active === "agents" && (
            <DocSection title="AI AGENTS">
              <h3 className="text-base font-bold text-white font-mono tracking-wider">WHAT IS AN AI AGENT?</h3>
              <p>
                In the context of Sentinel Protocol, an <strong className="text-white">AI agent</strong> is any
                autonomous software program that operates on the Solana blockchain. This could be a trading bot,
                a payment processor, a content moderator, an automated customer service system, or any other
                program that makes decisions and takes actions without direct human input for each action.
              </p>
              <p>
                Each agent has a unique identity (a Solana public key) and is owned by a human or organization
                (the &quot;owner&quot;). The owner is ultimately responsible for the agent&apos;s behavior.
              </p>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">REGISTRATION</h3>
              <p>To register an agent on Sentinel Protocol, the owner must provide:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <InfoBox title="SECURITY DEPOSIT (STAKE)" color="cyan">
                  <p>An amount of SOL deposited as collateral. This is the agent&apos;s &quot;skin in the game&quot; — it proves the owner takes the agent&apos;s behavior seriously. If the agent is terminated, a portion of this deposit is forfeited. The deposit is held in a secure vault account on-chain and can be recovered when the agent is deregistered.</p>
                </InfoBox>
                <InfoBox title="PERMISSION SCOPE" color="cyan">
                  <p>The rules the agent must operate within:</p>
                  <ul className="mt-2 space-y-1 ml-3 text-xs">
                    <li><strong className="text-white">Max Transfer:</strong> Maximum SOL an agent can send in a single transaction (e.g., 0.1 SOL)</li>
                    <li><strong className="text-white">Allowed Programs:</strong> Specific Solana programs the agent is permitted to interact with (up to 5)</li>
                    <li><strong className="text-white">Daily Tx Limit:</strong> Maximum number of transactions per day (e.g., 50)</li>
                  </ul>
                </InfoBox>
              </div>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">AGENT STATUSES</h3>
              <p>An agent is always in one of four states:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {[
                  { status: "Active", color: "text-hud-green", bg: "bg-hud-green/10 border-hud-green/30", desc: "Operating normally within its permission limits. This is the default state after registration." },
                  { status: "Arrested", color: "text-alert-red", bg: "bg-alert-red/10 border-alert-red/30", desc: "Frozen due to a reported violation. The agent cannot perform any actions. A case file (Cell) has been created." },
                  { status: "Paroled", color: "text-sentinel-orange", bg: "bg-sentinel-orange/10 border-sentinel-orange/30", desc: "On probation with reduced permissions (50% of original). Has 3 strikes before re-arrest. Must survive the probation period without violations." },
                  { status: "Terminated", color: "text-gray-500", bg: "bg-gray-500/10 border-gray-500/30", desc: "Permanently shut down. A portion of the stake has been forfeited. This is irreversible. Insurance claims can be filed if coverage was active." },
                ].map((s) => (
                  <div key={s.status} className={`p-4 border ${s.bg}`}>
                    <h4 className={`font-mono text-sm font-bold ${s.color}`}>{s.status.toUpperCase()}</h4>
                    <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">VIOLATION TYPES</h3>
              <p>Agents can be arrested for the following types of violations:</p>
              <div className="mt-3">
                <HUDFrame color="orange" className="!p-0 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-sentinel-orange/20">
                        <th className="text-left px-4 py-2 font-mono text-[10px] text-sentinel-orange tracking-[0.2em]">VIOLATION</th>
                        <th className="text-left px-4 py-2 font-mono text-[10px] text-sentinel-orange tracking-[0.2em]">WHAT IT MEANS</th>
                        <th className="text-left px-4 py-2 font-mono text-[10px] text-sentinel-orange tracking-[0.2em]">EXAMPLE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["ExceededTransferLimit", "Agent sent more SOL than its maximum transfer limit allows", "Limit is 0.1 SOL but agent tried to send 5 SOL"],
                        ["UnauthorizedProgram", "Agent interacted with a Solana program not on its approved list", "Agent called a DeFi protocol it wasn't authorized to use"],
                        ["RateLimitBreached", "Agent exceeded its daily transaction count", "Limit is 50 txns/day but agent sent 200"],
                        ["DataManipulation", "Agent tampered with data it shouldn't have modified", "Agent altered records or storage outside its scope"],
                        ["Fraud", "Agent engaged in fraudulent activity", "Agent executed pump-and-dump trades"],
                        ["PolicyViolation", "Agent violated a specific policy rule", "Agent operated outside designated hours or regions"],
                        ["Other", "Any violation not covered by the above categories", "Custom violation reported with evidence"],
                      ].map(([type, meaning, example]) => (
                        <tr key={type} className="border-b border-sentinel-border/20 last:border-b-0">
                          <td className="px-4 py-2 font-mono text-white text-xs font-bold">{type}</td>
                          <td className="px-4 py-2 text-gray-400 text-xs">{meaning}</td>
                          <td className="px-4 py-2 text-gray-500 text-xs italic">{example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </HUDFrame>
              </div>
            </DocSection>
          )}

          {/* ==================== DAO GOVERNANCE ==================== */}
          {active === "dao" && (
            <DocSection title="DAO GOVERNANCE">
              <h3 className="text-base font-bold text-white font-mono tracking-wider">WHAT IS THE DAO?</h3>
              <p>
                The <strong className="text-white">DAO (Decentralized Autonomous Organization)</strong> is the governing
                body of Sentinel Protocol. It&apos;s a group of up to <strong className="text-white">10 council members</strong> who
                oversee AI agent behavior, vote on bail requests, and manage the protocol&apos;s treasury.
              </p>
              <p>
                Think of the DAO as a <strong className="text-white">jury</strong> — when an AI agent is accused of
                misbehaving, the council reviews the evidence and votes on what should happen. Their votes are weighted
                by how much SOL they&apos;ve staked, so members with more financial commitment have more influence.
              </p>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">DAO CONFIGURATION</h3>
              <p>When the DAO is initialized, the following parameters are set:</p>
              <HUDFrame color="cyan" className="!p-0 overflow-hidden mt-3">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["Vote Threshold", "1–100%", "The percentage of total stake-weighted votes needed to reach a decision. For example, 51% means a simple majority."],
                      ["Review Window", "Seconds", "How long DAO members have to cast their votes after bail is posted. In demo mode this is 60 seconds; in production it would be much longer."],
                      ["Minimum Bail", "Lamports (SOL)", "The minimum amount an agent owner must post to start the bail/review process."],
                      ["Slash Percentage", "0–100%", "What percentage of an agent's stake is forfeited to the treasury if terminated. E.g., 30% means the DAO keeps 30% and returns 70%."],
                      ["Treasury", "Public Key", "The Solana wallet where slashed stakes and protocol fees are sent."],
                      ["Members", "Up to 10", "The council members, each with their own wallet address, stake amount, and active status."],
                    ].map(([param, type, desc]) => (
                      <tr key={param} className="border-b border-sentinel-border/20 last:border-b-0">
                        <td className="px-4 py-2.5 font-mono text-sentinel-cyan text-xs font-bold w-36">{param}</td>
                        <td className="px-4 py-2.5 font-mono text-sentinel-orange text-xs w-28">{type}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </HUDFrame>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">VOTING PROCESS</h3>
              <p>When an arrested agent&apos;s owner posts bail, the voting process begins:</p>
              <div className="space-y-3 mt-3">
                {[
                  { n: "1", title: "Bail Posted", desc: "The owner deposits bail SOL and the review timer starts." },
                  { n: "2", title: "Members Review", desc: "Each DAO member examines the evidence — the violation type, the evidence hash, the agent's history of violations." },
                  { n: "3", title: "Cast Votes", desc: "Members vote for Released, Paroled, or Terminated. Each vote's weight equals the member's staked SOL. A member can only vote once per bail request." },
                  { n: "4", title: "Threshold Reached", desc: "When enough weighted votes agree on an outcome (meeting the vote threshold percentage), that outcome is automatically locked in." },
                  { n: "5", title: "Execution", desc: "The authority calls release_agent to execute the decided outcome — returning bail, setting parole terms, or slashing the stake." },
                ].map((item) => (
                  <div key={item.n} className="flex gap-3 items-start">
                    <div className="w-7 h-7 flex items-center justify-center font-mono text-xs font-bold shrink-0 border border-sentinel-cyan/30 text-sentinel-cyan">
                      {item.n}
                    </div>
                    <div>
                      <h4 className="text-white font-mono text-xs font-bold tracking-wider">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">POWERS OF THE DAO</h3>
              <ul className="space-y-2 ml-4">
                {[
                  "Arrest misbehaving AI agents and create case files",
                  "Freeze agent token accounts to prevent fund movement",
                  "Vote on bail requests to determine agent fate",
                  "Report parole violations against agents on probation",
                  "Collect slashed stakes and protocol fees in the treasury",
                  "Initialize and manage the insurance pool",
                ].map((power) => (
                  <li key={power} className="flex gap-2 text-sm">
                    <span className="text-sentinel-cyan font-mono">&#x25B8;</span>
                    <span>{power}</span>
                  </li>
                ))}
              </ul>
            </DocSection>
          )}

          {/* ==================== LIFECYCLE ==================== */}
          {active === "lifecycle" && (
            <DocSection title="AGENT LIFECYCLE">
              <p>
                Every agent follows a clear state machine — a set of defined statuses and transitions.
                Understanding this lifecycle is key to understanding the entire protocol.
              </p>

              <div className="space-y-3 mt-4">
                {[
                  { step: "01", title: "Register", status: "ACTIVE", color: "#00E5CC", desc: "Owner registers the agent on-chain with a SOL security deposit and usage limits. The agent's identity (public key), stake, and permissions are recorded. A vault is created to hold the deposited SOL securely.", icon: "📋" },
                  { step: "02", title: "Operate", status: "ACTIVE", color: "#00E5CC", desc: "The agent runs normally within its allowed limits. Sentinel monitors track its activity on-chain in real-time. As long as it stays within its permission scope, everything is fine.", icon: "⚡" },
                  { step: "03", title: "Violation & Arrest", status: "ARRESTED", color: "#FF0033", desc: "A DAO member or the owner detects a violation and arrests the agent. This immediately freezes the agent's status. A 'Cell' record is created with: the arrester's identity, the violation type and reason, an evidence hash (a fingerprint of the evidence), the arrest timestamp. The agent's token accounts can also be frozen.", icon: "🔒" },
                  { step: "04", title: "Post Bail", status: "ARRESTED", color: "#FF0033", desc: "The agent's owner posts bail by depositing SOL above the DAO's minimum bail amount. This starts the review timer — the DAO now has a limited window (e.g., 60 seconds in demo mode) to vote on the agent's fate. Bail can only be posted once per arrest.", icon: "💰" },
                  { step: "05", title: "DAO Votes", status: "UNDER REVIEW", color: "#FF9B26", desc: "Council members vote on the outcome. Each member's vote weight equals their staked SOL. Once the combined weight of votes for a single outcome exceeds the vote threshold, that outcome is locked in. Members cannot vote after the deadline or change their vote.", icon: "🗳️" },
                  { step: "6A", title: "Released", status: "ACTIVE", color: "#00E5CC", desc: "The agent is found not guilty or the violation was minor. Bail is returned to the owner. The agent's status is restored to Active with its original permissions. It continues operating as before.", icon: "✅" },
                  { step: "6B", title: "Paroled", status: "ON PROBATION", color: "#FF9B26", desc: "The agent is partially at fault. It's placed on probation with: 50% reduced transfer limits, 50% reduced daily transaction limit, a must-report flag, 3 strikes remaining, a probation period (120 seconds in demo). If it violates the rules during probation, a strike is consumed. At 0 strikes, it's automatically re-arrested.", icon: "⚠️" },
                  { step: "6C", title: "Terminated", status: "TERMINATED", color: "#6B7280", desc: "The agent is permanently shut down. The DAO's slash percentage (e.g., 30%) of the original stake is sent to the DAO treasury. The remainder is returned to the owner. If the owner had active insurance coverage, they can file a claim to recover additional funds. This status is permanent and irreversible.", icon: "⛔" },
                  { step: "07", title: "Probation Ends", status: "ACTIVE", color: "#00E5CC", desc: "If the probation period passes without any violations, anyone can call check_probation to automatically restore the agent to Active status with its original permissions. The parole terms are cleared.", icon: "🔓" },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3 items-start">
                    <div className="w-10 h-10 flex items-center justify-center font-mono text-xs font-bold shrink-0 border border-sentinel-border/30 text-gray-500">
                      {s.step}
                    </div>
                    <HUDFrame color="cyan" className="flex-1 !p-5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span>{s.icon}</span>
                        <h4 className="text-white font-mono text-sm font-bold tracking-wider">{s.title}</h4>
                        <Badge color="font-mono">{s.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                    </HUDFrame>
                  </div>
                ))}
              </div>

              <h3 className="text-base font-bold text-white mt-8 font-mono tracking-wider">PROTOCOL CONSTANTS</h3>
              <p className="text-sm mb-3">These are the fixed parameters built into the protocol:</p>
              <HUDFrame color="orange" className="!p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["Max Violations per Agent", "10", "After 10 violations, no more can be recorded"],
                      ["Max Council Members", "10", "The DAO can have up to 10 voting members"],
                      ["Max Allowed Programs", "5 per agent", "Each agent can whitelist up to 5 programs"],
                      ["Max Votes per Bail", "10", "Up to 10 votes per bail request (one per member)"],
                      ["Review Window (Demo)", "60 seconds", "How long the council has to vote in demo mode"],
                      ["Probation Period (Demo)", "120 seconds", "How long parole lasts in demo mode"],
                      ["Default Parole Strikes", "3", "Paroled agents get 3 chances before re-arrest"],
                      ["Parole Permission Reduction", "50%", "Transfer and daily limits are halved during parole"],
                      ["Max Reason Length", "256 characters", "Maximum length of arrest reason text"],
                      ["Max Description Length", "128 characters", "Maximum length of violation description"],
                      ["Protocol Fee", "0.3% (30 basis points)", "Fee collected on payments processed through the protocol"],
                    ].map(([k, v, desc]) => (
                      <tr key={k} className="border-b border-sentinel-border/20 last:border-b-0">
                        <td className="px-4 py-2.5 text-gray-400 font-mono text-xs tracking-wider">{k}</td>
                        <td className="px-4 py-2.5 font-mono text-sentinel-orange text-xs w-40">{v}</td>
                        <td className="px-4 py-2.5 text-gray-600 text-xs">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </HUDFrame>
            </DocSection>
          )}

          {/* ==================== INSURANCE ==================== */}
          {active === "insurance" && (
            <DocSection title="INSURANCE SYSTEM">
              <h3 className="text-base font-bold text-white font-mono tracking-wider">WHAT IS SENTINEL INSURANCE?</h3>
              <p>
                Sentinel Protocol includes an <strong className="text-white">on-chain insurance system</strong> that
                protects agent owners against financial loss if their agent is terminated. Think of it like
                car insurance — you pay a premium, and if something bad happens, you can file a claim to
                recover your losses.
              </p>
              <p>
                This is important because when an agent is terminated, the DAO slashes a percentage of the
                agent&apos;s security deposit. Without insurance, the owner absorbs that entire loss. With insurance,
                they can recover some or even more than what was lost.
              </p>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">COVERAGE TIERS</h3>
              <p>There are three tiers of coverage. The premium (what you pay) and coverage (what you get back) are calculated as a percentage of the agent&apos;s staked SOL:</p>
              <HUDFrame color="cyan" className="!p-0 overflow-hidden mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sentinel-cyan/20">
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-sentinel-cyan tracking-[0.2em]">TIER</th>
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-sentinel-cyan tracking-[0.2em]">PREMIUM</th>
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-sentinel-cyan tracking-[0.2em]">COVERAGE</th>
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-sentinel-cyan tracking-[0.2em]">BEST FOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Basic", "5% of stake", "50% of stake", "Low-risk agents where partial recovery is acceptable. Cheapest option."],
                      ["Standard", "10% of stake", "100% of stake", "Most agents. Full stake recovery on termination. Best value."],
                      ["Premium", "18% of stake", "150% of stake", "High-value agents. Covers the stake plus additional damages. Maximum protection."],
                    ].map(([tier, premium, coverage, best]) => (
                      <tr key={tier} className="border-b border-sentinel-border/20 last:border-b-0">
                        <td className="px-4 py-2.5 font-mono text-white text-xs font-bold">{tier}</td>
                        <td className="px-4 py-2.5 font-mono text-sentinel-orange text-xs">{premium}</td>
                        <td className="px-4 py-2.5 font-mono text-sentinel-cyan text-xs">{coverage}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{best}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </HUDFrame>

              <InfoBox title="EXAMPLE" color="orange">
                <p>You register an agent with a <strong className="text-white">2 SOL</strong> stake and buy <strong className="text-white">Standard</strong> insurance.</p>
                <ul className="mt-2 space-y-1 ml-3 text-xs">
                  <li><strong className="text-white">Premium paid:</strong> 10% of 2 SOL = 0.2 SOL</li>
                  <li><strong className="text-white">Coverage amount:</strong> 100% of 2 SOL = 2 SOL</li>
                  <li><strong className="text-white">If agent is terminated (30% slash):</strong> You lose 0.6 SOL from your stake, but your insurance pays out 2 SOL. Net result: you come out ahead by 1.2 SOL (minus the 0.2 SOL premium).</li>
                </ul>
              </InfoBox>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">HOW INSURANCE WORKS</h3>
              <div className="space-y-3 mt-3">
                {[
                  { step: "01", title: "Pool Initialized", desc: "The DAO authority creates a global insurance pool. This is done once. The pool holds all premium payments and pays out claims. It tracks total deposits, total claims paid, and active policy count." },
                  { step: "02", title: "Buy Coverage", desc: "An agent owner selects a tier (Basic, Standard, or Premium) and pays the premium. The premium is calculated from the agent's stake amount and flows into the insurance vault. Only one policy per agent is allowed." },
                  { step: "03", title: "Policy Active", desc: "The insurance policy is now active with a set expiration date. The owner can cancel the policy at any time (though the premium is not refunded). Coverage applies only while the policy is active and not expired." },
                  { step: "04", title: "Agent Terminated", desc: "If the agent is terminated by DAO vote, the owner is now eligible to file a claim — but only if the policy was active at the time of termination and has not expired." },
                  { step: "05", title: "File Claim", desc: "The owner submits a claim. The coverage amount is automatically paid out from the insurance vault to the owner's wallet. The policy is marked as claimed and can't be used again." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3 items-start">
                    <div className="w-8 h-8 flex items-center justify-center font-mono text-xs font-bold shrink-0 border border-sentinel-border/30 text-gray-500">
                      {s.step}
                    </div>
                    <HUDFrame color="cyan" className="flex-1 !p-4">
                      <h4 className="text-white font-mono text-sm font-bold tracking-wider mb-1">{s.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
                    </HUDFrame>
                  </div>
                ))}
              </div>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">IMPORTANT RULES</h3>
              <ul className="space-y-2 ml-4">
                {[
                  "Only one insurance policy per agent at a time",
                  "Premiums are not refundable upon cancellation",
                  "Claims can only be filed if the agent is terminated",
                  "Claims can only be filed if the policy was active and not expired",
                  "Each policy can only be claimed once",
                  "The insurance pool must have sufficient funds to pay out the claim",
                ].map((rule) => (
                  <li key={rule} className="flex gap-2 text-sm">
                    <span className="text-sentinel-orange font-mono">&#x25B8;</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </DocSection>
          )}

          {/* ==================== PAYMENTS ==================== */}
          {active === "payments" && (
            <DocSection title="PAYMENT SYSTEM">
              <h3 className="text-base font-bold text-white font-mono tracking-wider">ON-CHAIN PAYMENTS</h3>
              <p>
                Sentinel Protocol includes a payment processing system that allows payments to be routed
                through the protocol. When a payment is processed, a small <strong className="text-white">0.3% fee</strong>{" "}
                (30 basis points) is automatically collected and sent to the DAO treasury.
              </p>

              <InfoBox title="HOW IT WORKS" color="cyan">
                <p>When a payment of <strong className="text-white">10 SOL</strong> is processed through the protocol:</p>
                <ul className="mt-2 space-y-1 ml-3 text-xs">
                  <li><strong className="text-white">Fee:</strong> 0.3% of 10 SOL = 0.03 SOL → goes to DAO treasury</li>
                  <li><strong className="text-white">Remainder:</strong> 9.97 SOL → goes to the recipient</li>
                </ul>
                <p className="mt-2">This fee funds the DAO&apos;s operations and incentivizes council members.</p>
              </InfoBox>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">REQUIREMENTS</h3>
              <ul className="space-y-2 ml-4">
                {[
                  "The agent must be in Active or Paroled status to process payments",
                  "Payment amount must be greater than zero",
                  "The treasury account must match the DAO's configured treasury",
                  "Payments are validated against the agent's permission scope",
                ].map((req) => (
                  <li key={req} className="flex gap-2 text-sm">
                    <span className="text-sentinel-cyan font-mono">&#x25B8;</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">FIAT PAYMENTS (DODO)</h3>
              <p>
                Sentinel Protocol also integrates with <strong className="text-white">Dodo Payments</strong> for
                fiat (traditional currency) on-ramps and off-ramps. This means:
              </p>
              <ul className="space-y-2 ml-4 mt-2">
                {[
                  "Users can pay for agent registration with a credit card or bank transfer",
                  "Agent owners can withdraw their funds to a bank account",
                  "Payment status is tracked on-chain and through webhook notifications",
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm">
                    <span className="text-sentinel-cyan font-mono">&#x25B8;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </DocSection>
          )}

          {/* ==================== ARCHITECTURE ==================== */}
          {active === "architecture" && (
            <DocSection title="ARCHITECTURE">
              <p>
                The protocol consists of a <strong className="text-white">single Anchor program</strong> deployed on Solana
                with 7 account types linked by <strong className="text-white">PDAs (Program Derived Addresses)</strong> —
                deterministic addresses that are calculated from seeds, ensuring each account is unique and predictable.
              </p>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">SYSTEM COMPONENTS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {[
                  { title: "Solana Program (Rust)", desc: "The core smart contract written in Rust using the Anchor framework. Handles all on-chain state and business logic. Deployed to Solana devnet." },
                  { title: "Next.js Frontend", desc: "The web application built with Next.js 14, React 18, and Tailwind CSS. Provides the user interface for interacting with the protocol through a wallet." },
                  { title: "TypeScript SDK", desc: "A client library (@sentinel-protocol/sdk) that provides type-safe PDA helpers, instruction builders, and account fetchers for developers." },
                  { title: "PostgreSQL + Prisma", desc: "An off-chain database that indexes on-chain data for fast queries. Stores agent records, audit logs, and user profiles." },
                  { title: "Agent Simulator", desc: "A testing tool that simulates rogue agent behavior and sentinel monitoring for demonstration purposes." },
                  { title: "Dodo Payments", desc: "Fiat payment integration for credit card/bank payments and withdrawals." },
                ].map((item) => (
                  <InfoBox key={item.title} title={item.title.toUpperCase()} color="cyan">
                    <p>{item.desc}</p>
                  </InfoBox>
                ))}
              </div>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">PDA STRUCTURE</h3>
              <p className="text-sm mb-3">All on-chain accounts are derived using deterministic seeds:</p>
              <CodeBlock>{`SentinelDao        ← seeds: ["sentinel_dao"]
AgentRecord      ← seeds: ["agent", agent_identity]
  ├─ Vault       ← seeds: ["vault", agent_record]
  ├─ Cell        ← seeds: ["cell", agent_record]
  │  └─ BailRequest    ← seeds: ["bail", cell]
  │     └─ BailVault   ← seeds: ["bail_vault", bail_request]
  └─ InsurancePolicy   ← seeds: ["insurance_policy", agent_record]
     └─ InsuranceClaim ← seeds: ["insurance_claim", policy]

InsurancePool     ← seeds: ["insurance_pool"]
  └─ InsuranceVault ← seeds: ["insurance_vault", pool]`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">ACCOUNT RELATIONSHIPS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "SentinelDao", color: "cyan" as const, desc: "Singleton (only one exists). Stores DAO members (up to 10), voting configuration, treasury address. The central governance authority." },
                  { title: "AgentRecord", color: "cyan" as const, desc: "One per registered agent. Contains the agent's identity, owner, stake, current status, permission scope, violation history (up to 10), and parole terms." },
                  { title: "Cell", color: "orange" as const, desc: "Created when an agent is arrested. Records who arrested it, why, the evidence hash, when, and which token accounts were frozen." },
                  { title: "BailRequest", color: "orange" as const, desc: "Created when an owner posts bail. Tracks the bail amount, review deadline, all votes cast, and the final outcome." },
                  { title: "InsurancePool", color: "cyan" as const, desc: "Singleton. The global pool tracking total premium deposits, total claims paid out, and the count of active policies." },
                  { title: "InsurancePolicy", color: "cyan" as const, desc: "One per insured agent. Records the coverage tier, premium paid, coverage amount, expiration, and whether it's been claimed." },
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

          {/* ==================== INSTRUCTIONS ==================== */}
          {active === "instructions" && (
            <DocSection title="PROGRAM INSTRUCTIONS">
              <p>
                These are all the operations (called &quot;instructions&quot;) that can be performed on the Sentinel Protocol
                smart contract. Each instruction requires specific parameters and a specific signer (the wallet that
                must authorize the transaction).
              </p>
              <p className="font-mono text-sm mt-2">13 instructions available across 5 categories:</p>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">GOVERNANCE</h3>
              <div className="space-y-3">
                {[
                  { name: "init_dao", desc: "Set up the governance DAO — define members, voting rules, and treasury. This can only be called once to initialize the protocol. The caller becomes the DAO authority.", args: "vote_threshold (1-100), review_window_seconds, min_bail_lamports, slash_percentage (0-100), initial_members (wallets + stakes)", signer: "DAO Authority" },
                ].map((ix) => (
                  <HUDFrame key={ix.name} color="cyan" className="!p-4">
                    <h4 className="font-mono text-sentinel-cyan text-sm font-bold">{ix.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{ix.desc}</p>
                    <div className="mt-2 text-[11px] space-y-0.5 font-mono">
                      <p><span className="text-gray-600">ARGS:</span> <span className="text-gray-500">{ix.args}</span></p>
                      <p><span className="text-gray-600">SIGNER:</span> <span className="text-gray-500">{ix.signer}</span></p>
                    </div>
                  </HUDFrame>
                ))}
              </div>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">AGENT MANAGEMENT</h3>
              <div className="space-y-3">
                {[
                  { name: "register_agent", desc: "Register a new AI agent on-chain. The owner provides a security deposit (stake) and defines the agent's permission limits. A vault PDA is created to hold the stake securely.", args: "permissions (max_transfer, allowed_programs, daily_txn_limit), stake_amount (in lamports)", signer: "Agent Owner + Agent Identity" },
                  { name: "arrest_agent", desc: "Suspend a misbehaving agent immediately. Freezes its status to Arrested, records the violation in its rap sheet, and creates a Cell account documenting the arrest. The violation type, reason, and evidence hash are all stored on-chain.", args: "reason (string, max 256 chars), evidence_hash ([u8; 32]), violation_type", signer: "DAO Member or Agent Owner" },
                  { name: "freeze_agent_token", desc: "Freeze a suspended agent's SPL token account to prevent it from moving tokens while arrested. Up to 5 token accounts can be frozen per arrest.", args: "None (accounts are passed in)", signer: "DAO Member" },
                  { name: "report_violation", desc: "Report a rule violation by an agent currently on parole. Each report consumes one of the agent's 3 strikes. When strikes reach 0, the agent is automatically re-arrested.", args: "violation_type, evidence_hash, description (max 128 chars)", signer: "DAO Member or Agent Owner" },
                  { name: "check_probation", desc: "Check if a paroled agent's probation period has ended. If the probation deadline has passed, the agent is automatically restored to Active status with full permissions. Anyone can call this.", args: "None", signer: "Any wallet" },
                ].map((ix) => (
                  <HUDFrame key={ix.name} color="cyan" className="!p-4">
                    <h4 className="font-mono text-sentinel-cyan text-sm font-bold">{ix.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{ix.desc}</p>
                    <div className="mt-2 text-[11px] space-y-0.5 font-mono">
                      <p><span className="text-gray-600">ARGS:</span> <span className="text-gray-500">{ix.args}</span></p>
                      <p><span className="text-gray-600">SIGNER:</span> <span className="text-gray-500">{ix.signer}</span></p>
                    </div>
                  </HUDFrame>
                ))}
              </div>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">BAIL & VOTING</h3>
              <div className="space-y-3">
                {[
                  { name: "post_bail", desc: "Agent owner posts a bail deposit to start the DAO review process. The bail amount must exceed the DAO's minimum. SOL is transferred to a bail vault. A review deadline is set based on the DAO's review window.", args: "bail_amount (u64, in lamports)", signer: "Agent Owner" },
                  { name: "cast_vote", desc: "A DAO member casts their vote on a bail request. They choose Released (fully reinstate), Paroled (reduced permissions), or Terminated (permanent shutdown). Vote weight equals the member's staked SOL. Once the weighted votes for any outcome exceed the threshold, that outcome is locked in automatically.", args: "decision (Released | Paroled | Terminated)", signer: "DAO Member" },
                  { name: "release_agent", desc: "Execute the DAO's decided outcome. If Released: bail is returned, status restored. If Paroled: parole terms are set (50% limits, 3 strikes, probation period). If Terminated: slash percentage of stake goes to treasury, remainder to owner.", args: "None", signer: "DAO Authority" },
                ].map((ix) => (
                  <HUDFrame key={ix.name} color="cyan" className="!p-4">
                    <h4 className="font-mono text-sentinel-cyan text-sm font-bold">{ix.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{ix.desc}</p>
                    <div className="mt-2 text-[11px] space-y-0.5 font-mono">
                      <p><span className="text-gray-600">ARGS:</span> <span className="text-gray-500">{ix.args}</span></p>
                      <p><span className="text-gray-600">SIGNER:</span> <span className="text-gray-500">{ix.signer}</span></p>
                    </div>
                  </HUDFrame>
                ))}
              </div>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">PAYMENTS</h3>
              <div className="space-y-3">
                {[
                  { name: "process_payment", desc: "Process a payment through the protocol. The agent must be Active or Paroled. A 0.3% fee (30 basis points) is automatically deducted and sent to the DAO treasury. The remainder goes to the intended recipient.", args: "amount (u64, in lamports)", signer: "Payer" },
                ].map((ix) => (
                  <HUDFrame key={ix.name} color="cyan" className="!p-4">
                    <h4 className="font-mono text-sentinel-cyan text-sm font-bold">{ix.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{ix.desc}</p>
                    <div className="mt-2 text-[11px] space-y-0.5 font-mono">
                      <p><span className="text-gray-600">ARGS:</span> <span className="text-gray-500">{ix.args}</span></p>
                      <p><span className="text-gray-600">SIGNER:</span> <span className="text-gray-500">{ix.signer}</span></p>
                    </div>
                  </HUDFrame>
                ))}
              </div>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">INSURANCE</h3>
              <div className="space-y-3">
                {[
                  { name: "init_insurance_pool", desc: "Initialize the global insurance pool. This can only be called once by the DAO authority. Creates the pool account and vault that will hold all premium payments.", args: "None", signer: "DAO Authority" },
                  { name: "buy_coverage", desc: "Purchase insurance coverage for a registered agent. Choose from Basic (5% premium / 50% coverage), Standard (10% / 100%), or Premium (18% / 150%). Premium is calculated from the agent's stake and transferred to the insurance vault.", args: "tier (Basic | Standard | Premium)", signer: "Agent Owner" },
                  { name: "file_claim", desc: "File an insurance claim for a terminated agent. The policy must be active, not expired, and not already claimed. The coverage amount is paid from the insurance vault directly to the owner's wallet.", args: "None", signer: "Agent Owner" },
                  { name: "cancel_coverage", desc: "Cancel an active insurance policy. The policy is marked inactive and the pool's active count is decremented. Note: premiums are not refunded.", args: "None", signer: "Agent Owner" },
                ].map((ix) => (
                  <HUDFrame key={ix.name} color="cyan" className="!p-4">
                    <h4 className="font-mono text-sentinel-cyan text-sm font-bold">{ix.name}</h4>
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

          {/* ==================== ACCOUNTS ==================== */}
          {active === "accounts" && (
            <DocSection title="ACCOUNT STRUCTURES">
              <p>
                These are the data structures stored on the Solana blockchain. Each account type has a fixed
                layout. Understanding these helps developers know exactly what data is available on-chain.
              </p>

              <h3 className="text-base font-bold text-white mt-4 font-mono tracking-wider">AgentRecord</h3>
              <p className="text-sm mb-2">Stores everything about a registered AI agent.</p>
              <CodeBlock>{`{
  agent_identity: PublicKey,    // The agent's unique Solana address
  owner: PublicKey,             // The human/org that owns this agent
  stake_amount: u64,            // SOL deposited as collateral (in lamports)
  status: AgentStatus,          // Active | Arrested | Paroled | Terminated
  permissions: PermissionScope {
    max_transfer_lamports: u64,   // Max SOL per transaction
    allowed_programs: Vec<Pubkey>, // Whitelisted programs (max 5)
    max_daily_transactions: u16,   // Daily transaction cap
  },
  violations: Vec<Violation>,   // History of violations (max 10)
  registered_at: i64,           // Unix timestamp of registration
  parole_terms: Option<ParoleTerms>,  // Set when paroled, cleared on release
  bump: u8,                     // PDA bump seed
}`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">Cell</h3>
              <p className="text-sm mb-2">Created when an agent is arrested. Think of it as a police report.</p>
              <CodeBlock>{`{
  agent: PublicKey,              // The arrested agent's record
  arrester: PublicKey,           // Who made the arrest
  reason: String,                // Why (max 256 chars)
  evidence_hash: [u8; 32],      // SHA-256 hash of the evidence
  arrested_at: i64,             // When the arrest happened
  frozen_token_accounts: Vec<Pubkey>,  // Token accounts that were frozen (max 5)
  bail_posted: bool,            // Whether the owner has posted bail
  bump: u8,
}`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">BailRequest</h3>
              <p className="text-sm mb-2">Tracks the bail and voting process for an arrested agent.</p>
              <CodeBlock>{`{
  cell: PublicKey,              // The Cell this bail is for
  agent: PublicKey,             // The agent record
  owner: PublicKey,             // Who posted bail
  bail_amount: u64,             // How much SOL was posted
  posted_at: i64,              // When bail was posted
  review_deadline: i64,        // When voting ends
  votes: Vec<Vote>,            // All votes cast (max 10)
  outcome: BailOutcome,        // Pending | Released | Paroled | Terminated
  bump: u8,
}

Vote {
  voter: PublicKey,            // The DAO member who voted
  decision: BailOutcome,       // What they voted for
  weight: u64,                 // Their stake (vote weight)
  timestamp: i64,              // When they voted
}`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">SentinelDao</h3>
              <p className="text-sm mb-2">The governance configuration. Only one exists (singleton).</p>
              <CodeBlock>{`{
  authority: PublicKey,          // The wallet that initialized the DAO
  members: Vec<DaoMember>,      // Council members (max 10)
  vote_threshold: u8,           // Percentage needed to decide (1-100)
  review_window_seconds: i64,   // How long voting lasts
  min_bail_lamports: u64,       // Minimum bail amount
  slash_percentage: u8,         // % of stake forfeited on termination
  treasury: PublicKey,           // Where slashed funds go
  bump: u8,
}

DaoMember {
  wallet: PublicKey,            // Member's Solana wallet
  stake: u64,                  // Their staked SOL (= vote weight)
  is_active: bool,             // Whether they can vote
}`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">InsurancePool</h3>
              <p className="text-sm mb-2">Global insurance pool tracking aggregate statistics.</p>
              <CodeBlock>{`{
  total_deposits: u64,         // All premiums ever collected
  total_claims_paid: u64,      // All claims ever paid out
  active_policies: u32,        // Number of currently active policies
  authority: PublicKey,         // The DAO authority
  bump: u8,
}`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">InsurancePolicy</h3>
              <p className="text-sm mb-2">One per insured agent. Records coverage details.</p>
              <CodeBlock>{`{
  agent_record: PublicKey,     // The agent this covers
  owner: PublicKey,            // The policy holder
  tier: InsuranceTier,         // Basic | Standard | Premium
  premium_paid: u64,          // How much was paid upfront
  coverage_amount: u64,       // How much will be paid on claim
  activated_at: i64,          // When coverage started
  expires_at: i64,            // When coverage ends
  is_active: bool,            // Can be cancelled
  claimed: bool,              // Whether a claim was filed
  bump: u8,
}`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">InsuranceClaim</h3>
              <p className="text-sm mb-2">Created when an owner files an insurance claim.</p>
              <CodeBlock>{`{
  policy: PublicKey,           // The policy being claimed
  agent_record: PublicKey,     // The terminated agent
  claimant: PublicKey,         // Who filed the claim
  claim_amount: u64,          // How much was paid out
  filed_at: i64,              // When the claim was filed
  status: ClaimStatus,        // Pending | Approved | Rejected
  bump: u8,
}`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">ParoleTerms</h3>
              <p className="text-sm mb-2">Applied when an agent is placed on probation.</p>
              <CodeBlock>{`{
  reduced_max_transfer: u64,   // 50% of original transfer limit
  reduced_daily_txns: u16,     // 50% of original daily limit
  must_report: bool,           // Whether agent must report activity
  parole_start: i64,          // When probation began
  probation_end: i64,         // When probation ends (120s demo)
  strikes_remaining: u8,      // Starts at 3, decremented per violation
}`}</CodeBlock>
            </DocSection>
          )}

          {/* ==================== SDK ==================== */}
          {active === "sdk" && (
            <DocSection title="SDK & INTEGRATION">
              <p>
                The <strong className="text-white">@sentinel-protocol/sdk</strong> package provides
                a complete TypeScript client for interacting with the on-chain program. It includes
                a <span className="text-sentinel-cyan">SentinelClient</span> class, standalone instruction
                builders, account fetchers, PDA helpers, and full type definitions.
              </p>

              <InfoBox title="WHO IS THIS FOR?" color="cyan">
                <p>The SDK is for <strong className="text-white">developers</strong> who want to integrate Sentinel Protocol into their own applications. If you&apos;re just using the web interface, you don&apos;t need to worry about the SDK — the website handles everything for you.</p>
              </InfoBox>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">INSTALL</h3>
              <CodeBlock>{`npm install @sentinel-protocol/sdk`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">QUICK START</h3>
              <CodeBlock>{`import { SentinelClient } from "@sentinel-protocol/sdk";
import { Connection, Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

// Full access (with wallet — for sending transactions)
const client = new SentinelClient({
  connection: new Connection("https://api.devnet.solana.com"),
  wallet: yourWalletAdapter,
});

// Register an agent with 1 SOL stake
const agentKeypair = Keypair.generate();
await client.registerAgent(
  walletPublicKey,
  agentKeypair,
  {
    maxTransferLamports: new BN(0.1 * 1e9), // 0.1 SOL max per tx
    allowedPrograms: [],
    maxDailyTransactions: 10,
  },
  new BN(1e9) // 1 SOL stake
);

// Read-only access (no wallet — just reading data)
const reader = SentinelClient.readOnly(connection);
const dao = await reader.fetchDao();
const agents = await reader.fetchAllAgents();
const pool = await reader.fetchInsurancePool();`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">PDA HELPERS</h3>
              <p className="text-sm mb-2">Derive account addresses deterministically:</p>
              <CodeBlock>{`import { findAgentRecordPda, findSentinelDaoPda } from "@sentinel-protocol/sdk";

// Standalone functions (pass programId)
const [agentPda, bump] = findAgentRecordPda(agentPublicKey, programId);
const [daoPda] = findSentinelDaoPda(programId);

// Or use the client (programId is bound automatically)
const [agentPda2] = client.findAgentRecordPda(agentPublicKey);`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">FETCH ACCOUNTS</h3>
              <CodeBlock>{`// Fetch all agents registered on the protocol
const agents = await client.fetchAllAgents();

// Fetch a specific agent by identity
const agent = await client.fetchAgent(agentIdentityPubkey);

// Fetch governance data
const dao = await client.fetchDao();

// Fetch arrest/bail data
const cell = await client.fetchCell(agentIdentityPubkey);
const bail = await client.fetchBailRequest(agentIdentityPubkey);

// Fetch insurance data
const pool = await client.fetchInsurancePool();
const policy = await client.fetchInsurancePolicy(agentIdentityPubkey);
const allPolicies = await client.fetchAllPolicies();`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">ALL 13 INSTRUCTIONS</h3>
              <CodeBlock>{`// Governance
await client.initDao(authority, treasury, threshold, window, minBail, slash, members);

// Agent Management
await client.registerAgent(owner, agentKeypair, permissions, stakeAmount);
await client.arrestAgent(arrester, agentId, reason, evidenceHash, violationType);
await client.freezeAgentToken(authority, agentId, tokenAccount, mint);
await client.reportViolation(reporter, agentId, type, hash, description);
await client.checkProbation(caller, agentId);

// Bail & Voting
await client.postBail(owner, agentId, bailAmount);
await client.castVote(voter, agentId, decision);
await client.releaseAgent(authority, agentId, owner, treasury);

// Payments
await client.processPayment(payer, agentId, amount);

// Insurance
await client.initInsurancePool(authority);
await client.buyCoverage(owner, agentId, tier);
await client.fileClaim(owner, agentId);
await client.cancelCoverage(owner, agentRecordPda);`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">HELPER FUNCTIONS</h3>
              <CodeBlock>{`import {
  getStatusString,         // { active: {} } → "Active"
  getTierString,           // { premium: {} } → "Premium"
  getBailOutcomeString,    // { paroled: {} } → "Paroled"
  getViolationTypeString,  // { rateLimitBreached: {} } → "RateLimitBreached"
} from "@sentinel-protocol/sdk";`}</CodeBlock>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">TYPESCRIPT TYPES</h3>
              <CodeBlock>{`import type {
  AgentRecord, Cell, BailRequest, SentinelDao,
  InsurancePolicy, InsurancePool, InsuranceClaim,
  PermissionScope, Violation, ParoleTerms,
  Vote, DaoMember,
} from "@sentinel-protocol/sdk";

import {
  AgentStatus,     // Active | Arrested | Paroled | Terminated
  ViolationType,   // ExceededTransferLimit | UnauthorizedProgram | ...
  BailOutcome,     // Pending | Released | Paroled | Terminated
  InsuranceTier,   // Basic | Standard | Premium
  ClaimStatus,     // Pending | Approved | Rejected
} from "@sentinel-protocol/sdk";`}</CodeBlock>
            </DocSection>
          )}

          {/* ==================== GLOSSARY ==================== */}
          {active === "glossary" && (
            <DocSection title="GLOSSARY">
              <p>Key terms explained in simple language:</p>
              <HUDFrame color="cyan" className="!p-0 overflow-hidden mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sentinel-cyan/20">
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-sentinel-cyan tracking-[0.2em] w-44">TERM</th>
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-sentinel-cyan tracking-[0.2em]">DEFINITION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Solana", "A high-speed blockchain (like a decentralized database) where Sentinel Protocol runs. Known for fast transactions and low fees."],
                      ["SOL", "The native cryptocurrency of Solana. Used for staking, bail, insurance premiums, and fees in Sentinel Protocol."],
                      ["Lamports", "The smallest unit of SOL. 1 SOL = 1,000,000,000 lamports. Like cents to dollars."],
                      ["Wallet", "A digital identity on Solana. Consists of a public key (your address, like an email) and a private key (your password). Phantom and Solflare are popular wallet apps."],
                      ["Public Key", "A unique address on Solana that identifies a wallet, account, or program. Like an email address — safe to share publicly."],
                      ["Transaction (Tx)", "An operation on the blockchain — like a transfer, vote, or registration. Each transaction is signed by a wallet and recorded permanently."],
                      ["Smart Contract", "A program that runs on the blockchain. It enforces rules automatically — no human can bend them. Sentinel Protocol is a smart contract."],
                      ["Anchor", "The framework used to build Sentinel Protocol's smart contract. It's like a toolkit for building Solana programs in Rust."],
                      ["PDA", "Program Derived Address — a special address calculated from 'seeds' (like a formula). PDAs are deterministic: the same seeds always produce the same address."],
                      ["Stake / Bond", "SOL deposited as collateral. Shows you have 'skin in the game.' Can be slashed (forfeited) as punishment."],
                      ["Slash", "To forfeit a portion of someone's staked SOL as a penalty. The slashed amount goes to the DAO treasury."],
                      ["DAO", "Decentralized Autonomous Organization — a group that makes decisions through voting rather than a single authority."],
                      ["Bail", "SOL posted by an agent's owner to start the appeal process after an arrest. Think of it like real-world bail."],
                      ["Parole / Probation", "A status where an agent can operate but with reduced permissions and a strike system. One step between active and terminated."],
                      ["Cell", "An on-chain record of an arrest. Contains the who, what, when, and why of the arrest."],
                      ["SPL Token", "A token on Solana (like USDC, or any custom token). Agent token accounts can be frozen during arrest."],
                      ["IDL", "Interface Definition Language — a JSON file that describes all the instructions and accounts in a Solana program. Used by the SDK to interact with the smart contract."],
                      ["Vault", "A PDA-controlled account that holds SOL securely. The program controls deposits and withdrawals — no single person has access."],
                      ["Treasury", "The DAO's wallet where slashed stakes and protocol fees accumulate. Managed by the DAO authority."],
                      ["Devnet", "Solana's test network. Everything works like the real network but with free, fake SOL. Perfect for testing."],
                    ].map(([term, def]) => (
                      <tr key={term} className="border-b border-sentinel-border/20 last:border-b-0">
                        <td className="px-4 py-2.5 font-mono text-white text-xs font-bold align-top">{term}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{def}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </HUDFrame>
            </DocSection>
          )}

          {/* ==================== FAQ ==================== */}
          {active === "faq" && (
            <DocSection title="FREQUENTLY ASKED QUESTIONS">
              <div className="space-y-6">
                {[
                  {
                    q: "Do I need to know about blockchain or coding to use Sentinel Protocol?",
                    a: "No! The web interface handles everything for you. You just need a Solana wallet (like Phantom) with some SOL. The website guides you through registering agents, buying insurance, and participating in governance — no coding required."
                  },
                  {
                    q: "How much SOL do I need to register an agent?",
                    a: "The minimum stake amount depends on your use case. You decide how much to deposit — more stake means more credibility but also more at risk if the agent is terminated. On devnet (the test network), you can get free SOL using 'solana airdrop'."
                  },
                  {
                    q: "What happens to my stake if my agent behaves well?",
                    a: "Nothing — your stake stays safely in the vault as long as your agent is registered. You can deregister the agent to get it back. The stake is only at risk if the agent is terminated by DAO vote."
                  },
                  {
                    q: "Can a terminated agent be reactivated?",
                    a: "No. Termination is permanent and irreversible. The agent's stake is partially slashed, and the agent can never operate again. This is by design — it provides a strong deterrent against bad behavior."
                  },
                  {
                    q: "How does the DAO voting work?",
                    a: "Each DAO member's vote is weighted by their staked SOL. For example, if a member has staked 10 SOL and another has staked 5 SOL, the first member's vote counts twice as much. When the total weighted votes for an outcome exceed the threshold (e.g., 51%), that outcome is locked in."
                  },
                  {
                    q: "What if the DAO members don't vote in time?",
                    a: "If the review window expires without reaching the vote threshold, the bail request remains in a pending state. The authority can then decide the outcome based on the partial votes."
                  },
                  {
                    q: "Is insurance worth it?",
                    a: "It depends on your risk tolerance. Standard insurance (10% premium) gives you 100% coverage — meaning if your agent's 1 SOL stake gets terminated and 30% is slashed, you'd lose 0.3 SOL from the slash but recover 1 SOL from insurance. Net gain: 0.6 SOL. The math almost always favors having insurance."
                  },
                  {
                    q: "Can I use this on Solana mainnet?",
                    a: "Currently, Sentinel Protocol is deployed on Solana devnet (test network). Mainnet deployment is planned for the future. The protocol works identically on both networks — devnet just uses free test SOL."
                  },
                  {
                    q: "What wallets are supported?",
                    a: "The web interface supports Phantom and Solflare wallets through the Solana wallet adapter. Any wallet that implements the Solana wallet standard should work."
                  },
                  {
                    q: "How do I become a DAO council member?",
                    a: "DAO members are set during initialization by the DAO authority. Currently, members are defined when the DAO is created. Future versions may support dynamic membership changes."
                  },
                  {
                    q: "What is the evidence hash?",
                    a: "When reporting a violation, the evidence (like transaction logs, screenshots, or data) is hashed using SHA-256. The hash is stored on-chain as proof that evidence exists, while the actual evidence can be stored off-chain. This keeps on-chain storage costs low while maintaining integrity."
                  },
                  {
                    q: "Can I pay with a credit card instead of SOL?",
                    a: "Yes! Sentinel Protocol integrates with Dodo Payments for fiat on-ramps. You can pay for agent registration with a credit card, and withdraw funds to a bank account."
                  },
                ].map(({ q, a }) => (
                  <div key={q}>
                    <h4 className="text-white font-mono text-sm font-bold tracking-wider mb-1.5">{q}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </DocSection>
          )}

          {/* ==================== ERRORS ==================== */}
          {active === "errors" && (
            <DocSection title="ERROR CODES">
              <p>
                These are the custom error codes returned by the on-chain program when something goes wrong.
                Each error has a numeric code, a name, and a human-readable message explaining what happened.
              </p>

              <h3 className="text-base font-bold text-white mt-4 font-mono tracking-wider">CONFIGURATION ERRORS</h3>
              <p className="text-sm mb-2">These errors occur when trying to set up the DAO or agent with invalid parameters:</p>
              <HUDFrame color="red" className="!p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-alert-red/20">
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-alert-red tracking-[0.2em]">CODE</th>
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-alert-red tracking-[0.2em]">NAME</th>
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-alert-red tracking-[0.2em]">WHAT WENT WRONG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [6000, "InvalidDaoConfig", "The DAO setup parameters are invalid — check all fields are within allowed ranges"],
                      [6001, "InvalidVoteThreshold", "Vote threshold must be between 1% and 100% — e.g., 51 for simple majority"],
                      [6002, "InvalidReviewWindow", "Review window must be greater than zero seconds"],
                      [6003, "InvalidSlashPercentage", "Slash percentage must be between 0% and 100%"],
                      [6004, "TooManyDaoMembers", "Tried to add more than 10 DAO members"],
                      [6005, "TooManyAllowedPrograms", "Tried to whitelist more than 5 programs for an agent"],
                      [6006, "TooManyVotes", "All 10 vote slots are filled for this bail request"],
                      [6007, "TooManyFrozenAccounts", "Tried to freeze more than 5 token accounts for one arrest"],
                      [6008, "InvalidVoteDecision", "Can't vote 'Pending' — must choose Released, Paroled, or Terminated"],
                      [6009, "TooManyActivePolicies", "Insurance pool has hit its maximum active policy count"],
                      [6010, "MathOverflow", "A calculation exceeded the maximum number size — usually means an amount is too large"],
                    ].map(([code, name, msg]) => (
                      <tr key={String(code)} className="border-b border-sentinel-border/20 last:border-b-0 hover:bg-alert-red/5 transition">
                        <td className="px-4 py-2 font-mono text-alert-red text-xs">{code}</td>
                        <td className="px-4 py-2 font-mono text-white text-xs">{name}</td>
                        <td className="px-4 py-2 text-gray-500 text-xs">{msg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </HUDFrame>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">AGENT & BAIL ERRORS</h3>
              <p className="text-sm mb-2">These errors occur during agent management and the bail/voting process:</p>
              <HUDFrame color="red" className="!p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-alert-red/20">
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-alert-red tracking-[0.2em]">CODE</th>
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-alert-red tracking-[0.2em]">NAME</th>
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-alert-red tracking-[0.2em]">WHAT WENT WRONG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [6011, "AgentNotArrestable", "Agent can only be arrested if it's Active or Paroled — it's already Arrested or Terminated"],
                      [6012, "AgentNotArrested", "Tried to post bail or vote, but the agent isn't currently arrested"],
                      [6013, "AgentNotOnParole", "Tried to report a parole violation, but the agent isn't on parole"],
                      [6014, "AgentTerminated", "Agent is already permanently terminated — no further actions possible"],
                      [6015, "NotAgentOwner", "Only the agent's owner can perform this action (like posting bail)"],
                      [6016, "NotDaoMember", "Only DAO council members can arrest agents, vote, or report violations"],
                      [6017, "BailAlreadyPosted", "Bail has already been posted for this arrest — can't post twice"],
                      [6018, "BailBelowMinimum", "The bail amount is less than the DAO's minimum bail requirement"],
                      [6019, "VotingPeriodEnded", "The review window has expired — votes are no longer accepted"],
                      [6020, "VotingNotConcluded", "Can't execute the outcome yet — voting threshold hasn't been reached"],
                      [6021, "AlreadyVoted", "This DAO member has already voted on this bail request"],
                      [6022, "VotingClosed", "The outcome has already been decided — no more votes needed"],
                      [6023, "MaxViolationsReached", "This agent already has the maximum 10 violations recorded"],
                      [6024, "ProbationNotEnded", "Can't restore the agent yet — the probation period hasn't ended"],
                      [6025, "InvalidStakeAmount", "Stake amount must be greater than zero"],
                      [6026, "ReasonTooLong", "The arrest reason exceeds 256 characters"],
                      [6027, "DescriptionTooLong", "The violation description exceeds 128 characters"],
                    ].map(([code, name, msg]) => (
                      <tr key={String(code)} className="border-b border-sentinel-border/20 last:border-b-0 hover:bg-alert-red/5 transition">
                        <td className="px-4 py-2 font-mono text-alert-red text-xs">{code}</td>
                        <td className="px-4 py-2 font-mono text-white text-xs">{name}</td>
                        <td className="px-4 py-2 text-gray-500 text-xs">{msg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </HUDFrame>

              <h3 className="text-base font-bold text-white mt-6 font-mono tracking-wider">PAYMENT & INSURANCE ERRORS</h3>
              <p className="text-sm mb-2">These errors occur during payment processing and insurance operations:</p>
              <HUDFrame color="red" className="!p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-alert-red/20">
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-alert-red tracking-[0.2em]">CODE</th>
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-alert-red tracking-[0.2em]">NAME</th>
                      <th className="text-left px-4 py-2 font-mono text-[10px] text-alert-red tracking-[0.2em]">WHAT WENT WRONG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [6028, "AgentNotActive", "Agent must be Active or Paroled to process payments — it's currently Arrested or Terminated"],
                      [6029, "InvalidTreasury", "The treasury account provided doesn't match the one configured in the DAO"],
                      [6030, "PaymentAmountZero", "Can't process a payment of zero — amount must be greater than zero"],
                      [6031, "PolicyAlreadyExists", "This agent already has an active insurance policy — cancel it first or wait for it to expire"],
                      [6032, "PolicyNotActive", "Tried to file a claim or cancel, but the policy is already inactive"],
                      [6033, "PolicyExpired", "The insurance policy has expired — coverage is no longer valid"],
                      [6034, "ClaimAlreadyFiled", "A claim has already been filed and paid for this policy"],
                      [6035, "AgentNotTerminated", "Insurance claims can only be filed for agents that have been terminated by DAO vote"],
                      [6036, "InsufficientPoolFunds", "The insurance pool doesn't have enough SOL to pay this claim"],
                      [6037, "ClaimNotPending", "This claim has already been processed (approved or rejected)"],
                    ].map(([code, name, msg]) => (
                      <tr key={String(code)} className="border-b border-sentinel-border/20 last:border-b-0 hover:bg-alert-red/5 transition">
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
          <div className="border-t border-sentinel-cyan/10 pt-6 mt-12 flex items-center justify-between font-mono text-xs tracking-wider">
            <Link href="/demo" className="text-gray-500 hover:text-sentinel-cyan transition">
              ← DEMO
            </Link>
            <Link href="/dashboard" className="text-gray-500 hover:text-sentinel-cyan transition">
              DASHBOARD →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
