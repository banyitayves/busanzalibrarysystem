'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export default function LibrarianDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('books');

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">👨‍💼 Librarian Management Panel</h2>
        <p>Manage the library collection, user access, and system oversight.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 flex-wrap border-b">
        {[
          { id: 'books', label: '📚 Manage Books', icon: 'books' },
          { id: 'users', label: '👥 Users', icon: 'users' },
          { id: 'analytics', label: '📊 Analytics', icon: 'analytics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'books' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Library Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-blue-600">1,247</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">892</p>
              </div>
              <div className="bg-orange-50 p-4 rounded">
                <p className="text-sm text-gray-600">Borrowed</p>
                <p className="text-2xl font-bold text-orange-600">355</p>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">12</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
              Add New Book
            </button>
            <p className="text-gray-600 mt-4">Use the main library section to manage books</p>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">User Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-indigo-50 p-4 rounded">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-indigo-600">487</p>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-2xl font-bold text-blue-600">412</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">Teachers</p>
                <p className="text-2xl font-bold text-green-600">75</p>
              </div>
            </div>
            <p className="text-gray-600">User management features coming soon...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">System Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Monthly Activity</h4>
                <p className="text-gray-600 text-sm">Questions Asked: 324</p>
                <p className="text-gray-600 text-sm">Summaries Generated: 156</p>
                <p className="text-gray-600 text-sm">Course Enrollments: 89</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Most Active Users</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• John Doe - 45 questions</li>
                  <li>• Sarah Smith - 38 questions</li>
                  <li>• Mike Johnson - 32 questions</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
