'use client';

import { useAuth } from '@/app/context/AuthContext';
import StudentLibraryHub from '@/app/components/StudentLibraryHub';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">📚 Welcome, {user?.name}!</h2>
        <p>
          Access the library catalogue, borrow books, and manage your reading activities in a simple library-management workflow.
        </p>
        <div className="mt-3 p-2 bg-blue-400 rounded text-sm">
          Library access: browse titles, review details, and manage borrowing in one place.
        </div>
      </div>

      <StudentLibraryHub />
    </div>
  );
}
