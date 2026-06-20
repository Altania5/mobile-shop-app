import { prisma } from "@/lib/db";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { WorkOrderStatus } from "@/generated/prisma";
import { StatusBadge } from "@/components/work-orders/StatusBadge";

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const STATUS_TABS: { label: string; value: WorkOrderStatus | "ALL" }[] = [
  { label: "All",         value: "ALL" },
  { label: "Pending",     value: "PENDING" },
  { label: "Scheduled",   value: "SCHEDULED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed",   value: "COMPLETED" },
  { label: "Invoiced",    value: "INVOICED" },
  { label: "Paid",        value: "PAID" },
];

export default async function WorkOrdersPage({ searchParams }: Props) {
  const { status: statusParam = "ALL", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, Number(pageStr));
  const limit = 25;

  const statusFilter = statusParam !== "ALL" ? (statusParam as WorkOrderStatus) : undefined;

  const where = statusFilter ? { status: statusFilter } : {};

  const [workOrders, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: { select: { firstName: true, lastName: true } },
        vehicle:  { select: { year: true, make: true, model: true } },
      },
    }),
    prisma.workOrder.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600">{total}</span>
        </div>
        <Link
          href="/work-orders/new"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Work Order
        </Link>
      </div>

      {/* Status tabs */}
      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {STATUS_TABS.map(({ label, value }) => (
          <Link
            key={value}
            href={`/work-orders?status=${value}`}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              statusParam === value
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Table */}
      {workOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
          <ClipboardList className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">No work orders{statusFilter ? ` with status "${statusParam}"` : " yet"}</p>
          <Link href="/work-orders/new" className="mt-4 text-sm font-medium text-blue-600 hover:underline">
            Create your first work order
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3">Number</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Scheduled</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/work-orders/${wo.id}`} className="font-mono text-blue-600 hover:underline">
                        {wo.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {wo.customer.lastName}, {wo.customer.firstName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {wo.vehicle.year} {wo.vehicle.make} {wo.vehicle.model}
                    </td>
                    <td className="px-4 py-3 max-w-[240px] truncate text-gray-600">{wo.description}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {wo.scheduledAt
                        ? new Date(wo.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={wo.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/work-orders?status=${statusParam}&page=${page - 1}`} className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50">Previous</Link>
                )}
                {page < totalPages && (
                  <Link href={`/work-orders?status=${statusParam}&page=${page + 1}`} className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50">Next</Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
