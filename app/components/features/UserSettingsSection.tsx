'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

const THEME_OPTIONS = [
  { value: 'system', label: 'System default' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

type ThemeOption = (typeof THEME_OPTIONS)[number]['value'];

function applyTheme(theme: ThemeOption) {
  const root = document.documentElement;

  if (theme === 'system') {
    root.style.removeProperty('--background');
    root.style.removeProperty('--foreground');
    return;
  }

  if (theme === 'dark') {
    root.style.setProperty('--background', '#0a0a0a');
    root.style.setProperty('--foreground', '#ededed');
    return;
  }

  root.style.setProperty('--background', '#ffffff');
  root.style.setProperty('--foreground', '#171717');
}

export default function UserSettingsSection() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [name, setName] = useState(user?.name || '');
  const [theme, setTheme] = useState<ThemeOption>(user?.theme || 'system');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setUsername(user.username || '');
    setName(user.name);
    setTheme(user.theme || 'system');
  }, [user]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!user) {
      setError('No active user. Please log in again.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    const updates: any = {};
    if (username && username !== user.username) updates.username = username;
    if (name && name !== user.name) updates.name = name;
    if (theme && theme !== user.theme) updates.theme = theme;
    if (newPassword) updates.password = newPassword;

    if (!Object.keys(updates).length) {
      setMessage('No changes were made.');
      return;
    }

    if ((updates.username || updates.password) && !currentPassword) {
      setError('Please enter your current password to change username or password.');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          currentPassword: currentPassword || undefined,
          updates,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Unable to save settings');
        return;
      }

      updateUser({
        username: data.user.username,
        name: data.user.name,
        theme: data.user.theme,
      });
      setMessage('Your settings were updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Unable to save settings at this time.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">My Account Settings</h2>
          <p className="text-sm text-gray-600">Update your username, password, and display theme from one place.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700">
          Current theme:
          <span className="font-semibold">{theme || 'system'}</span>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm text-slate-700">
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Username"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Display name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Your display name"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Theme preference
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeOption)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            >
              {THEME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm text-slate-700">
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Current password"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="New password"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Confirm password"
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </section>
  );
}
