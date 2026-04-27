'use client';

import { useState } from 'react';
import { useAuth, type UserRole } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !name || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!selectedRole || selectedRole === 'librarian') {
      setError('Only students can register. Teachers and Librarians use admin panel.');
      return;
    }

    setIsLoading(true);
    try {
      await register(email, name, password, selectedRole);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
          Create Your Account
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="John Doe"
              required
            />
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a:
            </label>
            <div className="space-y-3">
              {[
                { role: 'student' as UserRole, label: '👨‍🎓 Student', desc: 'Learn & ask questions' },
                { role: 'teacher' as UserRole, label: '👨‍🏫 Teacher', desc: 'Create courses' },
              ].map(({ role, label, desc }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  disabled={role === 'teacher'}
                  className={`w-full p-3 text-left rounded-lg border-2 transition ${
                    selectedRole === role
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  } ${role === 'teacher' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold text-gray-800">{label}</div>
                  <div className="text-xs text-gray-600">{desc}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Teachers register through admin panel
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6 border-t pt-4">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
