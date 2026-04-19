import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const agent = await prisma.indexedAgent.findFirst({
    where: {
      OR: [{ id: params.id }, { agentIdentity: params.id }],
    },
    include: { violations: true },
  });

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...agent,
    stakeAmount: agent.stakeAmount.toString(),
    maxTransferLamports: agent.maxTransferLamports.toString(),
    registeredAt: agent.registeredAt.toString(),
    lastIndexedSlot: agent.lastIndexedSlot.toString(),
    violations: agent.violations.map((v) => ({
      ...v,
      timestamp: v.timestamp.toString(),
    })),
  });
}
