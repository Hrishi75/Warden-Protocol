import { prisma } from "./db";
import { Prisma } from "@prisma/client";

export async function logAudit(
  action: string,
  actor: string,
  targetType?: string,
  targetId?: string,
  metadata?: Record<string, string | number | boolean>
) {
  await prisma.auditLog.create({
    data: {
      action,
      actor,
      targetType,
      targetId,
      metadata: metadata as unknown as Prisma.InputJsonValue,
    },
  });
}
