"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";

interface Props {
  workOrderId: string;
  diagnosis: string;
  workPerformed: string;
  recommendations: string;
  editable: boolean;
}

export function WorkOrderNotes({ workOrderId, diagnosis, workPerformed, recommendations, editable }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({ diagnosis, workPerformed, recommendations });

  async function save() {
    setSaving(true);
    await fetch(`/api/work-orders/${workOrderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  const fields: { key: keyof typeof values; label: string; placeholder: string }[] = [
    { key: "diagnosis",       label: "Diagnosis",        placeholder: "Root cause found during inspection…" },
    { key: "workPerformed",   label: "Work Performed",   placeholder: "Replaced brake pads front/rear, resurfaced rotors…" },
    { key: "recommendations", label: "Recommendations",  placeholder: "Suggest cabin air filter replacement at next service…" },
  ];

  return (
    <section className="rounded-lg border border-gray-200 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Technician Notes</h2>
        {editable && !editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700">
            <Pencil className="h-3 w-3" /> Edit
          </button>
        )}
        {editing && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={save} disabled={saving}>
              <Check className="h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
            {editing ? (
              <Textarea
                value={values[key]}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                placeholder={placeholder}
                rows={3}
              />
            ) : values[key] ? (
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{values[key]}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">{editable ? "Tap Edit to add…" : "Not recorded"}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
