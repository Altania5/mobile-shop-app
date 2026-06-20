"use client";

import { use } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "./actions";
import { PortalAuthShell, portalInputCls, portalButtonCls } from "@/components/portal/PortalAuthShell";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [error, formAction, pending] = useActionState(resetPasswordAction, undefined);

  return (
    <PortalAuthShell
      title="Set a new password"
      footer={<Link href="/portal/login" className="font-semibold text-[#1e2833] hover:underline">Back to sign in</Link>}
    >
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">New password</label>
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={portalInputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirm password</label>
          <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={portalInputCls} />
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className={portalButtonCls}>
          {pending ? "Saving…" : "Reset Password"}
        </button>
      </form>
    </PortalAuthShell>
  );
}
