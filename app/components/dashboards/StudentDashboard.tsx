'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import QuestionSection from '@/app/components/features/QuestionSection';
import SummarySection from '@/app/components/features/SummarySection';
import CoursesSection from '@/app/components/features/CoursesSection';
import DiscussionsSection from '@/app/components/features/DiscussionsSection';
import RecommendationsSection from '@/app/components/features/RecommendationsSection';
import PeerMessagingSection from '@/app/components/features/PeerMessagingSection';
import ClassmatesSection from '@/app/components/features/ClassmatesSection';
import StudentLibraryHub from '@/app/components/StudentLibraryHub';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('library');

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">👨‍🎓 Welcome, {user?.name}!</h2>
        <p>
          Welcome to your Smart Library. Ask questions, get AI-powered answers, discover recommended books, chat with peers, and collaborate with classmates.
        </p>
        {user?.class_name && (
          <div className="mt-3 p-2 bg-blue-400 rounded text-sm">
            📚 Class: <strong>{user.class_name}</strong> | Level: <strong>{user.level}</strong>
          </div>
        )}
        <div className="mt-3 p-2 bg-blue-400 rounded text-sm">
          📞 Need help? Contact <strong>YVES</strong> at <strong>+250791756160</strong>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 flex-wrap border-b overflow-x-auto">
        {[
          { id: 'library', label: '📚 Smart Library', icon: 'library' },
          { id: 'questions', label: '❓ Ask Questions', icon: 'question' },
          { id: 'summaries', label: '📖 Book Summaries', icon: 'summary' },
          { id: 'recommendations', label: '🎯 AI Recommendations', icon: 'recommendations' },
          { id: 'classmates', label: '👥 Classmates', icon: 'classmates' },
          { id: 'courses', label: '📚 Courses', icon: 'courses' },
          { id: 'discussions', label: '💬 Peer Learning', icon: 'discussions' },
          { id: 'messaging', label: '💭 Chat with Peers', icon: 'messaging' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold transition whitespace-nowrap ${
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
        {activeTab === 'library' && <StudentLibraryHub />}
        {activeTab === 'questions' && <QuestionSection />}
        {activeTab === 'summaries' && <SummarySection />}
        {activeTab === 'recommendations' && <RecommendationsSection />}
        {activeTab === 'classmates' && <ClassmatesSection />}
        {activeTab === 'courses' && <CoursesSection />}
        {activeTab === 'discussions' && <DiscussionsSection type="student" />}
        {activeTab === 'messaging' && <PeerMessagingSection />}
      </div>
    </div>
  );
}
