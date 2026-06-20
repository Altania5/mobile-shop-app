"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, hashResetToken, createCustomerSession } from "@/lib/customer-auth";

export async function resetPasswordAction(_: unknown, formData: FormData): Promise<string | undefined> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) return "Invalid reset link.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password !== confirm) return "Passwords do not match.";

  const customer = await prisma.customer.findFirst({
    where: { passwordResetToken: hashResetToken(token), passwordResetExpires: { gt: new Date() } },
  });
  if (!customer) return "This reset link is invalid or has expired.";

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      passwordHash: await hashPassword(password),
      emailVerified: true,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  await createCustomerSession(customer);
  redirect("/portal/dashboard");
}
