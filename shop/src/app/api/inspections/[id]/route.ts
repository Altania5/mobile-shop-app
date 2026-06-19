import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: {
      workOrder: { include: { vehicle: true, customer: true } },
      items: {
        include: { photos: { orderBy: { createdAt: "asc" } } },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      },
    },
  });
  if (!inspection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(inspection);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { notes } = await req.json();
  const inspection = await prisma.inspection.update({ where: { id }, data: { notes } });
  return NextResponse.json(inspection);
}
