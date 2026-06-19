import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  taxRate: z.number().min(0).max(1).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      workOrder: {
        include: {
          vehicle: true,
          lineItems: { orderBy: [{ type: "asc" }, { createdAt: "asc" }] },
        },
      },
      payments: { orderBy: { processedAt: "desc" } },
    },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  return NextResponse.json(invoice);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const result = updateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.flatten() }, { status: 422 });
  }

  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Recalculate totals if tax rate changed
  const taxRate = result.data.taxRate ?? existing.taxRate;
  const taxAmount = Math.round(existing.subtotal * taxRate * 100) / 100;
  const total = Math.round((existing.subtotal + taxAmount) * 100) / 100;

  const invoice = await prisma.invoice.update({
    where: { id },
    data: { ...result.data, taxRate, taxAmount, total },
  });

  return NextResponse.json(invoice);
}
