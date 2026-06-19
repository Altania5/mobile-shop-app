import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { InspectionBoard } from "@/components/inspections/InspectionBoard";
import { INSPECTION_TEMPLATE } from "@/lib/inspection-template";

type Params = { params: Promise<{ id: string }> };

export default async function InspectionPage({ params }: Params) {
  const { id } = await params;

  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: {
      workOrder: { include: { vehicle: true, customer: true } },
      items: {
        include: { photos: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  if (!inspection) notFound();

  const { workOrder } = inspection;
  const { vehicle, customer } = workOrder;

  return (
    <div className="p-6 max-w-3xl">
      <Link
        href={`/work-orders/${workOrder.id}`}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ChevronLeft className="h-4 w-4" />
        {workOrder.number}
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Multi-Point Inspection</h1>
        <p className="text-sm text-gray-500 mt-1">
          {vehicle.year} {vehicle.make} {vehicle.model} ·{" "}
          {customer.firstName} {customer.lastName}
        </p>
      </div>

      <InspectionBoard
        inspection={inspection}
        template={INSPECTION_TEMPLATE}
        inspectionId={id}
      />
    </div>
  );
}
