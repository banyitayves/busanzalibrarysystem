'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import QuestionSection from '@/app/components/features/QuestionSection';
import SummarySection from '@/app/components/features/SummarySection';
import CoursesSection from '@/app/components/features/CoursesSection';
import DiscussionsSection from '@/app/components/features/DiscussionsSection';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('questions');

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">👨‍🎓 Welcome to Your Learning Journey!</h2>
        <p>
          Ask questions, get AI-powered answers, generate book summaries, and learn from peers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 flex-wrap border-b">
        {[
          { id: 'questions', label: '❓ Ask Questions', icon: 'question' },
          { id: 'summaries', label: '📖 Book Summaries', icon: 'summary' },
          { id: 'courses', label: '📚 Courses', icon: 'courses' },
          { id: 'discussions', label: '💬 Peer Learning', icon: 'discussions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'questions' && <QuestionSection />}
        {activeTab === 'summaries' && <SummarySection />}
        {activeTab === 'courses' && <CoursesSection />}
        {activeTab === 'discussions' && <DiscussionsSection type="student" />}
      </div>
    </div>
  );
}
