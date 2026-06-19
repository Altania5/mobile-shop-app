import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPhone } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Car,
  ClipboardList,
  Pencil,
  Plus,
} from "lucide-react";
import { WorkOrderStatus } from "@/generated/prisma";
import { DeleteCustomerButton } from "./DeleteCustomerButton";

type Params = { params: Promise<{ id: string }> };

const statusVariant: Record<WorkOrderStatus, "default" | "success" | "warning" | "destructive" | "info"> = {
  PENDING: "warning",
  SCHEDULED: "info",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  INVOICED: "default",
  PAID: "success",
  CANCELLED: "destructive",
};

export default async function CustomerDetailPage({ params }: Params) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: { orderBy: { year: "desc" } },
      workOrders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { vehicle: true },
      },
    },
  });

  if (!customer) notFound();

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <Link
        href="/customers"
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Customers
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {customer.firstName} {customer.lastName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {formatPhone(customer.phone)}
            </span>
            {customer.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {customer.email}
              </span>
            )}
            {customer.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {customer.address && `${customer.address}, `}
                {customer.city}, {customer.state} {customer.zip}
              </span>
            )}
          </div>
          {customer.notes && (
            <p className="mt-2 text-sm text-gray-600 italic">{customer.notes}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/customers/${id}/edit`}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <DeleteCustomerButton customerId={id} customerName={`${customer.firstName} ${customer.lastName}`} />
        </div>
      </div>

      {/* Vehicles */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Car className="h-5 w-5 text-gray-400" />
            Vehicles
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {customer.vehicles.length}
            </span>
          </h2>
          <Link
            href={`/customers/${id}/vehicles/new`}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Link>
        </div>

        {customer.vehicles.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
            <Car className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No vehicles on file</p>
            <Link
              href={`/customers/${id}/vehicles/new`}
              className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              Add a vehicle
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {customer.vehicles.map((v) => (
              <div
                key={v.id}
                className="flex items-start justify-between rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {v.year} {v.make} {v.model}
                    {v.trim && <span className="ml-1 font-normal text-gray-500">{v.trim}</span>}
                  </p>
                  <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                    {v.color && <p>Color: {v.color}</p>}
                    {v.licensePlate && <p>Plate: {v.licensePlate.toUpperCase()}</p>}
                    {v.vin && <p className="font-mono">VIN: {v.vin.toUpperCase()}</p>}
                    {v.mileage && <p>Mileage: {v.mileage.toLocaleString()}</p>}
                  </div>
                </div>
                <Link
                  href={`/customers/${id}/vehicles/${v.id}/edit`}
                  className="ml-3 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Work Orders */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ClipboardList className="h-5 w-5 text-gray-400" />
            Work Orders
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {customer.workOrders.length}
            </span>
          </h2>
          <Link
            href={`/work-orders/new?customerId=${id}`}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            <Plus className="h-4 w-4" />
            New Work Order
          </Link>
        </div>

        {customer.workOrders.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
            <ClipboardList className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No work orders yet</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3">Number</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {customer.workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/work-orders/${wo.id}`}
                        className="font-mono text-blue-600 hover:underline"
                      >
                        {wo.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {wo.vehicle.year} {wo.vehicle.make} {wo.vehicle.model}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                      {wo.description}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[wo.status]}>
                        {wo.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(wo.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
