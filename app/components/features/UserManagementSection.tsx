'use client';

import { useEffect, useState } from 'react';

interface UserSummary {
  id: string;
  username: string;
  name: string;
  role: string;
  class_name?: string | null;
  level?: string | null;
  email?: string | null;
  theme?: string;
}

export default function UserManagementSection() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users?role=librarian');
        const text = await response.text();
        let data: any = {};

        try {
          data = text ? JSON.parse(text) : {};
        } catch (error) {
          throw new Error(text || 'The server returned a non-JSON response.');
        }

        if (!response.ok) {
          throw new Error(data.error || 'Unable to fetch users');
        }

        setUsers(data.users || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const countByRole = (role: string) => users.filter((user) => user.role === role).length;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">User Management</h3>
          <p className="text-sm text-gray-600">Review the full user list and verify account information.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-slate-600">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase">Total</div>
            <div className="text-lg font-semibold">{users.length}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase">Students</div>
            <div className="text-lg font-semibold">{countByRole('student')}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase">Teachers</div>
            <div className="text-lg font-semibold">{countByRole('teacher')}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading users...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Username</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Level</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Class</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Theme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.username}</td>
                  <td className="px-4 py-3 text-slate-600">{user.role}</td>
                  <td className="px-4 py-3 text-slate-600">{user.level || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{user.class_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{user.theme || 'system'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
