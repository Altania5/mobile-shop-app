import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

function requireStaff(session: Session | null) {
  const u = session?.user as { id?: string; userType?: string; role?: string } | undefined;
  const isStaff = !!u && (u.userType === "staff" || (!!u.role && u.userType !== "customer"));
  return isStaff ? u : null;
}

const patchSchema = z.object({
  status: z.enum(["PENDING", "PUBLISHED", "HIDDEN"]).optional(),
  adminReply: z.string().trim().max(2000).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!requireStaff(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 422 });
  }
  const d = parsed.data;

  const updated = await prisma.testimonial
    .update({
      where: { id },
      data: {
        ...(d.status ? { status: d.status } : {}),
        ...(d.adminReply !== undefined ? { adminReply: d.adminReply || null } : {}),
      },
    })
    .catch(() => null);

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!requireStaff(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
