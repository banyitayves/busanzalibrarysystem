'use client';

import { useEffect, useState } from 'react';

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  class_name: string;
  hasBook?: boolean;
  currentBook?: string;
  loanStatus?: string;
}

interface Class {
  name: string;
  count: number;
  students: Student[];
}

interface BorrowRecord {
  borrow_id: string;
  student_id: string;
  student_name: string;
  book_title: string;
  status: 'borrowed' | 'returned' | 'overdue';
}

export default function LibrarianClassesSection() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [exportingClass, setExportingClass] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClassesAndStudents();
  }, []);

  const loadClassesAndStudents = async () => {
    try {
      setLoading(true);
      const [studentsResponse, borrowRecordsResponse] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/borrow-records'),
      ]);

      const students = await studentsResponse.json();
      const borrowed = await borrowRecordsResponse.json();

      const classMap = new Map<string, Student[]>();
      const studentRecords = Array.isArray(students) ? students : [];
      const loanRecords = Array.isArray(borrowed) ? borrowed : [];

      studentRecords.forEach((student: Student) => {
        const className = student.class_name || 'No Class';
        if (!classMap.has(className)) {
          classMap.set(className, []);
        }
        const record = loanRecords.find(
          (item: BorrowRecord) => item.student_id === student.id || item.student_name === student.name
        );
        classMap.get(className)?.push({
          ...student,
          hasBook: Boolean(record && ['borrowed', 'overdue'].includes(record.status)),
          currentBook: record?.book_title || '',
          loanStatus: record?.status || 'none',
        });
      });

      const classList: Class[] = Array.from(classMap.entries())
        .map(([name, studentsInClass]) => ({
          name,
          count: studentsInClass.length,
          students: studentsInClass.sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setClasses(classList);
      setBorrowRecords(loanRecords);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportStudentsAsExcel = async (className: string) => {
    try {
      setExportingClass(className);
      const classData = classes.find((item) => item.name === className);
      if (!classData) return;

      const response = await fetch('/api/export-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className,
          format: 'xlsx',
          students: classData.students.map((student) => ({
            name: student.name,
            email: student.email,
            id: student.id,
            role: student.role,
            className: student.class_name,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${className}_students.xlsx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      alert('Failed to export: ' + String(error));
    } finally {
      setExportingClass(null);
    }
  };

  const filteredClasses = classes.filter((classItem) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;

    return (
      classItem.name.toLowerCase().includes(term) ||
      classItem.students.some((student) =>
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.currentBook?.toLowerCase().includes(term)
      )
    );
  });

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-center text-gray-600">Loading classes and students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">📚 Classes & Students Management</h3>
            <p className="text-sm text-gray-600">Review every class roster, flag students with active loans, and export class lists.</p>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search class or student"
            className="px-3 py-2 border border-gray-300 rounded-lg w-full md:w-72"
          />
        </div>

        {filteredClasses.length === 0 ? (
          <p className="text-gray-600">No matching classes found.</p>
        ) : (
          <div className="space-y-4">
            {filteredClasses.map((classItem) => {
              const activeBorrowers = classItem.students.filter((student) => student.hasBook).length;

              return (
                <div key={classItem.name} className="border rounded-lg p-4">
                  <div
                    onClick={() => setExpandedClass(expandedClass === classItem.name ? null : classItem.name)}
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-800">{classItem.name}</h4>
                      <p className="text-sm text-gray-500">{classItem.count} students • {activeBorrowers} with active books</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          exportStudentsAsExcel(classItem.name);
                        }}
                        disabled={exportingClass === classItem.name}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {exportingClass === classItem.name ? 'Preparing...' : '⬇️ Excel'}
                      </button>
                      <span className="text-gray-400">{expandedClass === classItem.name ? '▼' : '▶'}</span>
                    </div>
                  </div>

                  {expandedClass === classItem.name && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-2">
                        {classItem.students.map((student) => (
                          <div key={student.id} className="flex flex-col gap-2 bg-gray-50 p-3 rounded md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.email || 'No email provided'}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                              {student.hasBook ? (
                                <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-800">
                                  📖 Has book • {student.currentBook || 'Active loan'}
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700">
                                  No active loan
                                </span>
                              )}
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {student.role}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 mb-2">Total Classes</p>
          <p className="text-3xl font-bold text-blue-600">{classes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 mb-2">Total Students</p>
          <p className="text-3xl font-bold text-green-600">{classes.reduce((sum, classItem) => sum + classItem.count, 0)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 mb-2">Active Borrowers</p>
          <p className="text-3xl font-bold text-purple-600">{borrowRecords.filter((record) => record.status === 'borrowed' || record.status === 'overdue').length}</p>
        </div>
      </div>
    </div>
  );
}
