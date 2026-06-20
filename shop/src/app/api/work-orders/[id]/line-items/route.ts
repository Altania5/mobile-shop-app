import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { LineItemType } from "@/generated/prisma";

const schema = z.object({
  type: z.nativeEnum(LineItemType),
  description: z.string().min(1, "Description required"),
  partNumber: z.string().optional().nullable(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: workOrderId } = await params;
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten() },
      { status: 422 }
    );
  }

  const { quantity, unitPrice, ...rest } = result.data;
  const total = Math.round(quantity * unitPrice * 100) / 100;

  const lineItem = await prisma.lineItem.create({
    data: { workOrderId, quantity, unitPrice, total, ...rest },
  });

  return NextResponse.json(lineItem, { status: 201 });
}
