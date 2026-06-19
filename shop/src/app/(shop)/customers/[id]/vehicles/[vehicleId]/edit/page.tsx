import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { VehicleForm } from "@/components/vehicles/VehicleForm";

type Params = { params: Promise<{ id: string; vehicleId: string }> };

export default async function EditVehiclePage({ params }: Params) {
  const { id: customerId, vehicleId } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { customer: true },
  });

  if (!vehicle || vehicle.customerId !== customerId) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href={`/customers/${customerId}`}
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to {vehicle.customer.firstName} {vehicle.customer.lastName}
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Edit {vehicle.year} {vehicle.make} {vehicle.model}
      </h1>
      <VehicleForm
        customerId={customerId}
        vehicleId={vehicleId}
        defaultValues={{
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          trim: vehicle.trim ?? "",
          vin: vehicle.vin ?? "",
          licensePlate: vehicle.licensePlate ?? "",
          color: vehicle.color ?? "",
          mileage: vehicle.mileage ?? undefined,
          notes: vehicle.notes ?? "",
        }}
      />
    </div>
  );
}
