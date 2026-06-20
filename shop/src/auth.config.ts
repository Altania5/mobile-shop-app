import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  // Force consistent cookie names regardless of protocol.
  // Without this, the Edge middleware sees HTTPS (ngrok URL) and looks for
  // __Secure-authjs.session-token, while the Node.js API handler sees HTTP
  // (localhost:3000) and sets authjs.session-token — causing a mismatch on mobile.
  useSecureCookies: false,
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn  = !!auth?.user;
      const isLoginPage = request.nextUrl.pathname === "/login";

      if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }
      if (!isLoggedIn && !isLoginPage) {
        return Response.redirect(new URL("/login", request.nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        const u = user as { role?: string; userType?: string };
        if (u.role) token.role = u.role;
        if (u.userType) token.userType = u.userType;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const u = session.user as { id?: string; role?: string; userType?: string };
        if (token.sub) u.id = token.sub;
        u.role = token.role as string | undefined;
        // Tokens minted before userType existed (staff) carry a role but no userType.
        u.userType = (token.userType as string | undefined) ?? (token.role ? "staff" : undefined);
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
