'use client';

import { useEffect, useState } from 'react';

interface ReadableBook {
  id: string;
  title: string;
  author: string;
  description: string;
  created_at: string;
}

export default function ReadBooksSection() {
  const [books, setBooks] = useState<ReadableBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books?type=readable');
        const data = await response.json();
        setBooks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading readable books:', error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading reading materials...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Read Books & Materials</h2>
      <p className="text-gray-600 mb-6">These items are available for reading and contain attached content such as PDFs or text files.</p>

      {books.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-600">
          No readable materials have been added yet. Librarians can upload PDF or text files for reading here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map((book) => (
            <div key={book.id} className="border border-gray-300 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-2">by {book.author || 'Unknown'}</p>
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{book.description}</p>
              <a
                href={`/books/${book.id}`}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
              >
                📖 Read Now
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
