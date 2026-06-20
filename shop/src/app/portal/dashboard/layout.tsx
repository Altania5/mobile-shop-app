import Link from "next/link";
import { redirect } from "next/navigation";
import { Wrench } from "lucide-react";
import { auth } from "@/auth";
import { signOutCustomerAction } from "@/app/portal/actions";

export default async function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as { name?: string; userType?: string } | undefined;
  if (!user || user.userType !== "customer") redirect("/portal/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1e2833] text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[#d4af37]" />
            <span className="font-bold">Hard Work <span className="text-[#d4af37]">Mobile</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-300 sm:inline">{user.name}</span>
            <form action={signOutCustomerAction}>
              <button type="submit" className="rounded-md border border-white/25 px-3 py-1.5 text-sm font-medium text-white hover:border-[#d4af37] hover:text-[#d4af37]">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
