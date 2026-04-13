import { PublicKey } from "@solana/web3.js";

const AGENT_SEED = Buffer.from("agent");
const CELL_SEED = Buffer.from("cell");
const BAIL_SEED = Buffer.from("bail");
const DAO_SEED = Buffer.from("sentinel_dao");
const VAULT_SEED = Buffer.from("vault");
const BAIL_VAULT_SEED = Buffer.from("bail_vault");
const INSURANCE_POOL_SEED = Buffer.from("insurance_pool");
const INSURANCE_POLICY_SEED = Buffer.from("insurance_policy");
const INSURANCE_VAULT_SEED = Buffer.from("insurance_vault");
const INSURANCE_CLAIM_SEED = Buffer.from("insurance_claim");

export function findAgentRecordPda(
  agentPubkey: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [AGENT_SEED, agentPubkey.toBuffer()],
    programId
  );
}

export function findCellPda(
  agentRecordPda: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [CELL_SEED, agentRecordPda.toBuffer()],
    programId
  );
}

export function findBailRequestPda(
  cellPda: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [BAIL_SEED, cellPda.toBuffer()],
    programId
  );
}

export function findSentinelDaoPda(
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([DAO_SEED], programId);
}

export function findVaultPda(
  agentRecordPda: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [VAULT_SEED, agentRecordPda.toBuffer()],
    programId
  );
}

export function findBailVaultPda(
  bailRequestPda: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [BAIL_VAULT_SEED, bailRequestPda.toBuffer()],
    programId
  );
}

export function findInsurancePoolPda(
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [INSURANCE_POOL_SEED],
    programId
  );
}

export function findInsurancePolicyPda(
  agentRecordPda: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [INSURANCE_POLICY_SEED, agentRecordPda.toBuffer()],
    programId
  );
}

export function findInsuranceVaultPda(
  insurancePoolPda: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [INSURANCE_VAULT_SEED, insurancePoolPda.toBuffer()],
    programId
  );
}

export function findInsuranceClaimPda(
  insurancePolicyPda: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [INSURANCE_CLAIM_SEED, insurancePolicyPda.toBuffer()],
    programId
  );
}
