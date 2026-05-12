import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  fetchAllAgentsOnChain,
  fetchAllBailRequestsOnChain,
  getCurrentSlot,
} from "@/lib/program-server";
import { logAudit } from "@/lib/audit";
import { requireBearerToken } from "@/lib/server-auth";
import { sendNotificationEmail, NotificationTemplate } from "@/lib/email";

type Prefs = { arrest: boolean; bail: boolean; violation: boolean };
const DEFAULT_PREFS: Prefs = { arrest: true, bail: true, violation: true };

const ARREST_TRANSITIONS = new Set([
  "Active->Arrested",
  "Arrested->Paroled",
  "Arrested->Released",
  "Paroled->Terminated",
  "Active->Terminated",
  "Arrested->Terminated",
]);

async function notifyOwner(
  owner: string,
  category: keyof Prefs,
  template: NotificationTemplate
): Promise<void> {
  try {
    const profile = await prisma.operativeProfile.findUnique({ where: { walletAddress: owner } });
    if (!profile?.email || !profile.emailVerifiedAt) return;
    const prefs: Prefs = { ...DEFAULT_PREFS, ...((profile.emailNotifyPrefs ?? {}) as Partial<Prefs>) };
    if (!prefs[category]) return;
    const sent = await sendNotificationEmail(profile.email, template);
    if (!sent) {
      await logAudit("notification.failed", "system", "profile", owner, { category });
    }
  } catch (err) {
    console.error("notifyOwner error:", err);
    await logAudit("notification.failed", "system", "profile", owner, {
      category,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

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
    let notificationsSent = 0;

    for (const agent of agents) {
      const existing = await prisma.indexedAgent.findUnique({
        where: { agentIdentity: agent.agentIdentity },
      });

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

      const dbAgent = await prisma.indexedAgent.findUnique({
        where: { agentIdentity: agent.agentIdentity },
      });

      if (dbAgent && agent.violations.length > 0) {
        await prisma.indexedViolation.deleteMany({ where: { agentId: dbAgent.id } });
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

      // Status-change notifications (skip on first index — existing === null)
      if (
        existing &&
        agent.status !== existing.status &&
        agent.status !== existing.lastNotifiedStatus
      ) {
        const transition = `${existing.status}->${agent.status}`;
        if (ARREST_TRANSITIONS.has(transition)) {
          const template: NotificationTemplate =
            agent.status === "Arrested"
              ? { kind: "agent_arrested", agentIdentity: agent.agentIdentity }
              : {
                  kind: "bail_outcome",
                  agentIdentity: agent.agentIdentity,
                  outcome: agent.status,
                };
          await notifyOwner(agent.owner, agent.status === "Arrested" ? "arrest" : "bail", template);
          notificationsSent++;
        }
        await prisma.indexedAgent.update({
          where: { agentIdentity: agent.agentIdentity },
          data: { lastNotifiedStatus: agent.status },
        });
      } else if (!existing) {
        // First-time index: seed the idempotency key without sending.
        await prisma.indexedAgent.update({
          where: { agentIdentity: agent.agentIdentity },
          data: { lastNotifiedStatus: agent.status, lastNotifiedViolationCount: agent.violations.length },
        });
      }

      // New-violation notification (idempotent via lastNotifiedViolationCount)
      if (existing) {
        const newCount = agent.violations.length;
        const seen = existing.lastNotifiedViolationCount ?? 0;
        if (newCount > seen) {
          const freshTypes = agent.violations.slice(seen).map((v) => v.violationType);
          await notifyOwner(agent.owner, "violation", {
            kind: "violation_reported",
            agentIdentity: agent.agentIdentity,
            violationTypes: freshTypes,
          });
          notificationsSent++;
          await prisma.indexedAgent.update({
            where: { agentIdentity: agent.agentIdentity },
            data: { lastNotifiedViolationCount: newCount },
          });
        }
      }

      agentsUpserted++;
    }

    for (const bail of bailRequests) {
      const existing = await prisma.indexedBailRequest.findUnique({
        where: { cellPda: bail.cellPda },
      });

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

      if (
        existing &&
        bail.outcome !== existing.outcome &&
        bail.outcome !== existing.lastNotifiedOutcome &&
        bail.outcome !== "Pending"
      ) {
        await notifyOwner(bail.owner, "bail", {
          kind: "bail_outcome",
          agentIdentity: bail.agentIdentity,
          outcome: bail.outcome,
        });
        notificationsSent++;
        await prisma.indexedBailRequest.update({
          where: { cellPda: bail.cellPda },
          data: { lastNotifiedOutcome: bail.outcome },
        });
      } else if (!existing) {
        await prisma.indexedBailRequest.update({
          where: { cellPda: bail.cellPda },
          data: { lastNotifiedOutcome: bail.outcome },
        });
      }

      bailUpserted++;
    }

    await logAudit("indexer.run", "system", "indexer", undefined, {
      slot: currentSlot.toString(),
      agents: agentsUpserted,
      bailRequests: bailUpserted,
      notificationsSent,
    });

    return NextResponse.json({
      indexed: true,
      slot: currentSlot.toString(),
      agents: agentsUpserted,
      bailRequests: bailUpserted,
      notificationsSent,
    });
  } catch (error) {
    console.error("Indexer error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Indexer failed" },
      { status: 500 }
    );
  }
}
