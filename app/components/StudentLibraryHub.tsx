'use client';

import { useState } from 'react';
import BookUploadSection from './features/BookUploadSection';
import BorrowBooksSection from './features/BorrowBooksSection';
import BookDetailsSection from './features/BookDetailsSection';

type TabType = 'browse' | 'details' | 'upload';

export default function StudentLibraryHub() {
  const [activeTab, setActiveTab] = useState<TabType>('browse');

  const tabs = [
    { id: 'browse', label: 'Browse & Borrow', icon: '📚' },
    { id: 'details', label: 'View Book Details', icon: '📖' },
    { id: 'upload', label: 'Upload Book', icon: '⬆️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Library Management System</h1>
          <p className="text-gray-600">Manage the catalogue, borrow records, and library operations from one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">📖</div>
            <h3 className="font-semibold text-sm">Browse & Borrow</h3>
            <p className="text-xs text-gray-600 mt-1">Search the catalog and issue books</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🗂️</div>
            <h3 className="font-semibold text-sm">Manage Catalog</h3>
            <p className="text-xs text-gray-600 mt-1">Review available titles and details</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">📦</div>
            <h3 className="font-semibold text-sm">Track Availability</h3>
            <p className="text-xs text-gray-600 mt-1">Monitor book status and returns</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">⬆️</div>
            <h3 className="font-semibold text-sm">Upload Records</h3>
            <p className="text-xs text-gray-600 mt-1">Add new books and documents</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 bg-white p-4 rounded-lg shadow-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'upload' && <BookUploadSection />}
          {activeTab === 'browse' && <BorrowBooksSection />}
          {activeTab === 'details' && <BookDetailsSection />}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How to use the system</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Start by browsing the catalog or uploading a new book</li>
            <li>✓ Review each title before issuing or returning it</li>
            <li>✓ Keep track of borrowed materials and availability</li>
            <li>✓ Use the library dashboard for day-to-day operations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
