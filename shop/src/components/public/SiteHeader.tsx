"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Wrench } from "lucide-react";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#1e2833]/95 backdrop-blur border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-white" onClick={() => setOpen(false)}>
          <Wrench className="h-6 w-6 text-[#d4af37]" />
          <span className="text-lg font-bold tracking-tight">
            Hard Work <span className="text-[#d4af37]">Mobile</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-medium text-gray-200 transition-colors hover:text-[#d4af37]">
              {n.label}
            </Link>
          ))}
          <Link href="/portal/login" className="rounded-lg border border-white/25 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:border-[#d4af37] hover:text-[#d4af37]">
            Customer Login
          </Link>
          <a href="tel:4845933875" className="rounded-lg bg-[#d4af37] px-4 py-1.5 text-sm font-bold text-[#1e2833] transition-colors hover:bg-[#c9a42e]">
            (484) 593-3875
          </a>
        </nav>

        {/* Mobile toggle */}
        <button className="text-white md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-white/10 bg-[#1e2833] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/5 hover:text-[#d4af37]">
                {n.label}
              </Link>
            ))}
            <Link href="/portal/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/5">
              Customer Login
            </Link>
            <a href="tel:4845933875" className="mt-2 rounded-lg bg-[#d4af37] px-3 py-2.5 text-center text-sm font-bold text-[#1e2833]">
              Call (484) 593-3875
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
