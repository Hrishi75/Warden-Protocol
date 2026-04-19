import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Faction } from "@prisma/client";
import { logAudit } from "@/lib/audit";
import { verifyWalletSignature } from "@/lib/server-auth";
import { profileSaveSchema, signedAuthSchema } from "@/lib/schemas";

const factionMap: Record<string, Faction> = {
  sentinel: "SENTINEL",
  vanguard: "VANGUARD",
  phantom: "PHANTOM",
};

const reverseFactionMap: Record<Faction, string> = {
  SENTINEL: "sentinel",
  VANGUARD: "vanguard",
  PHANTOM: "phantom",
};

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 });
  }

  const profile = await prisma.operativeProfile.findUnique({
    where: { walletAddress: wallet },
    include: { linkedWallets: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    callsign: profile.callsign,
    walletAddress: profile.walletAddress,
    faction: profile.faction ? reverseFactionMap[profile.faction] : null,
    clearanceLevel: profile.clearanceLevel,
    xp: profile.xp,
    registeredAt: profile.registeredAt.getTime(),
    signature: profile.signature,
    avatarStyle: profile.avatarStyle,
    linkedWallets: profile.linkedWallets.map((w) => ({
      address: w.address,
      linkedAt: w.linkedAt.getTime(),
      label: w.label,
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = profileSaveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { walletAddress, callsign, faction, clearanceLevel, xp, signature, avatarStyle, registeredAt, auth } =
      parsed.data;

    const verified = verifyWalletSignature(auth);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: verified.status });
    }
    if (verified.walletAddress !== walletAddress) {
      return NextResponse.json({ error: "Signer does not match walletAddress" }, { status: 403 });
    }

    const dbFaction = faction ? factionMap[faction] : null;

    const profile = await prisma.operativeProfile.upsert({
      where: { walletAddress },
      update: {
        ...(callsign != null && { callsign }),
        ...(dbFaction != null && { faction: dbFaction }),
        ...(clearanceLevel != null && { clearanceLevel }),
        ...(xp != null && { xp }),
        ...(avatarStyle != null && { avatarStyle }),
        ...(signature != null && { signature }),
      },
      create: {
        walletAddress,
        callsign: callsign ?? null,
        faction: dbFaction ?? null,
        clearanceLevel: clearanceLevel ?? 1,
        xp: xp ?? 0,
        avatarStyle: avatarStyle ?? null,
        signature: signature ?? null,
        registeredAt: registeredAt ? new Date(registeredAt) : new Date(),
      },
      include: { linkedWallets: true },
    });

    await logAudit("profile.saved", walletAddress, "profile", walletAddress, {
      callsign: callsign ?? "",
      faction: faction ?? "",
    });

    return NextResponse.json({
      callsign: profile.callsign,
      walletAddress: profile.walletAddress,
      faction: profile.faction ? reverseFactionMap[profile.faction] : null,
      clearanceLevel: profile.clearanceLevel,
      xp: profile.xp,
      registeredAt: profile.registeredAt.getTime(),
      signature: profile.signature,
      avatarStyle: profile.avatarStyle,
      linkedWallets: profile.linkedWallets.map((w) => ({
        address: w.address,
        linkedAt: w.linkedAt.getTime(),
        label: w.label,
      })),
    });
  } catch (error) {
    console.error("Profile save error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 });
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
  if (verified.walletAddress !== wallet) {
    return NextResponse.json({ error: "Signer does not match wallet" }, { status: 403 });
  }

  try {
    await prisma.operativeProfile.delete({ where: { walletAddress: wallet } });
    await logAudit("profile.deleted", wallet, "profile", wallet);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
}
