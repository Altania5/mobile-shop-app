import { CustomerForm } from "@/components/customers/CustomerForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewCustomerPage() {
  return (
    <div className="p-8 max-w-2xl">
      <Link
        href="/customers"
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Customers
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Customer</h1>
      <CustomerForm />
    </div>
  );
}
