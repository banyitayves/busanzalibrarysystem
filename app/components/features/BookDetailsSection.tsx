'use client';

import { useState, useEffect } from 'react';

interface BookDetail {
  id: number;
  title: string;
  author: string;
  description: string;
  file_type: string;
  file_content: string;
  created_at: string;
}

interface Summary {
  summary: string;
}

export default function BookDetailsSection() {
  const [bookId, setBookId] = useState('');
  const [book, setBook] = useState<BookDetail | null>(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'summary'>('details');

  const handleFetchBook = async () => {
    if (!bookId.trim()) {
      setError('Please enter a book ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/books/${bookId}`);
      const data = await response.json();

      if (response.ok) {
        setBook(data);
        // Fetch summary
        const summaryResponse = await fetch(`/api/books/${bookId}?action=summary`);
        const summaryData = await summaryResponse.json();
        setSummary(summaryData.summary || 'No summary available');
      } else {
        setError(data.error || 'Book not found');
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Book Details & Summary</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          placeholder="Enter book ID..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleFetchBook}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Loading...' : 'Fetch'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {book && (
        <div>
          <div className="mb-4 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 font-semibold ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 font-semibold ${activeTab === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            >
              Summary
            </button>
          </div>

          {activeTab === 'details' && (
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-blue-900">{book.title}</h3>
                <p className="text-gray-600">by {book.author || 'Unknown'}</p>
              </div>
              <div>
                <label className="font-semibold text-sm">Description:</label>
                <p className="text-gray-700 mt-1">{book.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-semibold">File Type:</label>
                  <p className="text-gray-600">{book.file_type.toUpperCase()}</p>
                </div>
                <div>
                  <label className="font-semibold">Uploaded:</label>
                  <p className="text-gray-600">{new Date(book.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <label className="font-semibold text-sm">Content Preview:</label>
                <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 max-h-48 overflow-y-auto text-sm text-gray-700">
                  {book.file_content.substring(0, 500)}...
                </div>
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div>
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
