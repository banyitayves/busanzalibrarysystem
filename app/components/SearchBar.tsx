'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

export default function SearchBar() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const role = user?.role || 'guest';
  const isLibrarian = role === 'librarian';
  const isDeputyHeadTeacher = role === 'deputy_head_teacher';
  const canViewUsers = isLibrarian || isDeputyHeadTeacher;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);

    const executeSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&role=${encodeURIComponent(role)}`
        );
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch (err) {
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    if (!q) {
      if (!canViewUsers) {
        setResults(null);
        setOpen(false);
        return;
      }
      executeSearch();
      return;
    }

    timer.current = window.setTimeout(executeSearch, 300);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [q, role, isLibrarian]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => { if (results) setOpen(true); }}
          placeholder={canViewUsers ? 'Search books, students, or teachers...' : 'Search books...'}
          className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => {
            if (q && results) setOpen(true);
          }}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {open && results && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded shadow-lg max-h-80 overflow-auto">
          <div className="p-3">
            {isLibrarian && (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <strong>Classes</strong>
                </div>
                {results.classes && results.classes.length > 0 ? (
                  <ul className="mb-3">
                    {results.classes.map((c: any) => (
                      <li key={c.name} className="py-1 text-sm">
                        <Link href={`/classes/${encodeURIComponent(c.name)}`} className="text-blue-700 hover:underline">
                          {c.name}
                        </Link>
                        <span className="text-gray-500 ml-2">({c.count})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500 mb-3">No matching classes</div>
                )}
              </>
            )}

            {canViewUsers && (
              <>
                <div className="mb-2">
                  <strong>Users</strong>
                </div>
                {results.users && results.users.length > 0 ? (
                  <ul className="mb-3">
                    {results.users.map((user: any) => (
                      <li key={user.id} className="py-1 text-sm">
                        <span className="text-gray-800 font-medium">{user.name}</span>
                        <span className="ml-2 text-gray-500">({user.role})</span>
                        {user.class_name && <span className="ml-2 text-gray-500">{user.class_name}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500 mb-3">No matching students or teachers</div>
                )}
              </>
            )}

            {!isLibrarian && !canViewUsers && (
              <div className="text-sm text-gray-500 mb-3">Search classes requires librarian access.</div>
            )}

            <div className="mb-2">
              <strong>Books</strong>
            </div>
            {results.books && results.books.length > 0 ? (
              <ul>
                {results.books.map((b: any) => (
                  <li key={b.id} className="py-1 text-sm">
                    <Link href={`/books/${b.id}`} className="text-gray-800 hover:underline">
                      {b.title}
                    </Link>
                    {b.author && <span className="text-gray-500 ml-2">— {b.author}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">No books</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
