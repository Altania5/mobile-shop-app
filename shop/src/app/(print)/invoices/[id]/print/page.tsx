import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { LineItemType } from "@/generated/prisma";
import { PrintButton } from "@/components/invoices/PrintButton";

type Params = { params: Promise<{ id: string }> };

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

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function PrintInvoicePage({ params }: Params) {
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
      payments: { orderBy: { processedAt: "asc" } },
    },
  });

  if (!invoice) notFound();

  const shopName  = process.env.NEXT_PUBLIC_SHOP_NAME  ?? "Mobile Mechanic";
  const shopPhone = process.env.NEXT_PUBLIC_SHOP_PHONE ?? "";
  const shopEmail = process.env.NEXT_PUBLIC_SHOP_EMAIL ?? "";

  const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0);
  const balance   = Math.max(0, invoice.total - totalPaid);
  const { customer, workOrder } = invoice;
  const { vehicle } = workOrder;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @page { size: letter; margin: 0.75in; }
      `}</style>

      <PrintButton invoiceId={id} />

      <div className="min-h-screen bg-white p-10 font-sans text-gray-900 max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{shopName}</h1>
            {shopPhone && <p className="text-sm text-gray-500 mt-0.5">{shopPhone}</p>}
            {shopEmail && <p className="text-sm text-gray-500">{shopEmail}</p>}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900 tracking-tight">INVOICE</p>
            <p className="mt-1 font-mono text-sm text-gray-600">{invoice.number}</p>
            <span className={`mt-2 inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide
              ${invoice.status === "PAID"    ? "bg-green-100 text-green-800" :
                invoice.status === "VOID"    ? "bg-red-100 text-red-700" :
                invoice.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                "bg-blue-100 text-blue-700"}`}>
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-6 mb-8 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Date</p>
            <p>{fmtDate(invoice.createdAt)}</p>
          </div>
          {invoice.dueDate && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Due Date</p>
              <p>{fmtDate(invoice.dueDate)}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Work Order</p>
            <p className="font-mono">{workOrder.number}</p>
          </div>
        </div>

        {/* Bill To + Vehicle */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="rounded-lg border border-gray-200 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Bill To</p>
            <p className="font-semibold text-gray-900">{customer.firstName} {customer.lastName}</p>
            {customer.phone && <p className="text-gray-600 mt-0.5">{customer.phone}</p>}
            {customer.email && <p className="text-gray-600">{customer.email}</p>}
            {customer.address && (
              <p className="text-gray-600 mt-1">
                {customer.address}<br />
                {customer.city}, {customer.state} {customer.zip}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Vehicle</p>
            <p className="font-semibold text-gray-900">
              {vehicle.year} {vehicle.make} {vehicle.model}
              {vehicle.trim && ` ${vehicle.trim}`}
            </p>
            {vehicle.color     && <p className="text-gray-600 mt-0.5">{vehicle.color}</p>}
            {vehicle.vin       && <p className="font-mono text-xs text-gray-500 mt-1">VIN: {vehicle.vin}</p>}
            {vehicle.licensePlate && <p className="text-gray-600">Plate: {vehicle.licensePlate}</p>}
            {workOrder.mileageIn && (
              <p className="text-gray-600">
                Mileage: {workOrder.mileageIn.toLocaleString()}
                {workOrder.mileageOut ? ` → ${workOrder.mileageOut.toLocaleString()}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Line items */}
        <table className="w-full text-sm mb-0">
          <thead>
            <tr className="bg-gray-900 text-white text-xs uppercase tracking-wide">
              <th className="py-2.5 px-3 text-left rounded-tl-md w-16">Type</th>
              <th className="py-2.5 px-3 text-left">Description</th>
              <th className="py-2.5 px-3 text-right w-12">Qty</th>
              <th className="py-2.5 px-3 text-right w-24">Unit Price</th>
              <th className="py-2.5 px-3 text-right w-24 rounded-tr-md">Total</th>
            </tr>
          </thead>
          <tbody>
            {workOrder.lineItems.map((item, i) => (
              <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="py-2 px-3 text-xs text-gray-500">{TYPE_LABELS[item.type]}</td>
                <td className="py-2 px-3 text-gray-800">
                  {item.description}
                  {item.partNumber && (
                    <span className="ml-2 font-mono text-xs text-gray-400">{item.partNumber}</span>
                  )}
                </td>
                <td className="py-2 px-3 text-right text-gray-600">{item.quantity}</td>
                <td className="py-2 px-3 text-right text-gray-600">{fmt(item.unitPrice)}</td>
                <td className="py-2 px-3 text-right font-medium text-gray-900">{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mt-0 mb-8">
          <div className="w-64 border border-gray-200 rounded-b-md text-sm">
            <div className="flex justify-between px-3 py-2 border-b border-gray-100 text-gray-600">
              <span>Subtotal</span>
              <span>{fmt(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between px-3 py-2 border-b border-gray-100 text-gray-600">
              <span>Tax ({(invoice.taxRate * 100).toFixed(0)}%)</span>
              <span>{fmt(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between px-3 py-2.5 font-bold text-gray-900 bg-gray-50">
              <span>Total</span>
              <span>{fmt(invoice.total)}</span>
            </div>
            {totalPaid > 0 && (
              <>
                <div className="flex justify-between px-3 py-2 border-t border-gray-100 text-green-700">
                  <span>Paid</span>
                  <span>{fmt(totalPaid)}</span>
                </div>
                <div className="flex justify-between px-3 py-2.5 font-bold text-gray-900 bg-gray-50 border-t border-gray-200">
                  <span>Balance Due</span>
                  <span>{fmt(balance)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Work performed */}
        {workOrder.workPerformed && (
          <div className="mb-6 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Work Performed</p>
            <p className="text-gray-700 whitespace-pre-wrap">{workOrder.workPerformed}</p>
          </div>
        )}

        {/* Recommendations */}
        {workOrder.recommendations && (
          <div className="mb-6 text-sm rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700 mb-1">Recommendations</p>
            <p className="text-yellow-800 whitespace-pre-wrap">{workOrder.recommendations}</p>
          </div>
        )}

        {/* Payment history */}
        {invoice.payments.length > 0 && (
          <div className="mb-6 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Payments Received</p>
            <table className="w-full">
              <thead className="text-left text-xs text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="pb-1 pr-4">Date</th>
                  <th className="pb-1 pr-4">Method</th>
                  <th className="pb-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="py-1.5 pr-4 text-gray-600">{fmtDate(p.processedAt)}</td>
                    <td className="py-1.5 pr-4 text-gray-600">{p.method}</td>
                    <td className="py-1.5 text-right font-medium text-gray-900">{fmt(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Notes</p>
            <p className="text-gray-700">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
          Thank you for your business! · {shopName}
          {shopPhone && ` · ${shopPhone}`}
        </div>
      </div>
    </>
  );
}
