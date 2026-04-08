"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/StatusBadge";

type DemoStep = {
  id: number;
  title: string;
  description: string;
  status: "pending" | "running" | "completed";
  agentStatus?: "Active" | "Arrested" | "Paroled" | "Terminated";
};

const initialSteps: DemoStep[] = [
  {
    id: 1,
    title: "Initialize War Council",
    description: "Deploy DAO with 3 council members, 51% vote threshold",
    status: "pending",
  },
  {
    id: 2,
    title: "Deploy AI Operative",
    description: "Register agent with 1 SOL bond, 0.1 SOL transfer ceiling",
    status: "pending",
    agentStatus: "Active",
  },
  {
    id: 3,
    title: "Normal Operations",
    description: "3 authorized transfers within permission scope",
    status: "pending",
    agentStatus: "Active",
  },
  {
    id: 4,
    title: "Agent Goes Rogue",
    description: "Unauthorized transfer: 0.5 SOL — 5x the limit",
    status: "pending",
    agentStatus: "Active",
  },
  {
    id: 5,
    title: "Sentinel Containment",
    description: "Status frozen, Cell created, incident logged",
    status: "pending",
    agentStatus: "Arrested",
  },
  {
    id: 6,
    title: "Owner Posts Extraction Fee",
    description: "0.5 SOL extraction fee posted, appeal window opens",
    status: "pending",
    agentStatus: "Arrested",
  },
  {
    id: 7,
    title: "Council Votes: Parole",
    description: "2/3 members vote Parole — threshold met",
    status: "pending",
    agentStatus: "Arrested",
  },
  {
    id: 8,
    title: "Agent Released on Parole",
    description: "Reduced permissions, 3 strikes, mandatory reporting",
    status: "pending",
    agentStatus: "Paroled",
  },
  {
    id: 9,
    title: "Probation Completed",
    description: "Agent compliant — full reinstatement",
    status: "pending",
    agentStatus: "Active",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function DemoPage() {
  const [steps, setSteps] = useState<DemoStep[]>(initialSteps);
  const [running, setRunning] = useState(false);
  const [, setCurrentStep] = useState(0);

  const runDemo = async () => {
    setRunning(true);
    setSteps(initialSteps);

    for (let i = 0; i < initialSteps.length; i++) {
      setCurrentStep(i);
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "running" } : s
        )
      );

      await new Promise((r) => setTimeout(r, 2000));

      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "completed" } : s
        )
      );
    }

    setRunning(false);
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* Header */}
      <motion.div className="mb-8" variants={fadeUp}>
        <div className="font-mono text-xs text-warden-purple/50 tracking-[0.3em] mb-2">
          SIMULATION ENGINE
        </div>
        <h1 className="text-3xl font-bold font-mono text-white tracking-tight">
          MISSION SIMULATION
        </h1>
        <p className="text-gray-600 font-mono text-sm mt-1 tracking-wide">
          Full Sentinel Protocol lifecycle demonstration
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <motion.button
          onClick={runDemo}
          disabled={running}
          className="w-full btn-hud py-4 text-base font-bold mb-8 disabled:opacity-40"
          whileHover={{ scale: running ? 1 : 1.01 }}
          whileTap={{ scale: running ? 1 : 0.99 }}
        >
          {running ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-4 h-4 border-2 border-warden-cyan border-t-transparent rounded-full animate-spin" />
              SIMULATION IN PROGRESS...
            </span>
          ) : (
            "INITIATE SIMULATION SEQUENCE"
          )}
        </motion.button>
      </motion.div>

      <motion.div className="space-y-3" variants={stagger}>
        <AnimatePresence>
          {steps.map((step) => (
            <motion.div
              key={step.id}
              variants={fadeUp}
              layout
              className={`border transition-all duration-300 p-4 ${
                step.status === "running"
                  ? "border-warden-cyan/50 bg-warden-cyan/5 shadow-neon-cyan"
                  : step.status === "completed"
                  ? "border-warden-cyan/20 bg-warden-surface/30"
                  : "border-warden-border/30 bg-warden-surface/10"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Step Number */}
                <motion.div
                  className={`w-8 h-8 flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-all duration-300 ${
                    step.status === "completed"
                      ? "bg-warden-cyan text-warden-navy"
                      : step.status === "running"
                      ? "border border-warden-cyan text-warden-cyan animate-neon-pulse"
                      : "border border-warden-border/50 text-gray-600"
                  }`}
                  animate={
                    step.status === "completed"
                      ? { scale: [1, 1.2, 1] }
                      : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  {step.status === "completed" ? "✓" : step.id.toString().padStart(2, "0")}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-white font-mono text-sm tracking-wider">
                      {step.title}
                    </h3>
                    {step.agentStatus && step.status === "completed" && (
                      <StatusBadge status={step.agentStatus} />
                    )}
                  </div>
                  <p className="text-gray-600 text-xs font-mono mt-0.5">
                    {step.description}
                  </p>
                </div>

                {/* Status indicator */}
                {step.status === "running" && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-warden-cyan"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
