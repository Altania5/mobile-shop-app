import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  postId: z.string().min(1),
  authorName: z.string().trim().min(1, "Name required").max(80),
  text: z.string().trim().min(1, "Comment required").max(2000),
});

// POST — public comment on a post (allowed only if the post permits comments).
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 422 });
  }
  const { postId, authorName, text } = parsed.data;

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { allowComments: true, publishedAt: true } });
  if (!post || !post.publishedAt) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  if (!post.allowComments) return NextResponse.json({ error: "Comments are closed for this post." }, { status: 403 });

  // If a portal customer is logged in, attribute the comment to them.
  const u = (await auth())?.user as { id?: string; name?: string; userType?: string } | undefined;
  const isCustomer = u?.userType === "customer";

  const comment = await prisma.comment.create({
    data: {
      postId,
      text,
      authorName: isCustomer && u?.name ? u.name : authorName,
      customerId: isCustomer ? u?.id : undefined,
    },
    select: { id: true, authorName: true, text: true, createdAt: true },
  });

  return NextResponse.json(comment, { status: 201 });
}
