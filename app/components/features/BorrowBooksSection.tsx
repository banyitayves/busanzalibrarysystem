'use client';

import { useState, useEffect } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  file_type: string;
  created_at: string;
}

export default function BorrowBooksSection() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      
      if (!response.ok || !Array.isArray(data)) {
        setBooks([]);
        console.warn('Books API returned invalid data:', data);
      } else {
        setBooks(data);
      }
    } catch (error) {
      console.error('Error loading books:', error);
      setBooks([]);
      setMessage(`Error loading books: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'borrow',
          studentId: '1', // Replace with actual user ID
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully borrowed "${books.find((b) => b.id === bookId)?.title}"`);
        setSelectedBookId(null);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error borrowing book: ${String(error)}`);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading books...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Borrow Books</h2>

      {message && (
        <div className={`p-3 rounded-md mb-4 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {books.length === 0 ? (
        <p className="text-gray-600">No books available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map((book) => (
            <div key={book.id} className="border border-gray-300 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-2">by {book.author || 'Unknown'}</p>
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{book.description}</p>
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>{book.file_type.toUpperCase()}</span>
                <span>{new Date(book.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = `/books/${book.id}`}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  📖 Read
                </button>
                <button
                  onClick={() => handleBorrow(book.id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  📚 Borrow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
