import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PostForm } from "@/components/admin/PostForm";

export const metadata = { title: "Edit Post — Shop Manager" };
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Params) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <PostForm
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        summary: post.summary ?? "",
        content: post.content,
        heroImage: post.heroImage ?? "",
        allowComments: post.allowComments,
        published: !!post.publishedAt,
      }}
    />
  );
}
