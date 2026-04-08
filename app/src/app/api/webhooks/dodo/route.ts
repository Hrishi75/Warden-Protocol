import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { updatePaymentStatus, setPayment } from "@/lib/payment-store";

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const computed = createHmac("sha256", secret).update(rawBody).digest("hex");
  return computed === signature;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("webhook-signature") || "";
    const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

    // Verify signature if webhook key is configured
    if (webhookKey && signature) {
      if (!verifySignature(rawBody, signature, webhookKey)) {
        console.error("Webhook signature verification failed");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.type || payload.event_type;
    const data = payload.data || payload;

    console.log(`[Webhook] Received event: ${eventType}`);

    switch (eventType) {
      case "payment.succeeded": {
        const paymentId = data.payment_id;
        const metadata = data.metadata || {};

        // Update existing record or create new one
        if (paymentId) {
          updatePaymentStatus(paymentId, "succeeded");

          // If record doesn't exist yet (webhook arrived before polling), create it
          if (metadata.agentPublicKey) {
            setPayment({
              paymentId,
              status: "succeeded",
              agentPublicKey: metadata.agentPublicKey,
              ownerPublicKey: metadata.ownerPublicKey || "",
              stakeAmount: metadata.stakeAmount || "0",
              maxTransfer: metadata.maxTransfer || "0",
              maxDailyTxns: metadata.maxDailyTxns || "0",
              createdAt: Date.now(),
            });
          }
        }

        console.log(`[Webhook] Payment succeeded: ${paymentId}`);
        break;
      }

      case "payment.failed": {
        const paymentId = data.payment_id;
        if (paymentId) {
          updatePaymentStatus(paymentId, "failed");
        }
        console.log(`[Webhook] Payment failed: ${paymentId}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
