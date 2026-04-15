import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnchorProgram = any;

export interface PermissionScopeInput {
  maxTransferLamports: BN;
  allowedPrograms: PublicKey[];
  maxDailyTransactions: number;
}

export interface DaoMemberInput {
  wallet: PublicKey;
  stake: BN;
  isActive: boolean;
}
