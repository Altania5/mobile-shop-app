import type { Metadata } from "next";
import Link from "next/link";
import { PHONE, PHONE_HREF, AREA } from "@/lib/marketing";

export const metadata: Metadata = {
  title: "About — Hard Work Mobile",
  description: "Hard Work Mobile is a mobile mechanic serving Southeast PA with honest, upfront auto repair at your location.",
};

const VALUES = [
  { icon: "fa-solid fa-handshake", title: "Honesty First", desc: "We tell you what your vehicle actually needs — not what pads the bill. Upfront pricing, every time." },
  { icon: "fa-solid fa-location-dot", title: "Maximum Convenience", desc: "We bring the shop to your driveway. No tow trucks, no waiting rooms, no rearranging your day." },
  { icon: "fa-solid fa-screwdriver-wrench", title: "Real Craftsmanship", desc: "Professional-grade tools and quality parts on every job, backed by a satisfaction guarantee." },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-[#1e2833] py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-extrabold">About Hard Work Mobile</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            A mobile mechanic built on a simple idea: quality auto repair shouldn&apos;t mean a tow,
            a wait, or a runaround. We come to you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="space-y-5 text-lg leading-relaxed text-gray-700">
          <p>
            Hard Work Mobile is a mobile auto repair service covering {AREA}. We bring
            professional diagnostic equipment and quality parts directly to your home or workplace,
            handling everything from check-engine lights and brakes to engine, suspension, and
            electrical repairs.
          </p>
          <p>
            Because there&apos;s no shop overhead, our labor rate stays a fair <strong>$80/hr</strong>,
            and because we quote upfront, you always know what you&apos;re paying before any work begins.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100">
              <i className={`${v.icon} text-2xl text-[#d4af37]`} />
              <h3 className="mt-3 font-bold text-[#1e2833]">{v.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#d4af37] py-14 text-center text-[#1e2833]">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold">Let&apos;s get your vehicle taken care of.</h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="rounded-lg bg-[#1e2833] px-6 py-3 font-bold text-white hover:bg-[#111b24]">
              Request Service
            </Link>
            <a href={PHONE_HREF} className="rounded-lg border-2 border-[#1e2833] px-6 py-3 font-semibold text-[#1e2833] hover:bg-[#1e2833]/10">
              <i className="fa-solid fa-phone mr-2" />{PHONE}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
