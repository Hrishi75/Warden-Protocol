"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgram } from "@/lib/useProgram";
import { fetchDao } from "@/lib/program";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AuthGuard } from "@/components/AuthGuard";
import { HUDFrame } from "@/components/HUDFrame";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

function DaoContent() {
  const { program } = useProgram();
  const [activeTab, setActiveTab] = useState<"members" | "votes" | "config">("members");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dao, setDao] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDao = useCallback(async () => {
    if (!program) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await fetchDao(program);
      setDao(data);
    } catch (err) {
      console.error("Failed to fetch DAO:", err);
      setError("War Council not initialized on devnet.");
      setDao(null);
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    loadDao();
  }, [loadDao]);

  const members = dao?.members ?? [];
  const voteThreshold = dao?.voteThreshold ?? 51;
  const reviewWindow = dao?.reviewWindowSeconds?.toNumber?.() ?? 60;
  const minBail = dao?.minBailLamports?.toNumber?.() ?? 100000000;
  const slashPct = dao?.slashPercentage ?? 50;

  const tabLabels = {
    members: "COUNCIL MEMBERS",
    votes: "TRIBUNAL",
    config: "PROTOCOL CONFIG",
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      {/* Header */}
      <motion.div className="flex items-start justify-between mb-8 gap-4" variants={fadeUp}>
        <div>
          <div className="font-mono text-xs text-warden-orange/50 tracking-[0.3em] mb-2">
            GOVERNANCE TERMINAL
          </div>
          <h1 className="text-3xl font-bold font-mono text-white tracking-tight">
            WAR COUNCIL
          </h1>
          <p className="text-gray-600 font-mono text-sm mt-1 tracking-wide">
            The human jury governing agent accountability
          </p>
        </div>
        {program && (
          <motion.button
            onClick={loadDao}
            className="btn-hud !py-2 !px-4 text-xs"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            REFRESH
          </motion.button>
        )}
      </motion.div>

      {loading ? (
        <motion.div className="text-center py-20" variants={fadeUp}>
          <div className="w-8 h-8 border-2 border-warden-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-mono text-sm tracking-wider">
            CONNECTING TO WAR COUNCIL...
          </p>
        </motion.div>
      ) : error ? (
        <motion.div variants={fadeUp}>
          <HUDFrame color="orange" className="text-center py-12">
            <p className="text-warden-orange font-mono text-sm mb-2">{error}</p>
            <p className="text-gray-600 text-xs font-mono">
              Connect wallet and verify DAO initialization.
            </p>
          </HUDFrame>
        </motion.div>
      ) : (
        <>
          {/* Tabs */}
          <motion.div className="flex gap-0 mb-6 border border-warden-border/50 w-fit" variants={fadeUp}>
            {(["members", "votes", "config"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-2.5 font-mono text-xs tracking-wider transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-warden-cyan/10 text-warden-cyan"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                {tabLabels[tab]}
                {activeTab === tab && (
                  <motion.div
                    layoutId="daoTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-warden-cyan"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "members" && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <HUDFrame color="cyan" label="ROSTER" className="!p-0 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-warden-cyan/20">
                        <th className="text-left px-6 py-3 font-mono text-[10px] text-warden-cyan tracking-[0.2em]">
                          WALLET
                        </th>
                        <th className="text-left px-6 py-3 font-mono text-[10px] text-warden-cyan tracking-[0.2em]">
                          STAKE
                        </th>
                        <th className="text-left px-6 py-3 font-mono text-[10px] text-warden-cyan tracking-[0.2em]">
                          STATUS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-gray-600 font-mono text-sm">
                            NO COUNCIL MEMBERS FOUND
                          </td>
                        </tr>
                      ) : (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        members.map((m: any, i: number) => {
                          const walletStr = m.wallet?.toBase58?.() ?? String(m.wallet);
                          const stakeVal = m.stake?.toNumber?.() ?? 0;
                          return (
                            <motion.tr
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="border-b border-warden-border/20 hover:bg-warden-cyan/5 transition"
                            >
                              <td className="px-6 py-4 font-mono text-sm text-white">
                                {walletStr.slice(0, 4)}...{walletStr.slice(-4)}
                              </td>
                              <td className="px-6 py-4 text-sm text-warden-cyan font-mono">
                                {(stakeVal / LAMPORTS_PER_SOL).toFixed(2)} SOL
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`font-mono text-xs tracking-wider ${
                                    m.isActive ? "text-hud-green" : "text-gray-600"
                                  }`}
                                >
                                  {m.isActive ? "● ACTIVE" : "○ INACTIVE"}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </HUDFrame>
              </motion.div>
            )}

            {activeTab === "votes" && (
              <motion.div
                key="votes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <HUDFrame color="purple" label="TRIBUNAL" className="text-center py-12">
                  <div className="text-3xl opacity-20 mb-4">◎</div>
                  <p className="text-gray-500 font-mono text-sm tracking-wider">
                    NO PENDING EXTRACTION REQUESTS
                  </p>
                  <p className="text-gray-600 text-xs font-mono mt-2">
                    Requests appear here when a contained agent&apos;s owner posts extraction fee.
                  </p>
                </HUDFrame>
              </motion.div>
            )}

            {activeTab === "config" && (
              <motion.div
                key="config"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <HUDFrame color="orange" label="CONFIGURATION" className="!p-0">
                  {[
                    { label: "Vote Threshold", value: `${voteThreshold}%` },
                    { label: "Review Window", value: `${reviewWindow}s` },
                    { label: "Min Extraction Fee", value: `${(minBail / LAMPORTS_PER_SOL).toFixed(2)} SOL` },
                    { label: "Slash Percentage", value: `${slashPct}%` },
                  ].map((item, i, arr) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`flex justify-between px-6 py-4 ${
                        i < arr.length - 1 ? "border-b border-warden-border/20" : ""
                      }`}
                    >
                      <span className="text-gray-500 font-mono text-sm tracking-wider">
                        {item.label}
                      </span>
                      <span className="text-warden-orange font-mono text-sm font-bold">
                        {item.value}
                      </span>
                    </motion.div>
                  ))}
                </HUDFrame>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

export default function DaoPage() {
  return (
    <AuthGuard>
      <DaoContent />
    </AuthGuard>
  );
}
