"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { WalletProvider } from "@/providers/WalletProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { NavBar } from "@/components/NavBar";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <WalletProvider>
      <AuthProvider>
        <NavBar />

        {/* Global scanline overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-[100]"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 229, 204, 0.008) 2px, rgba(0, 229, 204, 0.008) 4px)",
          }}
        />

        <main className={isLanding ? "" : "max-w-7xl mx-auto px-6 pt-28 pb-8"}>
          {children}
        </main>
      </AuthProvider>
    </WalletProvider>
  );
}