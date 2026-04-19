"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { WalletButton } from "./WalletButton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, walletConnected } = useAuth();

  if (isLoading) {
    return (
      <motion.div
        className="min-h-[60vh] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="hud-frame text-center p-12">
          <div className="w-8 h-8 border-2 border-sentinel-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-sentinel-cyan text-sm tracking-widest uppercase animate-neon-pulse">
            Verifying clearance...
          </p>
        </div>
      </motion.div>
    );
  }

  if (!walletConnected) {
    return (
      <motion.div
        className="min-h-[60vh] flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hud-frame text-center p-12 max-w-md">
          <div className="text-alert-red font-mono text-xs tracking-widest mb-6 uppercase">
            UPLINK REQUIRED
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 font-mono">
            NO NEURAL LINK DETECTED
          </h2>
          <p className="text-gray-400 mb-8 text-sm">
            Connect your wallet to access the Sentinel Protocol command systems.
          </p>
          <div className="flex justify-center">
            <WalletButton />
          </div>
          <div className="mt-6 hud-divider" />
          <p className="text-gray-600 text-xs font-mono mt-4 tracking-wider">
            SUPPORTED: PHANTOM / SOLFLARE
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
