"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";

interface Props {
  workOrderId: string;
  existingInspectionId: string | null;
}

export function StartInspectionButton({ workOrderId, existingInspectionId }: Props) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (existingInspectionId) {
      router.push(`/inspections/${existingInspectionId}`);
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`/api/work-orders/${workOrderId}/inspection`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/inspections/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
    >
      <ClipboardCheck className="h-4 w-4" />
      {loading ? "Starting…" : existingInspectionId ? "View Inspection" : "Start Inspection"}
    </button>
  );
}
