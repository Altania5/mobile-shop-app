import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { TestimonialStatus } from "@/generated/prisma";

const STATUSES = ["PENDING", "PUBLISHED", "HIDDEN"] as const;

function requireStaff(session: Session | null) {
  const u = session?.user as { id?: string; userType?: string; role?: string } | undefined;
  const isStaff = !!u && (u.userType === "staff" || (!!u.role && u.userType !== "customer"));
  return isStaff ? u : null;
}

// GET — admin list (all statuses, optional ?status= filter)
export async function GET(req: NextRequest) {
  if (!requireStaff(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const statusParam = req.nextUrl.searchParams.get("status")?.toUpperCase();
  const status = STATUSES.includes(statusParam as (typeof STATUSES)[number])
    ? (statusParam as TestimonialStatus)
    : undefined;

  const testimonials = await prisma.testimonial.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ testimonials });
}

// POST — public/customer submission (always created as PENDING for moderation)
const submitSchema = z.object({
  quote: z.string().trim().min(1, "Please write a few words.").max(2000),
  rating: z.coerce.number().int().min(1).max(5),
  authorName: z.string().trim().min(1, "Name required").max(80),
  serviceLabel: z.string().trim().max(120).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = submitSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 422 });
  }
  const d = parsed.data;

  const u = (await auth())?.user as { id?: string; name?: string; userType?: string } | undefined;
  const isCustomer = u?.userType === "customer";

  await prisma.testimonial.create({
    data: {
      quote: d.quote,
      rating: d.rating,
      authorName: isCustomer && u?.name ? u.name : d.authorName,
      serviceLabel: d.serviceLabel || null,
      status: "PENDING",
      customerId: isCustomer ? u?.id : undefined,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
