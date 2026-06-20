"use client";

import { useState, useRef } from "react";
import { Camera, X, ChevronDown, ChevronUp } from "lucide-react";
import { INSPECTION_TEMPLATE } from "@/lib/inspection-template";

type Photo = { id: string; url: string; storageKey: string };
type Item  = { id: string; category: string; name: string; condition: string; notes: string | null; photos: Photo[] };
type Inspection = { id: string; notes: string | null; items: Item[] };

const CONDITIONS = [
  { value: "GOOD",          label: "Good",            color: "bg-green-500",  text: "text-green-700",  ring: "ring-green-500",  bg: "bg-green-50"  },
  { value: "FAIR",          label: "Fair",            color: "bg-yellow-400", text: "text-yellow-700", ring: "ring-yellow-400", bg: "bg-yellow-50" },
  { value: "NEEDS_SERVICE", label: "Needs Service",   color: "bg-red-500",    text: "text-red-700",    ring: "ring-red-500",    bg: "bg-red-50"    },
  { value: "NOT_INSPECTED", label: "Not Inspected",   color: "bg-gray-300",   text: "text-gray-500",   ring: "ring-gray-300",   bg: "bg-gray-50"   },
] as const;

function conditionStyle(value: string) {
  return CONDITIONS.find((c) => c.value === value) ?? CONDITIONS[3];
}

export function InspectionBoard({
  inspection,
  inspectionId,
  template,
}: {
  inspection: Inspection;
  inspectionId: string;
  template: typeof INSPECTION_TEMPLATE;
}) {
  const [items, setItems]           = useState<Item[]>(inspection.items);
  const [expanded, setExpanded]     = useState<string | null>(template[0]?.category ?? null);
  const [uploading, setUploading]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeItemId = useRef<string | null>(null);

  async function updateCondition(itemId: string, condition: string) {
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, condition } : i));
    await fetch(`/api/inspections/${inspectionId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ condition }),
    });
  }

  async function updateNotes(itemId: string, notes: string) {
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, notes } : i));
    await fetch(`/api/inspections/${inspectionId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
  }

  function openCamera(itemId: string) {
    activeItemId.current = itemId;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file   = e.target.files?.[0];
    const itemId = activeItemId.current;
    if (!file || !itemId) return;

    setUploading(itemId);
    try {
      // 1. Upload file through Next.js — server uploads to R2, no browser↔R2 CORS needed
      const form = new FormData();
      form.append("file", file);

      const uploadRes = await fetch(`/api/inspections/${inspectionId}/items/${itemId}/upload-url`, {
        method: "POST",
        body: form,
      });
      if (!uploadRes.ok) {
        const body = await uploadRes.json().catch(() => ({}));
        throw new Error(`Upload ${uploadRes.status}: ${body.error ?? "unknown"}`);
      }
      const { url, storageKey } = await uploadRes.json();

      // 2. Save the photo record
      const photoRes = await fetch(`/api/inspections/${inspectionId}/items/${itemId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, storageKey }),
      });
      if (!photoRes.ok) throw new Error(`Photo save ${photoRes.status}`);
      const photo = await photoRes.json();

      setItems((prev) =>
        prev.map((i) => i.id === itemId ? { ...i, photos: [...i.photos, photo] } : i)
      );
      e.target.value = "";
    } catch (err) {
      alert(`Photo upload failed: ${err instanceof Error ? err.message : err}`);
      e.target.value = "";
    } finally {
      setUploading(null);
    }
  }

  async function deletePhoto(itemId: string, photoId: string) {
    await fetch(`/api/inspections/${inspectionId}/photos/${photoId}`, { method: "DELETE" });
    setItems((prev) =>
      prev.map((i) => i.id === itemId ? { ...i, photos: i.photos.filter((p) => p.id !== photoId) } : i)
    );
  }

  // Summary counts
  const counts = { GOOD: 0, FAIR: 0, NEEDS_SERVICE: 0, NOT_INSPECTED: 0 };
  items.forEach((i) => { counts[i.condition as keyof typeof counts]++; });

  return (
    <div className="space-y-4">
      {/* Hidden file input for camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Summary bar */}
      <div className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
        {CONDITIONS.filter((c) => c.value !== "NOT_INSPECTED").map((c) => (
          <div key={c.value} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
            <span className={c.text}>{counts[c.value as keyof typeof counts]} {c.label}</span>
          </div>
        ))}
        <span className="ml-auto text-gray-400">{counts.NOT_INSPECTED} remaining</span>
      </div>

      {/* Categories */}
      {template.map((section) => {
        const sectionItems = items.filter((i) => i.category === section.category);
        const isOpen = expanded === section.category;
        const hasIssues = sectionItems.some((i) => i.condition === "NEEDS_SERVICE");
        const hasFair   = sectionItems.some((i) => i.condition === "FAIR");
        const allDone   = sectionItems.every((i) => i.condition !== "NOT_INSPECTED");

        return (
          <div key={section.category} className="rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : section.category)}
              className="flex w-full items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 text-left"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${hasIssues ? "bg-red-500" : hasFair ? "bg-yellow-400" : allDone ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="font-medium text-gray-800 text-sm">{section.category}</span>
                <span className="text-xs text-gray-400">({sectionItems.length} items)</span>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {isOpen && (
              <div className="divide-y divide-gray-100 border-t border-gray-100">
                {sectionItems.map((item) => {
                  const style = conditionStyle(item.condition);
                  return (
                    <div key={item.id} className={`p-4 ${style.bg}`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        {/* Condition selector */}
                        <div className="flex gap-1 shrink-0">
                          {CONDITIONS.filter((c) => c.value !== "NOT_INSPECTED").map((c) => (
                            <button
                              key={c.value}
                              onClick={() => updateCondition(item.id, c.value)}
                              className={`rounded px-2 py-1 text-xs font-medium border transition-all
                                ${item.condition === c.value
                                  ? `${c.color} text-white ring-2 ${c.ring} ring-offset-1`
                                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"}`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <textarea
                        defaultValue={item.notes ?? ""}
                        onBlur={(e) => updateNotes(item.id, e.target.value)}
                        placeholder="Notes…"
                        rows={1}
                        className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 mb-2"
                      />

                      {/* Photos */}
                      <div className="flex flex-wrap gap-2 items-center">
                        {item.photos.map((photo) => (
                          <div key={photo.id} className="relative group h-16 w-16">
                            <img
                              src={photo.url}
                              alt=""
                              className="h-16 w-16 rounded object-cover border border-gray-200"
                            />
                            <button
                              onClick={() => deletePhoto(item.id, photo.id)}
                              className="absolute -top-1 -right-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => openCamera(item.id)}
                          disabled={uploading === item.id}
                          className="flex h-16 w-16 items-center justify-center rounded border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 disabled:opacity-50"
                        >
                          {uploading === item.id
                            ? <span className="text-xs">…</span>
                            : <Camera className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
