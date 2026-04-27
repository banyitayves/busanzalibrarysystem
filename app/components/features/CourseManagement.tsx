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

export default function CourseManagement() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    videoUrl: '',
    sampleQuestions: '',
    duration: '6 weeks',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      // Filter by instructor (in demo, show all)
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sampleQuestions: formData.sampleQuestions
            .split('\n')
            .filter((q) => q.trim()),
          instructor: user?.name,
        }),
      });
      const newCourse = await response.json();
      setCourses([...courses, newCourse]);
      setFormData({
        title: '',
        description: '',
        category: 'General',
        videoUrl: '',
        sampleQuestions: '',
        duration: '6 weeks',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    try {
      await fetch(`/api/courses?id=${id}`, { method: 'DELETE' });
      setCourses(courses.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Total Courses</p>
          <p className="text-3xl font-bold text-blue-600">{courses.length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-3xl font-bold text-green-600">
            {courses.reduce((sum, c) => sum + c.students, 0)}
          </p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Active Discussions</p>
          <p className="text-3xl font-bold text-purple-600">24</p>
        </div>
      </div>

      {/* Create Course Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
        >
          + Create New Course
        </button>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">📚 Create New Course</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-24"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>General</option>
                  <option>Web Development</option>
                  <option>Data Science</option>
                  <option>Design</option>
                  <option>Mobile Development</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/video"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sample Questions (one per line)
              </label>
              <textarea
                name="sampleQuestions"
                value={formData.sampleQuestions}
                onChange={handleInputChange}
                placeholder="What is React?&#10;How do hooks work?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-20"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-semibold"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Your Courses ({courses.length})</h3>
        {courses.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-600">
            No courses created yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{course.title}</h4>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold"
                  >
                    🗑️
                  </button>
                </div>

                <p className="text-xs text-indigo-600 font-semibold mb-2">
                  {course.category}
                </p>
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                  {course.description}
                </p>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>⏱️ {course.duration}</p>
                  <p>👥 {course.students} students</p>
                </div>

                <button className="w-full mt-4 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition font-semibold">
                  Edit Course
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
