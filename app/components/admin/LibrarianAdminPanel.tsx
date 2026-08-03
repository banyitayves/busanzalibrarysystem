"use client";

import { useState, useEffect } from "react";
import { fetchJson } from "@/lib/fetch-json";

interface NewUserPayload {
  username: string;
  password: string;
  name: string;
  role: "librarian" | "deputy_head_teacher";
}

export default function LibrarianAdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<NewUserPayload>({ username: "", password: "", name: "", role: "librarian" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await fetchJson<{ users?: any[] }>(`/api/users?role=librarian`);
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const payload = { ...form };
      // Call the users API POST for creating staff
      const result = await fetchJson<any>(`/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMessage(result.message || "Created");
      setForm({ username: "", password: "", name: "", role: form.role });
      loadUsers();
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold text-lg mb-4">Librarian Admin Panel</h3>
      <p className="text-sm text-gray-600 mb-3">Create librarian or deputy headteacher accounts</p>

      {message && <div className="mb-3 p-2 bg-blue-50 text-blue-800 rounded">{message}</div>}

      <form onSubmit={handleCreate} className="space-y-3 mb-4">
        <div>
          <input placeholder="username" value={form.username} onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <input placeholder="full name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <input placeholder="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} type="password" className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <select value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as any }))} className="w-full px-3 py-2 border rounded">
            <option value="librarian">Librarian</option>
            <option value="deputy_head_teacher">Deputy Head Teacher</option>
          </select>
        </div>
        <div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
        </div>
      </form>

      <div>
        <h4 className="font-semibold mb-2">Existing Librarians</h4>
        {loading ? <div>Loading...</div> : (
          <ul className="space-y-2">
            {users.map((u) => (
              <li key={u.id} className="text-sm border p-2 rounded">{u.username} — {u.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
