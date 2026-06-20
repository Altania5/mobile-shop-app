import { prisma } from "@/lib/db";
import { BlogManager } from "@/components/admin/BlogManager";

export const metadata = { title: "Blog — Shop Manager" };
export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });

  const rows = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    published: !!p.publishedAt,
    comments: p._count.comments,
    createdAt: p.createdAt.toISOString(),
  }));

  return <BlogManager initialPosts={rows} />;
}
