'use client';

import { useEffect, useState } from 'react';

interface Student {
  id: string;
  name: string;
  email?: string;
  role?: string;
  class_name?: string;
}

interface Props {
  params: Promise<{ className: string }> | { className: string };
}

export default function ClassDetailPage({ params }: Props) {
  const [className, setClassName] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await Promise.resolve(params);
        setClassName(decodeURIComponent((resolved as any).className || ''));
      } catch {
        setError('Failed to load class name');
      }
    };

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!className) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/students');
        if (!response.ok) throw new Error('Failed to fetch students');

        const data = await response.json();
        const filtered = Array.isArray(data)
          ? data.filter((student: Student) => student.class_name === className)
          : [];

        setStudents(filtered);
      } catch (err) {
        setError(`Unable to load class details: ${String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [className]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{className || 'Class Details'}</h1>
            <p className="text-indigo-100">
              View the class roster and see the current students linked to this class.
            </p>
          </div>

          <div className="p-8">
            {loading ? (
              <p className="text-gray-600">Loading class details...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : (
              <>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Class</p>
                    <p className="text-xl font-semibold text-indigo-700">{className}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="text-xl font-semibold text-green-700">{students.length}</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-xl font-semibold text-amber-700">Active</p>
                  </div>
                </div>

                {students.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id} className="border-t border-gray-200">
                            <td className="px-4 py-3 text-sm text-gray-800">{student.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.email || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-600">
                    No students are currently registered for this class.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
