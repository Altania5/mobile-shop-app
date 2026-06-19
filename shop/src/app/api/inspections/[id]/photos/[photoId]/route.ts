import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFromR2 } from "@/lib/r2";

type Params = { params: Promise<{ photoId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { photoId } = await params;

  const photo = await prisma.inspectionPhoto.findUnique({ where: { id: photoId } });
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteFromR2(photo.storageKey);
  await prisma.inspectionPhoto.delete({ where: { id: photoId } });

  return NextResponse.json({ ok: true });
}
