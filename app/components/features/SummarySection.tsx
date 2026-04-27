'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

interface Summary {
  id: string;
  userId: string;
  userName: string;
  bookTitle: string;
  originalText: string;
  summary: string;
  createdAt: string;
}

export default function SummarySection() {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [bookTitle, setBookTitle] = useState('');
  const [bookText, setBookText] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      const response = await fetch('/api/summaries');
      const data = await response.json();
      setSummaries(data);
    } catch (error) {
      console.error('Error fetching summaries:', error);
    }
  };

  const handleGenerateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || !bookText.trim()) {
      alert('Please provide both book title and content');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle,
          originalText: bookText,
          userId: user?.id,
          userName: user?.name,
        }),
      });
      const summary = await response.json();
      setSummaries([summary, ...summaries]);
      setBookTitle('');
      setBookText('');
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this summary?')) return;
    try {
      await fetch(`/api/summaries?id=${id}`, { method: 'DELETE' });
      setSummaries(summaries.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error deleting summary:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">📄 Generate Book Summary</h3>
        <form onSubmit={handleGenerateSummary} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book Title
            </label>
            <input
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="Enter book title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book Content (paste text or excerpt)
            </label>
            <textarea
              value={bookText}
              onChange={(e) => setBookText(e.target.value)}
              placeholder="Paste the book content here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-32"
            />
            <p className="text-xs text-gray-500 mt-2">
              Minimum 100 words recommended for better summaries
            </p>
          </div>

          <button
            type="submit"
            disabled={generating || !bookTitle.trim() || !bookText.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-semibold"
          >
            {generating ? '🤖 Generating...' : '✨ Generate Summary'}
          </button>
        </form>
      </div>

      {/* Summaries List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Your Summaries</h3>
        {summaries.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-600">
            No summaries yet. Upload a book to get started!
          </div>
        ) : (
          summaries.map((summary) => (
            <div key={summary.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-900">{summary.bookTitle}</h4>
                  <p className="text-sm text-gray-500">
                    By {summary.userName} •{' '}
                    {new Date(summary.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(summary.id)}
                  className="text-red-600 hover:text-red-700 transition text-sm font-semibold"
                >
                  🗑️ Delete
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    Original Text ({summary.originalText.split(' ').length} words):
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {summary.originalText}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    📖 AI-Generated Summary:
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {summary.summary}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
