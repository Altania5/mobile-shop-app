import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Phone, Mail, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SendInvoiceButton } from "@/components/invoices/SendInvoiceButton";
import { RecordPaymentForm } from "@/components/invoices/RecordPaymentForm";
import { VoidInvoiceButton } from "@/components/invoices/VoidInvoiceButton";
import { TerminalButton } from "@/components/invoices/TerminalButton";
import { formatPhone } from "@/lib/utils";
import { InvoiceStatus, LineItemType } from "@/generated/prisma";

type Params = { params: Promise<{ id: string }> };

const STATUS_VARIANT: Record<InvoiceStatus, "default" | "success" | "warning" | "destructive" | "info"> = {
  DRAFT:   "default",
  SENT:    "info",
  PARTIAL: "warning",
  PAID:    "success",
  OVERDUE: "destructive",
  VOID:    "destructive",
};

const TYPE_LABELS: Record<LineItemType, string> = {
  LABOR:  "Labor",
  PART:   "Part",
  FLUID:  "Fluid",
  SUBLET: "Sublet",
  FEE:    "Fee",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default async function InvoiceDetailPage({ params }: Params) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      workOrder: {
        include: {
          vehicle: true,
          lineItems: { orderBy: [{ type: "asc" }, { createdAt: "asc" }] },
        },
      },
      payments: { orderBy: { processedAt: "desc" } },
    },
  });

  if (!invoice) notFound();

  const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, invoice.total - totalPaid);
  const canAct = !["PAID", "VOID"].includes(invoice.status);

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/invoices" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft className="h-4 w-4" />
        Invoices
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-bold text-gray-900">{invoice.number}</h1>
            <Badge variant={STATUS_VARIANT[invoice.status]}>{invoice.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Created {new Date(invoice.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            {invoice.dueDate && ` · Due ${new Date(invoice.dueDate).toLocaleDateString()}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canAct && (
            <>
              <TerminalButton invoiceId={id} />
              <SendInvoiceButton
                invoiceId={id}
                alreadySent={!!invoice.squareInvoiceId}
                paymentUrl={invoice.squareInvoiceUrl}
              />
              <VoidInvoiceButton invoiceId={id} />
            </>
          )}
          <Link
            href={`/invoices/${id}/print`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Print / PDF
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: line items + payments */}
        <div className="lg:col-span-2 space-y-6">

          {/* Line items */}
          <section className="rounded-lg border border-gray-200 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Services & Parts</h2>
              <Link href={`/work-orders/${invoice.workOrderId}`} className="text-xs text-blue-600 hover:underline">
                View Work Order {invoice.workOrder.number}
              </Link>
            </div>

            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 text-left text-xs text-gray-500">
                <tr>
                  <th className="pb-2 pr-4 w-16">Type</th>
                  <th className="pb-2 pr-4">Description</th>
                  <th className="pb-2 pr-4 w-16 text-right">Qty</th>
                  <th className="pb-2 pr-4 w-24 text-right">Unit</th>
                  <th className="pb-2 w-24 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoice.workOrder.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-4">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                        {TYPE_LABELS[item.type]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-800">
                      {item.description}
                      {item.partNumber && <span className="ml-2 font-mono text-xs text-gray-400">{item.partNumber}</span>}
                    </td>
                    <td className="py-2 pr-4 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-2 pr-4 text-right text-gray-600">{fmt(item.unitPrice)}</td>
                    <td className="py-2 text-right font-medium text-gray-900">{fmt(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 border-t border-gray-200 pt-4 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{fmt(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax ({(invoice.taxRate * 100).toFixed(0)}%)</span>
                <span>{fmt(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-200">
                <span>Total</span>
                <span>{fmt(invoice.total)}</span>
              </div>
              {totalPaid > 0 && (
                <>
                  <div className="flex justify-between text-green-700">
                    <span>Paid</span>
                    <span>{fmt(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Balance Due</span>
                    <span>{fmt(remaining)}</span>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Payments */}
          <section className="rounded-lg border border-gray-200 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Payments</h2>

            {invoice.payments.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No payments recorded</p>
            ) : (
              <table className="w-full text-sm mb-4">
                <thead className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Method</th>
                    <th className="pb-2 pr-4">Note</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoice.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 pr-4 text-gray-500">
                        {new Date(p.processedAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4 text-gray-700">{p.method}</td>
                      <td className="py-2 pr-4 text-gray-500">{p.note ?? "—"}</td>
                      <td className="py-2 text-right font-medium text-gray-900">{fmt(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {canAct && remaining > 0 && (
              <RecordPaymentForm invoiceId={id} remaining={remaining} />
            )}
          </section>
        </div>

        {/* Right: customer + vehicle + Square link */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Bill To</h3>
            <Link href={`/customers/${invoice.customer.id}`} className="font-semibold text-blue-600 hover:underline">
              {invoice.customer.firstName} {invoice.customer.lastName}
            </Link>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                {formatPhone(invoice.customer.phone)}
              </p>
              {invoice.customer.email && (
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {invoice.customer.email}
                </p>
              )}
              {invoice.customer.address && (
                <p className="text-xs text-gray-400">
                  {invoice.customer.address}<br />
                  {invoice.customer.city}, {invoice.customer.state} {invoice.customer.zip}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Vehicle</h3>
            <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Car className="h-4 w-4 text-gray-400" />
              {invoice.workOrder.vehicle.year} {invoice.workOrder.vehicle.make} {invoice.workOrder.vehicle.model}
            </p>
          </div>

          {invoice.squareInvoiceUrl && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
              <p className="font-medium text-blue-800 mb-2">Square Payment Link</p>
              <a
                href={invoice.squareInvoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all text-xs"
              >
                {invoice.squareInvoiceUrl}
              </a>
            </div>
          )}

          {invoice.notes && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-yellow-700">Notes</h3>
              <p className="text-sm text-yellow-800">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
