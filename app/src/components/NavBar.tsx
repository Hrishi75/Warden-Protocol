"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/providers/AuthProvider";
import { WalletButton } from "@/components/WalletButton";
import { MobileMenu } from "@/components/MobileMenu";
import { OperativeCard } from "@/components/OperativeCard";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const primaryLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/register", label: "Deploy Agent" },
];

const dropdownLinks = [
  { href: "/dao", label: "Governance" },
  { href: "/demo", label: "Live Demo" },
  { href: "/docs", label: "Docs" },
];

const allMobileLinks = [
  ...primaryLinks,
  ...dropdownLinks,
  { href: "/profile", label: "Profile" },
];

export function NavBar() {
  const pathname = usePathname();
  const { disconnect } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { operative, isAuthenticated, walletConnected, signOut } = useAuth();

  const handleDisconnect = () => {
    signOut();
    disconnect();
  };

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        moreButtonRef.current && !moreButtonRef.current.contains(target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const isDropdownActive = dropdownLinks.some((l) => l.href === pathname);

  return (
    <>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4"
      >
        <div className="w-full max-w-5xl relative">
          <nav
            className="w-full border border-warden-cyan/10 transition-all duration-300"
            style={{
              background: "rgba(11, 13, 26, 0.75)",
              backdropFilter: "blur(24px) saturate(1.4)",
              WebkitBackdropFilter: "blur(24px) saturate(1.4)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(0, 229, 204, 0.05), 0 0 40px rgba(0, 229, 204, 0.03)",
              clipPath:
                "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
            }}
          >
            {/* Top accent line */}
            <div
              className="h-[1px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0, 229, 204, 0.3) 20%, rgba(255, 155, 38, 0.3) 80%, transparent)",
              }}
            />

            <div className="flex items-center justify-between px-5 py-2.5">
              {/* Logo + Nav */}
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3 group">
                  <Image
                    src="/sentinelprotocol.png"
                    alt="Sentinel Protocol"
                    width={32}
                    height={32}
                    className="group-hover:drop-shadow-[0_0_8px_rgba(0,229,204,0.5)] transition-all duration-300"
                  />
                  <span className="text-base font-bold tracking-[0.15em] font-mono">
                    <span className="text-warden-cyan">SENTINEL</span>
                    <span className="text-warden-orange">.</span>
                  </span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-0.5">
                  {primaryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative px-3 py-2 text-xs font-mono tracking-wider uppercase transition-all duration-200 ${
                        pathname === link.href
                          ? "text-warden-cyan bg-warden-cyan/10"
                          : "text-gray-500 hover:text-warden-cyan/70 hover:bg-warden-cyan/5"
                      }`}
                    >
                      {link.label}
                      {pathname === link.href && (
                        <motion.div
                          layoutId="navIndicator"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-warden-cyan"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                    </Link>
                  ))}

                  {/* MORE Button */}
                  <button
                    ref={moreButtonRef}
                    onClick={() => setDropdownOpen((o) => !o)}
                    className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-mono tracking-wider uppercase transition-all duration-200 ${
                      isDropdownActive || dropdownOpen
                        ? "text-warden-cyan bg-warden-cyan/10"
                        : "text-gray-500 hover:text-warden-cyan/70 hover:bg-warden-cyan/5"
                    }`}
                  >
                    MORE
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M2 4L5 7L8 4" />
                    </svg>
                    {isDropdownActive && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-warden-cyan"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-3">
                <AnimatePresence>
                  {isAuthenticated && operative && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="hidden md:block"
                    >
                      <Link href="/profile" className="hover:opacity-80 transition-opacity">
                        <OperativeCard compact />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Wallet: Connect or Disconnect */}
                <div className="hidden sm:flex items-center gap-2">
                  {walletConnected ? (
                    <motion.button
                      onClick={handleDisconnect}
                      className="flex items-center gap-2 px-3 py-2 font-mono text-xs tracking-wider border border-alert-red/30 text-alert-red/80 hover:text-alert-red hover:border-alert-red/60 hover:bg-alert-red/10 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="Disconnect wallet"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-alert-red animate-pulse" />
                      DISCONNECT
                    </motion.button>
                  ) : (
                    <WalletButton />
                  )}
                </div>

                {/* Mobile Hamburger */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 text-gray-500 hover:text-warden-cyan transition"
                  aria-label="Open menu"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </nav>

          {/* Dropdown rendered OUTSIDE nav to avoid clipPath clipping */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-[200px] mt-1 min-w-[180px] border border-warden-cyan/10 z-[60]"
                style={{
                  background: "rgba(11, 13, 26, 0.95)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 229, 204, 0.05)",
                }}
              >
                {dropdownLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDropdownOpen(false)}
                    className={`block px-4 py-3 text-xs font-mono tracking-wider uppercase transition-all duration-200 border-b border-warden-cyan/5 last:border-b-0 ${
                      pathname === link.href
                        ? "text-warden-cyan bg-warden-cyan/10 border-l-2 border-l-warden-cyan"
                        : "text-gray-400 hover:text-warden-cyan hover:bg-warden-cyan/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        links={allMobileLinks}
        pathname={pathname}
      />
    </>
  );
}
