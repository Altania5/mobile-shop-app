"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "./actions";
import { PortalAuthShell, portalInputCls, portalButtonCls } from "@/components/portal/PortalAuthShell";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, { done: false });

  return (
    <PortalAuthShell
      title="Reset your password"
      footer={<Link href="/portal/login" className="font-semibold text-[#1e2833] hover:underline">Back to sign in</Link>}
    >
      {state.done ? (
        <p className="text-sm text-gray-600">
          If an account exists for that email, we&apos;ve sent a password reset link. It may take a minute to arrive.
        </p>
      ) : (
        <form action={formAction} className="space-y-4">
          <p className="text-sm text-gray-600">Enter your email and we&apos;ll send you a reset link.</p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" required autoComplete="email" className={portalInputCls} />
          </div>
          <button type="submit" disabled={pending} className={portalButtonCls}>
            {pending ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      )}
    </PortalAuthShell>
  );
}
