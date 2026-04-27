'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import CourseManagement from '@/app/components/features/CourseManagement';
import DiscussionsSection from '@/app/components/features/DiscussionsSection';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">👨‍🏫 Teacher Portal</h2>
        <p>Create courses, manage content, and guide your students' learning journey.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 flex-wrap border-b">
        {[
          { id: 'courses', label: '🎓 My Courses', icon: 'courses' },
          { id: 'discussions', label: '💬 Class Discussions', icon: 'discussions' },
          { id: 'students', label: '👥 Students', icon: 'students' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === tab.id
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'courses' && <CourseManagement />}
        {activeTab === 'discussions' && <DiscussionsSection type="teacher" />}
        {activeTab === 'students' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Your Students</h3>
            <p className="text-gray-600">Student enrollment features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
