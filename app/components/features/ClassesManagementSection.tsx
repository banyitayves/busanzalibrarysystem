'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  class_name: string;
}

interface Class {
  name: string;
  count: number;
  students: Student[];
}

export default function LibrarianClassesSection() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchClassesAndStudents();
  }, []);

  const fetchClassesAndStudents = async () => {
    try {
      setLoading(true);
      // Fetch all students and group by class
      const response = await fetch('/api/students');
      const students = await response.json();

      // Group students by class
      const classMap = new Map<string, Student[]>();
      students.forEach((student: Student) => {
        const className = student.class_name || 'No Class';
        if (!classMap.has(className)) {
          classMap.set(className, []);
        }
        classMap.get(className)?.push(student);
      });

      // Convert map to array of classes
      const classList: Class[] = Array.from(classMap.entries()).map(([name, students]) => ({
        name,
        count: students.length,
        students: students.sort((a, b) => a.name.localeCompare(b.name)),
      }));

      setClasses(classList.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportStudentsAsDOCX = async (className: string) => {
    try {
      setExporting(true);
      const classData = classes.find(c => c.name === className);
      if (!classData) return;

      // Send request to export endpoint
      const response = await fetch('/api/export-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className,
          students: classData.students.map(s => ({
            name: s.name,
            email: s.email,
            id: s.id,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${className}_students.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to export: ' + String(error));
    } finally {
      setExporting(false);
    }
  };

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
        <h3 className="text-lg font-bold mb-4">📚 Classes & Students Management</h3>
        
        {classes.length === 0 ? (
          <p className="text-gray-600">No classes found in the system.</p>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem) => (
              <div key={classItem.name} className="border rounded-lg p-4">
                <div
                  onClick={() => setExpandedClass(expandedClass === classItem.name ? null : classItem.name)}
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <div>
                    <h4 className="font-semibold text-gray-800">{classItem.name}</h4>
                    <p className="text-sm text-gray-500">{classItem.count} students</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportStudentsAsDOCX(classItem.name);
                      }}
                      disabled={exporting}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      📥 Export
                    </button>
                    <span className="text-gray-400">
                      {expandedClass === classItem.name ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {expandedClass === classItem.name && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="space-y-2">
                      {classItem.students.map((student) => (
                        <div key={student.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <div>
                            <p className="font-medium text-gray-800">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {student.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 mb-2">Total Classes</p>
          <p className="text-3xl font-bold text-blue-600">{classes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 mb-2">Total Students</p>
          <p className="text-3xl font-bold text-green-600">
            {classes.reduce((sum, c) => sum + c.count, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 mb-2">Average Class Size</p>
          <p className="text-3xl font-bold text-purple-600">
            {classes.length > 0
              ? Math.round(classes.reduce((sum, c) => sum + c.count, 0) / classes.length)
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
