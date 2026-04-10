"use client";

import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  // Type cast to work around React 18/19 type incompatibility with wallet adapter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Connection = ConnectionProvider as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SolanaWallet = SolanaWalletProvider as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const WalletModal = WalletModalProvider as any;

  return (
    <Connection endpoint={endpoint}>
      <SolanaWallet wallets={wallets} autoConnect>
        <WalletModal>{children}</WalletModal>
      </SolanaWallet>
    </Connection>
  );
}
