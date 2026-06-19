import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { itemId } = await params;
  const { condition, notes } = await req.json();

  const item = await prisma.inspectionItem.update({
    where: { id: itemId },
    data: {
      ...(condition !== undefined && { condition }),
      ...(notes     !== undefined && { notes     }),
    },
    include: { photos: true },
  });

  return NextResponse.json(item);
}
