"use client";

import { useState } from "react";
import { UserPlus, ShieldCheck, Wrench } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: Date | string;
};

export function UsersManager({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers]     = useState<User[]>(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState("");

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res  = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:     form.get("name"),
        email:    form.get("email"),
        password: form.get("password"),
        role:     form.get("role"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create user");
      return;
    }

    setUsers((prev) => [...prev, data]);
    setShowForm(false);
    (e.target as HTMLFormElement).reset();
  }

  async function toggleActive(user: User) {
    const res  = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, active: updated.active } : u)));
  }

  return (
    <div className="space-y-6">
      {/* User list */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className={!u.active ? "opacity-50" : ""}>
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium
                    ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                    {u.role === "ADMIN"
                      ? <><ShieldCheck className="h-3 w-3" />Admin</>
                      : <><Wrench className="h-3 w-3" />Technician</>}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${u.active ? "text-green-600" : "text-gray-400"}`}>
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleActive(u)}
                    className="text-xs text-gray-400 hover:text-gray-700 underline"
                  >
                    {u.active ? "Deactivate" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add user */}
      {showForm ? (
        <form onSubmit={handleAdd} className="rounded-lg border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Add Team Member</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
              <input name="name" required className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
              <input name="email" type="email" required className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Password (min 8 chars)</label>
              <input name="password" type="password" minLength={8} required className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Role</label>
              <select name="role" className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm">
                <option value="TECHNICIAN">Technician</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {loading ? "Adding…" : "Add User"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(""); }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <UserPlus className="h-4 w-4" />
          Add Team Member
        </button>
      )}
    </div>
  );
}
