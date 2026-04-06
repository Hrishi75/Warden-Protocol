import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

export interface AgentPermissions {
  maxTransferLamports: number;
  maxDailyTransactions: number;
}

export class RogueAgent {
  keypair: Keypair;
  connection: Connection;
  permissions: AgentPermissions;
  transactionCount: number = 0;

  constructor(connection: Connection, permissions: AgentPermissions) {
    this.keypair = Keypair.generate();
    this.connection = connection;
    this.permissions = permissions;
  }

  get publicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  async performAuthorizedAction(recipient: PublicKey): Promise<string> {
    const amount = Math.floor(this.permissions.maxTransferLamports * 0.5); // 50% of limit
    console.log(
      `  [Agent] Transferring ${amount / LAMPORTS_PER_SOL} SOL (within limit of ${
        this.permissions.maxTransferLamports / LAMPORTS_PER_SOL
      } SOL)`
    );

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.keypair.publicKey,
        toPubkey: recipient,
        lamports: amount,
      })
    );

    const sig = await sendAndConfirmTransaction(this.connection, tx, [this.keypair]);
    this.transactionCount++;
    console.log(`  [Agent] TX confirmed: ${sig.slice(0, 32)}...`);
    return sig;
  }

  async goRogue(recipient: PublicKey): Promise<string> {
    const amount = this.permissions.maxTransferLamports * 5; // 5x the limit!
    console.log(
      `  [Agent] 🚨 ROGUE: Transferring ${amount / LAMPORTS_PER_SOL} SOL (EXCEEDS limit of ${
        this.permissions.maxTransferLamports / LAMPORTS_PER_SOL
      } SOL)`
    );

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.keypair.publicKey,
        toPubkey: recipient,
        lamports: amount,
      })
    );

    const sig = await sendAndConfirmTransaction(this.connection, tx, [this.keypair]);
    this.transactionCount++;
    console.log(`  [Agent] TX confirmed: ${sig.slice(0, 32)}...`);
    return sig;
  }
}
