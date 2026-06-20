import type { Metadata } from "next";
import BookingRequestForm from "@/components/public/BookingRequestForm";
import { PHONE, PHONE_HREF, AREA } from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Contact & Book — Hard Work Mobile",
  description: "Request a mobile mechanic in Southeast PA. Fill out the booking form or call (484) 593-3875.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-[#1e2833] py-14 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-extrabold">Book Your Mobile Mechanic</h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-300">
            Fill out the form below and we&apos;ll confirm your appointment within a few hours.
            Prefer to talk? Call <a href={PHONE_HREF} className="font-semibold text-[#d4af37]">{PHONE}</a>.
          </p>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: "fa-solid fa-phone", title: "Phone", lines: [PHONE], href: PHONE_HREF, cta: "Call Now" },
            { icon: "fa-solid fa-clock", title: "Hours", lines: ["Mon – Fri", "10 AM – 6 PM"] },
            { icon: "fa-solid fa-map-location-dot", title: "Service Area", lines: [AREA] },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border-l-4 border-[#d4af37] bg-white p-6 text-center shadow-sm ring-1 ring-gray-100">
              <i className={`${c.icon} text-2xl text-[#d4af37]`} />
              <h3 className="mt-3 font-bold text-[#1e2833]">{c.title}</h3>
              {c.lines.map((l) => (
                <p key={l} className="mt-1 text-sm text-gray-600">{l}</p>
              ))}
              {c.href && (
                <a href={c.href} className="mt-3 inline-block text-sm font-bold text-[#d4af37] hover:underline">{c.cta}</a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Booking form */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <BookingRequestForm source="contact" />
        </div>
      </section>
    </>
  );
}
