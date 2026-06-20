"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { clearSession, verifyPassword, hashPassword } from "@/lib/customer-auth";

export async function signOutCustomerAction() {
  await clearSession();
  redirect("/");
}

export async function changeCustomerPasswordAction(_: unknown, formData: FormData): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  const u = session?.user as { id?: string; userType?: string } | undefined;
  if (!u?.id || u.userType !== "customer") return { ok: false, message: "Not signed in." };

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  if (next.length < 8) return { ok: false, message: "New password must be at least 8 characters." };

  const customer = await prisma.customer.findUnique({ where: { id: u.id } });
  if (!customer?.passwordHash) return { ok: false, message: "Account error." };

  const valid = await verifyPassword(current, customer.passwordHash);
  if (!valid) return { ok: false, message: "Current password is incorrect." };

  await prisma.customer.update({ where: { id: customer.id }, data: { passwordHash: await hashPassword(next) } });
  return { ok: true, message: "Password updated." };
}
