"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PaymentMethod } from "@/generated/prisma";

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH",   label: "Cash" },
  { value: "CHECK",  label: "Check" },
  { value: "CARD",   label: "Card (in person)" },
  { value: "VENMO",  label: "Venmo" },
  { value: "ZELLE",  label: "Zelle" },
  { value: "SQUARE", label: "Square (online)" },
  { value: "OTHER",  label: "Other" },
];

interface Props {
  invoiceId: string;
  remaining: number;
}

export function RecordPaymentForm({ invoiceId, remaining }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState(remaining.toFixed(2));
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { alert("Enter a valid amount"); return; }

    setSaving(true);
    const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amt, method, note: note || undefined }),
    });

    setSaving(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error ?? "Failed to record payment.");
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Record Payment
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
      <h3 className="font-medium text-gray-900 text-sm">Record Payment</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Amount ($)</label>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0.01"
            step="0.01"
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Method</label>
          <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className="h-8">
            {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Note (optional)</label>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Check #1234, confirmation code…"
          className="h-8 text-sm"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={saving}>{saving ? "Saving…" : "Record"}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
