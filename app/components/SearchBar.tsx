'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function SearchBar() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    if (!q) {
      setResults(null);
      setOpen(false);
      return;
    }
    setLoading(true);
    timer.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch (err) {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [q]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => { if (results) setOpen(true); }}
          placeholder="Search books, courses, classes..."
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
            <div className="mb-2">
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
              <div className="text-sm text-gray-500 mb-3">No classes</div>
            )}

            <div className="mb-2">
              <strong>Courses</strong>
            </div>
            {results.courses && results.courses.length > 0 ? (
              <ul className="mb-3">
                {results.courses.map((c: any) => (
                  <li key={c.id} className="py-1 text-sm">
                    <Link href={`/courses/${c.id}`} className="text-gray-800 hover:underline">
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 mb-3">No courses</div>
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
