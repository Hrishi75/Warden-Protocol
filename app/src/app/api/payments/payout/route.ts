import { NextRequest, NextResponse } from "next/server";
import { verifyWalletSignature } from "@/lib/server-auth";
import { payoutSchema } from "@/lib/schemas";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = payoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { ownerPublicKey, amount, currency, auth } = parsed.data;

    const verified = verifyWalletSignature(auth);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: verified.status });
    }
    if (verified.walletAddress !== ownerPublicKey) {
      return NextResponse.json({ error: "Signer must match ownerPublicKey" }, { status: 403 });
    }

    const payoutId = `payout_test_${Date.now()}`;

    await logAudit("payout.requested", ownerPublicKey, "payout", payoutId, {
      amount,
      currency,
    });

    return NextResponse.json({
      payoutId,
      status: "pending",
      amount,
      currency,
      ownerPublicKey,
      message: "Payout request submitted (test mode). Funds will be disbursed to your linked account.",
    });
  } catch (error) {
    console.error("Payout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payout request failed" },
      { status: 500 }
    );
  }
}
