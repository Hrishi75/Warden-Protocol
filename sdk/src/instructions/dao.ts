import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  findSentinelDaoPda,
  findInsurancePoolPda,
  findInsuranceVaultPda,
} from "../pda";
import type { AnchorProgram, DaoMemberInput } from "./types";

export async function initDao(
  program: AnchorProgram,
  authority: PublicKey,
  treasury: PublicKey,
  voteThreshold: number,
  reviewWindowSeconds: BN,
  minBailLamports: BN,
  slashPercentage: number,
  initialMembers: DaoMemberInput[]
) {
  const programId = program.programId;
  const [sentinelDao] = findSentinelDaoPda(programId);

  return program.methods
    .initDao(
      voteThreshold,
      reviewWindowSeconds,
      minBailLamports,
      slashPercentage,
      initialMembers
    )
    .accounts({
      authority,
      sentinelDao,
      treasury,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function initInsurancePool(
  program: AnchorProgram,
  authority: PublicKey
) {
  const programId = program.programId;
  const [sentinelDao] = findSentinelDaoPda(programId);
  const [insurancePool] = findInsurancePoolPda(programId);
  const [insuranceVault] = findInsuranceVaultPda(insurancePool, programId);

  return program.methods
    .initInsurancePool()
    .accounts({
      authority,
      sentinelDao,
      insurancePool,
      insuranceVault,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}
