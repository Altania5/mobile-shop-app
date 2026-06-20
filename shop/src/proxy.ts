import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COOKIE = "authjs.session-token";

// Staff admin lives at these root-level URLs. Anything not listed here and not
// under /portal is treated as public (marketing, blog, testimonials, etc.).
const STAFF_PREFIXES = [
  "/dashboard",
  "/customers",
  "/work-orders",
  "/invoices",
  "/booking-requests",
  "/inspections",
  "/admin",
  "/users",
];

// Portal auth pages must stay reachable while logged out.
const PORTAL_AUTH_PAGES = [
  "/portal/login",
  "/portal/register",
  "/portal/forgot-password",
  "/portal/reset-password",
];

function underAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

// Coarse, optimistic gate only — we check for the session cookie's presence (no
// crypto in the Edge runtime). Fine-grained staff-vs-customer enforcement is done
// in the (shop) and portal layouts via auth().
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = !!request.cookies.get(COOKIE)?.value;

  if (isLoggedIn) return NextResponse.next();

  if (underAny(pathname, STAFF_PREFIXES)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isPortalArea =
    (pathname === "/portal" || pathname.startsWith("/portal/")) &&
    !underAny(pathname, PORTAL_AUTH_PAGES);
  if (isPortalArea) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }

  // Public route — allow through.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|api/webhooks|api/cron|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
