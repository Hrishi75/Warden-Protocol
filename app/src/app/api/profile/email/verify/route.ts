import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyWalletSignature } from "@/lib/server-auth";
import { emailVerifySchema } from "@/lib/schemas";
import { logAudit } from "@/lib/audit";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = emailVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { code, auth } = parsed.data;

    const verified = verifyWalletSignature(auth);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: verified.status });
    }
    const walletAddress = verified.walletAddress;

    if (!auth.message.includes("EMAIL_LINK_VERIFY")) {
      return NextResponse.json({ error: "Invalid auth action" }, { status: 401 });
    }

    const pending = await prisma.emailVerification.findFirst({
      where: { walletAddress, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!pending) {
      return NextResponse.json({ error: "No active verification. Request a new code." }, { status: 404 });
    }

    if (pending.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 429 });
    }

    const match = await bcrypt.compare(code, pending.codeHash);
    if (!match) {
      await prisma.emailVerification.update({
        where: { id: pending.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }

    // Guard against a race where another wallet claimed the email after request was issued.
    const emailOwner = await prisma.operativeProfile.findUnique({ where: { email: pending.email } });
    if (emailOwner && emailOwner.walletAddress !== walletAddress) {
      await prisma.emailVerification.deleteMany({ where: { walletAddress } });
      return NextResponse.json({ error: "Email already linked to another wallet" }, { status: 409 });
    }

    await prisma.operativeProfile.upsert({
      where: { walletAddress },
      update: { email: pending.email, emailVerifiedAt: new Date() },
      create: {
        walletAddress,
        email: pending.email,
        emailVerifiedAt: new Date(),
      },
    });

    await prisma.emailVerification.deleteMany({ where: { walletAddress } });
    await logAudit("email.verified", walletAddress, "profile", walletAddress, { email: pending.email });

    return NextResponse.json({ ok: true, email: pending.email });
  } catch (error) {
    console.error("Email verify error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify email" },
      { status: 500 }
    );
  }
}
