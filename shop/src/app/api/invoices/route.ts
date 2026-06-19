import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { InvoiceStatus } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as InvoiceStatus | null;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 25;

  const where = status ? { status } : {};

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        workOrder: { select: { number: true, vehicle: { select: { year: true, make: true, model: true } } } },
        _count: { select: { payments: true } },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return NextResponse.json({ invoices, total, page, limit });
}
