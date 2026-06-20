"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerCustomerAction } from "./actions";
import { PortalAuthShell, portalInputCls, portalButtonCls } from "@/components/portal/PortalAuthShell";

export default function PortalRegisterPage() {
  const [error, formAction, pending] = useActionState(registerCustomerAction, undefined);

  return (
    <PortalAuthShell
      title="Create your account"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/portal/login" className="font-semibold text-[#1e2833] hover:underline">Sign in</Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">First name</label>
            <input name="firstName" required autoComplete="given-name" className={portalInputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Last name</label>
            <input name="lastName" required autoComplete="family-name" className={portalInputCls} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input name="email" type="email" required autoComplete="email" className={portalInputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
          <input name="phone" type="tel" required autoComplete="tel" className={portalInputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={portalInputCls} />
          <p className="mt-1 text-xs text-gray-400">At least 8 characters.</p>
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className={portalButtonCls}>
          {pending ? "Creating account…" : "Create Account"}
        </button>
      </form>
    </PortalAuthShell>
  );
}
