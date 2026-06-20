import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CustomerForm } from "@/components/customers/CustomerForm";

type Params = { params: Promise<{ id: string }> };

export default async function EditCustomerPage({ params }: Params) {
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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Customer</h1>
      <CustomerForm
        customerId={id}
        defaultValues={{
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email ?? "",
          phone: customer.phone,
          address: customer.address ?? "",
          city: customer.city ?? "",
          state: customer.state ?? "",
          zip: customer.zip ?? "",
          notes: customer.notes ?? "",
        }}
      />
    </div>
  );
}
