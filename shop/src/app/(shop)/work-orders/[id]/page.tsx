import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Phone, Car, MapPin, Clock, Pencil, User, ClipboardCheck } from "lucide-react";
import { StatusBadge } from "@/components/work-orders/StatusBadge";
import { StatusChanger } from "@/components/work-orders/StatusChanger";
import { LineItemsEditor } from "@/components/work-orders/LineItemsEditor";
import { WorkOrderNotes } from "./WorkOrderNotes";
import { StartInspectionButton } from "@/components/inspections/StartInspectionButton";
import { formatPhone } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

const EDITABLE_STATUSES = new Set(["PENDING", "SCHEDULED", "IN_PROGRESS"]);

export default async function WorkOrderDetailPage({ params }: Params) {
  const { id } = await params;

  const wo = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      lineItems: { orderBy: [{ type: "asc" }, { createdAt: "asc" }] },
      invoice: { select: { id: true, status: true, total: true } },
      inspection: { select: { id: true } },
    },
  });

  if (!wo) notFound();

  const editable = EDITABLE_STATUSES.has(wo.status);

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <Link href="/work-orders" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft className="h-4 w-4" />
        Work Orders
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-bold text-gray-900">{wo.number}</h1>
            <StatusBadge status={wo.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Created {new Date(wo.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editable && (
            <Link
              href={`/work-orders/${id}/edit`}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Details
            </Link>
          )}
          <StatusChanger workOrderId={id} currentStatus={wo.status} />
          <StartInspectionButton
            workOrderId={id}
            existingInspectionId={wo.inspection?.id ?? null}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer complaint */}
          <section className="rounded-lg border border-gray-200 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Customer Complaint</h2>
            <p className="text-gray-800">{wo.description}</p>
          </section>

          {/* Tech notes — inline editable */}
          <WorkOrderNotes
            workOrderId={id}
            diagnosis={wo.diagnosis ?? ""}
            workPerformed={wo.workPerformed ?? ""}
            recommendations={wo.recommendations ?? ""}
            editable={editable}
          />

          {/* Line Items */}
          <section className="rounded-lg border border-gray-200 p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Parts & Labor</h2>
            <LineItemsEditor
              workOrderId={id}
              initialItems={wo.lineItems}
              editable={editable}
            />
          </section>

          {/* Invoice link */}
          {wo.invoice && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
              <span className="font-medium text-green-800">Invoice created — </span>
              <Link href={`/invoices/${wo.invoice.id}`} className="text-green-700 underline">
                View Invoice
              </Link>
            </div>
          )}
        </div>

        {/* Right: sidebar details */}
        <div className="space-y-4">

          {/* Customer */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</h3>
            <Link href={`/customers/${wo.customer.id}`} className="font-semibold text-blue-600 hover:underline">
              {wo.customer.firstName} {wo.customer.lastName}
            </Link>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                {formatPhone(wo.customer.phone)}
              </p>
              {wo.customer.email && <p className="truncate">{wo.customer.email}</p>}
            </div>
          </div>

          {/* Vehicle */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Vehicle</h3>
            <div className="flex items-start gap-2">
              <Car className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div className="text-sm">
                <p className="font-semibold text-gray-900">
                  {wo.vehicle.year} {wo.vehicle.make} {wo.vehicle.model}
                  {wo.vehicle.trim && <span className="ml-1 font-normal text-gray-500">{wo.vehicle.trim}</span>}
                </p>
                {wo.vehicle.licensePlate && <p className="text-gray-500">Plate: {wo.vehicle.licensePlate.toUpperCase()}</p>}
                {wo.vehicle.vin && <p className="font-mono text-xs text-gray-400">VIN: {wo.vehicle.vin.toUpperCase()}</p>}
                {wo.mileageIn && <p className="text-gray-500">Mileage in: {wo.mileageIn.toLocaleString()}</p>}
                {wo.mileageOut && <p className="text-gray-500">Mileage out: {wo.mileageOut.toLocaleString()}</p>}
              </div>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="rounded-lg border border-gray-200 p-4 space-y-2">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Job Details</h3>
            {wo.scheduledAt && (
              <p className="flex items-center gap-1.5 text-sm text-gray-700">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                {new Date(wo.scheduledAt).toLocaleString(undefined, {
                  weekday: "short", month: "short", day: "numeric",
                  hour: "numeric", minute: "2-digit",
                })}
              </p>
            )}
            {wo.serviceLocation && (
              <p className="flex items-start gap-1.5 text-sm text-gray-700">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                {wo.serviceLocation}
              </p>
            )}
            {wo.technician && (
              <p className="flex items-center gap-1.5 text-sm text-gray-700">
                <User className="h-3.5 w-3.5 text-gray-400" />
                {wo.technician}
              </p>
            )}
          </div>

          {/* Internal notes */}
          {wo.internalNotes && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-yellow-700">Internal Notes</h3>
              <p className="text-sm text-yellow-800">{wo.internalNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
