'use client';

import { useState } from 'react';
import { useAuth, type UserRole } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedRole) {
      alert('Please fill in all fields and select a role');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, 'password', selectedRole);
      router.push('/dashboard');
    } catch (error) {
      alert('Login failed');
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

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="your@email.com"
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
            {isLoading ? 'Signing in...' : 'Sign In'}
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

        <p className="text-center text-sm text-gray-600 mt-6">
          Demo: Use any email (e.g., test@example.com)
        </p>
      </div>
    </div>
  );
}
