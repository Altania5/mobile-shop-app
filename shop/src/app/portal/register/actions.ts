"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, createCustomerSession } from "@/lib/customer-auth";

export async function registerCustomerAction(_: unknown, formData: FormData): Promise<string | undefined> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!firstName || !lastName || !email || !phone || !password) return "All fields are required.";
  if (password.length < 8) return "Password must be at least 8 characters.";

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return "An account with that email already exists. Try signing in or resetting your password.";
  }

  const customer = await prisma.customer.create({
    data: { firstName, lastName, email, phone, passwordHash: await hashPassword(password) },
  });

  await createCustomerSession(customer);
  redirect("/portal/dashboard");
}
