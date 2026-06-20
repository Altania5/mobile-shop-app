import { prisma } from "@/lib/db";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";

export const metadata = { title: "Testimonials — Shop Manager" };
export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  const rows = testimonials.map((t) => ({
    id: t.id,
    quote: t.quote,
    rating: t.rating,
    authorName: t.authorName,
    serviceLabel: t.serviceLabel,
    status: t.status,
    adminReply: t.adminReply,
    createdAt: t.createdAt.toISOString(),
  }));
  return <TestimonialsManager initial={rows} />;
}
