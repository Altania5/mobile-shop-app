import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Blog — Hard Work Mobile",
  description: "Car care tips, maintenance advice, and news from Hard Work Mobile.",
};

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function BlogIndexPage() {
  const posts = await prisma.post.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, slug: true, summary: true, heroImage: true, publishedAt: true },
  });

  return (
    <>
      <section className="bg-[#1e2833] py-14 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-extrabold">The Hard Work Mobile Blog</h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-300">
            Practical car-care advice and updates from your local mobile mechanic.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        {posts.length === 0 ? (
          <p className="py-16 text-center text-gray-500">No posts yet — check back soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {p.heroImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.heroImage} alt={p.title} className="h-44 w-full object-cover" />
                )}
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                    {p.publishedAt ? formatDate(p.publishedAt) : ""}
                  </p>
                  <h2 className="mt-1.5 text-lg font-bold text-[#1e2833] group-hover:text-[#d4af37]">{p.title}</h2>
                  {p.summary && <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-3">{p.summary}</p>}
                  <span className="mt-3 inline-block text-sm font-bold text-[#d4af37]">Read More →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
