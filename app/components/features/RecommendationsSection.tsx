'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

interface RecommendedBook {
  id: string;
  title: string;
  author: string;
  category: string;
  reason: string;
  rating: number;
}

export default function RecommendationsSection() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, [user?.id]);

  const fetchRecommendations = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/recommendations?userId=${user.id}`);
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterest = () => {
    if (interestInput.trim()) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const handleGenerateRecommendations = async () => {
    if (!user?.id || interests.length === 0) {
      alert('Please add at least one interest');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          interests,
        }),
      });
      const data = await response.json();
      setRecommendations(data.recommendations);
      setInterests([]);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  return (
    <div className="space-y-6">
      {/* Interest Input */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">🎯 Tell Us Your Interests</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              placeholder="Enter an interest (e.g., Science, Fiction, Technology)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddInterest();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddInterest}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Add
            </button>
          </div>

          {interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, idx) => (
                <div
                  key={idx}
                  className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  <span>{interest}</span>
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="text-indigo-600 hover:text-indigo-900 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleGenerateRecommendations}
            disabled={interests.length === 0 || loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-semibold"
          >
            {loading ? '⏳ Generating...' : '✨ Get Recommendations'}
          </button>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">📚 Recommended For You</h3>
        {loading && !recommendations.length ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-600">
            Loading recommendations...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-600">
            Add interests to get personalized recommendations!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((book) => (
              <div
                key={book.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition border-l-4 border-indigo-500"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{book.title}</h4>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                      ⭐ {book.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-700">{book.reason}</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {book.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
