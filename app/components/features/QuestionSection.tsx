'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

interface Question {
  id: string;
  studentId: string;
  studentName: string;
  question: string;
  answer?: string;
  createdAt: string;
  likes: number;
}

export default function QuestionSection() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [answering, setAnswering] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setAnswering(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion,
          studentId: user?.id,
          studentName: user?.name,
        }),
      });
      const question = await response.json();
      setQuestions([question, ...questions]);
      setNewQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Failed to ask question');
    } finally {
      setAnswering(false);
    }
  };

  const handleLike = async (id: string, currentLikes: number) => {
    try {
      await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, likes: currentLikes + 1 }),
      });
      setQuestions(
        questions.map((q) =>
          q.id === id ? { ...q, likes: currentLikes + 1 } : q
        )
      );
    } catch (error) {
      console.error('Error liking question:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Ask Question Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Ask Your Question</h3>
        <form onSubmit={handleAskQuestion} className="space-y-4">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask anything and AI will help you find the answer..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-24"
          />
          <button
            type="submit"
            disabled={answering || !newQuestion.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-semibold"
          >
            {answering ? '🤖 AI is thinking...' : '✨ Ask AI'}
          </button>
        </form>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Community Questions</h3>
        {questions.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-600">
            No questions yet. Be the first to ask!
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{q.studentName}</p>
                  <p className="text-sm text-gray-500">
                    {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Just now'}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-medium text-gray-900 mb-2">Q: {q.question}</p>
                {q.answer && (
                  <div className="bg-blue-50 p-4 rounded mt-3 border-l-4 border-blue-500">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      🤖 AI Answer:
                    </p>
                    <p className="text-gray-700 text-sm">{q.answer}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleLike(q.id, q.likes)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition"
                >
                  👍 {q.likes} Helpful
                </button>
                <button className="text-sm text-gray-600 hover:text-indigo-600 transition">
                  💬 Reply
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
