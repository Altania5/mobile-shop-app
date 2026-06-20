"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginCustomerAction } from "./actions";
import { PortalAuthShell, portalInputCls, portalButtonCls } from "@/components/portal/PortalAuthShell";

export default function PortalLoginPage() {
  const [error, formAction, pending] = useActionState(loginCustomerAction, undefined);

  return (
    <PortalAuthShell
      title="Sign in to your account"
      footer={
        <>
          New here?{" "}
          <Link href="/portal/register" className="font-semibold text-[#1e2833] hover:underline">Create an account</Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input name="email" type="email" required autoComplete="email" className={portalInputCls} />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Link href="/portal/forgot-password" className="text-xs text-gray-500 hover:underline">Forgot?</Link>
          </div>
          <input name="password" type="password" required autoComplete="current-password" className={portalInputCls} />
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className={portalButtonCls}>
          {pending ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </PortalAuthShell>
  );
}
