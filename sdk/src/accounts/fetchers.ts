import { PublicKey } from "@solana/web3.js";
import {
  findAgentRecordPda,
  findCellPda,
  findBailRequestPda,
  findSentinelDaoPda,
  findInsurancePoolPda,
  findInsurancePolicyPda,
} from "../pda";
import type { AnchorProgram } from "../instructions/types";

export async function fetchAllAgents(program: AnchorProgram) {
  return program.account.agentRecord.all();
}

export async function fetchAgent(
  program: AnchorProgram,
  agentIdentity: PublicKey
) {
  const [pda] = findAgentRecordPda(agentIdentity, program.programId);
  return program.account.agentRecord.fetch(pda);
}

export async function fetchDao(program: AnchorProgram) {
  const [pda] = findSentinelDaoPda(program.programId);
  return program.account.sentinelDao.fetch(pda);
}

export async function fetchCell(
  program: AnchorProgram,
  agentIdentity: PublicKey
) {
  const [agentRecord] = findAgentRecordPda(agentIdentity, program.programId);
  const [cellPda] = findCellPda(agentRecord, program.programId);
  return program.account.cell.fetch(cellPda);
}

export async function fetchBailRequest(
  program: AnchorProgram,
  agentIdentity: PublicKey
) {
  const [agentRecord] = findAgentRecordPda(agentIdentity, program.programId);
  const [cell] = findCellPda(agentRecord, program.programId);
  const [bailPda] = findBailRequestPda(cell, program.programId);
  return program.account.bailRequest.fetch(bailPda);
}

export async function fetchInsurancePool(program: AnchorProgram) {
  const [pda] = findInsurancePoolPda(program.programId);
  return program.account.insurancePool.fetch(pda);
}

export async function fetchInsurancePolicy(
  program: AnchorProgram,
  agentIdentity: PublicKey
) {
  const [agentRecord] = findAgentRecordPda(agentIdentity, program.programId);
  const [policyPda] = findInsurancePolicyPda(agentRecord, program.programId);
  return program.account.insurancePolicy.fetch(policyPda);
}

export async function fetchAllPolicies(program: AnchorProgram) {
  return program.account.insurancePolicy.all();
}
