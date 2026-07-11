'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import BorrowBooksSection from '@/app/components/features/BorrowBooksSection';
import StudentBorrowingManagementSection from '@/app/components/features/StudentBorrowingManagementSection';

type TeacherTab = 'catalog' | 'borrowing' | 'support';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TeacherTab>('catalog');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">👩‍🏫 Teacher Library Portal</h2>
        <p>Support catalog review, student borrowing, and library services through a teacher-friendly dashboard.</p>
      </div>

      <div className="flex gap-4 flex-wrap border-b overflow-x-auto">
        {[
          { id: 'catalog', label: '📖 View Catalog' },
          { id: 'borrowing', label: '📊 Borrowing Activity' },
          { id: 'support', label: '🛟 Student Support' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TeacherTab)}
            className={`px-4 py-2 font-semibold transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'catalog' && <BorrowBooksSection />}

      {activeTab === 'borrowing' && <StudentBorrowingManagementSection />}

      {activeTab === 'support' && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-3">What teachers can do</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Review the library catalogue before guiding students.</li>
              <li>Monitor ongoing borrowing activity and overdue items.</li>
              <li>Coordinate with the librarian for library requests and updates.</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-3">Library reminders</h3>
            <p className="text-gray-600">
              Encourage students to borrow responsibly and return books on time to keep the collection available for everyone.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
