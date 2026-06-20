"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOutAction() {
  (await cookies()).delete("authjs.session-token");
  redirect("/login");
}
