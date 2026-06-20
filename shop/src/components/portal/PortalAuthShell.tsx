import Link from "next/link";
import { Wrench } from "lucide-react";

export function PortalAuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-[#d4af37]" />
            <span className="text-xl font-bold text-[#1e2833]">Hard Work Mobile</span>
          </div>
          <p className="text-sm text-gray-500">{subtitle ?? "Customer Portal"}</p>
        </Link>
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-5 text-lg font-bold text-gray-900">{title}</h1>
          {children}
        </div>
        {footer && <div className="mt-5 text-center text-sm text-gray-500">{footer}</div>}
      </div>
    </div>
  );
}

export const portalInputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37]";

export const portalButtonCls =
  "w-full rounded-md bg-[#1e2833] py-2.5 text-sm font-semibold text-white hover:bg-[#2a3441] disabled:opacity-60";
