"use client";

import React from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/providers/AuthProvider";
import { WalletButton } from "./WalletButton";

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
  pathname: string;
}

export function MobileMenu({ isOpen, onClose, links, pathname }: MobileMenuProps) {
  const { disconnect, connected } = useWallet();
  const { signOut } = useAuth();

  const handleDisconnect = () => {
    signOut();
    disconnect();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Menu Panel */}
      <div
        className="fixed top-0 right-0 h-full w-72 z-50 p-6 flex flex-col gap-2 animate-fade-in border-l"
        style={{
          background: "rgba(11, 13, 26, 0.95)",
          backdropFilter: "blur(24px)",
          borderColor: "rgba(0, 229, 204, 0.15)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="self-end p-2 text-gray-500 hover:text-warden-cyan transition"
          aria-label="Close menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Branding */}
        <div className="font-mono text-xs text-warden-cyan/50 tracking-[0.3em] mb-2">
          NAVIGATION
        </div>

        <nav className="flex flex-col gap-0 border border-warden-border/30">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`px-4 py-3 font-mono text-xs tracking-wider transition border-b border-warden-border/20 last:border-b-0 ${
                pathname === link.href
                  ? "text-warden-cyan bg-warden-cyan/10 border-l-2 border-l-warden-cyan"
                  : "text-gray-400 hover:text-warden-cyan hover:bg-warden-cyan/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex flex-col gap-3">
          {connected ? (
            <button
              onClick={handleDisconnect}
              className="flex items-center justify-center gap-2 px-4 py-3 font-mono text-xs tracking-wider border border-alert-red/30 text-alert-red/80 hover:text-alert-red hover:border-alert-red/60 hover:bg-alert-red/10 transition-all duration-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-alert-red animate-pulse" />
              DISCONNECT WALLET
            </button>
          ) : (
            <WalletButton />
          )}
        </div>

        <div className="mt-auto">
          <div className="hud-divider mb-3" />
          <p className="font-mono text-[10px] text-gray-700 tracking-wider text-center">
            SENTINEL PROTOCOL // DEVNET
          </p>
        </div>
      </div>
    </>
  );
}
