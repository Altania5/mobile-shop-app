import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  searchParams: Promise<{ customerId?: string; vehicleId?: string }>;
}

export default async function NewWorkOrderPage({ searchParams }: Props) {
  const { customerId, vehicleId } = await searchParams;

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/work-orders" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft className="h-4 w-4" />
        Work Orders
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Work Order</h1>
      <WorkOrderForm defaultCustomerId={customerId} defaultVehicleId={vehicleId} />
    </div>
  );
}
