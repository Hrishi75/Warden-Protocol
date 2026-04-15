import { BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  findAgentRecordPda,
  findVaultPda,
  findCellPda,
  findSentinelDaoPda,
  findBailRequestPda,
  findBailVaultPda,
} from "../pda";
import type { AnchorProgram, PermissionScopeInput } from "./types";

export async function registerAgent(
  program: AnchorProgram,
  owner: PublicKey,
  agentKeypair: Keypair,
  permissions: PermissionScopeInput,
  stakeAmount: BN
) {
  const programId = program.programId;
  const [agentRecord] = findAgentRecordPda(agentKeypair.publicKey, programId);
  const [vault] = findVaultPda(agentRecord, programId);

  return program.methods
    .registerAgent(permissions, stakeAmount)
    .accounts({
      owner,
      agentIdentity: agentKeypair.publicKey,
      agentRecord,
      vault,
      systemProgram: SystemProgram.programId,
    })
    .signers([agentKeypair])
    .rpc();
}

export async function arrestAgent(
  program: AnchorProgram,
  arrester: PublicKey,
  agentIdentity: PublicKey,
  reason: string,
  evidenceHash: number[],
  violationType: object
) {
  const programId = program.programId;
  const [agentRecord] = findAgentRecordPda(agentIdentity, programId);
  const [cell] = findCellPda(agentRecord, programId);
  const [sentinelDao] = findSentinelDaoPda(programId);

  return program.methods
    .arrestAgent(reason, evidenceHash, violationType)
    .accounts({
      arrester,
      agentRecord,
      cell,
      sentinelDao,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function freezeAgentToken(
  program: AnchorProgram,
  authority: PublicKey,
  agentIdentity: PublicKey,
  tokenAccount: PublicKey,
  mint: PublicKey
) {
  const programId = program.programId;
  const [agentRecord] = findAgentRecordPda(agentIdentity, programId);
  const [cell] = findCellPda(agentRecord, programId);
  const [sentinelDao] = findSentinelDaoPda(programId);

  return program.methods
    .freezeAgentToken()
    .accounts({
      authority,
      agentRecord,
      cell,
      sentinelDao,
      tokenAccount,
      mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

export async function releaseAgent(
  program: AnchorProgram,
  authority: PublicKey,
  agentIdentity: PublicKey,
  ownerPubkey: PublicKey,
  treasuryPubkey: PublicKey
) {
  const programId = program.programId;
  const [agentRecord] = findAgentRecordPda(agentIdentity, programId);
  const [cell] = findCellPda(agentRecord, programId);
  const [bailRequest] = findBailRequestPda(cell, programId);
  const [bailVault] = findBailVaultPda(bailRequest, programId);
  const [stakeVault] = findVaultPda(agentRecord, programId);
  const [sentinelDao] = findSentinelDaoPda(programId);

  return program.methods
    .releaseAgent()
    .accounts({
      authority,
      agentRecord,
      cell,
      bailRequest,
      bailVault,
      stakeVault,
      owner: ownerPubkey,
      sentinelDao,
      treasury: treasuryPubkey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function reportViolation(
  program: AnchorProgram,
  reporter: PublicKey,
  agentIdentity: PublicKey,
  violationType: object,
  evidenceHash: number[],
  description: string
) {
  const programId = program.programId;
  const [agentRecord] = findAgentRecordPda(agentIdentity, programId);
  const [sentinelDao] = findSentinelDaoPda(programId);

  return program.methods
    .reportViolation(violationType, evidenceHash, description)
    .accounts({
      reporter,
      agentRecord,
      sentinelDao,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function checkProbation(
  program: AnchorProgram,
  caller: PublicKey,
  agentIdentity: PublicKey
) {
  const programId = program.programId;
  const [agentRecord] = findAgentRecordPda(agentIdentity, programId);

  return program.methods
    .checkProbation()
    .accounts({
      caller,
      agentRecord,
    })
    .rpc();
}
