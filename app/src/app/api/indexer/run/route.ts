import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  fetchAllAgentsOnChain,
  fetchAllBailRequestsOnChain,
  getCurrentSlot,
} from "@/lib/program-server";
import { logAudit } from "@/lib/audit";
import { requireBearerToken } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  const unauthorized = requireBearerToken(req, "INDEXER_RUN_SECRET");
  if (unauthorized) return unauthorized;

  try {
    const currentSlot = await getCurrentSlot();
    const [agents, bailRequests] = await Promise.all([
      fetchAllAgentsOnChain(),
      fetchAllBailRequestsOnChain(),
    ]);

    let agentsUpserted = 0;
    let bailUpserted = 0;

    // Upsert agents and their violations
    for (const agent of agents) {
      await prisma.indexedAgent.upsert({
        where: { agentIdentity: agent.agentIdentity },
        update: {
          owner: agent.owner,
          stakeAmount: agent.stakeAmount,
          status: agent.status,
          maxTransferLamports: agent.maxTransferLamports,
          maxDailyTransactions: agent.maxDailyTransactions,
          lastIndexedSlot: currentSlot,
          lastIndexedAt: new Date(),
        },
        create: {
          agentIdentity: agent.agentIdentity,
          owner: agent.owner,
          stakeAmount: agent.stakeAmount,
          status: agent.status,
          maxTransferLamports: agent.maxTransferLamports,
          maxDailyTransactions: agent.maxDailyTransactions,
          registeredAt: agent.registeredAt,
          lastIndexedSlot: currentSlot,
        },
      });

      // Sync violations: delete existing and re-create
      const dbAgent = await prisma.indexedAgent.findUnique({
        where: { agentIdentity: agent.agentIdentity },
      });

      if (dbAgent && agent.violations.length > 0) {
        await prisma.indexedViolation.deleteMany({
          where: { agentId: dbAgent.id },
        });
        await prisma.indexedViolation.createMany({
          data: agent.violations.map((v) => ({
            agentId: dbAgent.id,
            violationType: v.violationType,
            evidenceHash: v.evidenceHash,
            description: v.description,
            timestamp: v.timestamp,
          })),
        });
      }

      agentsUpserted++;
    }

    // Upsert bail requests
    for (const bail of bailRequests) {
      await prisma.indexedBailRequest.upsert({
        where: { cellPda: bail.cellPda },
        update: {
          owner: bail.owner,
          bailAmount: bail.bailAmount,
          outcome: bail.outcome,
          votesCount: bail.votesCount,
          lastIndexedSlot: currentSlot,
          lastIndexedAt: new Date(),
        },
        create: {
          cellPda: bail.cellPda,
          agentIdentity: bail.agentIdentity,
          owner: bail.owner,
          bailAmount: bail.bailAmount,
          postedAt: bail.postedAt,
          reviewDeadline: bail.reviewDeadline,
          outcome: bail.outcome,
          votesCount: bail.votesCount,
          lastIndexedSlot: currentSlot,
        },
      });
      bailUpserted++;
    }

    await logAudit("indexer.run", "system", "indexer", undefined, {
      slot: currentSlot.toString(),
      agents: agentsUpserted,
      bailRequests: bailUpserted,
    });

    return NextResponse.json({
      indexed: true,
      slot: currentSlot.toString(),
      agents: agentsUpserted,
      bailRequests: bailUpserted,
    });
  } catch (error) {
    console.error("Indexer error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Indexer failed" },
      { status: 500 }
    );
  }
}
