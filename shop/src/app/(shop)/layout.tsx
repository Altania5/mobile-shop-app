import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as { role?: string; userType?: string } | undefined;
  // Staff = explicit userType, or a legacy token that has a role but isn't a customer.
  const isStaff = !!user && (user.userType === "staff" || (!!user.role && user.userType !== "customer"));
  if (!isStaff) redirect("/login");

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-white">{children}</main>
    </div>
  );
}
