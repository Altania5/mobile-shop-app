import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { VehicleForm } from "@/components/vehicles/VehicleForm";

type Params = { params: Promise<{ id: string }> };

export default async function NewVehiclePage({ params }: Params) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href={`/customers/${id}`}
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to {customer.firstName} {customer.lastName}
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Add Vehicle</h1>
      <p className="mb-6 text-sm text-gray-500">
        Adding vehicle for {customer.firstName} {customer.lastName}
      </p>
      <VehicleForm customerId={id} />
    </div>
  );
}
