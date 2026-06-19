import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { active } = await req.json();

  const user = await prisma.user.update({
    where: { id },
    data: { active },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  return NextResponse.json(user);
}
