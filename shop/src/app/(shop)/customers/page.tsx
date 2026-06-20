import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatPhone } from "@/lib/utils";
import { Users, Plus, Search } from "lucide-react";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function CustomersPage({ searchParams }: Props) {
  const { q = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, Number(pageStr));
  const limit = 25;

  const where = q
    ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" as const } },
          { lastName: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { vehicles: true, workOrders: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600">
            {total}
          </span>
        </div>
        <Link
          href="/customers/new"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Customer
        </Link>
      </div>

      {/* Search */}
      <form className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name, phone, or email…"
            className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>

      {/* Table */}
      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">
            {q ? `No customers matching "${q}"` : "No customers yet"}
          </p>
          {!q && (
            <Link
              href="/customers/new"
              className="mt-4 text-sm font-medium text-blue-600 hover:underline"
            >
              Add your first customer
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3 text-center">Vehicles</th>
                  <th className="px-4 py-3 text-center">Work Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/customers/${c.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {c.lastName}, {c.firstName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatPhone(c.phone)}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.city ? `${c.city}, ${c.state ?? ""}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {c._count.vehicles}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {c._count.workOrders}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/customers?q=${q}&page=${page - 1}`}
                    className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/customers?q=${q}&page=${page + 1}`}
                    className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
