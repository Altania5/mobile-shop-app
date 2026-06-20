"use client";

import { useState } from "react";

type Comment = { id: string; authorName: string; text: string; createdAt: string };

export function CommentForm({ postId, onAdded }: { postId: string; onAdded: (c: Comment) => void }) {
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, authorName, text }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? "Could not post your comment.");
      }
      const comment = await res.json();
      onAdded(comment);
      setText("");
      setAuthorName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input className={inputCls} placeholder="Your name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required maxLength={80} />
      <textarea className={inputCls + " resize-none"} placeholder="Add a comment…" rows={3} value={text} onChange={(e) => setText(e.target.value)} required maxLength={2000} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="rounded-lg bg-[#1e2833] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2a3441] disabled:opacity-60">
        {submitting ? "Posting…" : "Post Comment"}
      </button>
    </form>
  );
}
