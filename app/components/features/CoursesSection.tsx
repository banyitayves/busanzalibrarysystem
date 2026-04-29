'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  videoUrl?: string;
  sampleQuestions?: string[];
  students: number;
  duration: string;
  createdAt: string;
}

export default function CoursesSection() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set());
  const [enrollmentMessage, setEnrollmentMessage] = useState<{ id: string; message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchCourses();
    if (user?.id) {
      fetchEnrolledCourses();
    }
  }, [user?.id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      const data = await response.json();
      // Filter by instructor (in demo, show all)
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch(`/api/courses/enroll?studentId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data.map((course: any) => course.id));
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!user?.id) {
      setEnrollmentMessage({
        id: courseId,
        message: 'Please log in to enroll',
        type: 'error',
      });
      return;
    }

    setEnrollingCourses(prev => new Set([...prev, courseId]));

    try {
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          courseId: courseId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEnrolledCourses(prev => [...prev, courseId]);
        setEnrollmentMessage({
          id: courseId,
          message: '✅ Successfully enrolled!',
          type: 'success',
        });
        // Clear message after 3 seconds
        setTimeout(() => setEnrollmentMessage(null), 3000);
      } else if (data.alreadyEnrolled) {
        setEnrolledCourses(prev => [...prev, courseId]);
        setEnrollmentMessage({
          id: courseId,
          message: 'Already enrolled in this course',
          type: 'error',
        });
      } else {
        setEnrollmentMessage({
          id: courseId,
          message: data.error || 'Failed to enroll',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      setEnrollmentMessage({
        id: courseId,
        message: 'Error enrolling in course',
        type: 'error',
      });
    } finally {
      setEnrollingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const categories = ['All', ...new Set(courses.map((c) => c.category))];
  const filteredCourses =
    selectedCategory === 'All'
      ? courses
      : courses.filter((c) => c.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">🎓 Available Courses</h3>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white p-6 rounded-lg text-center text-gray-600">
          No courses found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 flex items-center justify-center">
                <span className="text-4xl">📚</span>
              </div>

              <div className="p-4">
                <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full mb-2">
                  {course.category}
                </span>
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>👨‍🏫 {course.instructor}</p>
                  <p>⏱️ {course.duration}</p>
                  <p>👥 {course.students} students enrolled</p>
                </div>

                {course.sampleQuestions && course.sampleQuestions.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p className="text-xs font-semibold text-blue-900 mb-2">
                      Sample Questions:
                    </p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      {course.sampleQuestions.slice(0, 2).map((q, idx) => (
                        <li key={idx}>• {q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolledCourses.includes(course.id) || enrollingCourses.has(course.id)}
                    className={`w-full px-4 py-2 rounded hover:transition font-semibold text-sm ${
                      enrolledCourses.includes(course.id)
                        ? 'bg-green-600 text-white cursor-default hover:bg-green-600'
                        : enrollingCourses.has(course.id)
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-indigo-600 text-white rounded hover:bg-indigo-700'
                    }`}
                  >
                    {enrolledCourses.includes(course.id)
                      ? '✅ Enrolled'
                      : enrollingCourses.has(course.id)
                      ? '⏳ Enrolling...'
                      : 'Enroll Now'}
                  </button>

                  {enrollmentMessage?.id === course.id && (
                    <div className={`text-xs p-2 rounded text-center ${
                      enrollmentMessage.type === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {enrollmentMessage.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
