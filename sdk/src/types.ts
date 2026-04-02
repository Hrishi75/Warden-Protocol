import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

// Enums matching on-chain types
export enum AgentStatus {
  Active = "Active",
  Arrested = "Arrested",
  Paroled = "Paroled",
  Terminated = "Terminated",
}

export enum ViolationType {
  ExceededTransferLimit = "ExceededTransferLimit",
  UnauthorizedProgram = "UnauthorizedProgram",
  RateLimitBreached = "RateLimitBreached",
  ParoleViolation = "ParoleViolation",
  Other = "Other",
}

export enum BailOutcome {
  Pending = "Pending",
  Released = "Released",
  Paroled = "Paroled",
  Terminated = "Terminated",
}

// Structs matching on-chain types
export interface PermissionScope {
  maxTransferLamports: BN;
  allowedPrograms: PublicKey[];
  maxDailyTransactions: number;
}

export interface Violation {
  timestamp: BN;
  violationType: ViolationType;
  evidenceHash: number[];
  description: string;
}

export interface ParoleTerms {
  reducedMaxTransfer: BN;
  reducedDailyTxns: number;
  mustReport: boolean;
  paroleStart: BN;
  probationEnd: BN;
  strikesRemaining: number;
}

export interface AgentRecord {
  agentIdentity: PublicKey;
  owner: PublicKey;
  stakeAmount: BN;
  status: { active: {} } | { arrested: {} } | { paroled: {} } | { terminated: {} };
  permissions: PermissionScope;
  violations: Violation[];
  registeredAt: BN;
  paroleTerms: ParoleTerms | null;
  bump: number;
}

export interface Cell {
  agent: PublicKey;
  arrester: PublicKey;
  reason: string;
  evidenceHash: number[];
  arrestedAt: BN;
  frozenTokenAccounts: PublicKey[];
  bailPosted: boolean;
  bump: number;
}

export interface BailRequest {
  cell: PublicKey;
  agent: PublicKey;
  owner: PublicKey;
  bailAmount: BN;
  postedAt: BN;
  reviewDeadline: BN;
  votes: Vote[];
  outcome: { pending: {} } | { released: {} } | { paroled: {} } | { terminated: {} };
  bump: number;
}

export interface Vote {
  voter: PublicKey;
  decision: { pending: {} } | { released: {} } | { paroled: {} } | { terminated: {} };
  weight: BN;
  timestamp: BN;
}

export interface DaoMember {
  wallet: PublicKey;
  stake: BN;
  isActive: boolean;
}

export interface WardenDao {
  authority: PublicKey;
  members: DaoMember[];
  voteThreshold: number;
  reviewWindowSeconds: BN;
  minBailLamports: BN;
  slashPercentage: number;
  treasury: PublicKey;
  bump: number;
}
