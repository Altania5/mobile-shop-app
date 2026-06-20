import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

type Params = { params: Promise<{ id: string }> };

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "Hard Work Mobile <onboarding@resend.dev>";

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function declineEmailHtml(firstName: string, service: string, preferredDate: Date | string) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1e2833;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="color:#d4af37;margin:0;font-size:24px;">Hard Work Mobile</h1>
        <p style="color:#94a3b8;margin:8px 0 0;">Mobile Auto Repair · Southeast PA</p>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:32px 24px;">
        <h2 style="color:#1e2833;margin-top:0;">Hi ${firstName},</h2>
        <p style="color:#475569;">
          Thank you for reaching out to Hard Work Mobile. Unfortunately, we're unable to accommodate
          your request for <strong>${service}</strong> on <strong>${formatDate(preferredDate)}</strong> at this time.
        </p>
        <p style="color:#475569;">
          We'd love to find another time that works for you. Please give us a call and we'll do our
          best to get you scheduled at your convenience.
        </p>
        <a href="tel:4845933875" style="display:inline-block;background:#d4af37;color:#1e2833;font-weight:700;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:16px;">(484) 593-3875</a>
        <p style="color:#94a3b8;font-size:13px;margin-top:32px;">
          Hard Work Mobile · Chester, Delaware &amp; Montgomery Counties, PA<br>
          Mon–Fri 10 AM–6 PM · $80/hr · We come to you
        </p>
      </div>
    </div>
  `;
}

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const booking = await prisma.bookingRequest.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking request not found" }, { status: 404 });
  }
  if (booking.status !== "NEW") {
    return NextResponse.json({ error: `Booking is already ${booking.status.toLowerCase()}` }, { status: 409 });
  }

  await prisma.bookingRequest.update({
    where: { id },
    data: { status: "DECLINED" },
  });

  // Send decline email (fire-and-forget)
  const firstName = booking.name.split(" ")[0] ?? booking.name;
  const service =
    booking.service === "Other" ? booking.serviceOther ?? "service" : booking.service;

  resend.emails
    .send({
      from: FROM,
      to: [booking.email],
      subject: "Regarding Your Booking Request — Hard Work Mobile",
      html: declineEmailHtml(firstName, service, booking.preferredDate),
    })
    .catch((err: unknown) => console.error("Decline email failed:", err));

  return NextResponse.json({ ok: true });
}
