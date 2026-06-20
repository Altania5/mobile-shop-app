import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  description: z.string().min(1).optional(),
  diagnosis: z.string().optional().nullable(),
  workPerformed: z.string().optional().nullable(),
  recommendations: z.string().optional().nullable(),
  technician: z.string().optional().nullable(),
  serviceLocation: z.string().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  startedAt: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  mileageIn: z.number().int().nonnegative().optional().nullable(),
  mileageOut: z.number().int().nonnegative().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  customerNotes: z.string().optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      lineItems: { orderBy: [{ type: "asc" }, { createdAt: "asc" }] },
      invoice: true,
    },
  });

  if (!workOrder) {
    return NextResponse.json({ error: "Work order not found" }, { status: 404 });
  }

  return NextResponse.json(workOrder);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const result = updateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten() },
      { status: 422 }
    );
  }

  const workOrder = await prisma.workOrder.update({
    where: { id },
    data: result.data,
    include: { customer: true, vehicle: true, lineItems: true },
  });

  return NextResponse.json(workOrder);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  await prisma.workOrder.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
