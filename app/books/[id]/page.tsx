'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  file_type: string;
  file_content: string;
  created_at: string;
}

export default function BookDetailView() {
  const params = useParams();
  const bookId = params?.id as string;
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookId) return;

    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books/${bookId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch book');
        }
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(`Error loading book: ${String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-center text-gray-600">Loading book...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-center text-red-600">{error || 'Book not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-blue-100 mb-4">by {book.author}</p>
            <p className="text-blue-50">{book.description}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="bg-blue-700 px-3 py-1 rounded">
                {book.file_type?.toUpperCase()}
              </span>
              <span className="bg-blue-700 px-3 py-1 rounded">
                {new Date(book.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none bg-gray-50 p-6 rounded-lg">
              {book.file_content ? (
                <pre className="whitespace-pre-wrap break-words font-sans text-gray-800">
                  {book.file_content}
                </pre>
              ) : (
                <p className="text-gray-600">No content available for this book.</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 p-6 border-t">
            <div className="flex gap-4">
              <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                📚 Borrow This Book
              </button>
              <button className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                ❓ Ask Question About This Book
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 mb-2">Word Count</p>
            <p className="text-2xl font-bold text-blue-600">
              {book.file_content?.split(/\s+/).length || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 mb-2">Reading Time</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.ceil((book.file_content?.split(/\s+/).length || 0) / 200)} min
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 mb-2">Characters</p>
            <p className="text-2xl font-bold text-blue-600">
              {book.file_content?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
