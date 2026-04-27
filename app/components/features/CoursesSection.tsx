'use client';

import { useState, useEffect } from 'react';

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
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

                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-semibold text-sm">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
