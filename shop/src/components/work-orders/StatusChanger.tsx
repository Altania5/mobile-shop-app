"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WorkOrderStatus } from "@/generated/prisma";

const NEXT_STATUS: Partial<Record<WorkOrderStatus, WorkOrderStatus>> = {
  PENDING:     "SCHEDULED",
  SCHEDULED:   "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
};

const NEXT_LABEL: Partial<Record<WorkOrderStatus, string>> = {
  PENDING:     "Mark Scheduled",
  SCHEDULED:   "Start Job",
  IN_PROGRESS: "Mark Complete",
};

export function StatusChanger({
  workOrderId,
  currentStatus,
}: {
  workOrderId: string;
  currentStatus: WorkOrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const nextStatus = NEXT_STATUS[currentStatus];
  const label = NEXT_LABEL[currentStatus];

  async function handleCancel() {
    if (!confirm("Cancel this work order?")) return;
    setLoading(true);
    await fetch(`/api/work-orders/${workOrderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    router.refresh();
    setLoading(false);
  }

  async function advance() {
    if (!nextStatus) return;
    // "Create Invoice" will be wired to the invoices module — for now just advance status
    setLoading(true);
    await fetch(`/api/work-orders/${workOrderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  async function createInvoice() {
    setLoading(true);
    const res = await fetch(`/api/work-orders/${workOrderId}/invoice`, { method: "POST" });
    if (res.ok) {
      const inv = await res.json();
      router.push(`/invoices/${inv.id}`);
    } else {
      const err = await res.json();
      alert(err.error ?? "Failed to create invoice.");
    }
    setLoading(false);
  }

  if (currentStatus === "PAID" || currentStatus === "CANCELLED") return null;

  return (
    <div className="flex items-center gap-2">
      {currentStatus === "COMPLETED" && (
        <Button onClick={createInvoice} disabled={loading}>
          {loading ? "Creating…" : "Create Invoice"}
        </Button>
      )}
      {nextStatus && label && currentStatus !== "COMPLETED" && (
        <Button onClick={advance} disabled={loading}>
          {loading ? "Updating…" : label}
        </Button>
      )}
      {!["INVOICED", "COMPLETED"].includes(currentStatus) && (
        <Button variant="ghost" onClick={handleCancel} disabled={loading} className="text-red-600 hover:bg-red-50 hover:text-red-700">
          Cancel Job
        </Button>
      )}
    </div>
  );
}
