import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const vehicleSchema = z.object({
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  make: z.string().min(1, "Make required"),
  model: z.string().min(1, "Model required"),
  trim: z.string().optional().nullable(),
  vin: z.string().optional().nullable(),
  licensePlate: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  mileage: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: customerId } = await params;

  const vehicles = await prisma.vehicle.findMany({
    where: { customerId },
    orderBy: { year: "desc" },
    include: { _count: { select: { workOrders: true } } },
  });

  return NextResponse.json(vehicles);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: customerId } = await params;
  const body = await req.json();
  const result = vehicleSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten() },
      { status: 422 }
    );
  }

  // Verify customer exists
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const vehicle = await prisma.vehicle.create({
    data: { ...result.data, customerId },
  });

  return NextResponse.json(vehicle, { status: 201 });
}
