import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2).optional(),
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  trim: z.string().optional().nullable(),
  vin: z.string().optional().nullable(),
  licensePlate: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  mileage: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      customer: true,
      workOrders: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json(vehicle);
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

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: result.data,
  });

  return NextResponse.json(vehicle);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  await prisma.vehicle.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
