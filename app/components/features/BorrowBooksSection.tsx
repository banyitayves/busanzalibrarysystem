'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { fetchJson } from '@/lib/fetch-json';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  file_type: string;
  created_at: string;
  copies_available?: number;
  copies_total?: number;
}

interface BorrowBooksSectionProps {
  onBorrowSuccess?: (bookTitle: string) => void;
}

export default function BorrowBooksSection({ onBorrowSuccess }: BorrowBooksSectionProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const { user } = useAuth();
  const borrowedRole = user?.role === 'teacher' ? 'teacher' : user?.role === 'student' ? 'student' : 'guest';
  const canBorrow = user && (user.role === 'student' || user.role === 'teacher');
  const isGuest = user?.role === 'guest' || !canBorrow;
  const maxLoanLabel = borrowedRole === 'teacher' ? 'Teachers can borrow multiple books and return them within 3 months.' : 'Students can borrow only one book at a time and must return within 2 weeks.';

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await fetchJson<any[]>('/api/books?type=borrowable');

      if (!Array.isArray(data)) {
        setBooks([]);
        console.warn('Books API returned invalid data:', data);
      } else {
        setBooks(data);
      }
    } catch (error) {
      console.error('Error loading books:', error);
      setBooks([]);
      setMessage(`Error loading books: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId: string) => {
    if (isGuest) {
      setMessage('❌ Only students and teachers can borrow books. Please create an account to borrow.');
      return;
    }

    const borrowRole = user?.role === 'teacher' ? 'teacher' : 'student';
    const dueDate = new Date(Date.now() + (borrowRole === 'teacher' ? 90 : 14) * 24 * 60 * 60 * 1000);

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'borrow',
          studentId: user?.id || '1',
          userRole: borrowRole,
          borrowerName: user?.name || 'Library user',
          dueDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const borrowedTitle = books.find((b) => b.id === bookId)?.title || 'the selected book';
        setMessage(`Successfully borrowed "${borrowedTitle}"`);
        onBorrowSuccess?.(borrowedTitle);
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

      <div className="p-3 rounded-md mb-4 bg-indigo-100 text-indigo-800 border border-indigo-200">
        ℹ️ {maxLoanLabel}
      </div>

      {isGuest && (
        <div className="p-3 rounded-md mb-4 bg-orange-100 text-orange-700 border border-orange-300">
          ℹ️ You're in Guest Mode. You can read books but cannot borrow them. <a href="/register" className="font-semibold underline hover:no-underline">Create an account</a> to borrow books.
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-md mb-4 ${message.includes('Error') || message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
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
                <span>Copies available: {book.copies_available ?? 1}</span>
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
                  disabled={isGuest}
                  className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-semibold ${
                    isGuest
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
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
