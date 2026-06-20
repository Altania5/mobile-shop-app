"use client";

import { useState } from "react";
import { Star } from "lucide-react";

// Submission form for reviews. Used on the public /testimonials page and in the
// customer portal dashboard. Submissions are created as PENDING for moderation.
export function TestimonialForm({ hideName = false }: { hideName?: boolean }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [serviceLabel, setServiceLabel] = useState("");
  const [quote, setQuote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) { setError("Please select a star rating."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, authorName, serviceLabel, quote }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? "Could not submit your review.");
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl bg-green-50 p-6 text-center ring-1 ring-green-200">
        <p className="font-semibold text-green-800">Thank you for your review!</p>
        <p className="mt-1 text-sm text-green-700">We&apos;ll post it once it&apos;s approved.</p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div>
        <p className="mb-1.5 text-sm font-semibold text-gray-700">Your rating *</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <Star className="h-7 w-7 transition-colors" fill={n <= (hover || rating) ? "#d4af37" : "none"} stroke={n <= (hover || rating) ? "#d4af37" : "#cbd5e1"} />
            </button>
          ))}
        </div>
      </div>

      {!hideName && (
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Your name *</label>
          <input className={inputCls} value={authorName} onChange={(e) => setAuthorName(e.target.value)} required={!hideName} maxLength={80} />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Service (optional)</label>
        <input className={inputCls} value={serviceLabel} onChange={(e) => setServiceLabel(e.target.value)} placeholder="e.g. Brake Repair" maxLength={120} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Your review *</label>
        <textarea className={inputCls + " resize-none"} rows={4} value={quote} onChange={(e) => setQuote(e.target.value)} required maxLength={2000} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting} className="rounded-lg bg-[#d4af37] px-5 py-2.5 text-sm font-bold text-[#1e2833] hover:bg-[#c9a42e] disabled:opacity-60">
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
