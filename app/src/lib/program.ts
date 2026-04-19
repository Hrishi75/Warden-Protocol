import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  IDL,
  DEFAULT_PROGRAM_ID,
  findAgentRecordPda as _findAgentRecordPda,
  findCellPda as _findCellPda,
  findBailRequestPda as _findBailRequestPda,
  findSentinelDaoPda as _findSentinelDaoPda,
  findVaultPda as _findVaultPda,
  findBailVaultPda as _findBailVaultPda,
  findInsurancePoolPda as _findInsurancePoolPda,
  findInsurancePolicyPda as _findInsurancePolicyPda,
  findInsuranceVaultPda as _findInsuranceVaultPda,
  findInsuranceClaimPda as _findInsuranceClaimPda,
} from "@sentinel-protocol/sdk";

// Re-export program ID
export const PROGRAM_ID = DEFAULT_PROGRAM_ID;

// PDA helpers bound to default PROGRAM_ID for backward compat
export function findAgentRecordPda(agentPubkey: PublicKey): [PublicKey, number] {
  return _findAgentRecordPda(agentPubkey, PROGRAM_ID);
}

export function findCellPda(agentRecordPda: PublicKey): [PublicKey, number] {
  return _findCellPda(agentRecordPda, PROGRAM_ID);
}

export function findBailRequestPda(cellPda: PublicKey): [PublicKey, number] {
  return _findBailRequestPda(cellPda, PROGRAM_ID);
}

export function findSentinelDaoPda(): [PublicKey, number] {
  return _findSentinelDaoPda(PROGRAM_ID);
}

export function findVaultPda(agentRecordPda: PublicKey): [PublicKey, number] {
  return _findVaultPda(agentRecordPda, PROGRAM_ID);
}

export function findBailVaultPda(bailRequestPda: PublicKey): [PublicKey, number] {
  return _findBailVaultPda(bailRequestPda, PROGRAM_ID);
}

export function findInsurancePoolPda(): [PublicKey, number] {
  return _findInsurancePoolPda(PROGRAM_ID);
}

export function findInsurancePolicyPda(agentRecordPda: PublicKey): [PublicKey, number] {
  return _findInsurancePolicyPda(agentRecordPda, PROGRAM_ID);
}

export function findInsuranceVaultPda(insurancePoolPda: PublicKey): [PublicKey, number] {
  return _findInsuranceVaultPda(insurancePoolPda, PROGRAM_ID);
}

export function findInsuranceClaimPda(insurancePolicyPda: PublicKey): [PublicKey, number] {
  return _findInsuranceClaimPda(insurancePolicyPda, PROGRAM_ID);
}

// Re-export instruction builders
export {
  registerAgent,
  arrestAgent,
  freezeAgentToken,
  releaseAgent,
  reportViolation,
  checkProbation,
  postBail,
  castVote,
  buyCoverage,
  fileClaim,
  cancelCoverage,
  processPayment,
  initDao,
  initInsurancePool,
} from "@sentinel-protocol/sdk";

// Re-export account fetchers
export {
  fetchAllAgents,
  fetchAgent,
  fetchDao,
  fetchCell,
  fetchBailRequest,
  fetchInsurancePool,
  fetchInsurancePolicy,
  fetchAllPolicies,
} from "@sentinel-protocol/sdk";

// Re-export helpers
export {
  getStatusString,
  getTierString,
  getBailOutcomeString,
  getViolationTypeString,
} from "@sentinel-protocol/sdk";

// Re-export client
export { SentinelClient } from "@sentinel-protocol/sdk";

// Backward-compatible provider/program factories used by useProgram.ts
export function getProvider(
  connection: Connection,
  wallet: AnchorWallet
): AnchorProvider {
  return new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getProgram(provider: AnchorProvider): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Program(IDL as any, provider);
}
