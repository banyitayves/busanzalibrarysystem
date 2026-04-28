'use client';

import { useState } from 'react';
import BookUploadSection from './features/BookUploadSection';
import BorrowBooksSection from './features/BorrowBooksSection';
import AskQuestionSection from './features/AskQuestionSection';
import BookDetailsSection from './features/BookDetailsSection';

type TabType = 'upload' | 'browse' | 'ask' | 'details';

export default function StudentLibraryHub() {
  const [activeTab, setActiveTab] = useState<TabType>('browse');

  const tabs = [
    { id: 'browse', label: 'Browse & Borrow', icon: '📚' },
    { id: 'ask', label: 'Ask Questions', icon: '❓' },
    { id: 'details', label: 'View Summary', icon: '📖' },
    { id: 'upload', label: 'Upload Book', icon: '⬆️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Smart Library Hub</h1>
          <p className="text-gray-600">AI-Powered Learning Platform with Intelligent Q&A</p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">📖</div>
            <h3 className="font-semibold text-sm">Browse & Borrow</h3>
            <p className="text-xs text-gray-600 mt-1">Access thousands of books</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold text-sm">AI Q&A</h3>
            <p className="text-xs text-gray-600 mt-1">Get instant answers from books</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="font-semibold text-sm">AI Summaries</h3>
            <p className="text-xs text-gray-600 mt-1">Quick book summaries</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">⬆️</div>
            <h3 className="font-semibold text-sm">Upload Books</h3>
            <p className="text-xs text-gray-600 mt-1">Share your resources</p>
          </div>
        </div>

        {/* Tab Navigation */}
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

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'upload' && <BookUploadSection />}
          {activeTab === 'browse' && <BorrowBooksSection />}
          {activeTab === 'ask' && <AskQuestionSection />}
          {activeTab === 'details' && <BookDetailsSection />}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tip: How to Use</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Start by uploading or browsing books in the library</li>
            <li>✓ Use "Ask Questions" to get AI-powered answers from any book</li>
            <li>✓ View AI-generated summaries to quickly understand content</li>
            <li>✓ Borrow books for extended reading with 14-day loan period</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
