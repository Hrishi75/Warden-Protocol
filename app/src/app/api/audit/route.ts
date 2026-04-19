import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { auditQuerySchema, signedAuthSchema } from "@/lib/schemas";
import { verifyWalletSignature } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = auditQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { actor, action, targetType, page, limit } = parsed.data;

  const authParsed = signedAuthSchema.safeParse({
    walletAddress: req.headers.get("x-sp-wallet"),
    message: req.headers.get("x-sp-message"),
    signature: req.headers.get("x-sp-signature"),
    issuedAt: Number(req.headers.get("x-sp-issued-at")),
  });
  if (!authParsed.success) {
    return NextResponse.json({ error: "Missing or invalid auth headers" }, { status: 401 });
  }
  const verified = verifyWalletSignature(authParsed.data);
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: verified.status });
  }

  if (actor && actor !== verified.walletAddress) {
    return NextResponse.json({ error: "Can only query own audit log" }, { status: 403 });
  }

  const where: Prisma.AuditLogWhereInput = { actor: verified.walletAddress };
  if (action) where.action = { contains: action };
  if (targetType) where.targetType = targetType;

  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, limit });
}
