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
import { WalletAgent, WalletConnectionInfo, recordWalletConnection } from "@/lib/wallet-api";
import { saveProfileToServer } from "@/lib/profile-api";

interface AuthContextType {
  operative: OperativeProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  walletConnected: boolean;
  walletAgents: WalletAgent[];
  walletConnectionInfo: WalletConnectionInfo | null;
  signIn: (callsign: string, faction: Faction, avatarStyle: string) => Promise<void>;
  signOut: () => void;
  deleteAccount: () => void;
  updateProfile: (updates: Partial<OperativeProfile>) => void;
  linkWallet: () => Promise<void>;
  unlinkWallet: (address: string) => void;
  refreshWalletAgents: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  operative: null,
  isAuthenticated: false,
  isLoading: true,
  walletConnected: false,
  walletAgents: [],
  walletConnectionInfo: null,
  signIn: async () => {},
  signOut: () => {},
  deleteAccount: () => {},
  updateProfile: () => {},
  linkWallet: async () => {},
  unlinkWallet: () => {},
  refreshWalletAgents: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const [operative, setOperative] = useState<OperativeProfile | null>(null);
  const [walletAgents, setWalletAgents] = useState<WalletAgent[]>([]);
  const [walletConnectionInfo, setWalletConnectionInfo] = useState<WalletConnectionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On wallet connect: record in DB (auto-creates profile), load profile + agents
  useEffect(() => {
    if (wallet.publicKey) {
      const address = wallet.publicKey.toBase58();

      // Try localStorage for instant display while server loads
      const localProfile = loadProfile(address);
      if (localProfile) {
        setOperative(localProfile);
      }

      // Record connection — server auto-creates profile if new wallet
      recordWalletConnection(address).then((data) => {
        if (!data) {
          // Server unreachable — use local profile or create a minimal one
          if (!localProfile) {
            const minimal: OperativeProfile = {
              walletAddress: address,
              callsign: null,
              faction: null,
              clearanceLevel: 1,
              xp: 0,
              registeredAt: Date.now(),
              signature: null,
              avatarStyle: null,
              linkedWallets: [],
            };
            setOperative(minimal);
          }
          setIsLoading(false);
          return;
        }

        setWalletConnectionInfo(data.connection);
        setWalletAgents(data.agents);

        // Server always returns a profile (auto-created on first connect)
        const serverProfile = data.profile as unknown as OperativeProfile;

        // If local profile has richer data (callsign etc), sync it to server
        if (localProfile?.callsign && !serverProfile.callsign) {
          saveProfileToServer(localProfile).catch(() => {});
          setOperative(localProfile);
        } else {
          // Use server profile as source of truth
          saveProfile(serverProfile);
          setOperative(serverProfile);
        }

        setIsLoading(false);
      });
    } else {
      setOperative(null);
      setWalletAgents([]);
      setWalletConnectionInfo(null);
      setIsLoading(false);
    }
  }, [wallet.publicKey]);

  const refreshWalletAgents = useCallback(async () => {
    if (!wallet.publicKey) return;
    const data = await recordWalletConnection(wallet.publicKey.toBase58());
    if (data) {
      setWalletAgents(data.agents);
      setWalletConnectionInfo(data.connection);
    }
  }, [wallet.publicKey]);

  const signIn = useCallback(
    async (callsign: string, faction: Faction, avatarStyle: string) => {
      const profile = await signAndCreateProfile(wallet, callsign, faction, avatarStyle);
      setOperative(profile);
    },
    [wallet]
  );

  const signOut = useCallback(() => {
    setOperative(null);
    setWalletAgents([]);
    setWalletConnectionInfo(null);
  }, []);

  const deleteAccount = useCallback(() => {
    if (wallet.publicKey) {
      deleteProfile(wallet.publicKey.toBase58());
    }
    setOperative(null);
    setWalletAgents([]);
    setWalletConnectionInfo(null);
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
        walletAgents,
        walletConnectionInfo,
        signIn,
        signOut,
        deleteAccount,
        updateProfile,
        linkWallet,
        unlinkWallet,
        refreshWalletAgents,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
