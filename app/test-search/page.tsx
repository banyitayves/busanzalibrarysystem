'use client';

import { useState } from 'react';

const SEARCH_ROLES = ['guest', 'student', 'teacher', 'librarian'] as const;

type SearchRole = (typeof SEARCH_ROLES)[number];

export default function TestSearchPage() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState<SearchRole>('librarian');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const doSearch = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const url = `/api/search${q ? `?q=${encodeURIComponent(q)}` : ''}&role=${encodeURIComponent(role)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setResult(data);
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Global Search</h1>

      <div className="flex flex-col gap-3 md:flex-row mb-4 items-start md:items-end">
        <input
          className="border px-3 py-2 rounded w-full md:w-72"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search query (leave empty for all classes if librarian)"
        />
        <select
          className="border px-3 py-2 rounded w-full md:w-48"
          value={role}
          onChange={(e) => setRole(e.target.value as SearchRole)}
        >
          {SEARCH_ROLES.map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {roleOption}
            </option>
          ))}
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={doSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {result && (
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold">Classes ({result.classes?.length || 0})</h2>
            <ul className="list-disc pl-6">
              {(result.classes || []).map((c: any) => (
                <li key={c.name}>{c.name} — {c.count} students</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold">Books ({result.books?.length || 0})</h2>
            <ul className="list-disc pl-6">
              {(result.books || []).map((b: any) => (
                <li key={b.id}>{b.title} — {b.author}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
