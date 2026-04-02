import { PublicKey } from "@solana/web3.js";

const AGENT_SEED = Buffer.from("agent");
const CELL_SEED = Buffer.from("cell");
const BAIL_SEED = Buffer.from("bail");
const DAO_SEED = Buffer.from("warden_dao");
const VAULT_SEED = Buffer.from("vault");
const BAIL_VAULT_SEED = Buffer.from("bail_vault");

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

export function findWardenDaoPda(
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
