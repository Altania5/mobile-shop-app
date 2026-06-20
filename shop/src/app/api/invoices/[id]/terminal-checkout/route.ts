import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { squareClient } from "@/lib/square";
import type { Currency } from "square";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { payments: { select: { amount: true } } },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "PAID")  return NextResponse.json({ error: "Invoice is already paid" }, { status: 422 });
  if (invoice.status === "VOID")  return NextResponse.json({ error: "Invoice is voided" }, { status: 422 });

  const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0);
  const balance   = Math.max(0, invoice.total - totalPaid);

  if (balance <= 0) return NextResponse.json({ error: "No balance remaining" }, { status: 422 });

  const deviceId = process.env.SQUARE_TERMINAL_DEVICE_ID ?? "";
  if (!deviceId) return NextResponse.json({ error: "Terminal device not configured" }, { status: 500 });

  try {
    const response = await squareClient.terminal.checkouts.create({
      idempotencyKey: `terminal-${id}-${Date.now()}`,
      checkout: {
        amountMoney: {
          amount: BigInt(Math.round(balance * 100)),
          currency: "USD" as Currency,
        },
        referenceId: id,
        note: invoice.number,
        deviceOptions: {
          deviceId,
          tipSettings: { allowTipping: false },
          skipReceiptScreen: false,
        },
      },
    });

    return NextResponse.json({ checkoutId: response.checkout?.id });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "body" in err) {
      return NextResponse.json({ error: "Square error", detail: (err as { body: unknown }).body }, { status: 502 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : "Square error" }, { status: 502 });
  }
}
