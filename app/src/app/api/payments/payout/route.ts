import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ownerPublicKey, amount, currency } = body;

    if (!ownerPublicKey || !amount || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["INR", "USD"].includes(currency)) {
      return NextResponse.json({ error: "Unsupported currency. Use INR or USD." }, { status: 400 });
    }

    // In test mode, simulate payout creation.
    // In production, this would call dodo.payouts.create() with bank details.
    const payoutId = `payout_test_${Date.now()}`;

    console.log(`[Payout] Requested: ${amount} ${currency} for ${ownerPublicKey}`);

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
