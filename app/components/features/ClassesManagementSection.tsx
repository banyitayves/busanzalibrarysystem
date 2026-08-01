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

interface ClassGroup {
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

const CLASS_OPTIONS = {
  S1: ['S1A', 'S1B', 'S1C', 'S1D'],
  S2: ['S2A', 'S2B', 'S2C', 'S2D', 'S2E', 'S2F'],
  S3: ['S3A', 'S3B', 'S3C', 'S3D'],
  S4: ['S4 MS2', 'S4 ARTS', 'S4 LANG'],
  S5: ['S5 LFK', 'S5 MCE', 'S5 HGL'],
  S6: ['S6 LFK', 'S6 MCE', 'S6 HGL'],
};

const ALL_CLASSES = Object.values(CLASS_OPTIONS).flat();

export default function LibrarianClassesSection() {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>(ALL_CLASSES[0]);
  const [exportingClass, setExportingClass] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClassesAndStudents();
  }, []);

  useEffect(() => {
    if (!classes.length && ALL_CLASSES.length) {
      setSelectedClass(ALL_CLASSES[0]);
    }
  }, [classes]);

  const loadClassesAndStudents = async () => {
    try {
      setLoading(true);
      const [studentsResponse, borrowRecordsResponse] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/borrow-records'),
      ]);

      const studentsText = await studentsResponse.text();
      const borrowText = await borrowRecordsResponse.text();

      let studentsData: any[] = [];
      let borrowData: any[] = [];

      try {
        studentsData = studentsText ? JSON.parse(studentsText) : [];
      } catch {
        studentsData = [];
      }

      try {
        borrowData = borrowText ? JSON.parse(borrowText) : [];
      } catch {
        borrowData = [];
      }

      const classMap = new Map<string, Student[]>(ALL_CLASSES.map((name) => [name, []]));
      const studentRecords = Array.isArray(studentsData) ? studentsData : [];
      const loanRecords = Array.isArray(borrowData) ? borrowData : [];

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

      if (!classMap.has('No Class')) {
        classMap.set('No Class', []);
      }

      const classList: ClassGroup[] = ALL_CLASSES.map((name) => ({
        name,
        count: classMap.get(name)?.length || 0,
        students: classMap.get(name)?.sort((a, b) => a.name.localeCompare(b.name)) ?? [],
      }));

      setClasses(classList);
      setBorrowRecords(loanRecords);
      if (!ALL_CLASSES.includes(selectedClass)) {
        setSelectedClass(classList[0]?.name || ALL_CLASSES[0]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses(
        ALL_CLASSES.map((name) => ({
          name,
          count: 0,
          students: [],
        }))
      );
      setBorrowRecords([]);
      setSelectedClass(ALL_CLASSES[0]);
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

  const selectedClassData = classes.find((item) => item.name === selectedClass);

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">👥 Classes & Students</h3>
            <p className="text-sm text-gray-600">
              Browse all registration classes, select the class you want, and review enrolled students.
            </p>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search classes or students"
            className="px-3 py-2 border border-gray-300 rounded-lg w-full md:w-80"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
          <div className="space-y-3">
            <div className="bg-slate-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-600">Total registration classes</p>
              <p className="text-3xl font-bold text-blue-600">{classes.length}</p>
            </div>
            <div className="overflow-hidden rounded-lg border bg-white">
              <div className="border-b bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                Choose a class
              </div>
              <div className="max-h-[520px] overflow-auto">
                {filteredClasses.map((classItem) => (
                  <button
                    key={classItem.name}
                    onClick={() => setSelectedClass(classItem.name)}
                    className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition ${
                      selectedClass === classItem.name
                        ? 'bg-indigo-50 text-indigo-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between gap-3 items-center">
                      <span>{classItem.name}</span>
                      <span className="text-xs text-slate-500">{classItem.count} students</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{selectedClassData?.name || 'No class selected'}</h4>
                  <p className="text-sm text-gray-500">{selectedClassData?.count ?? 0} enrolled students</p>
                </div>
                <button
                  onClick={() => exportStudentsAsExcel(selectedClassData?.name || '')}
                  disabled={!selectedClassData || exportingClass === selectedClassData.name}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {exportingClass === selectedClassData?.name ? 'Preparing...' : 'Export class list'}
                </button>
              </div>
            </div>

            {selectedClassData?.students.length ? (
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 text-sm text-slate-600">
                  <div>Student</div>
                  <div>Status</div>
                  <div>Loan</div>
                </div>
                <div className="divide-y">
                  {selectedClassData.students.map((student) => (
                    <div key={student.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{student.name}</p>
                        <p className="text-sm text-slate-500">{student.email || 'No email'}</p>
                      </div>
                      <div className="text-sm text-slate-700">
                        {student.role}
                      </div>
                      <div className="flex flex-col gap-2 text-sm">
                        {student.hasBook ? (
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-orange-800">
                            📖 {student.loanStatus === 'overdue' ? 'Overdue' : 'Borrowed'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                            No active loan
                          </span>
                        )}
                        {student.currentBook && <span className="text-slate-500">{student.currentBook}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg border text-gray-600">
                No students are registered in this class yet.
              </div>
            )}
          </div>
        </div>
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
