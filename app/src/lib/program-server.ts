import { Connection } from "@solana/web3.js";
import {
  SentinelClient,
  getStatusString,
  getViolationTypeString,
  getBailOutcomeString,
} from "@sentinel-protocol/sdk";

function getConnection(): Connection {
  const rpc =
    process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.devnet.solana.com";
  return new Connection(rpc, "confirmed");
}

function getReadOnlyClient(): SentinelClient {
  return SentinelClient.readOnly(getConnection());
}

export interface OnChainAgent {
  publicKey: string;
  agentIdentity: string;
  owner: string;
  stakeAmount: bigint;
  status: string;
  maxTransferLamports: bigint;
  maxDailyTransactions: number;
  registeredAt: bigint;
  violations: {
    violationType: string;
    evidenceHash: string;
    description: string;
    timestamp: bigint;
  }[];
}

export interface OnChainBailRequest {
  publicKey: string;
  cellPda: string;
  agentIdentity: string;
  owner: string;
  bailAmount: bigint;
  postedAt: bigint;
  reviewDeadline: bigint;
  outcome: string;
  votesCount: number;
}

export async function fetchAllAgentsOnChain(): Promise<OnChainAgent[]> {
  const client = getReadOnlyClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accounts: any[] = await client.fetchAllAgents();

  return accounts.map((acc) => ({
    publicKey: acc.publicKey.toBase58(),
    agentIdentity: acc.account.agentIdentity.toBase58(),
    owner: acc.account.owner.toBase58(),
    stakeAmount: BigInt(acc.account.stakeAmount.toString()),
    status: getStatusString(acc.account.status),
    maxTransferLamports: BigInt(
      acc.account.permissions.maxTransferLamports.toString()
    ),
    maxDailyTransactions: acc.account.permissions.maxDailyTransactions,
    registeredAt: BigInt(acc.account.registeredAt.toString()),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    violations: (acc.account.violations || []).map((v: any) => ({
      violationType: getViolationTypeString(v.violationType),
      evidenceHash: Buffer.from(v.evidenceHash).toString("hex"),
      description: v.description,
      timestamp: BigInt(v.timestamp.toString()),
    })),
  }));
}

export async function fetchAllBailRequestsOnChain(): Promise<
  OnChainBailRequest[]
> {
  const client = getReadOnlyClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const program = client.program as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accounts: any[] = await program.account.bailRequest.all();

  return accounts.map((acc) => ({
    publicKey: acc.publicKey.toBase58(),
    cellPda: acc.account.cell.toBase58(),
    agentIdentity: acc.account.agent.toBase58(),
    owner: acc.account.owner.toBase58(),
    bailAmount: BigInt(acc.account.bailAmount.toString()),
    postedAt: BigInt(acc.account.postedAt.toString()),
    reviewDeadline: BigInt(acc.account.reviewDeadline.toString()),
    outcome: getBailOutcomeString(acc.account.outcome),
    votesCount: acc.account.votes?.length || 0,
  }));
}

export async function getCurrentSlot(): Promise<bigint> {
  const connection = getConnection();
  const slot = await connection.getSlot("confirmed");
  return BigInt(slot);
}
