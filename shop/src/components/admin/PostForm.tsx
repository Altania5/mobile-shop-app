"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type PostFormData = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  heroImage: string;
  allowComments: boolean;
  published: boolean;
};

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";

export function PostForm({ initial }: { initial?: PostFormData }) {
  const router = useRouter();
  const editing = !!initial?.id;
  const [form, setForm] = useState<PostFormData>(
    initial ?? { title: "", slug: "", summary: "", content: "", heroImage: "", allowComments: true, published: false }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof PostFormData>(key: K, value: PostFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      slug: form.slug || undefined,
      summary: form.summary,
      content: form.content,
      heroImage: form.heroImage,
      allowComments: form.allowComments,
      published: form.published,
    };
    const res = await fetch(editing ? `/api/posts/${initial!.id}` : "/api/posts", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/blog");
      router.refresh();
    } else {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? "Could not save the post.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 p-8">
      <h1 className="text-2xl font-bold text-gray-900">{editing ? "Edit Post" : "New Post"}</h1>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
        <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} required />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
        <input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated from title if blank" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Summary</label>
        <textarea className={inputCls + " resize-none"} rows={2} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Hero image URL</label>
        <input className={inputCls} value={form.heroImage} onChange={(e) => set("heroImage", e.target.value)} placeholder="https://…" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Content *</label>
        <textarea className={inputCls + " font-mono"} rows={14} value={form.content} onChange={(e) => set("content", e.target.value)} required />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.allowComments} onChange={(e) => set("allowComments", e.target.checked)} />
          Allow comments
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
          Published
        </label>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? "Saving…" : editing ? "Save Changes" : "Create Post"}
        </button>
        <button type="button" onClick={() => router.push("/admin/blog")} className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
          Cancel
        </button>
      </div>
    </form>
  );
}
