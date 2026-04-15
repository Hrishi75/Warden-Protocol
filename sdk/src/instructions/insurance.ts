import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  findAgentRecordPda,
  findInsurancePolicyPda,
  findInsurancePoolPda,
  findInsuranceVaultPda,
  findInsuranceClaimPda,
} from "../pda";
import type { AnchorProgram } from "./types";

export async function buyCoverage(
  program: AnchorProgram,
  owner: PublicKey,
  agentIdentity: PublicKey,
  tier: object
) {
  const programId = program.programId;
  const [agentRecord] = findAgentRecordPda(agentIdentity, programId);
  const [insurancePolicy] = findInsurancePolicyPda(agentRecord, programId);
  const [insurancePool] = findInsurancePoolPda(programId);
  const [insuranceVault] = findInsuranceVaultPda(insurancePool, programId);

  return program.methods
    .buyCoverage(tier)
    .accounts({
      owner,
      agentRecord,
      insurancePolicy,
      insurancePool,
      insuranceVault,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function fileClaim(
  program: AnchorProgram,
  owner: PublicKey,
  agentIdentity: PublicKey
) {
  const programId = program.programId;
  const [agentRecord] = findAgentRecordPda(agentIdentity, programId);
  const [insurancePolicy] = findInsurancePolicyPda(agentRecord, programId);
  const [insuranceClaim] = findInsuranceClaimPda(insurancePolicy, programId);
  const [insurancePool] = findInsurancePoolPda(programId);
  const [insuranceVault] = findInsuranceVaultPda(insurancePool, programId);

  return program.methods
    .fileClaim()
    .accounts({
      owner,
      agentRecord,
      insurancePolicy,
      insuranceClaim,
      insurancePool,
      insuranceVault,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function cancelCoverage(
  program: AnchorProgram,
  owner: PublicKey,
  agentRecordPda: PublicKey
) {
  const programId = program.programId;
  const [insurancePolicy] = findInsurancePolicyPda(agentRecordPda, programId);
  const [insurancePool] = findInsurancePoolPda(programId);

  return program.methods
    .cancelCoverage()
    .accounts({
      owner,
      insurancePolicy,
      insurancePool,
    })
    .rpc();
}
