"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword, createCustomerSession } from "@/lib/customer-auth";

export async function loginCustomerAction(_: unknown, formData: FormData): Promise<string | undefined> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return "Email and password are required.";

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || !customer.passwordHash) return "Invalid email or password.";

  const ok = await verifyPassword(password, customer.passwordHash);
  if (!ok) return "Invalid email or password.";

  await createCustomerSession(customer);
  redirect("/portal/dashboard");
}
