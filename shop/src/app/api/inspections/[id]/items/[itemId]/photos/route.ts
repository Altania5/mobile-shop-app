import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ itemId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { itemId } = await params;
  const { url, storageKey } = await req.json();

  const photo = await prisma.inspectionPhoto.create({
    data: { inspectionItemId: itemId, url, storageKey },
  });

  return NextResponse.json(photo, { status: 201 });
}
