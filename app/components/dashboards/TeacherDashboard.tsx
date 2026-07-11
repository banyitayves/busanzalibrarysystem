'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">👩‍🏫 Library Staff Portal</h2>
        <p>Support catalog maintenance, book availability, and borrower services through the library system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Catalogue Review</h3>
          <p className="text-sm text-gray-600">Check book availability and inspect records before issue or return.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Borrower Support</h3>
          <p className="text-sm text-gray-600">Assist with borrowing, renewals, and quick status checks.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Library Operations</h3>
          <p className="text-sm text-gray-600">Coordinate updates and day-to-day administration for the collection.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Library tasks</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Review the catalog and item availability.</li>
          <li>Monitor borrowing activity and return status.</li>
          <li>Coordinate with the librarian for new arrivals and updates.</li>
        </ul>
      </div>
    </div>
  );
}
