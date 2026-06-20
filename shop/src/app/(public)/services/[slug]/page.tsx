import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingRequestForm from "@/components/public/BookingRequestForm";
import { SERVICE_DATA, SERVICE_LABELS, PHONE, PHONE_HREF } from "@/lib/marketing";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(SERVICE_DATA).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = SERVICE_DATA[slug];
  if (!data) return { title: "Service — Hard Work Mobile" };
  return {
    title: `${data.eyebrow} — Hard Work Mobile`,
    description: data.subheadline,
  };
}

export default async function ServiceLandingPage({ params }: Params) {
  const { slug } = await params;
  const data = SERVICE_DATA[slug];
  if (!data) notFound();

  const { eyebrow, headline, subheadline, services } = data;

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1e2833] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="inline-block rounded-full bg-[#d4af37] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1e2833]">
            {eyebrow}
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            {headline[0]}
            <span className="text-[#d4af37]">{headline[1]}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-300">{subheadline}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={PHONE_HREF} className="rounded-lg bg-[#d4af37] px-6 py-3 font-bold text-[#1e2833] hover:bg-[#c9a42e]">
              <i className="fa-solid fa-phone mr-2" />{PHONE}
            </a>
            <a href="#request-form" className="rounded-lg border-2 border-white/40 px-6 py-3 font-semibold text-white hover:border-[#d4af37] hover:text-[#d4af37]">
              Request Service
            </a>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-[#d4af37]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-4 py-3.5 text-sm font-bold text-[#1e2833]">
          <span><i className="fa-solid fa-car mr-2" />We Come to You</span>
          <span><i className="fa-solid fa-dollar-sign mr-2" />$80/hr Labor</span>
          <span><i className="fa-solid fa-file-invoice-dollar mr-2" />Upfront Pricing</span>
        </div>
      </div>

      {/* What's included */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-[#1e2833]">What&apos;s Included</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          All services performed at your home, workplace, or anywhere your vehicle is parked.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <i className={`${s.icon} text-2xl text-[#d4af37]`} />
              <h3 className="mt-3 font-bold text-[#1e2833]">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking form */}
      <section id="request-form" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <BookingRequestForm defaultService={SERVICE_LABELS[slug] ?? ""} source={`landing-${slug}`} />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#1e2833] py-14 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <p className="mt-2 text-gray-400">Book online above or give us a call — we&apos;ll get you squared away.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/services" className="rounded-lg border-2 border-white/40 px-6 py-3 font-semibold text-white hover:border-[#d4af37] hover:text-[#d4af37]">
              Browse All Services
            </Link>
            <a href={PHONE_HREF} className="rounded-lg bg-[#d4af37] px-6 py-3 font-bold text-[#1e2833] hover:bg-[#c9a42e]">
              <i className="fa-solid fa-phone mr-2" />{PHONE}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
