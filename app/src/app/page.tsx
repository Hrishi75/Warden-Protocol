"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { NetworkGraph } from "@/components/NetworkGraph";
import { LiveTimeline } from "@/components/LiveTimeline";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ActivityFeed } from "@/components/ActivityFeed";
import { CyberBackground } from "@/components/CyberBackground";
import { HUDFrame } from "@/components/HUDFrame";
import { useProtocolStats } from "@/lib/useProtocolStats";

const features = [
  {
    title: "Staked Accountability",
    description:
      "Every operative posts a SOL bond before deployment. Rogue behavior triggers stake slashing — real economic consequences for AI actions.",
    icon: "◈",
    color: "#FF0033",
  },
  {
    title: "Autonomous Enforcement",
    description:
      "Sentinels monitor agent behavior in real-time. Permission violations trigger instant containment — zero human latency.",
    icon: "⬡",
    color: "#00E5CC",
  },
  {
    title: "DAO Governance",
    description:
      "A War Council of human operatives votes on extraction, parole, and neutralization. AI accountability, governed by humans.",
    icon: "◎",
    color: "#6C5CE7",
  },
];

const marqueeWords = "DEPLOY ■ MONITOR ■ CONTAIN ■ GOVERN ■ STAKE ■ ARREST ■ PAROLE ■ ENFORCE ■ ";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function LandingPage() {
  const protocolStats = useProtocolStats();

  const stats = [
    { label: "DEPLOYED AGENTS", value: protocolStats.deployedAgents, prefix: "", suffix: "" },
    { label: "INCIDENTS DETECTED", value: protocolStats.incidentsDetected, prefix: "", suffix: "" },
    { label: "SOL BONDED", value: protocolStats.solBonded, prefix: "", suffix: "" },
    { label: "COUNCIL MEMBERS", value: protocolStats.councilMembers, prefix: "", suffix: "" },
  ];

  return (
    <div>
      {/* Animated background */}
      <CyberBackground />

      {/* ========== HERO — Full bleed, immersive ========== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.5) 100%)" }}
        />
        {/* Atmospheric glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[800px] h-[800px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255, 0, 51, 0.08), transparent 60%)",
              top: "-10%",
              right: "-10%",
            }}
          />
          <div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(0, 229, 204, 0.06), transparent 60%)",
              bottom: "0%",
              left: "-5%",
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(108, 92, 231, 0.05), transparent 60%)",
              top: "40%",
              left: "50%",
            }}
          />
        </div>

        <motion.div
          className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-24 pb-16"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* Top row: Badge */}
          <motion.div className="mb-8" variants={fadeUp}>
            <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.4em] text-warden-cyan/60 border border-warden-cyan/15 px-4 py-1.5 bg-warden-cyan/5 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-alert-red animate-pulse" />
              SENTINEL PROTOCOL // ACTIVE
            </span>
          </motion.div>

          {/* Main headline — massive, Ray-Ban EXE style */}
          <motion.div className="mb-6" variants={fadeUp}>
            <h1
              className="chrome-text text-[3rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] xl:text-[11rem] font-black leading-[0.85] tracking-tighter text-white uppercase"
              data-text="SENTINEL"
              style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
            >
              SENTINEL
            </h1>
          </motion.div>

          {/* Subtitle row */}
          <motion.div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12" variants={fadeUp}>
            <div className="max-w-lg">
              <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
                In a world where autonomous AI agents operate with real funds and permissions,
                Sentinel Protocol is the on-chain justice system — <span className="text-warden-cyan">stake</span>, <span className="text-alert-red">contain</span>, <span className="text-warden-orange">govern</span>.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard" className="btn-hud text-sm px-8 py-4 tracking-wider">
                  ENTER COMMAND CENTER
                </Link>
                <Link href="/demo" className="btn-secondary font-mono text-xs tracking-[0.2em] uppercase px-6 py-4">
                  RUN SIMULATION
                </Link>
              </div>
            </div>

            {/* Logo + status */}
            <motion.div
              className="flex items-center gap-4"
              variants={fadeUp}
            >
              <Image
                src="/sentinelprotocol.png"
                alt="Sentinel Protocol"
                width={70}
                height={70}
                className="drop-shadow-[0_0_30px_rgba(0,229,204,0.4)]"
                priority
              />
              <div className="font-mono text-xs text-gray-500">
                <div className="text-warden-cyan tracking-wider">SOLANA DEVNET</div>
                <div className="text-gray-600 tracking-wider mt-1">v1.0.0 // LIVE</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Scrolling marquee */}
          <motion.div
            className="overflow-hidden py-3"
            variants={fadeUp}
          >
            <div className="marquee-track">
              <span className="font-mono text-xs tracking-[0.3em] text-gray-600 whitespace-nowrap">
                {marqueeWords.repeat(6)}
              </span>
              <span className="font-mono text-xs tracking-[0.3em] text-gray-600 whitespace-nowrap">
                {marqueeWords.repeat(6)}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom scroll hint */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <div className="flex flex-col items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 animate-bounce">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="relative z-10 py-16 px-6">
        <motion.div
          className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp}>
              <HUDFrame color="cyan" label={stat.label} className="text-center !p-5">
                <div className="text-3xl md:text-4xl font-bold font-mono text-warden-cyan mt-2">
                  <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
              </HUDFrame>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ========== TACTICAL OVERVIEW ========== */}
      <ScrollReveal>
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Tactical Overview"
              subtitle="Live agent network — monitoring connections, operations, and governance in real-time"
            />
            <NetworkGraph />
          </div>
        </section>
      </ScrollReveal>

      {/* ========== OPERATION CHRONOLOG ========== */}
      <ScrollReveal direction="left">
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Operation Chronolog"
              subtitle="Complete agent lifecycle — from deployment to reinstatement, running live"
            />
            <LiveTimeline />
          </div>
        </section>
      </ScrollReveal>

      {/* ========== COMMS INTERCEPT ========== */}
      <ScrollReveal direction="right" delay={0.15}>
        <section className="relative z-10 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Comms Intercept"
              subtitle="Live protocol events — deployments, incidents, containments, and governance actions"
            />
            <ActivityFeed />
          </div>
        </section>
      </ScrollReveal>

      {/* ========== PROTOCOL DIRECTIVES ========== */}
      <ScrollReveal delay={0.1}>
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Protocol Directives"
              subtitle="Built for a future where AI agents operate autonomously with real economic stakes"
            />
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              {features.map((feature, i) => (
                <motion.div key={feature.title} variants={fadeUp}>
                  <HUDFrame
                    color={i === 0 ? "red" : i === 1 ? "cyan" : "purple"}
                    className="hover:scale-[1.02] transition-all duration-300 h-full group"
                  >
                    <div className="text-4xl mb-4 opacity-30 group-hover:opacity-60 transition-opacity" style={{ color: feature.color }}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 font-mono tracking-wide">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </HUDFrame>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* ========== FOOTER CTA ========== */}
      <ScrollReveal>
        <section className="relative z-10 py-24 px-6 overflow-hidden">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.h2
              className="chrome-text text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8"
              data-text="DEPLOY YOUR AGENTS"
              variants={fadeUp}
              style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
            >
              DEPLOY YOUR AGENTS
            </motion.h2>
            <motion.p className="text-gray-400 text-base mb-10 font-mono max-w-xl mx-auto" variants={fadeUp}>
              Register agents on Solana devnet. Set permissions. Let the War Council keep them accountable.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/auth" className="btn-hud text-base px-10 py-4 tracking-wider">
                BEGIN DEPLOYMENT
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </ScrollReveal>

      {/* ========== FOOTER ========== */}
      <footer className="relative z-10 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Divider */}
          <div className="h-px mb-12" style={{ background: "linear-gradient(90deg, transparent, rgba(0, 229, 204, 0.2) 30%, rgba(255, 155, 38, 0.2) 70%, transparent)" }} />

          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/sentinelprotocol.png" alt="Sentinel" width={28} height={28} className="drop-shadow-[0_0_8px_rgba(0,229,204,0.4)]" />
                <div>
                  <span className="font-mono text-sm font-bold tracking-[0.15em] text-white">SENTINEL</span>
                  <span className="text-warden-orange font-bold">.</span>
                </div>
              </div>
              <p className="text-gray-600 text-xs font-mono leading-relaxed tracking-wide">
                On-chain accountability for autonomous AI agents. Built on Solana.
              </p>
            </div>

            {/* Protocol */}
            <div>
              <h4 className="font-mono text-[10px] tracking-[0.3em] text-warden-cyan/60 mb-4 uppercase">Protocol</h4>
              <ul className="space-y-2.5">
                <li><Link href="/dashboard" className="text-gray-500 hover:text-warden-cyan transition text-xs font-mono tracking-wider">Command Center</Link></li>
                <li><Link href="/register" className="text-gray-500 hover:text-warden-cyan transition text-xs font-mono tracking-wider">Deploy Agent</Link></li>
                <li><Link href="/dao" className="text-gray-500 hover:text-warden-cyan transition text-xs font-mono tracking-wider">War Council</Link></li>
                <li><Link href="/demo" className="text-gray-500 hover:text-warden-cyan transition text-xs font-mono tracking-wider">Simulation</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-mono text-[10px] tracking-[0.3em] text-warden-cyan/60 mb-4 uppercase">Resources</h4>
              <ul className="space-y-2.5">
                <li><Link href="/docs" className="text-gray-500 hover:text-warden-cyan transition text-xs font-mono tracking-wider">Intel Database</Link></li>
                <li><Link href="/profile" className="text-gray-500 hover:text-warden-cyan transition text-xs font-mono tracking-wider">Operative Profile</Link></li>
                <li><Link href="/auth" className="text-gray-500 hover:text-warden-cyan transition text-xs font-mono tracking-wider">Register Identity</Link></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-mono text-[10px] tracking-[0.3em] text-warden-cyan/60 mb-4 uppercase">Community</h4>
              <div className="flex items-center gap-3 mb-4">
                {/* GitHub */}
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center border border-warden-border hover:border-warden-cyan/50 hover:bg-warden-cyan/10 transition-all group">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 group-hover:text-warden-cyan transition">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
                {/* Twitter/X */}
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center border border-warden-border hover:border-warden-cyan/50 hover:bg-warden-cyan/10 transition-all group">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 group-hover:text-warden-cyan transition">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* Discord */}
                <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center border border-warden-border hover:border-warden-cyan/50 hover:bg-warden-cyan/10 transition-all group">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 group-hover:text-warden-cyan transition">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>
                {/* Telegram */}
                <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center border border-warden-border hover:border-warden-cyan/50 hover:bg-warden-cyan/10 transition-all group">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 group-hover:text-warden-cyan transition">
                    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              </div>
              <p className="text-gray-600 text-[10px] font-mono tracking-wider leading-relaxed">
                Join the operatives building the future of AI accountability.
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="h-px mb-6" style={{ background: "linear-gradient(90deg, transparent, rgba(30, 33, 64, 0.8), transparent)" }} />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-gray-700 tracking-wider">
            <p>&copy; 2025 SENTINEL PROTOCOL. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-hud-green animate-pulse" />
              <span>SOLANA DEVNET // OPERATIONAL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}