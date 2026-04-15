import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  findAgentRecordPda,
  findCellPda,
  findBailRequestPda,
  findBailVaultPda,
  findSentinelDaoPda,
} from "../pda";
import type { AnchorProgram } from "./types";

export async function postBail(
  program: AnchorProgram,
  owner: PublicKey,
  agentIdentity: PublicKey,
  bailAmount: BN
) {
  const programId = program.programId;
  const [agentRecord] = findAgentRecordPda(agentIdentity, programId);
  const [cell] = findCellPda(agentRecord, programId);
  const [bailRequest] = findBailRequestPda(cell, programId);
  const [bailVault] = findBailVaultPda(bailRequest, programId);
  const [sentinelDao] = findSentinelDaoPda(programId);

  return program.methods
    .postBail(bailAmount)
    .accounts({
      owner,
      agentRecord,
      cell,
      bailRequest,
      bailVault,
      sentinelDao,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function castVote(
  program: AnchorProgram,
  voter: PublicKey,
  agentIdentity: PublicKey,
  decision: object
) {
  const programId = program.programId;
  const [agentRecord] = findAgentRecordPda(agentIdentity, programId);
  const [cell] = findCellPda(agentRecord, programId);
  const [bailRequest] = findBailRequestPda(cell, programId);
  const [sentinelDao] = findSentinelDaoPda(programId);

  return program.methods
    .castVote(decision)
    .accounts({
      voter,
      bailRequest,
      cell,
      agentRecord,
      sentinelDao,
    })
    .rpc();
}
