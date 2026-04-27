'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

interface Reply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

interface Discussion {
  id: string;
  title: string;
  topic: string;
  authorId: string;
  authorName: string;
  content: string;
  type: 'sync' | 'async';
  status: 'active' | 'closed';
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
}

export default function DiscussionsSection({ type = 'student' }: { type?: string }) {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedType, setSelectedType] = useState<'sync' | 'async'>('async');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTopic, setNewTopic] = useState('General');
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [selectedType]);

  const fetchDiscussions = async () => {
    try {
      const response = await fetch(`/api/discussions?type=${selectedType}`);
      const data = await response.json();
      setDiscussions(data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          topic: newTopic,
          type: selectedType,
          authorId: user?.id,
          authorName: user?.name,
        }),
      });
      const discussion = await response.json();
      setDiscussions([discussion, ...discussions]);
      setNewTitle('');
      setNewContent('');
      setNewTopic('General');
    } catch (error) {
      console.error('Error creating discussion:', error);
      alert('Failed to create discussion');
    } finally {
      setCreating(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscussion || !replyContent.trim()) return;

    try {
      const response = await fetch('/api/discussions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDiscussion.id,
          action: 'reply',
          reply: {
            content: replyContent,
            userId: user?.id,
            userName: user?.name,
          },
        }),
      });
      const updated = await response.json();
      setDiscussions(
        discussions.map((d) => (d.id === updated.id ? updated : d))
      );
      setSelectedDiscussion(updated);
      setReplyContent('');
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-4">
        <button
          onClick={() => setSelectedType('async')}
          className={`px-4 py-2 rounded transition ${
            selectedType === 'async'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          💬 Discussion Forum (Asynchronous)
        </button>
        <button
          onClick={() => setSelectedType('sync')}
          className={`px-4 py-2 rounded transition ${
            selectedType === 'sync'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🔴 Live Chat (Synchronous)
        </button>
      </div>

      {/* Create Discussion */}
      {!selectedDiscussion && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">
            {selectedType === 'async'
              ? '💬 Start a Discussion'
              : '🔴 Start a Live Chat'}
          </h3>
          <form onSubmit={handleCreateDiscussion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <select
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>General</option>
                <option>Next.js</option>
                <option>React</option>
                <option>Python</option>
                <option>Web Design</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What do you want to discuss?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share your thoughts or question..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-20"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-semibold"
            >
              {creating ? 'Creating...' : 'Create Discussion'}
            </button>
          </form>
        </div>
      )}

      {/* Discussions List or Selected Discussion */}
      {selectedDiscussion ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <button
            onClick={() => setSelectedDiscussion(null)}
            className="text-indigo-600 hover:text-indigo-700 mb-4 text-sm font-semibold"
          >
            ← Back to Discussions
          </button>

          <h3 className="text-2xl font-bold mb-2 text-gray-900">
            {selectedDiscussion.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            By {selectedDiscussion.authorName} •{' '}
            {new Date(selectedDiscussion.createdAt).toLocaleDateString()}
          </p>

          <p className="text-gray-700 mb-6 whitespace-pre-wrap">
            {selectedDiscussion.content}
          </p>

          {/* Replies */}
          <div className="border-t pt-6 mt-6">
            <h4 className="font-bold mb-4">
              💬 {selectedDiscussion.replies.length} Replies
            </h4>

            <div className="space-y-4 mb-6">
              {selectedDiscussion.replies.map((reply) => (
                <div key={reply.id} className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold text-gray-900">
                    {reply.userName}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(reply.timestamp).toLocaleString()}
                  </p>
                  <p className="text-gray-700">{reply.content}</p>
                </div>
              ))}
            </div>

            {/* Add Reply Form */}
            <form onSubmit={handleReply} className="space-y-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your response..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-20"
              />
              <button
                type="submit"
                disabled={!replyContent.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-semibold"
              >
                Post Reply
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">
            {discussions.length} Discussion{discussions.length !== 1 ? 's' : ''}
          </h3>
          {discussions.length === 0 ? (
            <div className="bg-white p-6 rounded-lg text-center text-gray-600">
              No discussions yet. Be the first to start one!
            </div>
          ) : (
            discussions.map((discussion) => (
              <div
                key={discussion.id}
                onClick={() => setSelectedDiscussion(discussion)}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-gray-900 text-lg">
                    {discussion.title}
                  </h4>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      discussion.type === 'async'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {discussion.type === 'async' ? '💬 Forum' : '🔴 Live'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  By {discussion.authorName} • {discussion.topic}
                </p>

                <p className="text-gray-700 mb-3 line-clamp-2">
                  {discussion.content}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>💬 {discussion.replies.length} replies</span>
                  <span>
                    {new Date(discussion.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
