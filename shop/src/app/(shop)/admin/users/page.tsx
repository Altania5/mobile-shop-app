import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { UsersManager } from "@/components/admin/UsersManager";

export default async function UsersPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Team</h1>
      <UsersManager initialUsers={users} />
    </div>
  );
}
