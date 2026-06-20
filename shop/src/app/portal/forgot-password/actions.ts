"use server";

import { prisma } from "@/lib/db";
import { makeResetToken } from "@/lib/customer-auth";
import { sendEmail, brandedEmail, appUrl } from "@/lib/email";

// Always returns success (no email enumeration). Sends a reset link if the
// account exists and has portal access (or can be granted it).
export async function forgotPasswordAction(_: unknown, formData: FormData): Promise<{ done: boolean }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { done: true };

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (customer) {
    const { raw, hash, expires } = makeResetToken();
    await prisma.customer.update({
      where: { id: customer.id },
      data: { passwordResetToken: hash, passwordResetExpires: expires },
    });
    const link = `${appUrl()}/portal/reset-password/${raw}`;
    await sendEmail({
      to: email,
      subject: "Reset your Hard Work Mobile password",
      html: brandedEmail(
        "Reset your password",
        `<p style="color:#475569;">We received a request to reset your password. This link is valid for one hour.</p>
         <a href="${link}" style="display:inline-block;background:#d4af37;color:#1e2833;font-weight:700;padding:12px 28px;border-radius:6px;text-decoration:none;">Reset Password</a>
         <p style="color:#94a3b8;font-size:13px;margin-top:20px;">If you didn't request this, you can safely ignore this email.</p>`
      ),
    });
  }

  return { done: true };
}
