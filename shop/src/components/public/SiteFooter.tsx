import Link from "next/link";
import { PHONE, PHONE_HREF, AREA } from "@/lib/marketing";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#1e2833] text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">
            Hard Work <span className="text-[#d4af37]">Mobile</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            Mobile auto repair across Southeast PA. We come to your home or office with honest,
            upfront pricing at {`$80/hr`} — no shop, no tow, no surprises.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/services" className="hover:text-[#d4af37]">Services</Link></li>
            <li><Link href="/about" className="hover:text-[#d4af37]">About</Link></li>
            <li><Link href="/blog" className="hover:text-[#d4af37]">Blog</Link></li>
            <li><Link href="/testimonials" className="hover:text-[#d4af37]">Testimonials</Link></li>
            <li><Link href="/contact" className="hover:text-[#d4af37]">Contact</Link></li>
            <li><Link href="/portal/login" className="hover:text-[#d4af37]">Customer Login</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Get in touch</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href={PHONE_HREF} className="font-semibold text-white hover:text-[#d4af37]">{PHONE}</a></li>
            <li className="text-gray-400">Mon–Fri · 10 AM – 6 PM</li>
            <li className="text-gray-400">{AREA}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-gray-500">
        © {year} Hard Work Mobile. All rights reserved.
      </div>
    </footer>
  );
}
