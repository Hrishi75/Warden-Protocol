import { NextRequest, NextResponse } from "next/server";
import { dodo } from "@/lib/dodo";
import { setPayment } from "@/lib/payment-store";
import { logAudit } from "@/lib/audit";
import { verifyWalletSignature } from "@/lib/server-auth";
import { checkoutSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { agentPublicKey, ownerPublicKey, stakeAmount, maxTransfer, maxDailyTxns, auth } = parsed.data;

    const verified = verifyWalletSignature(auth);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: verified.status });
    }
    if (verified.walletAddress !== ownerPublicKey) {
      return NextResponse.json({ error: "Signer must match ownerPublicKey" }, { status: 403 });
    }
    if (!auth.message.includes(agentPublicKey)) {
      return NextResponse.json({ error: "Auth message must reference agentPublicKey" }, { status: 401 });
    }

    const productId = process.env.DODO_PRODUCT_ID;
    if (!productId) {
      return NextResponse.json({ error: "Payment product not configured" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const payment = await dodo.payments.create({
      billing: {
        city: "Global",
        country: "US",
        state: "CA",
        street: "On-Chain",
        zipcode: "00000",
      },
      customer: {
        email: `${ownerPublicKey.slice(0, 8)}@sentinel.protocol`,
        name: ownerPublicKey.slice(0, 16),
      },
      payment_link: true,
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      metadata: {
        agentPublicKey,
        ownerPublicKey,
        stakeAmount: stakeAmount.toString(),
        maxTransfer: maxTransfer.toString(),
        maxDailyTxns: maxDailyTxns.toString(),
      },
      return_url: `${appUrl}/register?payment_status=success&payment_id={payment_id}`,
    });

    await setPayment({
      paymentId: payment.payment_id,
      status: "pending",
      agentPublicKey,
      ownerPublicKey,
      stakeAmount: stakeAmount.toString(),
      maxTransfer: maxTransfer.toString(),
      maxDailyTxns: maxDailyTxns.toString(),
      createdAt: Date.now(),
    });

    await logAudit("payment.created", ownerPublicKey, "payment", payment.payment_id, {
      agentPublicKey,
      stakeAmount: stakeAmount.toString(),
    });

    return NextResponse.json({
      paymentId: payment.payment_id,
      paymentLink: payment.payment_link,
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout" },
      { status: 500 }
    );
  }
}
