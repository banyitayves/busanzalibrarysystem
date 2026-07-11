'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import BorrowBooksSection from '@/app/components/features/BorrowBooksSection';
import ReadBooksSection from '@/app/components/features/ReadBooksSection';

type StudentTab = 'borrowable' | 'readable' | 'loans' | 'policy';

interface LoanRecord {
  id: string;
  title: string;
  borrowedAt: string;
  status: 'Active' | 'Returned';
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<StudentTab>('borrowable');
  const [loans, setLoans] = useState<LoanRecord[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const savedLoans = localStorage.getItem(`student-loans-${user.id}`);
    if (savedLoans) {
      try {
        setLoans(JSON.parse(savedLoans));
      } catch {
        setLoans([]);
      }
    }
  }, [user?.id]);

  const handleBorrowSuccess = (bookTitle: string) => {
    const newLoan: LoanRecord = {
      id: `${Date.now()}`,
      title: bookTitle,
      borrowedAt: new Date().toLocaleDateString(),
      status: 'Active',
    };

    const nextLoans = [newLoan, ...loans].slice(0, 5);
    setLoans(nextLoans);
    if (user?.id) {
      localStorage.setItem(`student-loans-${user.id}`, JSON.stringify(nextLoans));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">📚 Welcome, {user?.name}!</h2>
        <p>
          Browse the library catalogue, borrow books, and keep track of your current reading activity.
        </p>
        <div className="mt-3 p-2 bg-blue-400 rounded text-sm">
          Student access: search the catalog, borrow books, and monitor your active loans.
        </div>
      </div>

      <div className="flex gap-4 flex-wrap border-b overflow-x-auto">
        {[
          { id: 'borrowable', label: '📖 Borrowable Books' },
          { id: 'readable', label: '📚 Read Books' },
          { id: 'loans', label: '📚 My Loans' },
          { id: 'policy', label: '📋 Library Rules' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as StudentTab)}
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

      {activeTab === 'borrowable' && <BorrowBooksSection onBorrowSuccess={handleBorrowSuccess} />}

      {activeTab === 'readable' && <ReadBooksSection />}

      {activeTab === 'loans' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">My Borrowing Activity</h3>
          {loans.length === 0 ? (
            <p className="text-gray-600">You do not have any active loans yet. Borrow a book to see it here.</p>
          ) : (
            <div className="space-y-3">
              {loans.map((loan) => (
                <div key={loan.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{loan.title}</p>
                    <p className="text-sm text-gray-600">Borrowed on {loan.borrowedAt}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">{loan.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'policy' && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-3">Borrowing Rules</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Each student can borrow one book at a time.</li>
              <li>Borrowed books should be returned within 14 days.</li>
              <li>Overdue books may be blocked from borrowing more items.</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-3">Library Support</h3>
            <p className="text-gray-600">
              Contact the librarian for renewals, returns, or questions about the catalogue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
