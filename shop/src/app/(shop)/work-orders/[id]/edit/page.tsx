import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { WorkOrderEditForm } from "./WorkOrderEditForm";

type Params = { params: Promise<{ id: string }> };

export default async function EditWorkOrderPage({ params }: Params) {
  const { id } = await params;

  const wo = await prisma.workOrder.findUnique({
    where: { id },
    include: { customer: true, vehicle: true },
  });

  if (!wo) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <Link href={`/work-orders/${id}`} className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft className="h-4 w-4" />
        Back to {wo.number}
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Edit Work Order</h1>
      <p className="mb-6 text-sm text-gray-500">
        {wo.vehicle.year} {wo.vehicle.make} {wo.vehicle.model} · {wo.customer.firstName} {wo.customer.lastName}
      </p>
      <WorkOrderEditForm
        workOrderId={id}
        defaultValues={{
          description: wo.description,
          technician: wo.technician ?? "",
          serviceLocation: wo.serviceLocation ?? "",
          scheduledAt: wo.scheduledAt ? new Date(wo.scheduledAt).toISOString().slice(0, 16) : "",
          mileageIn: wo.mileageIn ?? undefined,
          mileageOut: wo.mileageOut ?? undefined,
          internalNotes: wo.internalNotes ?? "",
          customerNotes: wo.customerNotes ?? "",
        }}
      />
    </div>
  );
}
