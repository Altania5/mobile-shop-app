import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { squareClient, squareLocationId } from "@/lib/square";
import type { Currency } from "square";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      workOrder: { include: { lineItems: true, vehicle: true } },
    },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "VOID") return NextResponse.json({ error: "Invoice is voided" }, { status: 422 });
  if (invoice.squareInvoiceId) return NextResponse.json({ error: "Already sent via Square" }, { status: 409 });

  try {
    const vehicle = invoice.workOrder.vehicle;

    // Build line items — one per work order line item, or fall back to invoice total
    const lineItems = invoice.workOrder.lineItems.length > 0
      ? invoice.workOrder.lineItems.map((item) => ({
          name: item.description,
          quantity: String(item.quantity),
          basePriceMoney: {
            amount: BigInt(Math.round(item.unitPrice * 100)),
            currency: "USD" as Currency,
          },
        }))
      : [
          {
            name: `Invoice ${invoice.number} — ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            quantity: "1",
            basePriceMoney: {
              amount: BigInt(Math.round(invoice.total * 100)),
              currency: "USD" as Currency,
            },
          },
        ];

    const response = await squareClient.checkout.paymentLinks.create({
      idempotencyKey: `paylink-${id}`,
      order: {
        locationId: squareLocationId,
        lineItems,
        taxes: invoice.taxRate > 0 && invoice.workOrder.lineItems.length > 0
          ? [
              {
                uid: "sales-tax",
                name: `Sales Tax (${(invoice.taxRate * 100).toFixed(0)}%)`,
                percentage: String(invoice.taxRate * 100),
                scope: "ORDER",
                type: "ADDITIVE",
              },
            ]
          : undefined,
      },
      checkoutOptions: {
        allowTipping: false,
      },
      prePopulatedData: invoice.customer.email
        ? { buyerEmail: invoice.customer.email }
        : undefined,
    });

    const paymentLink = response.paymentLink!;
    const paymentUrl = paymentLink.url!;

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        squareInvoiceId: paymentLink.id,
        squareInvoiceUrl: paymentUrl,
        squareOrderId: paymentLink.orderId ?? null,
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ invoice: updated, paymentUrl });
  } catch (err: unknown) {
    // Surface the full Square error body for debugging
    if (err && typeof err === "object" && "body" in err) {
      return NextResponse.json({ error: "Square API error", detail: (err as { body: unknown }).body }, { status: 502 });
    }
    const msg = err instanceof Error ? err.message : "Square API error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
