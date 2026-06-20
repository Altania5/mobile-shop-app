"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VoidInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleVoid() {
    if (!confirm("Void this invoice? This cannot be undone.")) return;
    setLoading(true);
    const res = await fetch(`/api/invoices/${invoiceId}/void`, { method: "POST" });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert("Failed to void invoice.");
  }

  return (
    <button
      onClick={handleVoid}
      disabled={loading}
      className="text-sm text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
    >
      {loading ? "Voiding…" : "Void Invoice"}
    </button>
  );
}
