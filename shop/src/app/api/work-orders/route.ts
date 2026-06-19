import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { WorkOrderStatus } from "@/generated/prisma";

const createSchema = z.object({
  customerId: z.string().min(1, "Customer required"),
  vehicleId: z.string().min(1, "Vehicle required"),
  description: z.string().min(1, "Description required"),
  diagnosis: z.string().optional(),
  technician: z.string().optional(),
  serviceLocation: z.string().optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  mileageIn: z.number().int().nonnegative().optional().nullable(),
  internalNotes: z.string().optional(),
  customerNotes: z.string().optional(),
});

/** Generate next WO number for the current month */
async function nextWorkOrderNumber(): Promise<string> {
  const now = new Date();
  const prefix = `WO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  const last = await prisma.workOrder.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });

  const seq = last ? parseInt(last.number.split("-")[2] ?? "0") + 1 : 1;
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as WorkOrderStatus | null;
  const customerId = searchParams.get("customerId");
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 25;

  const where = {
    ...(status ? { status } : {}),
    ...(customerId ? { customerId } : {}),
    ...(q
      ? {
          OR: [
            { number: { contains: q } },
            { description: { contains: q, mode: "insensitive" as const } },
            { customer: { firstName: { contains: q, mode: "insensitive" as const } } },
            { customer: { lastName: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [workOrders, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        vehicle: { select: { id: true, year: true, make: true, model: true } },
        _count: { select: { lineItems: true } },
      },
    }),
    prisma.workOrder.count({ where }),
  ]);

  return NextResponse.json({ workOrders, total, page, limit });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = createSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten() },
      { status: 422 }
    );
  }

  const number = await nextWorkOrderNumber();

  const workOrder = await prisma.workOrder.create({
    data: { ...result.data, number },
    include: {
      customer: true,
      vehicle: true,
    },
  });

  return NextResponse.json(workOrder, { status: 201 });
}
