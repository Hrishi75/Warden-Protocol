import { NextRequest, NextResponse } from "next/server";
import { getPayment } from "@/lib/payment-store";

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("payment_id");

  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment_id" }, { status: 400 });
  }

  const record = await getPayment(paymentId);

  if (!record) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  return NextResponse.json({
    paymentId: record.paymentId,
    status: record.status,
    agentPublicKey: record.agentPublicKey,
    ownerPublicKey: record.ownerPublicKey,
    stakeAmount: record.stakeAmount,
    maxTransfer: record.maxTransfer,
    maxDailyTxns: record.maxDailyTxns,
  });
}
