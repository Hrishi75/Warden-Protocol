import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWalletSignature } from "@/lib/server-auth";
import { emailPrefsSchema } from "@/lib/schemas";
import { logAudit } from "@/lib/audit";

type Prefs = { arrest: boolean; bail: boolean; violation: boolean };

const DEFAULT_PREFS: Prefs = { arrest: true, bail: true, violation: true };

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = emailPrefsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { prefs, auth } = parsed.data;

    const verified = verifyWalletSignature(auth);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: verified.status });
    }
    const walletAddress = verified.walletAddress;

    if (!auth.message.includes("EMAIL_PREFS")) {
      return NextResponse.json({ error: "Invalid auth action" }, { status: 401 });
    }

    const profile = await prisma.operativeProfile.findUnique({ where: { walletAddress } });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const current: Prefs = {
      ...DEFAULT_PREFS,
      ...((profile.emailNotifyPrefs ?? {}) as Partial<Prefs>),
    };
    const next: Prefs = { ...current, ...prefs };

    await prisma.operativeProfile.update({
      where: { walletAddress },
      data: { emailNotifyPrefs: next },
    });

    await logAudit("email.prefs.updated", walletAddress, "profile", walletAddress, next);

    return NextResponse.json({ ok: true, prefs: next });
  } catch (error) {
    console.error("Email prefs error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update preferences" },
      { status: 500 }
    );
  }
}
