"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Must match useSecureCookies: false in auth.config.ts
const COOKIE = "authjs.session-token";

export async function loginAction(_: unknown, formData: FormData) {
  const email    = String(formData.get("email")    ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return "Email and password are required.";

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) return "Invalid email or password.";

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return "Invalid email or password.";

    // Create a JWT in the exact format Auth.js middleware expects.
    // salt must match the cookie name so the middleware can decode it.
    const jwt = await encode({
      token: {
        sub:      user.id,
        name:     user.name,
        email:    user.email,
        role:     user.role,
        userType: "staff",
      },
      secret: process.env.AUTH_SECRET!,
      salt:   COOKIE,
      maxAge: 60 * 60 * 24 * 30,
    });

    (await cookies()).set(COOKIE, jwt, {
      httpOnly: true,
      secure:   false,   // matches useSecureCookies: false
      sameSite: "lax",
      path:     "/",
      maxAge:   60 * 60 * 24 * 30,
    });
  } catch (err) {
    console.error("Login error:", err);
    return "An error occurred. Please try again.";
  }

  // redirect() throws a special Next.js error — must be outside try/catch
  redirect("/dashboard");
}
