import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function requireStaff(session: Session | null) {
  const u = session?.user as { id?: string; userType?: string; role?: string } | undefined;
  const isStaff = !!u && (u.userType === "staff" || (!!u.role && u.userType !== "customer"));
  return isStaff ? u : null;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const postSchema = z.object({
  title: z.string().trim().min(1, "Title required"),
  slug: z.string().trim().optional(),
  content: z.string().trim().min(1, "Content required"),
  summary: z.string().trim().optional(),
  heroImage: z.string().trim().url().optional().or(z.literal("")),
  allowComments: z.boolean().optional(),
  published: z.boolean().optional(),
});

// GET — admin list (all posts, including drafts)
export async function GET() {
  const staff = requireStaff(await auth());
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } }, _count: { select: { comments: true } } },
  });
  return NextResponse.json({ posts });
}

// POST — admin create
export async function POST(req: NextRequest) {
  const staff = requireStaff(await auth());
  if (!staff?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = postSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 422 });
  }
  const d = parsed.data;
  const slug = d.slug?.trim() ? slugify(d.slug) : slugify(d.title);

  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A post with that slug already exists." }, { status: 409 });
  }

  const post = await prisma.post.create({
    data: {
      title: d.title,
      slug,
      content: d.content,
      summary: d.summary || null,
      heroImage: d.heroImage || null,
      allowComments: d.allowComments ?? true,
      publishedAt: d.published ? new Date() : null,
      authorId: staff.id,
    },
  });
  return NextResponse.json(post, { status: 201 });
}
