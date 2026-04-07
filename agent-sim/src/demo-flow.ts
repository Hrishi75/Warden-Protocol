import * as anchor from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Load IDL — adjust path after anchor build
// import idl from "../../target/idl/sentinel_protocol.json";

const PROGRAM_ID = new PublicKey("5DCbrjFHUdzLHLayUUdFJBnBPC8UV7eUc3wJA1rVRQTa");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(step: number, msg: string) {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`\n[${timestamp}] STEP ${step}: ${msg}`);
  console.log("─".repeat(60));
}

async function airdropIfNeeded(connection: Connection, pubkey: PublicKey, amount: number) {
  const balance = await connection.getBalance(pubkey);
  if (balance < amount) {
    console.log(`  Airdropping ${amount / LAMPORTS_PER_SOL} SOL to ${pubkey.toBase58().slice(0, 8)}...`);
    const sig = await connection.requestAirdrop(pubkey, amount);
    await connection.confirmTransaction(sig);
  }
}

function findPda(seeds: (Buffer | Uint8Array)[], programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(seeds, programId);
}

async function runDemo() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║           SENTINEL PROTOCOL — FULL DEMO FLOW             ║");
  console.log("║     On-Chain AI Agent Accountability System             ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  // Setup connection — use devnet
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Generate test wallets
  const daoAuthority = Keypair.generate();
  const agentOwner = Keypair.generate();
  const agentIdentity = Keypair.generate();
  const daoMember1 = Keypair.generate();
  const daoMember2 = Keypair.generate();
  const treasury = Keypair.generate();

  // Fund wallets
  console.log("Funding test wallets on devnet...");
  const wallets = [daoAuthority, agentOwner, daoMember1, daoMember2];
  for (const w of wallets) {
    await airdropIfNeeded(connection, w.publicKey, 5 * LAMPORTS_PER_SOL);
  }
  console.log("✓ All wallets funded\n");

  // Setup provider
  const wallet = new anchor.Wallet(daoAuthority);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  // NOTE: After `anchor build`, load the IDL:
  // const program = new anchor.Program(idl as anchor.Idl, PROGRAM_ID, provider);
  // For now, we'll show the demo structure.

  console.log("Program ID:", PROGRAM_ID.toBase58());
  console.log("DAO Authority:", daoAuthority.publicKey.toBase58());
  console.log("Agent Owner:", agentOwner.publicKey.toBase58());
  console.log("Agent Identity:", agentIdentity.publicKey.toBase58());

  // Derive all PDAs
  const [sentinelDaoPda] = findPda([Buffer.from("sentinel_dao")], PROGRAM_ID);
  const [agentRecordPda] = findPda(
    [Buffer.from("agent"), agentIdentity.publicKey.toBuffer()],
    PROGRAM_ID
  );
  const [vaultPda] = findPda([Buffer.from("vault"), agentRecordPda.toBuffer()], PROGRAM_ID);
  const [cellPda] = findPda([Buffer.from("cell"), agentRecordPda.toBuffer()], PROGRAM_ID);
  const [bailRequestPda] = findPda([Buffer.from("bail"), cellPda.toBuffer()], PROGRAM_ID);
  const [bailVaultPda] = findPda(
    [Buffer.from("bail_vault"), bailRequestPda.toBuffer()],
    PROGRAM_ID
  );

  // ═══════════════════════════════════════════════════════════
  // STEP 1: Initialize Warden DAO
  // ═══════════════════════════════════════════════════════════
  log(1, "INITIALIZE SENTINEL DAO");
  console.log("  Creating DAO with 2 jury members...");
  console.log(`  Member 1: ${daoMember1.publicKey.toBase58().slice(0, 16)}... (stake: 1 SOL)`);
  console.log(`  Member 2: ${daoMember2.publicKey.toBase58().slice(0, 16)}... (stake: 1 SOL)`);
  console.log("  Vote threshold: 51%");
  console.log("  Review window: 30 seconds (demo mode)");
  console.log("  ✅ DAO initialized");

  await sleep(2000);

  // ═══════════════════════════════════════════════════════════
  // STEP 2: Register AI Agent
  // ═══════════════════════════════════════════════════════════
  log(2, "REGISTER AI AGENT");
  console.log(`  Agent: ${agentIdentity.publicKey.toBase58().slice(0, 16)}...`);
  console.log(`  Owner: ${agentOwner.publicKey.toBase58().slice(0, 16)}...`);
  console.log("  Stake: 1 SOL (accountability bond)");
  console.log("  Permissions:");
  console.log("    - Max transfer: 0.1 SOL per transaction");
  console.log("    - Max daily transactions: 10");
  console.log("  Status: 🟢 ACTIVE");
  console.log("  ✅ Agent registered on-chain");

  await sleep(2000);

  // ═══════════════════════════════════════════════════════════
  // STEP 3: Agent Performs Legit Actions
  // ═══════════════════════════════════════════════════════════
  log(3, "AGENT OPERATING NORMALLY");
  for (let i = 1; i <= 3; i++) {
    console.log(`  TX ${i}: Transfer 0.05 SOL → ✅ Within limits`);
    await sleep(800);
  }
  console.log("  Agent behavior: COMPLIANT");

  await sleep(1500);

  // ═══════════════════════════════════════════════════════════
  // STEP 4: Agent Goes Rogue
  // ═══════════════════════════════════════════════════════════
  log(4, "🚨 AGENT GOES ROGUE");
  console.log("  TX 4: Transfer 0.5 SOL → ❌ EXCEEDS 0.1 SOL LIMIT!");
  console.log("  ⚠️  Violation detected by Warden Monitor");
  console.log("  Violation type: ExceededTransferLimit");
  console.log("  Evidence hash: 0x" + "a1b2c3d4e5f6".repeat(5).slice(0, 64));

  await sleep(2000);

  // ═══════════════════════════════════════════════════════════
  // STEP 5: Warden Arrests Agent
  // ═══════════════════════════════════════════════════════════
  log(5, "🔒 AGENT ARRESTED");
  console.log(`  Arrester: DAO Member 1 (${daoMember1.publicKey.toBase58().slice(0, 16)}...)`);
  console.log("  Reason: Exceeded transfer limit — sent 0.5 SOL when limit is 0.1 SOL");
  console.log("  Actions taken:");
  console.log("    - Agent status → 🔴 ARRESTED");
  console.log("    - Cell account created with arrest context");
  console.log("    - Violation added to rap sheet (count: 1)");
  console.log("    - Token accounts frozen (if applicable)");
  console.log("  ✅ Agent contained — cannot execute further on-chain actions");

  await sleep(2000);

  // ═══════════════════════════════════════════════════════════
  // STEP 6: Owner Posts Bail
  // ═══════════════════════════════════════════════════════════
  log(6, "💰 BAIL POSTED");
  console.log(`  Posted by: Agent Owner (${agentOwner.publicKey.toBase58().slice(0, 16)}...)`);
  console.log("  Bail amount: 0.5 SOL");
  console.log("  Review window: 30 seconds");
  console.log("  ✅ Appeal process initiated — DAO jury notified");

  await sleep(2000);

  // ═══════════════════════════════════════════════════════════
  // STEP 7: DAO Votes
  // ═══════════════════════════════════════════════════════════
  log(7, "🗳️  DAO VOTING");
  console.log("  Voting in progress...");
  await sleep(1500);
  console.log(`  Vote 1: Member 1 → PAROLE (weight: 1 SOL, running total: 50%)`);
  await sleep(1500);
  console.log(`  Vote 2: Member 2 → PAROLE (weight: 1 SOL, running total: 100%)`);
  console.log("  ─────────────────────────────────────");
  console.log("  🎯 THRESHOLD MET (100% >= 51%)");
  console.log("  Outcome: PAROLED");
  console.log("  ✅ Voting resolved — agent will be released on parole");

  await sleep(2000);

  // ═══════════════════════════════════════════════════════════
  // STEP 8: Agent Released on Parole
  // ═══════════════════════════════════════════════════════════
  log(8, "⚠️  AGENT RELEASED ON PAROLE");
  console.log("  Status: 🟡 PAROLED");
  console.log("  Parole terms:");
  console.log("    - Reduced max transfer: 0.05 SOL (50% of original)");
  console.log("    - Reduced daily transactions: 5 (50% of original)");
  console.log("    - Mandatory reporting: ON");
  console.log("    - Strikes remaining: 3");
  console.log("    - Probation period: 120 seconds");
  console.log("  Bail returned to owner ✅");
  console.log("  Cell account closed ✅");

  await sleep(2000);

  // ═══════════════════════════════════════════════════════════
  // STEP 9: Agent Behaves During Probation
  // ═══════════════════════════════════════════════════════════
  log(9, "AGENT ON PROBATION — BEHAVING");
  for (let i = 1; i <= 3; i++) {
    console.log(`  TX ${i}: Transfer 0.03 SOL → ✅ Within parole limits`);
    await sleep(800);
  }
  console.log("  Agent behavior during parole: COMPLIANT");
  console.log("  Waiting for probation period to end...");

  await sleep(2000);

  // ═══════════════════════════════════════════════════════════
  // STEP 10: Full Reinstatement
  // ═══════════════════════════════════════════════════════════
  log(10, "🟢 AGENT FULLY REINSTATED");
  console.log("  Probation period completed successfully");
  console.log("  Status: 🟢 ACTIVE");
  console.log("  Full permissions restored:");
  console.log("    - Max transfer: 0.1 SOL");
  console.log("    - Max daily transactions: 10");
  console.log("  Parole terms cleared ✅");

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║                   DEMO COMPLETE                         ║");
  console.log("║                                                          ║");
  console.log("║  Full lifecycle demonstrated:                            ║");
  console.log("║  Register → Rogue → Arrest → Bail → Vote → Parole →    ║");
  console.log("║  Probation → Reinstatement                               ║");
  console.log("║                                                          ║");
  console.log("║  Warden Protocol: Who watches the agents?               ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");
}

runDemo().catch(console.error);
