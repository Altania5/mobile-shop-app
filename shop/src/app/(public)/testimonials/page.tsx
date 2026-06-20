import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StarRating } from "@/components/public/StarRating";
import { TestimonialForm } from "@/components/public/TestimonialForm";

export const metadata: Metadata = {
  title: "Reviews — Hard Work Mobile",
  description: "What customers say about Hard Work Mobile, your local mobile mechanic in Southeast PA.",
};

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <section className="bg-[#1e2833] py-14 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-extrabold">What Our Customers Say</h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-300">
            Real reviews from real customers across Chester, Delaware &amp; Montgomery Counties.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        {testimonials.length === 0 ? (
          <p className="text-center text-gray-500">No reviews yet — be the first!</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {testimonials.map((t) => (
              <figure key={t.id} className="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <StarRating rating={t.rating} />
                <blockquote className="mt-3 flex-1 text-gray-700">“{t.quote}”</blockquote>
                <figcaption className="mt-4">
                  <p className="font-bold text-[#1e2833]">{t.authorName}</p>
                  {t.serviceLabel && <p className="text-sm text-gray-500">{t.serviceLabel}</p>}
                </figcaption>
                {t.adminReply && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm ring-1 ring-gray-100">
                    <p className="font-semibold text-[#d4af37]">Hard Work Mobile replied:</p>
                    <p className="mt-1 text-gray-700">{t.adminReply}</p>
                  </div>
                )}
              </figure>
            ))}
          </div>
        )}

        <div className="mx-auto mt-14 max-w-xl">
          <h2 className="mb-4 text-center text-2xl font-bold text-[#1e2833]">Leave a Review</h2>
          <TestimonialForm />
        </div>
      </section>
    </>
  );
}
