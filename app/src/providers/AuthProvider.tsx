"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  OperativeProfile,
  Faction,
  loadProfile,
  signAndCreateProfile,
  deleteProfile,
  saveProfile,
  linkWallet as linkWalletFn,
  unlinkWallet as unlinkWalletFn,
} from "@/lib/auth";

interface AuthContextType {
  operative: OperativeProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  walletConnected: boolean;
  signIn: (callsign: string, faction: Faction, avatarStyle: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (updates: Partial<OperativeProfile>) => void;
  linkWallet: () => Promise<void>;
  unlinkWallet: (address: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  operative: null,
  isAuthenticated: false,
  isLoading: true,
  walletConnected: false,
  signIn: async () => {},
  signOut: () => {},
  updateProfile: () => {},
  linkWallet: async () => {},
  unlinkWallet: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const [operative, setOperative] = useState<OperativeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile when wallet connects
  useEffect(() => {
    if (wallet.publicKey) {
      const profile = loadProfile(wallet.publicKey.toBase58());
      setOperative(profile);
    } else {
      setOperative(null);
    }
    setIsLoading(false);
  }, [wallet.publicKey]);

  const signIn = useCallback(
    async (callsign: string, faction: Faction, avatarStyle: string) => {
      const profile = await signAndCreateProfile(wallet, callsign, faction, avatarStyle);
      setOperative(profile);
    },
    [wallet]
  );

  const signOut = useCallback(() => {
    if (wallet.publicKey) {
      deleteProfile(wallet.publicKey.toBase58());
    }
    setOperative(null);
  }, [wallet.publicKey]);

  const updateProfile = useCallback(
    (updates: Partial<OperativeProfile>) => {
      if (!operative) return;
      const updated = { ...operative, ...updates };
      saveProfile(updated);
      setOperative(updated);
    },
    [operative]
  );

  const linkWallet = useCallback(async () => {
    if (!operative) return;
    const updated = await linkWalletFn(wallet, operative);
    setOperative(updated);
  }, [operative, wallet]);

  const unlinkWallet = useCallback(
    (address: string) => {
      if (!operative) return;
      const updated = unlinkWalletFn(address, operative);
      setOperative(updated);
    },
    [operative]
  );

  return (
    <AuthContext.Provider
      value={{
        operative,
        isAuthenticated: !!operative,
        isLoading,
        walletConnected: !!wallet.publicKey,
        signIn,
        signOut,
        updateProfile,
        linkWallet,
        unlinkWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
