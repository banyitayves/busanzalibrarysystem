'use client';

import { useState } from 'react';
import { useAuth, type UserRole } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password || !selectedRole) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password, selectedRole);
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          📚 Smart Library
        </h1>
        <p className="text-gray-600 text-center mb-8">
          AI-Powered Learning Platform
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your username"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Your Role
            </label>
            <div className="space-y-3">
              {[
                { role: 'student' as UserRole, label: '👨‍🎓 Student', desc: 'Ask questions, get summaries' },
                { role: 'teacher' as UserRole, label: '👨‍🏫 Teacher', desc: 'Teach & create courses' },
                { role: 'librarian' as UserRole, label: '👨‍💼 Librarian', desc: 'Manage library' },
              ].map(({ role, label, desc }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition ${
                    selectedRole === role
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{label}</div>
                  <div className="text-xs text-gray-600">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
          >
            {isLoading ? '⏳ Signing in...' : '🔓 Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center border-t pt-6">
          <p className="text-sm text-gray-600 mb-4">
            Don't have an account?
          </p>
          <Link
            href="/register"
            className="w-full block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-center"
          >
            Create New Account
          </Link>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2">📞 Need Help?</p>
          <p className="text-xs text-blue-800">Contact <strong>YVES</strong> at <strong>+250791756160</strong></p>
          <p className="text-xs text-blue-800 mt-2">First time? Register a new account using the button below.</p>
        </div>
      </div>
    </div>
  );
}
