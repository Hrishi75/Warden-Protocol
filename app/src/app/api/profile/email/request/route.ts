import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { prisma } from "@/lib/db";
import { verifyWalletSignature } from "@/lib/server-auth";
import { emailRequestSchema } from "@/lib/schemas";
import { sendOtpEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_SENDS_PER_HOUR = 3;

function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = emailRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { email, auth } = parsed.data;

    const verified = verifyWalletSignature(auth);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: verified.status });
    }
    const walletAddress = verified.walletAddress;

    if (!auth.message.includes("EMAIL_LINK_REQUEST")) {
      return NextResponse.json({ error: "Invalid auth action" }, { status: 401 });
    }

    const existingOwner = await prisma.operativeProfile.findUnique({ where: { email } });
    if (existingOwner && existingOwner.walletAddress !== walletAddress) {
      return NextResponse.json({ error: "Email already linked to another wallet" }, { status: 409 });
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.emailVerification.count({
      where: { walletAddress, createdAt: { gte: hourAgo } },
    });
    if (recentCount >= MAX_SENDS_PER_HOUR) {
      return NextResponse.json(
        { error: "Too many verification requests. Try again later." },
        { status: 429 }
      );
    }

    await prisma.emailVerification.deleteMany({ where: { walletAddress } });

    const code = generateOtp();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await prisma.emailVerification.create({
      data: { walletAddress, email, codeHash, expiresAt },
    });

    const sent = await sendOtpEmail(email, code);
    if (!sent) {
      await logAudit("email.otp.send_failed", walletAddress, "profile", walletAddress, { email });
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 502 });
    }

    await logAudit("email.otp.sent", walletAddress, "profile", walletAddress, { email });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email request error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to request verification" },
      { status: 500 }
    );
  }
}
