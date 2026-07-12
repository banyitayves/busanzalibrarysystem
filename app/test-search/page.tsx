'use client';

import { useState } from 'react';

export default function TestSearchPage() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const doSearch = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const url = `/api/search${q ? `?q=${encodeURIComponent(q)}` : ''}`;
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

      <div className="flex gap-2 mb-4">
        <input
          className="border px-3 py-2 rounded w-72"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search query (leave empty to list classes)"
        />
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
            <h2 className="font-semibold">Courses ({result.courses?.length || 0})</h2>
            <ul className="list-disc pl-6">
              {(result.courses || []).map((c: any) => (
                <li key={c.id}>{c.title}</li>
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
