'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson } from '@/lib/fetch-json';

const CLASS_OPTIONS = {
  'S1': ['S1A', 'S1B', 'S1C', 'S1D'],
  'S2': ['S2A', 'S2B', 'S2C', 'S2D', 'S2E', 'S2F'],
  'S3': ['S3A', 'S3B', 'S3C', 'S3D'],
  'S4': ['S4 MS2', 'S4 ARTS', 'S4 LANG'],
  'S5': ['S5 LFK', 'S5 MCE', 'S5 HGL'],
  'S6': ['S6 LFK', 'S6 MCE', 'S6 HGL'],
};

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole] = useState<'student'>('student');
  const [selectedLevel, setSelectedLevel] = useState<keyof typeof CLASS_OPTIONS>('S1');
  const [selectedClass, setSelectedClass] = useState('S1A');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchJson<{ user?: { id: string | number; username: string; name: string; role: string; class_name: string | null; level: string | null }; token?: string; error?: string; details?: string }>(
        '/api/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.toLowerCase().replace(/\s+/g, ''),
            password,
            name,
            role: selectedRole,
            level: selectedLevel,
            class_name: selectedClass,
          }),
        }
      );

      if (!data.user) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store user info and redirect
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      router.push('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          📚 Library Management System
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Create your student account
        </p>
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Only students can register themselves. Librarian and deputy headteacher accounts are created by the library office.
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Choose a username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Enter password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Confirm password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Account type:
            </label>
            <div className="p-3 rounded-lg border-2 border-indigo-500 bg-indigo-50 text-indigo-900 font-semibold text-sm">
              👨‍🎓 Student
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Your Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => {
                const level = e.target.value as keyof typeof CLASS_OPTIONS;
                setSelectedLevel(level);
                setSelectedClass(CLASS_OPTIONS[level][0]);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {Object.keys(CLASS_OPTIONS).map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Your Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {CLASS_OPTIONS[selectedLevel].map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? '📝 Creating Account...' : '✅ Create Account'}
          </button>
        </form>

        <p className="text-gray-600 text-center mt-6 text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-600 font-semibold hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
