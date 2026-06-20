"use client";

import { useState } from "react";
import { Star, MessageSquareQuote, Check, EyeOff, Trash2, Reply } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  quote: string;
  rating: number;
  authorName: string;
  serviceLabel: string | null;
  status: "PENDING" | "PUBLISHED" | "HIDDEN";
  adminReply: string | null;
  createdAt: string;
};

const TABS = [
  { label: "Pending", value: "PENDING" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Hidden", value: "HIDDEN" },
  { label: "All", value: "" },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-green-100 text-green-700",
  HIDDEN: "bg-gray-100 text-gray-600",
};

export function TestimonialsManager({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [tab, setTab] = useState("PENDING");
  const [busy, setBusy] = useState<string | null>(null);
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const shown = tab ? rows.filter((r) => r.status === tab) : rows;
  const pendingCount = rows.filter((r) => r.status === "PENDING").length;

  async function patch(id: string, data: Partial<Pick<Row, "status" | "adminReply">>) {
    setBusy(id);
    const res = await fetch(`/api/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(null);
    if (res.ok) setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    setBusy(id);
    const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function startReply(r: Row) {
    setReplyFor(r.id);
    setReplyText(r.adminReply ?? "");
  }
  async function saveReply(id: string) {
    await patch(id, { adminReply: replyText });
    setReplyFor(null);
  }

  return (
    <div className="max-w-4xl p-8">
      <div className="mb-6 flex items-center gap-3">
        <MessageSquareQuote className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
        {pendingCount > 0 && (
          <span className="rounded-full bg-yellow-500 px-2.5 py-0.5 text-xs font-bold text-white">{pendingCount} pending</span>
        )}
      </div>

      <div className="mb-6 flex w-fit gap-1 rounded-lg bg-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn("rounded-md px-4 py-1.5 text-sm font-medium transition-colors", tab === t.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-gray-400">No testimonials here.</p>
      ) : (
        <div className="space-y-4">
          {shown.map((r) => (
            <div key={r.id} className={cn("rounded-xl border border-gray-200 p-5", busy === r.id && "opacity-50")}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className="h-4 w-4" fill={n <= r.rating ? "#d4af37" : "none"} stroke={n <= r.rating ? "#d4af37" : "#cbd5e1"} />
                    ))}
                  </div>
                  <p className="mt-2 text-gray-800">“{r.quote}”</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {r.authorName}
                    {r.serviceLabel && <span className="font-normal text-gray-500"> · {r.serviceLabel}</span>}
                  </p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[r.status])}>{r.status.toLowerCase()}</span>
              </div>

              {r.adminReply && replyFor !== r.id && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                  <span className="font-semibold text-[#d4af37]">Your reply: </span>
                  <span className="text-gray-700">{r.adminReply}</span>
                </div>
              )}

              {replyFor === r.id ? (
                <div className="mt-3 space-y-2">
                  <textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={2} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a public reply…" />
                  <div className="flex gap-2">
                    <button onClick={() => saveReply(r.id)} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Save reply</button>
                    <button onClick={() => setReplyFor(null)} className="rounded-md px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {r.status !== "PUBLISHED" && (
                    <button onClick={() => patch(r.id, { status: "PUBLISHED" })} className="flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100">
                      <Check className="h-3.5 w-3.5" /> Publish
                    </button>
                  )}
                  {r.status !== "HIDDEN" && (
                    <button onClick={() => patch(r.id, { status: "HIDDEN" })} className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200">
                      <EyeOff className="h-3.5 w-3.5" /> Hide
                    </button>
                  )}
                  <button onClick={() => startReply(r)} className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200">
                    <Reply className="h-3.5 w-3.5" /> {r.adminReply ? "Edit reply" : "Reply"}
                  </button>
                  <button onClick={() => remove(r.id)} className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
