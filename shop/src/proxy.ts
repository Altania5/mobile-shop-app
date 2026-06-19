import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COOKIE = "authjs.session-token";

// Check cookie existence only — no crypto in Edge runtime.
// The JWT itself was validated at login; here we just gate access to pages.
export default function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isLoggedIn  = !!request.cookies.get(COOKIE)?.value;

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|api/webhooks|api/cron|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
