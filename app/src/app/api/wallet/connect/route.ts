import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { verifyWalletSignature } from "@/lib/server-auth";
import { walletConnectSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = walletConnectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { walletAddress, auth } = parsed.data;

    const verified = verifyWalletSignature(auth);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: verified.status });
    }
    if (verified.walletAddress !== walletAddress) {
      return NextResponse.json({ error: "Signer does not match walletAddress" }, { status: 403 });
    }

    const connection = await prisma.walletConnection.upsert({
      where: { walletAddress },
      update: {
        lastConnectedAt: new Date(),
        connectionCount: { increment: 1 },
      },
      create: {
        walletAddress,
        firstConnectedAt: new Date(),
        lastConnectedAt: new Date(),
        connectionCount: 1,
      },
    });

    const profile = await prisma.operativeProfile.upsert({
      where: { walletAddress },
      update: {},
      create: {
        walletAddress,
      },
      include: { linkedWallets: true },
    });

    const agents = await prisma.indexedAgent.findMany({
      where: { owner: walletAddress },
      include: { violations: true },
      orderBy: { lastIndexedAt: "desc" },
    });

    await logAudit("wallet.connected", walletAddress, "wallet", walletAddress, {
      connectionCount: connection.connectionCount,
    });

    return NextResponse.json({
      connection: {
        walletAddress: connection.walletAddress,
        firstConnectedAt: connection.firstConnectedAt.toISOString(),
        lastConnectedAt: connection.lastConnectedAt.toISOString(),
        connectionCount: connection.connectionCount,
      },
      profile: {
        callsign: profile.callsign ?? null,
        walletAddress: profile.walletAddress,
        faction: profile.faction?.toLowerCase() ?? null,
        clearanceLevel: profile.clearanceLevel,
        xp: profile.xp,
        registeredAt: profile.registeredAt.getTime(),
        signature: profile.signature ?? null,
        avatarStyle: profile.avatarStyle ?? null,
        linkedWallets: profile.linkedWallets.map((w) => ({
          address: w.address,
          linkedAt: w.linkedAt.getTime(),
          label: w.label,
        })),
      },
      agents: agents.map((a) => ({
        id: a.id,
        agentIdentity: a.agentIdentity,
        owner: a.owner,
        stakeAmount: a.stakeAmount.toString(),
        status: a.status,
        maxTransferLamports: a.maxTransferLamports.toString(),
        maxDailyTransactions: a.maxDailyTransactions,
        registeredAt: a.registeredAt.toString(),
        lastIndexedSlot: a.lastIndexedSlot.toString(),
        violations: a.violations.map((v) => ({
          id: v.id,
          violationType: v.violationType,
          evidenceHash: v.evidenceHash,
          description: v.description,
          timestamp: v.timestamp.toString(),
        })),
      })),
    });
  } catch (error) {
    console.error("Wallet connect error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record wallet connection" },
      { status: 500 }
    );
  }
}
