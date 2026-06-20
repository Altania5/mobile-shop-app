"use client";

import { useState, useActionState } from "react";
import { TestimonialForm } from "@/components/public/TestimonialForm";
import { changeCustomerPasswordAction } from "@/app/portal/actions";

type Job = { id: string; number: string; service: string; vehicle: string; status: string; scheduledAt: string | null; completedAt: string | null; createdAt: string };
type Vehicle = { id: string; label: string; vin: string | null; color: string | null; mileage: number | null };
type Invoice = { id: string; number: string; service: string; total: number; status: string; squareInvoiceUrl: string | null; paidAt: string | null; sentAt: string | null };
type Request = { id: string; service: string; vehicle: string; status: string; preferredDate: string; createdAt: string };

const STATUS_STYLES: Record<string, string> = {
  Scheduled: "bg-purple-50 text-purple-700 border-purple-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Complete: "bg-green-50 text-green-700 border-green-200",
  Pending: "bg-gray-50 text-gray-600 border-gray-200",
  Submitted: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-green-50 text-green-700 border-green-200",
  Declined: "bg-red-50 text-red-700 border-red-200",
  Cancelled: "bg-gray-50 text-gray-600 border-gray-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
};

function Badge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? "bg-gray-50 text-gray-600 border-gray-200";
  return <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${s}`}>{status}</span>;
}

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
}

function Empty({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="py-16 text-center">
      <div className="mb-3 text-4xl">{icon}</div>
      <p className="font-semibold text-gray-800">{title}</p>
      <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}

export function PortalDashboard({
  firstName, jobs, vehicles, invoices, requests,
}: {
  firstName: string; jobs: Job[]; vehicles: Vehicle[]; invoices: Invoice[]; requests: Request[];
}) {
  const [tab, setTab] = useState("jobs");
  const unpaid = invoices.filter((i) => i.status !== "PAID").length;
  const activeJobs = jobs.filter((j) => j.status !== "Complete").length;

  const tabs = [
    { id: "jobs", label: "Jobs", count: activeJobs },
    { id: "vehicles", label: "Vehicles", count: vehicles.length },
    { id: "invoices", label: "Invoices", count: unpaid },
    { id: "requests", label: "Requests", count: 0 },
    { id: "reviews", label: "Leave a Review", count: 0 },
    { id: "settings", label: "Settings", count: 0 },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>

      <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.id ? "bg-[#1e2833] text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            {t.label}
            {t.count > 0 && <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${tab === t.id ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="mt-5 pb-12">
        {tab === "jobs" && (
          jobs.length === 0 ? <Empty icon="🔧" title="No jobs yet" subtitle="Your service jobs will appear here." /> : (
            <div className="space-y-3">
              {jobs.map((j) => (
                <div key={j.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{j.service}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{j.vehicle}</p>
                    </div>
                    <Badge status={j.status} />
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-gray-400">
                    <span>{j.number}</span>
                    <span>{j.status === "Complete" ? `Completed ${fmt(j.completedAt)}` : j.scheduledAt ? `Scheduled ${fmt(j.scheduledAt)}` : `Created ${fmt(j.createdAt)}`}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "vehicles" && (
          vehicles.length === 0 ? <Empty icon="🚗" title="No vehicles yet" subtitle="Vehicles from your service history appear here." /> : (
            <div className="grid gap-3 sm:grid-cols-2">
              {vehicles.map((v) => (
                <div key={v.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="font-semibold text-gray-900">{v.label}</p>
                  <div className="mt-2 space-y-0.5 text-xs text-gray-400">
                    {v.vin && <p className="font-mono">VIN: {v.vin}</p>}
                    <p>{[v.color, v.mileage ? `${v.mileage.toLocaleString()} mi` : null].filter(Boolean).join(" · ") || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "invoices" && (
          invoices.length === 0 ? <Empty icon="📄" title="No invoices" subtitle="Invoices for completed work appear here." /> : (
            <div className="space-y-3">
              {invoices.map((i) => {
                const paid = i.status === "PAID";
                return (
                  <div key={i.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{i.service || i.number}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{i.number}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-bold text-gray-900">{money(i.total)}</p>
                        <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${paid ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                          {paid ? "Paid" : i.status === "OVERDUE" ? "Overdue" : "Unpaid"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{paid ? `Paid ${fmt(i.paidAt)}` : `Sent ${fmt(i.sentAt)}`}</span>
                      {!paid && i.squareInvoiceUrl && (
                        <a href={i.squareInvoiceUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#d4af37] px-3 py-1.5 text-xs font-bold text-[#1e2833] hover:bg-[#c9a42e]">
                          Pay Now →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {tab === "requests" && (
          requests.length === 0 ? <Empty icon="📋" title="No booking requests" subtitle="Requests you submit will appear here." /> : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{r.service}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{r.vehicle}</p>
                    </div>
                    <Badge status={r.status} />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Preferred {fmt(r.preferredDate)} · Submitted {fmt(r.createdAt)}</p>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "reviews" && (
          <div className="max-w-xl">
            <p className="mb-4 text-sm text-gray-600">Had a good experience? We&apos;d love to hear about it. Your review is posted after a quick approval.</p>
            <TestimonialForm hideName />
          </div>
        )}

        {tab === "settings" && <SettingsPanel />}
      </div>
    </div>
  );
}

function SettingsPanel() {
  const [state, formAction, pending] = useActionState(changeCustomerPasswordAction, { ok: false, message: "" });
  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent";
  return (
    <div className="max-w-md rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-900">Change Password</h3>
      <form action={formAction} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Current Password</label>
          <input name="currentPassword" type="password" required className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">New Password</label>
          <input name="newPassword" type="password" required minLength={8} className={inputCls} />
        </div>
        <button type="submit" disabled={pending} className="w-full rounded-lg bg-[#1e2833] py-2.5 text-sm font-semibold text-white hover:bg-[#2a3441] disabled:opacity-60">
          {pending ? "Updating…" : "Update Password"}
        </button>
      </form>
      {state.message && <p className={`mt-3 text-center text-sm font-medium ${state.ok ? "text-green-600" : "text-red-600"}`}>{state.message}</p>}
    </div>
  );
}
