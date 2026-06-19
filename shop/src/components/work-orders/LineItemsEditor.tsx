"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { LineItemType } from "@/generated/prisma";

interface LineItem {
  id: string;
  type: LineItemType;
  description: string;
  partNumber: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Props {
  workOrderId: string;
  initialItems: LineItem[];
  editable: boolean;
}

const TYPE_LABELS: Record<LineItemType, string> = {
  LABOR: "Labor",
  PART: "Part",
  FLUID: "Fluid",
  SUBLET: "Sublet",
  FEE: "Fee",
};

const DEFAULT_LABOR_RATE = 95;

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function LineItemsEditor({ workOrderId, initialItems, editable }: Props) {
  const [items, setItems] = useState<LineItem[]>(initialItems);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  // Draft row state
  const [draft, setDraft] = useState({
    type: "LABOR" as LineItemType,
    description: "",
    partNumber: "",
    quantity: "1",
    unitPrice: String(DEFAULT_LABOR_RATE),
  });

  const subtotal = items.reduce((s, i) => s + i.total, 0);

  async function addItem() {
    const qty = parseFloat(draft.quantity);
    const price = parseFloat(draft.unitPrice);
    if (!draft.description || isNaN(qty) || isNaN(price)) return;

    setSaving(true);
    const res = await fetch(`/api/work-orders/${workOrderId}/line-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: draft.type,
        description: draft.description,
        partNumber: draft.partNumber || null,
        quantity: qty,
        unitPrice: price,
      }),
    });

    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [...prev, item]);
      setDraft({ type: "LABOR", description: "", partNumber: "", quantity: "1", unitPrice: String(DEFAULT_LABOR_RATE) });
      setAdding(false);
    }
    setSaving(false);
  }

  async function deleteItem(id: string) {
    if (!confirm("Remove this line item?")) return;
    const res = await fetch(`/api/work-orders/${workOrderId}/line-items/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  // When type changes, preset unit price
  function handleTypeChange(type: LineItemType) {
    setDraft((d) => ({
      ...d,
      type,
      unitPrice: type === "LABOR" ? String(DEFAULT_LABOR_RATE) : d.unitPrice,
      quantity: type === "LABOR" ? d.quantity : "1",
    }));
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
          <tr>
            <th className="pb-2 pr-4 w-20">Type</th>
            <th className="pb-2 pr-4">Description</th>
            <th className="pb-2 pr-4 w-24">Part #</th>
            <th className="pb-2 pr-4 w-20 text-right">Qty</th>
            <th className="pb-2 pr-4 w-24 text-right">Unit</th>
            <th className="pb-2 w-24 text-right">Total</th>
            {editable && <th className="pb-2 w-8" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.length === 0 && !adding && (
            <tr>
              <td colSpan={editable ? 7 : 6} className="py-6 text-center text-gray-400 text-sm">
                No line items yet
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr key={item.id} className="group">
              <td className="py-2 pr-4">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                  {TYPE_LABELS[item.type]}
                </span>
              </td>
              <td className="py-2 pr-4 text-gray-800">{item.description}</td>
              <td className="py-2 pr-4 font-mono text-xs text-gray-500">{item.partNumber ?? "—"}</td>
              <td className="py-2 pr-4 text-right text-gray-700">{item.quantity}</td>
              <td className="py-2 pr-4 text-right text-gray-700">{fmt(item.unitPrice)}</td>
              <td className="py-2 text-right font-medium text-gray-900">{fmt(item.total)}</td>
              {editable && (
                <td className="py-2 pl-2">
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              )}
            </tr>
          ))}

          {/* Add row */}
          {adding && (
            <tr className="bg-blue-50">
              <td className="py-2 pr-2">
                <Select
                  value={draft.type}
                  onChange={(e) => handleTypeChange(e.target.value as LineItemType)}
                  className="h-8 text-xs"
                >
                  {Object.entries(TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </Select>
              </td>
              <td className="py-2 pr-2">
                <Input
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  placeholder={draft.type === "LABOR" ? "Oil change, brake pads…" : "Part description"}
                  className="h-8 text-sm"
                  autoFocus
                />
              </td>
              <td className="py-2 pr-2">
                <Input
                  value={draft.partNumber}
                  onChange={(e) => setDraft((d) => ({ ...d, partNumber: e.target.value }))}
                  placeholder="Part #"
                  className="h-8 text-xs font-mono"
                />
              </td>
              <td className="py-2 pr-2">
                <Input
                  value={draft.quantity}
                  onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))}
                  type="number"
                  min="0.1"
                  step="0.25"
                  className="h-8 text-sm text-right"
                />
              </td>
              <td className="py-2 pr-2">
                <Input
                  value={draft.unitPrice}
                  onChange={(e) => setDraft((d) => ({ ...d, unitPrice: e.target.value }))}
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-8 text-sm text-right"
                />
              </td>
              <td className="py-2 text-right font-medium text-gray-900">
                {fmt((parseFloat(draft.quantity) || 0) * (parseFloat(draft.unitPrice) || 0))}
              </td>
              <td className="py-2 pl-2">
                <button
                  onClick={() => setAdding(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Footer: add button + subtotal */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        {editable ? (
          adding ? (
            <Button size="sm" onClick={addItem} disabled={saving}>
              {saving ? "Saving…" : "Save Line Item"}
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Line Item
            </Button>
          )
        ) : (
          <span />
        )}

        <div className="text-right">
          <p className="text-sm text-gray-500">Subtotal</p>
          <p className="text-lg font-bold text-gray-900">{fmt(subtotal)}</p>
        </div>
      </div>
    </div>
  );
}
