import { prisma } from "./db";
import { PaymentStatus } from "@prisma/client";

export interface PaymentRecord {
  paymentId: string;
  status: "pending" | "succeeded" | "failed";
  agentPublicKey: string;
  ownerPublicKey: string;
  stakeAmount: string;
  maxTransfer: string;
  maxDailyTxns: string;
  createdAt: number;
}

const statusMap: Record<string, PaymentStatus> = {
  pending: "PENDING",
  succeeded: "SUCCEEDED",
  failed: "FAILED",
};

const reverseStatusMap: Record<PaymentStatus, PaymentRecord["status"]> = {
  PENDING: "pending",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
};

export async function setPayment(record: PaymentRecord) {
  await prisma.payment.upsert({
    where: { paymentId: record.paymentId },
    update: {
      status: statusMap[record.status],
      agentPublicKey: record.agentPublicKey,
      ownerPublicKey: record.ownerPublicKey,
      stakeAmount: record.stakeAmount,
      maxTransfer: record.maxTransfer,
      maxDailyTxns: record.maxDailyTxns,
    },
    create: {
      paymentId: record.paymentId,
      status: statusMap[record.status],
      agentPublicKey: record.agentPublicKey,
      ownerPublicKey: record.ownerPublicKey,
      stakeAmount: record.stakeAmount,
      maxTransfer: record.maxTransfer,
      maxDailyTxns: record.maxDailyTxns,
    },
  });
}

export async function getPayment(paymentId: string): Promise<PaymentRecord | null> {
  const row = await prisma.payment.findUnique({ where: { paymentId } });
  if (!row) return null;
  return {
    paymentId: row.paymentId,
    status: reverseStatusMap[row.status],
    agentPublicKey: row.agentPublicKey,
    ownerPublicKey: row.ownerPublicKey,
    stakeAmount: row.stakeAmount,
    maxTransfer: row.maxTransfer,
    maxDailyTxns: row.maxDailyTxns,
    createdAt: row.createdAt.getTime(),
  };
}

export async function updatePaymentStatus(paymentId: string, status: PaymentRecord["status"]) {
  await prisma.payment.update({
    where: { paymentId },
    data: { status: statusMap[status] },
  });
}
