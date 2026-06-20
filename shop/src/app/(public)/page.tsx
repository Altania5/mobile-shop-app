import Link from "next/link";
import { SERVICES, PHONE, PHONE_HREF } from "@/lib/marketing";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#1e2833] text-white">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="inline-block rounded-full bg-[#d4af37] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1e2833]">
            Mobile Mechanic — Chester, Delaware &amp; Montgomery Counties, PA
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Auto Repair That <span className="text-[#d4af37]">Comes to You.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-300">
            Skip the shop and the tow truck. Our mobile mechanic comes to your home or office across
            Southeast PA with honest, upfront pricing at <strong className="text-white">$80/hr</strong>.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={PHONE_HREF} className="rounded-lg bg-[#d4af37] px-6 py-3 font-bold text-[#1e2833] transition-colors hover:bg-[#c9a42e]">
              <i className="fa-solid fa-phone mr-2" />Call {PHONE}
            </a>
            <Link href="/contact" className="rounded-lg border-2 border-white/40 px-6 py-3 font-semibold text-white transition-colors hover:border-[#d4af37] hover:text-[#d4af37]">
              Get a Free Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-[#d4af37]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-4 py-3.5 text-sm font-bold text-[#1e2833]">
          <span><i className="fa-solid fa-car mr-2" />We Come to You</span>
          <span><i className="fa-solid fa-dollar-sign mr-2" />$80/hr Labor</span>
          <span><i className="fa-solid fa-file-invoice-dollar mr-2" />Upfront Pricing</span>
          <span><i className="fa-solid fa-map-location-dot mr-2" />Chester, Delaware &amp; Montgomery Co.</span>
        </div>
      </div>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-[#1e2833]">On-Site Auto Repair Services</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          Diagnostics, brakes, engines, suspension, electrical, and scheduled maintenance — all
          performed at your location.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>

      {/* Why */}
      <section className="bg-[#1e2833] py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold">Why Choose Hard Work Mobile?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-400">
            The same quality repair you&apos;d expect from a top-tier shop — delivered to your driveway.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "fa-solid fa-car", title: "No Shop Required", desc: "We come to your home, office, or wherever your vehicle is. No tow truck, no waiting room." },
              { icon: "fa-solid fa-dollar-sign", title: "$80/hr — Fair Rate", desc: "Significantly lower than most area shops, with no shop overhead padding the bill." },
              { icon: "fa-solid fa-file-invoice-dollar", title: "Upfront Pricing", desc: "You know exactly what you're paying before any work begins. No surprises." },
              { icon: "fa-solid fa-shield-halved", title: "Quality Guaranteed", desc: "Professional-grade tools, quality parts, and a satisfaction guarantee on every repair." },
            ].map((c) => (
              <div key={c.title} className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                <i className={`${c.icon} text-2xl text-[#d4af37]`} />
                <h3 className="mt-3 font-bold">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#d4af37] py-16 text-center text-[#1e2833]">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold">Ready to Book Your Mobile Mechanic?</h2>
          <p className="mt-3 text-[#1e2833]/80">
            Serving Chester, Delaware &amp; Montgomery Counties — we come to you at $80/hr.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="rounded-lg bg-[#1e2833] px-6 py-3 font-bold text-white transition-colors hover:bg-[#111b24]">
              Request Service
            </Link>
            <a href={PHONE_HREF} className="rounded-lg border-2 border-[#1e2833] px-6 py-3 font-semibold text-[#1e2833] transition-colors hover:bg-[#1e2833]/10">
              <i className="fa-solid fa-phone mr-2" />{PHONE}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
