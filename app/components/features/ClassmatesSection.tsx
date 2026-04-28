'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

interface Classmate {
  id: number;
  username: string;
  name: string;
  class_name: string;
  role: string;
}

export default function ClassmatesSection() {
  const { user } = useAuth();
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'student') {
      setIsLoading(false);
      return;
    }

    fetchClassmates();
  }, [user]);

  const fetchClassmates = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`/api/classmates?class=${user?.class_name}`, {
        headers: {
          'x-user-id': String(user?.id),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch classmates');
      }

      const data = await response.json();
      setClassmates(data.classmates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching classmates');
      console.error('Error fetching classmates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'student') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">Classmates feature is only available for students.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">👥 Your Classmates</h2>
        <p className="text-green-100">
          Connect and collaborate with students in your class {user?.class_name}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-4 text-gray-600">Loading classmates...</p>
        </div>
      ) : classmates.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">No other students in your class yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classmates.map((classmate) => (
            <div
              key={classmate.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{classmate.name}</h3>
                  <p className="text-sm text-gray-600">@{classmate.username}</p>
                  <p className="text-xs text-gray-500 mt-2">{classmate.role}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm font-semibold transition">
                  💬 Message
                </button>
                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm font-semibold transition">
                  🤝 Collaborate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Class Statistics */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-3">📊 Class Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{classmates.length}</p>
            <p className="text-sm text-purple-100">Total Students</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{user?.class_name}</p>
            <p className="text-sm text-purple-100">Your Class</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{user?.level}</p>
            <p className="text-sm text-purple-100">Your Level</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">🎯</p>
            <p className="text-sm text-purple-100">Ready to Learn</p>
          </div>
        </div>
      </div>

      {/* Collaboration Tips */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h3 className="font-bold text-lg text-blue-900 mb-3">💡 Collaboration Tips</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>✅ Form study groups to prepare for exams</li>
          <li>✅ Share notes and discuss difficult topics</li>
          <li>✅ Ask your classmates questions about books</li>
          <li>✅ Work together on assignments and projects</li>
          <li>✅ Organize peer learning sessions</li>
        </ul>
      </div>
    </div>
  );
}
