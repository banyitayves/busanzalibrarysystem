'use client';

import { useState, useEffect } from 'react';

interface Student {
  _id: string;
  name: string;
  username: string;
  email?: string;
  role: string;
  class_name?: string;
  created_at?: Date;
}

interface BorrowRecord {
  borrow_id: string;
  student_id: string;
  student_name: string;
  book_id: string;
  book_title: string;
  status: 'borrowed' | 'returned' | 'overdue';
  borrow_date: Date;
  due_date: Date;
  returned_date?: Date;
}

export default function StudentBorrowingManagementSection() {
  const [students, setStudents] = useState<Student[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all-students' | 'borrowed' | 'returned' | 'overdue'>('all-students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchBorrowRecords();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowRecords = async () => {
    try {
      const response = await fetch('/api/books');
      const books = await response.json();
      
      // Mock borrow records for demo - in production this would come from the database
      const mockBorrows: BorrowRecord[] = [
        {
          borrow_id: 'borrow_001',
          student_id: '1',
          student_name: 'John Student',
          book_id: 'book_1',
          book_title: 'Introduction to Mathematics',
          status: 'borrowed',
          borrow_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          due_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        },
        {
          borrow_id: 'borrow_002',
          student_id: '2',
          student_name: 'Jane Student',
          book_id: 'book_2',
          book_title: 'World History Overview',
          status: 'returned',
          borrow_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          due_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          returned_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          borrow_id: 'borrow_003',
          student_id: '3',
          student_name: 'Admin Librarian',
          book_id: 'book_3',
          book_title: 'Computer Science Fundamentals',
          status: 'overdue',
          borrow_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          due_date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        },
      ];
      setBorrowRecords(mockBorrows);
    } catch (error) {
      console.error('Error fetching borrow records:', error);
    }
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 'borrowed':
        return borrowRecords.filter(b => b.status === 'borrowed');
      case 'returned':
        return borrowRecords.filter(b => b.status === 'returned');
      case 'overdue':
        return borrowRecords.filter(b => b.status === 'overdue');
      case 'all-students':
      default:
        return students.filter(s =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
  };

  const handleReturnBook = async (borrowId: string) => {
    try {
      const record = borrowRecords.find(b => b.borrow_id === borrowId);
      if (record) {
        const updated = borrowRecords.map(b =>
          b.borrow_id === borrowId
            ? { ...b, status: 'returned' as const, returned_date: new Date() }
            : b
        );
        setBorrowRecords(updated);
      }
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  const handleRenewBorrow = async (borrowId: string) => {
    try {
      const record = borrowRecords.find(b => b.borrow_id === borrowId);
      if (record) {
        const updated = borrowRecords.map(b =>
          b.borrow_id === borrowId
            ? { ...b, due_date: new Date(b.due_date.getTime() + 14 * 24 * 60 * 60 * 1000) }
            : b
        );
        setBorrowRecords(updated);
      }
    } catch (error) {
      console.error('Error renewing borrow:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate: Date) => new Date() > new Date(dueDate);

  const stats = {
    totalStudents: students.length,
    borrowedBooks: borrowRecords.filter(b => b.status === 'borrowed').length,
    returnedBooks: borrowRecords.filter(b => b.status === 'returned').length,
    overdueBooks: borrowRecords.filter(b => b.status === 'overdue').length,
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold">📊 Student Borrowing Management</h2>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Books Borrowed</p>
          <p className="text-3xl font-bold text-green-600">{stats.borrowedBooks}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600">Books Returned</p>
          <p className="text-3xl font-bold text-purple-600">{stats.returnedBooks}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600">Overdue Books</p>
          <p className="text-3xl font-bold text-red-600">{stats.overdueBooks}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        <button
          onClick={() => { setActiveTab('all-students'); setSearchTerm(''); }}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'all-students'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          👥 All Students ({stats.totalStudents})
        </button>
        <button
          onClick={() => setActiveTab('borrowed')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'borrowed'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📤 Borrowed ({stats.borrowedBooks})
        </button>
        <button
          onClick={() => setActiveTab('returned')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'returned'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ✅ Returned ({stats.returnedBooks})
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'overdue'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⚠️ Overdue ({stats.overdueBooks})
        </button>
      </div>

      {/* Search Bar for Students Tab */}
      {activeTab === 'all-students' && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by student name or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Content */}
      <div className="overflow-x-auto">
        {activeTab === 'all-students' ? (
          // Students List
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold">Username</th>
                <th className="px-4 py-2 text-left font-semibold">Role</th>
                <th className="px-4 py-2 text-left font-semibold">Class</th>
                <th className="px-4 py-2 text-left font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredData().length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                getFilteredData().map((item: any) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{item.name}</td>
                    <td className="px-4 py-2 text-gray-600">{item.username}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {item.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">{item.class_name || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {item.created_at ? formatDate(item.created_at) : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          // Borrow Records
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Student</th>
                <th className="px-4 py-2 text-left font-semibold">Book Title</th>
                <th className="px-4 py-2 text-left font-semibold">Borrow Date</th>
                <th className="px-4 py-2 text-left font-semibold">Due Date</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredData().length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                getFilteredData().map((item: any) => (
                  <tr key={item.borrow_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{item.student_name}</td>
                    <td className="px-4 py-2">{item.book_title}</td>
                    <td className="px-4 py-2">{formatDate(item.borrow_date)}</td>
                    <td className="px-4 py-2">
                      <span className={isOverdue(item.due_date) && item.status === 'borrowed' ? 'text-red-600 font-semibold' : ''}>
                        {formatDate(item.due_date)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.status === 'borrowed'
                            ? 'bg-orange-100 text-orange-800'
                            : item.status === 'returned'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      {item.status === 'borrowed' && (
                        <>
                          <button
                            onClick={() => handleReturnBook(item.borrow_id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs font-semibold"
                          >
                            Mark Returned
                          </button>
                          <button
                            onClick={() => handleRenewBorrow(item.borrow_id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-semibold"
                          >
                            Renew
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Track all student borrowing activities in real-time</li>
          <li>✓ Manage returned books and mark them as returned</li>
          <li>✓ Monitor overdue books and send reminders to students</li>
          <li>✓ Renew book loans for students when requested</li>
          <li>✓ View complete student roster and their status</li>
        </ul>
      </div>
    </div>
  );
}
