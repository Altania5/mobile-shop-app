import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { squareClient } from "@/lib/square";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "PAID") return NextResponse.json({ error: "Cannot void a paid invoice" }, { status: 422 });

  // Delete the Square payment link if one was created
  if (invoice.squareInvoiceId) {
    try {
      await squareClient.checkout.paymentLinks.delete({ id: invoice.squareInvoiceId });
    } catch {
      // Best-effort — link may have already expired or been used
    }
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: "VOID" },
  });

  return NextResponse.json(updated);
}
