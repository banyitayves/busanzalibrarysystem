'use client';

import { useState } from 'react';

interface SearchResult {
  bookId: number;
  bookTitle: string;
  answer: string;
  source: string;
}

export default function AskQuestionSection() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch('/api/books/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          studentId: '1', // Replace with actual user ID
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
        setSearched(true);
        if (data.results.length === 0) {
          setError('No relevant answers found in the books');
        }
      } else {
        setError(data.error || 'Error processing question');
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Ask a Question About Books</h2>

      <form onSubmit={handleAsk} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about any book in the system..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Searching...' : 'Ask'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {searched && results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg mb-4">
            Answers from {results.length} book{results.length !== 1 ? 's' : ''}:
          </h3>
          {results.map((result, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded">
              <h4 className="font-semibold text-blue-900 mb-2">{result.bookTitle}</h4>
              <p className="text-gray-800 mb-2">{result.answer}</p>
              <span className="text-xs text-gray-600">{result.source}</span>
            </div>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !error && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md">
          No answers found. Try a different question or upload more books.
        </div>
      )}
    </div>
  );
}
