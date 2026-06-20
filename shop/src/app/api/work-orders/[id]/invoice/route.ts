import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

/** Generate next INV number for the current month */
async function nextInvoiceNumber(): Promise<string> {
  const now = new Date();
  const prefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const last = await prisma.invoice.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const seq = last ? parseInt(last.number.split("-")[2] ?? "0") + 1 : 1;
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}

export async function POST(_req: NextRequest, { params }: Params) {
  const { id: workOrderId } = await params;

  const wo = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: { lineItems: true, invoice: true },
  });

  if (!wo) return NextResponse.json({ error: "Work order not found" }, { status: 404 });
  if (wo.invoice) return NextResponse.json({ error: "Invoice already exists", invoiceId: wo.invoice.id }, { status: 409 });
  if (!["COMPLETED", "INVOICED"].includes(wo.status)) {
    return NextResponse.json({ error: "Work order must be completed before invoicing" }, { status: 422 });
  }

  const subtotal = wo.lineItems.reduce((s, i) => s + i.total, 0);
  const taxRate = 0.08;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  // Due date: 30 days from now
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const number = await nextInvoiceNumber();

  const [invoice] = await prisma.$transaction([
    prisma.invoice.create({
      data: {
        number,
        workOrderId,
        customerId: wo.customerId,
        subtotal,
        taxRate,
        taxAmount,
        total,
        dueDate,
        status: "DRAFT",
      },
    }),
    prisma.workOrder.update({
      where: { id: workOrderId },
      data: { status: "INVOICED" },
    }),
  ]);

  return NextResponse.json(invoice, { status: 201 });
}
