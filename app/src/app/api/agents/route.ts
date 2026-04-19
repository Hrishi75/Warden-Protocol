import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { agentsQuerySchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = agentsQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { status, owner, page, limit } = parsed.data;

  const where: Prisma.IndexedAgentWhereInput = {};
  if (status) where.status = status;
  if (owner) where.owner = owner;

  const skip = (page - 1) * limit;
  const [agents, total] = await Promise.all([
    prisma.indexedAgent.findMany({
      where,
      include: { violations: true },
      orderBy: { lastIndexedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.indexedAgent.count({ where }),
  ]);

  return NextResponse.json({
    agents: agents.map((a) => ({
      ...a,
      stakeAmount: a.stakeAmount.toString(),
      maxTransferLamports: a.maxTransferLamports.toString(),
      registeredAt: a.registeredAt.toString(),
      lastIndexedSlot: a.lastIndexedSlot.toString(),
      violations: a.violations.map((v) => ({
        ...v,
        timestamp: v.timestamp.toString(),
      })),
    })),
    total,
    page,
    limit,
  });
}
