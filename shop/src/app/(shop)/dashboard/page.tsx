import { prisma } from "@/lib/db";
import Link from "next/link";
import { Users, ClipboardList, FileText, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const WO_STATUS_LABEL: Record<string, string> = {
  PENDING:     "Pending",
  SCHEDULED:   "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED:   "Completed",
  INVOICED:    "Invoiced",
  PAID:        "Paid",
  CANCELLED:   "Cancelled",
};

const WO_STATUS_COLOR: Record<string, string> = {
  PENDING:     "bg-gray-200 text-gray-700",
  SCHEDULED:   "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED:   "bg-green-100 text-green-700",
  INVOICED:    "bg-purple-100 text-purple-700",
  PAID:        "bg-green-200 text-green-800",
  CANCELLED:   "bg-red-100 text-red-700",
};

export default async function DashboardPage() {
  const now = new Date();
  const startOfMonth    = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    revenueThisMonth,
    revenueLastMonth,
    openInvoices,
    overdueInvoices,
    customerCount,
    woByStatus,
    recentWorkOrders,
    recentInvoices,
  ] = await Promise.all([
    // Revenue this month (sum of completed payments)
    prisma.payment.aggregate({
      where: { status: "COMPLETED", processedAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    // Revenue last month
    prisma.payment.aggregate({
      where: { status: "COMPLETED", processedAt: { gte: startOfLastMonth, lt: startOfMonth } },
      _sum: { amount: true },
    }),
    // Open invoices with their payments to calculate balance
    prisma.invoice.findMany({
      where: { status: { in: ["SENT", "PARTIAL", "OVERDUE"] } },
      include: { payments: { select: { amount: true } } },
    }),
    // Overdue invoices
    prisma.invoice.findMany({
      where: { status: "OVERDUE" },
      include: { payments: { select: { amount: true } } },
    }),
    // Total customers
    prisma.customer.count(),
    // Work orders grouped by status
    prisma.workOrder.groupBy({ by: ["status"], _count: { _all: true } }),
    // Recent work orders
    prisma.workOrder.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { customer: true, vehicle: true },
    }),
    // Recent invoices
    prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
  ]);

  const thisMonthRevenue = revenueThisMonth._sum.amount ?? 0;
  const lastMonthRevenue = revenueLastMonth._sum.amount ?? 0;
  const revenueDelta = thisMonthRevenue - lastMonthRevenue;

  const outstandingBalance = openInvoices.reduce((sum, inv) => {
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    return sum + Math.max(0, inv.total - paid);
  }, 0);

  const overdueBalance = overdueInvoices.reduce((sum, inv) => {
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    return sum + Math.max(0, inv.total - paid);
  }, 0);

  const openWoCount = woByStatus
    .filter((w) => ["PENDING", "SCHEDULED", "IN_PROGRESS"].includes(w.status))
    .reduce((s, w) => s + w._count._all, 0);

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400">
          {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <div className="rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Revenue This Month</p>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(thisMonthRevenue)}</p>
          <p className={`mt-1 text-xs ${revenueDelta >= 0 ? "text-green-600" : "text-red-500"}`}>
            {revenueDelta >= 0 ? "+" : ""}{fmt(revenueDelta)} vs last month
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Outstanding</p>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(outstandingBalance)}</p>
          <p className="mt-1 text-xs text-gray-400">{openInvoices.length} open invoice{openInvoices.length !== 1 ? "s" : ""}</p>
        </div>

        <Link href="/invoices?status=OVERDUE" className="rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Overdue</p>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(overdueBalance)}</p>
          <p className="mt-1 text-xs text-gray-400">{overdueInvoices.length} invoice{overdueInvoices.length !== 1 ? "s" : ""} past due</p>
        </Link>

        <Link href="/customers" className="rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Customers</p>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{customerCount}</p>
          <p className="mt-1 text-xs text-gray-400">total on file</p>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Work order pipeline */}
        <div className="rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Work Order Pipeline</h2>
            <Link href="/work-orders" className="text-xs text-blue-600 hover:underline">{openWoCount} open</Link>
          </div>
          <div className="space-y-2">
            {["PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "INVOICED", "PAID", "CANCELLED"].map((status) => {
              const count = woByStatus.find((w) => w.status === status)?._count._all ?? 0;
              if (count === 0) return null;
              return (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${WO_STATUS_COLOR[status]}`}>
                    {WO_STATUS_LABEL[status]}
                  </span>
                  <span className="font-semibold text-gray-800">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent work orders */}
        <div className="rounded-lg border border-gray-200 p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Recent Work Orders</h2>
            <Link href="/work-orders" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentWorkOrders.map((wo) => (
              <Link
                key={wo.id}
                href={`/work-orders/${wo.id}`}
                className="flex items-center justify-between rounded-md px-3 py-2.5 hover:bg-gray-50 -mx-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {wo.customer.firstName} {wo.customer.lastName}
                    <span className="ml-2 font-mono text-xs text-gray-400">{wo.number}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {wo.vehicle.year} {wo.vehicle.make} {wo.vehicle.model}
                  </p>
                </div>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${WO_STATUS_COLOR[wo.status]}`}>
                  {WO_STATUS_LABEL[wo.status]}
                </span>
              </Link>
            ))}
            {recentWorkOrders.length === 0 && (
              <p className="text-sm text-gray-400 italic">No work orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="rounded-lg border border-gray-200 p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Recent Invoices</h2>
          <Link href="/invoices" className="text-xs text-blue-600 hover:underline">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-400 border-b border-gray-100">
            <tr>
              <th className="pb-2 pr-4">Invoice</th>
              <th className="pb-2 pr-4">Customer</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentInvoices.map((inv) => (
              <tr key={inv.id}>
                <td className="py-2 pr-4">
                  <Link href={`/invoices/${inv.id}`} className="font-mono text-blue-600 hover:underline">
                    {inv.number}
                  </Link>
                </td>
                <td className="py-2 pr-4 text-gray-700">
                  {inv.customer.firstName} {inv.customer.lastName}
                </td>
                <td className="py-2 pr-4">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    inv.status === "PAID"    ? "bg-green-100 text-green-700" :
                    inv.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                    inv.status === "SENT"    ? "bg-blue-100 text-blue-700" :
                    inv.status === "PARTIAL" ? "bg-yellow-100 text-yellow-700" :
                    inv.status === "VOID"    ? "bg-gray-100 text-gray-500" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="py-2 text-right font-medium text-gray-900">{fmt(inv.total)}</td>
              </tr>
            ))}
            {recentInvoices.length === 0 && (
              <tr><td colSpan={4} className="py-3 text-sm text-gray-400 italic">No invoices yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quick actions */}
      <div className="rounded-lg border border-gray-200 p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/customers/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + New Customer
          </Link>
          <Link href="/work-orders/new" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            + New Work Order
          </Link>
        </div>
      </div>
    </div>
  );
}
