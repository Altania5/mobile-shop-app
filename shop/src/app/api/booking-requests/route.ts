import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { BookingRequestStatus, PreferredTimeSlot } from "@/generated/prisma";

const STATUSES = ["NEW", "CONTACTED", "SCHEDULED", "COMPLETED", "CANCELLED", "CONVERTED", "DECLINED"] as const;

// GET — admin list, optionally filtered by status. (staff only)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const statusParam = req.nextUrl.searchParams.get("status")?.toUpperCase();
  const status = STATUSES.includes(statusParam as (typeof STATUSES)[number])
    ? (statusParam as BookingRequestStatus)
    : undefined;

  const requests = await prisma.bookingRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ requests });
}

// POST — public booking-request submission from the marketing site.
const TIME_SLOT_MAP: Record<string, PreferredTimeSlot> = {
  morning: "MORNING",
  afternoon: "AFTERNOON",
  evening: "EVENING",
};

const createSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  vehicleYear: z.coerce.number().int(),
  vehicleMake: z.string().trim().min(1),
  vehicleModel: z.string().trim().min(1),
  service: z.string().trim().min(1),
  serviceOther: z.string().trim().optional(),
  preferredDate: z.coerce.date(),
  preferredTimeSlot: z.string().transform((v) => v.toLowerCase()).pipe(z.enum(["morning", "afternoon", "evening"])),
  serviceAddress: z.string().trim().min(1),
  source: z.string().trim().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission", details: parsed.error.flatten() }, { status: 422 });
  }
  const d = parsed.data;

  // Link to an existing customer by email if one exists.
  const customer = await prisma.customer.findFirst({
    where: { email: d.email.toLowerCase() },
    select: { id: true },
  });

  const created = await prisma.bookingRequest.create({
    data: {
      name: d.name,
      email: d.email.toLowerCase(),
      phone: d.phone,
      vehicleYear: d.vehicleYear,
      vehicleMake: d.vehicleMake,
      vehicleModel: d.vehicleModel,
      service: d.service,
      serviceOther: d.serviceOther,
      preferredDate: d.preferredDate,
      preferredTimeSlot: TIME_SLOT_MAP[d.preferredTimeSlot],
      serviceAddress: d.serviceAddress,
      source: d.source ?? "contact",
      customerId: customer?.id,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
