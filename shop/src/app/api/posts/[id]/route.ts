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

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const updateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  content: z.string().trim().min(1).optional(),
  summary: z.string().trim().optional(),
  heroImage: z.string().trim().url().optional().or(z.literal("")),
  allowComments: z.boolean().optional(),
  published: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const staff = requireStaff(await auth());
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = updateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 422 });
  }
  const d = parsed.data;

  const nextSlug = d.slug ? slugify(d.slug) : undefined;
  if (nextSlug && nextSlug !== post.slug) {
    const clash = await prisma.post.findUnique({ where: { slug: nextSlug } });
    if (clash) return NextResponse.json({ error: "A post with that slug already exists." }, { status: 409 });
  }

  // Toggle publish state only when `published` is explicitly provided.
  let publishedAt = post.publishedAt;
  if (d.published === true && !post.publishedAt) publishedAt = new Date();
  if (d.published === false) publishedAt = null;

  const updated = await prisma.post.update({
    where: { id },
    data: {
      title: d.title ?? post.title,
      slug: nextSlug ?? post.slug,
      content: d.content ?? post.content,
      summary: d.summary !== undefined ? d.summary || null : post.summary,
      heroImage: d.heroImage !== undefined ? d.heroImage || null : post.heroImage,
      allowComments: d.allowComments ?? post.allowComments,
      publishedAt,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const staff = requireStaff(await auth());
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.post.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
