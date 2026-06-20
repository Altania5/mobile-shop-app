"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOutAction } from "@/app/actions";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  Wrench,
  LogOut,
  ShieldCheck,
  Inbox,
  Newspaper,
  MessageSquareQuote,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",        label: "Dashboard",   icon: LayoutDashboard },
  { href: "/booking-requests", label: "Bookings",    icon: Inbox           },
  { href: "/customers",        label: "Customers",   icon: Users           },
  { href: "/work-orders",      label: "Work Orders", icon: ClipboardList   },
  { href: "/invoices",         label: "Invoices",    icon: FileText        },
  { href: "/admin/blog",       label: "Blog",        icon: Newspaper       },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as { name?: string; email?: string; role?: string } | undefined;
  const isAdmin = user?.role === "ADMIN";

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-gray-50">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <Wrench className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-gray-900">Shop Manager</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}

          {isAdmin && (
            <li>
              <Link
                href="/admin/users"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Team
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* User + logout */}
      <div className="border-t border-gray-200 p-3">
        {user && (
          <div className="mb-2 px-2">
            <p className="text-xs font-medium text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.role}</p>
          </div>
        )}
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
