import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  ParsedTransactionWithMeta,
} from "@solana/web3.js";

export interface MonitoredAgent {
  agentPubkey: PublicKey;
  maxTransferLamports: number;
  maxDailyTransactions: number;
  allowedPrograms: PublicKey[];
}

export interface DetectedViolation {
  agentPubkey: PublicKey;
  violationType: "ExceededTransferLimit" | "UnauthorizedProgram" | "RateLimitBreached";
  description: string;
  txSignature: string;
  amount?: number;
}

export class SentinelMonitor {
  connection: Connection;
  agents: Map<string, MonitoredAgent> = new Map();
  dailyTxCounts: Map<string, number> = new Map();
  onViolation?: (violation: DetectedViolation) => void;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  addAgent(agent: MonitoredAgent) {
    this.agents.set(agent.agentPubkey.toBase58(), agent);
    this.dailyTxCounts.set(agent.agentPubkey.toBase58(), 0);
    console.log(
      `  [Monitor] Now watching agent ${agent.agentPubkey.toBase58().slice(0, 16)}...`
    );
  }

  async checkTransaction(
    tx: ParsedTransactionWithMeta,
    agentKey: string
  ): Promise<DetectedViolation | null> {
    const agent = this.agents.get(agentKey);
    if (!agent) return null;

    // Check transfer amounts
    if (tx.meta && tx.transaction.message.instructions) {
      for (const ix of tx.transaction.message.instructions) {
        if ("parsed" in ix && ix.parsed?.type === "transfer") {
          const amount = ix.parsed.info.lamports;
          if (amount > agent.maxTransferLamports) {
            return {
              agentPubkey: agent.agentPubkey,
              violationType: "ExceededTransferLimit",
              description: `Transferred ${amount / LAMPORTS_PER_SOL} SOL, limit is ${
                agent.maxTransferLamports / LAMPORTS_PER_SOL
              } SOL`,
              txSignature: tx.transaction.signatures[0],
              amount,
            };
          }
        }
      }
    }

    // Check rate limit
    const count = (this.dailyTxCounts.get(agentKey) || 0) + 1;
    this.dailyTxCounts.set(agentKey, count);
    if (count > agent.maxDailyTransactions) {
      return {
        agentPubkey: agent.agentPubkey,
        violationType: "RateLimitBreached",
        description: `Daily transaction count ${count} exceeds limit of ${agent.maxDailyTransactions}`,
        txSignature: tx.transaction.signatures[0],
      };
    }

    return null;
  }

  async startMonitoring(agentPubkey: PublicKey): Promise<number> {
    console.log(
      `  [Monitor] Starting real-time monitoring for ${agentPubkey.toBase58().slice(0, 16)}...`
    );

    const subscriptionId = this.connection.onLogs(
      agentPubkey,
      async (logs) => {
        console.log(`  [Monitor] Activity detected: ${logs.signature.slice(0, 32)}...`);

        try {
          const tx = await this.connection.getParsedTransaction(logs.signature, {
            maxSupportedTransactionVersion: 0,
          });
          if (!tx) return;

          const violation = await this.checkTransaction(
            tx,
            agentPubkey.toBase58()
          );

          if (violation) {
            console.log(
              `  [Monitor] 🚨 VIOLATION DETECTED: ${violation.violationType}`
            );
            console.log(`  [Monitor] ${violation.description}`);
            this.onViolation?.(violation);
          }
        } catch (e) {
          console.error(`  [Monitor] Error checking transaction:`, e);
        }
      },
      "confirmed"
    );

    return subscriptionId;
  }

  stopMonitoring(subscriptionId: number) {
    this.connection.removeOnLogsListener(subscriptionId);
    console.log("  [Monitor] Monitoring stopped");
  }
}
