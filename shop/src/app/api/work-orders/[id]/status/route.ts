import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { WorkOrderStatus } from "@/generated/prisma";

const schema = z.object({
  status: z.nativeEnum(WorkOrderStatus),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 422 });
  }

  const { status } = result.data;

  // Set timestamps automatically on status transitions
  const timestamps: Record<string, Date | null> = {};
  if (status === "IN_PROGRESS") timestamps.startedAt = new Date();
  if (status === "COMPLETED") timestamps.completedAt = new Date();

  const workOrder = await prisma.workOrder.update({
    where: { id },
    data: { status, ...timestamps },
  });

  return NextResponse.json(workOrder);
}
