import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

type Params = { params: Promise<{ id: string }> };

const serverUrl = process.env.SERVER_URL ?? "http://localhost:5000";
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "Hard Work Mobile <onboarding@resend.dev>";

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Morning (8 AM – 12 PM)",
  afternoon: "Afternoon (12 PM – 5 PM)",
  evening: "Evening (5 PM – 7 PM)",
};

function splitName(full: string): { firstName: string; lastName: string } {
  const idx = full.indexOf(" ");
  if (idx === -1) return { firstName: full, lastName: "" };
  return { firstName: full.slice(0, idx), lastName: full.slice(idx + 1) };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

async function nextWorkOrderNumber(): Promise<string> {
  const now = new Date();
  const prefix = `WO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const last = await prisma.workOrder.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const seq = last ? parseInt(last.number.split("-")[2] ?? "0") + 1 : 1;
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}

function approvalEmailHtml(params: {
  firstName: string;
  woNumber: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  service: string;
  preferredDate: string;
  preferredTimeSlot: string;
  serviceAddress: string;
}) {
  const { firstName, woNumber, vehicleYear, vehicleMake, vehicleModel, service, preferredDate, preferredTimeSlot, serviceAddress } = params;
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1e2833;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="color:#d4af37;margin:0;font-size:24px;">Hard Work Mobile</h1>
        <p style="color:#94a3b8;margin:8px 0 0;">Mobile Auto Repair · Southeast PA</p>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:32px 24px;">
        <h2 style="color:#1e2833;margin-top:0;">You're on the schedule, ${firstName}!</h2>
        <p style="color:#475569;">Great news — we've confirmed your service request and created a work order. We'll call or text you 30 minutes before arrival.</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:24px 0;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:.05em;">Work Order ${woNumber}</p>
          <table style="border-collapse:collapse;width:100%;font-size:15px;">
            <tr><td style="padding:5px 16px 5px 0;color:#64748b;">Vehicle</td><td style="padding:5px 0;font-weight:600;">${vehicleYear} ${vehicleMake} ${vehicleModel}</td></tr>
            <tr><td style="padding:5px 16px 5px 0;color:#64748b;">Service</td><td style="padding:5px 0;font-weight:600;">${service}</td></tr>
            <tr><td style="padding:5px 16px 5px 0;color:#64748b;">Date</td><td style="padding:5px 0;font-weight:600;">${formatDate(preferredDate)}</td></tr>
            <tr><td style="padding:5px 16px 5px 0;color:#64748b;">Time</td><td style="padding:5px 0;font-weight:600;">${TIME_SLOT_LABELS[preferredTimeSlot] ?? preferredTimeSlot}</td></tr>
            <tr><td style="padding:5px 16px 5px 0;color:#64748b;">Location</td><td style="padding:5px 0;font-weight:600;">${serviceAddress}</td></tr>
          </table>
        </div>
        <p style="color:#475569;">Questions or need to reschedule? Give us a call:</p>
        <a href="tel:4845933875" style="display:inline-block;background:#d4af37;color:#1e2833;font-weight:700;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:16px;">(484) 593-3875</a>
        <p style="color:#94a3b8;font-size:13px;margin-top:32px;">Hard Work Mobile · Chester, Delaware &amp; Montgomery Counties, PA<br>$80/hr · We come to you</p>
      </div>
    </div>
  `;
}

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // 1. Fetch the booking from the Express server
  const bookingRes = await fetch(`${serverUrl}/api/booking-requests/${id}`, { cache: "no-store" });
  if (!bookingRes.ok) {
    return NextResponse.json({ error: "Booking request not found" }, { status: 404 });
  }
  const booking = await bookingRes.json();

  if (booking.status !== "new") {
    return NextResponse.json({ error: `Booking is already ${booking.status}` }, { status: 409 });
  }

  // 2. Find or create the customer (match by email)
  const { firstName, lastName } = splitName(booking.name as string);
  let customer = booking.email
    ? await prisma.customer.findFirst({ where: { email: (booking.email as string).toLowerCase() } })
    : null;

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email: (booking.email as string).toLowerCase(),
        phone: booking.phone as string,
        address: booking.serviceAddress as string,
        notes: "Created from booking request form.",
      },
    });
  }

  // 3. Find or create the vehicle
  let vehicle = await prisma.vehicle.findFirst({
    where: {
      customerId: customer.id,
      year: Number(booking.vehicleYear),
      make: booking.vehicleMake as string,
      model: booking.vehicleModel as string,
    },
  });

  if (!vehicle) {
    vehicle = await prisma.vehicle.create({
      data: {
        customerId: customer.id,
        year: Number(booking.vehicleYear),
        make: booking.vehicleMake as string,
        model: booking.vehicleModel as string,
      },
    });
  }

  // 4. Create the work order
  const woNumber = await nextWorkOrderNumber();
  const serviceLabel =
    booking.service === "Other"
      ? `Other: ${booking.serviceOther ?? ""}`
      : (booking.service as string);

  const scheduledAt = new Date(booking.preferredDate as string);
  scheduledAt.setUTCHours(12, 0, 0, 0); // default to noon

  const workOrder = await prisma.workOrder.create({
    data: {
      number: woNumber,
      customerId: customer.id,
      vehicleId: vehicle.id,
      description: serviceLabel,
      serviceLocation: booking.serviceAddress as string,
      scheduledAt,
      customerNotes: `Preferred time: ${TIME_SLOT_LABELS[booking.preferredTimeSlot as string] ?? booking.preferredTimeSlot}. Source: ${booking.source}.`,
    },
  });

  // 5. Mark booking as converted in MongoDB
  await fetch(`${serverUrl}/api/booking-requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "converted" }),
  });

  // 6. Auto-register customer portal account (fire-and-forget)
  if (booking.email && process.env.PORTAL_INTERNAL_SECRET) {
    fetch(`${serverUrl}/api/users/portal/auto-register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.PORTAL_INTERNAL_SECRET,
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email: booking.email,
        phone: booking.phone,
      }),
    }).catch((err: unknown) => console.error("Portal auto-register failed:", err));
  }

  // 7. Send confirmation email (fire-and-forget)
  if (booking.email) {
    resend.emails
      .send({
        from: FROM,
        to: [booking.email as string],
        subject: `Your Service Appointment is Confirmed — Hard Work Mobile`,
        html: approvalEmailHtml({
          firstName,
          woNumber,
          vehicleYear: Number(booking.vehicleYear),
          vehicleMake: booking.vehicleMake as string,
          vehicleModel: booking.vehicleModel as string,
          service: serviceLabel,
          preferredDate: booking.preferredDate as string,
          preferredTimeSlot: booking.preferredTimeSlot as string,
          serviceAddress: booking.serviceAddress as string,
        }),
      })
      .catch((err: unknown) => console.error("Approval email failed:", err));
  }

  return NextResponse.json({
    workOrderId: workOrder.id,
    workOrderNumber: workOrder.number,
    customerId: customer.id,
  });
}
