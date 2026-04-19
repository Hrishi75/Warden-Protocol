import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWalletSignature } from "@/lib/server-auth";
import { linkWalletSchema, signedAuthSchema } from "@/lib/schemas";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = linkWalletSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { walletAddress, newAddress, label, auth } = parsed.data;

    const verified = verifyWalletSignature(auth);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: verified.status });
    }
    if (verified.walletAddress !== walletAddress) {
      return NextResponse.json({ error: "Signer must own primary wallet" }, { status: 403 });
    }
    if (!auth.message.includes(newAddress)) {
      return NextResponse.json({ error: "Auth message must reference linked wallet" }, { status: 401 });
    }
    if (newAddress === walletAddress) {
      return NextResponse.json({ error: "Cannot link primary wallet to itself" }, { status: 400 });
    }

    const profile = await prisma.operativeProfile.findUnique({
      where: { walletAddress },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const linked = await prisma.linkedWallet.create({
      data: {
        address: newAddress,
        label: label || null,
        profileId: profile.id,
      },
    });

    await logAudit("wallet.linked", walletAddress, "linkedWallet", newAddress);

    return NextResponse.json({
      address: linked.address,
      linkedAt: linked.linkedAt.getTime(),
      label: linked.label,
    });
  } catch (error) {
    console.error("Link wallet error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to link wallet" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address parameter" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Missing auth payload" }, { status: 401 });
  }

  const authParsed = signedAuthSchema.safeParse((body as { auth?: unknown })?.auth);
  if (!authParsed.success) {
    return NextResponse.json({ error: "Invalid auth payload" }, { status: 401 });
  }

  const verified = verifyWalletSignature(authParsed.data);
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: verified.status });
  }

  const linked = await prisma.linkedWallet.findUnique({
    where: { address },
    include: { profile: true },
  });
  if (!linked) {
    return NextResponse.json({ error: "Linked wallet not found" }, { status: 404 });
  }
  if (verified.walletAddress !== linked.profile.walletAddress) {
    return NextResponse.json({ error: "Signer must own primary wallet" }, { status: 403 });
  }

  try {
    await prisma.linkedWallet.delete({ where: { address } });
    await logAudit("wallet.unlinked", linked.profile.walletAddress, "linkedWallet", address);
    return NextResponse.json({ unlinked: true });
  } catch {
    return NextResponse.json({ error: "Linked wallet not found" }, { status: 404 });
  }
}
