"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteCustomerButton({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (
      !confirm(
        `Delete ${customerName}? This will also delete their vehicles and cannot be undone.`
      )
    )
      return;

    const res = await fetch(`/api/customers/${customerId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/customers");
      router.refresh();
    } else {
      alert("Failed to delete customer.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </button>
  );
}
