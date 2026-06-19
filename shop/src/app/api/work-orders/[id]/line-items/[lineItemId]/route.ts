import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { LineItemType } from "@/generated/prisma";

const schema = z.object({
  type: z.nativeEnum(LineItemType).optional(),
  description: z.string().min(1).optional(),
  partNumber: z.string().optional().nullable(),
  quantity: z.number().positive().optional(),
  unitPrice: z.number().nonnegative().optional(),
});

type Params = { params: Promise<{ id: string; lineItemId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { lineItemId } = await params;
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten() },
      { status: 422 }
    );
  }

  const existing = await prisma.lineItem.findUnique({ where: { id: lineItemId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const quantity = result.data.quantity ?? existing.quantity;
  const unitPrice = result.data.unitPrice ?? existing.unitPrice;
  const total = Math.round(quantity * unitPrice * 100) / 100;

  const lineItem = await prisma.lineItem.update({
    where: { id: lineItemId },
    data: { ...result.data, quantity, unitPrice, total },
  });

  return NextResponse.json(lineItem);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { lineItemId } = await params;

  await prisma.lineItem.delete({ where: { id: lineItemId } });

  return new NextResponse(null, { status: 204 });
}
