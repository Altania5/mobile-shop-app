"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Phone, Mail, MapPin, Car, Wrench, Calendar, Clock, Inbox, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BookingRequest = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  service: string;
  serviceOther?: string;
  preferredDate: string;
  preferredTimeSlot: "morning" | "afternoon" | "evening";
  serviceAddress: string;
  source: string;
  status: string;
  createdAt: string;
};

type ActionResult = { workOrderId?: string; workOrderNumber?: string } | null;

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Morning · 8–12 PM",
  afternoon: "Afternoon · 12–5 PM",
  evening: "Evening · 5–7 PM",
};

const STATUS_STYLES: Record<string, string> = {
  new:       "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  scheduled: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
  converted: "bg-emerald-100 text-emerald-700",
  declined:  "bg-red-100 text-red-700",
};

const TABS = [
  { label: "All",       value: ""          },
  { label: "New",       value: "new"       },
  { label: "Converted", value: "converted" },
  { label: "Declined",  value: "declined"  },
];

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatReceivedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function BookingRequestsClient() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [pending, setPending] = useState<{ id: string; type: "approve" | "decline" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ActionResult>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter
        ? `/api/booking-requests?status=${statusFilter}`
        : "/api/booking-requests";
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load booking requests");
      }
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  async function handleAction(id: string, type: "approve" | "decline") {
    setActionLoading(id);
    setPending(null);
    setLastResult(null);
    try {
      const res = await fetch(`/api/booking-requests/${id}/${type}`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `${type} failed`);
      }
      const result = await res.json();
      if (type === "approve") setLastResult(result);
      await fetchRequests();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  const newCount = requests.filter((r) => r.status === "new").length;

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Inbox className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
          {newCount > 0 && (
            <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
              {newCount} new
            </span>
          )}
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Success banner after approval */}
      {lastResult?.workOrderNumber && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
          <p className="font-medium text-emerald-800">
            Booking approved — Work Order{" "}
            <strong>{lastResult.workOrderNumber}</strong> created and confirmation email sent.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={`/work-orders/${lastResult.workOrderId}`}
              className="flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
            >
              View WO <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button onClick={() => setLastResult(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              statusFilter === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-16">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          Loading…
        </div>
      ) : requests.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <Inbox className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="font-medium text-gray-500">No booking requests</p>
          <p className="text-sm mt-1">
            {statusFilter ? `No requests with status "${statusFilter}"` : "Requests from the website will appear here."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Vehicle</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Service &amp; Location</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Preferred</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => {
                const isPending = pending?.id === r._id;
                const isLoading = actionLoading === r._id;
                const serviceLabel =
                  r.service === "Other" ? r.serviceOther || "Other" : r.service;

                return (
                  <tr key={r._id} className={cn("transition-colors", isLoading ? "opacity-60" : "hover:bg-gray-50")}>
                    {/* Customer */}
                    <td className="px-4 py-3 align-top">
                      <p className="font-semibold text-gray-900">{r.name}</p>
                      <a
                        href={`tel:${r.phone}`}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 mt-0.5"
                      >
                        <Phone className="h-3 w-3 shrink-0" />
                        {r.phone}
                      </a>
                      <a
                        href={`mailto:${r.email}`}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                      >
                        <Mail className="h-3 w-3 shrink-0" />
                        {r.email}
                      </a>
                      <p className="text-xs text-gray-400 mt-1">{formatReceivedDate(r.createdAt)}</p>
                    </td>

                    {/* Vehicle */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Car className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="font-medium">{r.vehicleYear} {r.vehicleMake}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-5">{r.vehicleModel}</p>
                    </td>

                    {/* Service + location */}
                    <td className="px-4 py-3 align-top max-w-[220px]">
                      <div className="flex items-start gap-1.5 text-gray-700">
                        <Wrench className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="break-words">{serviceLabel}</span>
                      </div>
                      <div className="flex items-start gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                        <span className="break-words">{r.serviceAddress}</span>
                      </div>
                    </td>

                    {/* Preferred date/time */}
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>{formatShortDate(r.preferredDate)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Clock className="h-3 w-3 shrink-0" />
                        {TIME_SLOT_LABELS[r.preferredTimeSlot] ?? r.preferredTimeSlot}
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3 align-top">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-600"
                        )}
                      >
                        {r.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 align-top text-right">
                      {isLoading ? (
                        <div className="flex justify-end pt-1">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                        </div>
                      ) : r.status === "new" ? (
                        isPending ? (
                          <div className="flex flex-col items-end gap-1.5">
                            <p className="text-xs text-gray-500">
                              {pending.type === "approve"
                                ? "Create work order & notify customer?"
                                : "Decline and notify customer?"}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAction(r._id, pending.type)}
                                className={cn(
                                  "rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-colors",
                                  pending.type === "approve"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                                )}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setPending(null)}
                                className="rounded-md px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setPending({ id: r._id, type: "approve" })}
                              className="flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => setPending({ id: r._id, type: "decline" })}
                              className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                              Decline
                            </button>
                          </div>
                        )
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
