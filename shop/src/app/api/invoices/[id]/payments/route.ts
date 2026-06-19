import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { PaymentMethod } from "@/generated/prisma";

const schema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: z.nativeEnum(PaymentMethod),
  note: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: invoiceId } = await params;
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.flatten() }, { status: 422 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount: result.data.amount,
      method: result.data.method,
      note: result.data.note,
      status: "COMPLETED",
    },
  });

  // Check if invoice is now fully paid
  const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0) + result.data.amount;
  const newStatus = totalPaid >= invoice.total ? "PAID" : "PARTIAL";

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: newStatus,
      ...(newStatus === "PAID" ? { paidAt: new Date() } : {}),
    },
  });

  // If fully paid, update work order status too
  if (newStatus === "PAID") {
    await prisma.workOrder.update({
      where: { id: invoice.workOrderId },
      data: { status: "PAID" },
    });
  }

  return NextResponse.json(payment, { status: 201 });
}
