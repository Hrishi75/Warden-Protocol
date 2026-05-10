import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWalletSignature } from "@/lib/server-auth";
import { emailUnlinkSchema } from "@/lib/schemas";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = emailUnlinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { auth } = parsed.data;

    const verified = verifyWalletSignature(auth);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: verified.status });
    }
    const walletAddress = verified.walletAddress;

    if (!auth.message.includes("EMAIL_UNLINK")) {
      return NextResponse.json({ error: "Invalid auth action" }, { status: 401 });
    }

    await prisma.operativeProfile.update({
      where: { walletAddress },
      data: { email: null, emailVerifiedAt: null, emailNotifyPrefs: null },
    }).catch(() => null);

    await prisma.emailVerification.deleteMany({ where: { walletAddress } });
    await logAudit("email.unlinked", walletAddress, "profile", walletAddress);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email unlink error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to unlink email" },
      { status: 500 }
    );
  }
}
