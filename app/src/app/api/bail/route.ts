import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { bailQuerySchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = bailQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { outcome, agent, page, limit } = parsed.data;

  const where: Prisma.IndexedBailRequestWhereInput = {};
  if (outcome) where.outcome = outcome;
  if (agent) where.agentIdentity = agent;

  const skip = (page - 1) * limit;
  const [requests, total] = await Promise.all([
    prisma.indexedBailRequest.findMany({
      where,
      orderBy: { lastIndexedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.indexedBailRequest.count({ where }),
  ]);

  return NextResponse.json({
    bailRequests: requests.map((b) => ({
      ...b,
      bailAmount: b.bailAmount.toString(),
      postedAt: b.postedAt.toString(),
      reviewDeadline: b.reviewDeadline.toString(),
      lastIndexedSlot: b.lastIndexedSlot.toString(),
    })),
    total,
    page,
    limit,
  });
}
