import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { findAgentRecordPda, findSentinelDaoPda } from "../pda";
import type { AnchorProgram } from "./types";

export async function processPayment(
  program: AnchorProgram,
  payer: PublicKey,
  agentIdentity: PublicKey,
  amount: BN
) {
  const programId = program.programId;
  const [agentRecord] = findAgentRecordPda(agentIdentity, programId);
  const [sentinelDao] = findSentinelDaoPda(programId);
  const dao = await program.account.sentinelDao.fetch(sentinelDao);

  return program.methods
    .processPayment(amount)
    .accounts({
      payer,
      agentRecord,
      sentinelDao,
      treasury: (dao as { treasury: PublicKey }).treasury,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}
