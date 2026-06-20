import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES, PHONE, PHONE_HREF } from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Services — Hard Work Mobile",
  description: "On-site auto repair services across Southeast PA: diagnostics, brakes, engine, suspension, electrical, and scheduled maintenance.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="bg-[#1e2833] py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-extrabold">Our Services</h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-300">
            Everything a traditional shop offers — performed at your home or office at {PHONE ? "$80/hr" : ""}.
            Pick a service to learn more and request a booking.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="group rounded-xl border-l-4 border-[#d4af37] bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <i className={`${s.icon} text-2xl text-[#d4af37]`} />
              <h3 className="mt-3 font-bold text-[#1e2833]">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.desc}</p>
              <span className="mt-3 inline-block text-sm font-bold text-[#d4af37]">Learn More →</span>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-gray-50 p-8 text-center ring-1 ring-gray-100">
          <h2 className="text-xl font-bold text-[#1e2833]">Don&apos;t see what you need?</h2>
          <p className="mt-2 text-gray-600">We handle most repairs. Give us a call and we&apos;ll let you know.</p>
          <a href={PHONE_HREF} className="mt-5 inline-block rounded-lg bg-[#d4af37] px-6 py-3 font-bold text-[#1e2833] transition-colors hover:bg-[#c9a42e]">
            <i className="fa-solid fa-phone mr-2" />{PHONE}
          </a>
        </div>
      </section>
    </>
  );
}
