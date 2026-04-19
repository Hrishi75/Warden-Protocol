import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { Prisma } from "@prisma/client";
import { updatePaymentStatus, setPayment } from "@/lib/payment-store";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

const MAX_WEBHOOK_AGE_SEC = 5 * 60;

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const computed = createHmac("sha256", secret).update(rawBody).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  if (computed.length !== provided.length) return false;
  return timingSafeEqual(computed, provided);
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

    if (!webhookKey || webhookKey === "your-webhook-signing-key-here") {
      console.error("DODO_PAYMENTS_WEBHOOK_KEY not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const signature = req.headers.get("webhook-signature");
    if (!signature || !verifySignature(rawBody, signature, webhookKey)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const timestampHeader = req.headers.get("webhook-timestamp");
    if (timestampHeader) {
      const ts = parseInt(timestampHeader, 10);
      if (!Number.isFinite(ts)) {
        return NextResponse.json({ error: "Invalid webhook-timestamp" }, { status: 400 });
      }
      const ageSec = Math.abs(Math.floor(Date.now() / 1000) - ts);
      if (ageSec > MAX_WEBHOOK_AGE_SEC) {
        return NextResponse.json({ error: "Webhook expired" }, { status: 401 });
      }
    }

    const webhookId =
      req.headers.get("webhook-id") ||
      createHmac("sha256", webhookKey).update(rawBody).digest("hex");

    const payload = JSON.parse(rawBody);
    const eventType = payload.type || payload.event_type || "unknown";
    const data = payload.data || payload;

    try {
      await prisma.webhookEvent.create({
        data: {
          source: "dodo",
          webhookId,
          eventType,
          payload,
          signature,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return NextResponse.json({ received: true, duplicate: true });
      }
      throw err;
    }

    switch (eventType) {
      case "payment.succeeded": {
        const paymentId = data.payment_id;
        const metadata = data.metadata || {};

        if (paymentId) {
          await updatePaymentStatus(paymentId, "succeeded");

          if (metadata.agentPublicKey) {
            await setPayment({
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

        await logAudit("payment.succeeded", metadata.ownerPublicKey || "system", "payment", paymentId);
        break;
      }

      case "payment.failed": {
        const paymentId = data.payment_id;
        if (paymentId) {
          await updatePaymentStatus(paymentId, "failed");
          await logAudit("payment.failed", "system", "payment", paymentId);
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }

    await prisma.webhookEvent.update({
      where: { webhookId },
      data: { processedAt: new Date() },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

