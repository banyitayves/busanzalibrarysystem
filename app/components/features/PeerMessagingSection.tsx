'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: { [id: string]: string };
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
}

export default function PeerMessagingSection() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'conversations' | 'new'>('conversations');

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedConversation && user?.id) {
      fetchMessagesForConversation();
    }
  }, [selectedConversation, user?.id]);

  const fetchConversations = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(
        `/api/messages?userId=${user.id}&action=conversations`
      );
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessagesForConversation = async () => {
    if (!selectedConversation || !user?.id) return;
    try {
      const response = await fetch(
        `/api/messages?userId=${user.id}&conversationId=${selectedConversation}`
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    let receiverId = '';
    if (selectedConversation) {
      const conv = conversations.find((c) => c.id === selectedConversation);
      if (conv) {
        receiverId = conv.participants.find((p) => p !== user?.id) || '';
      }
    } else if (tab === 'new') {
      receiverId = recipientName; // In real app, lookup user by name
    }

    if (!receiverId) {
      alert('Please select a recipient');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.id,
          senderName: user?.name,
          receiverId,
          receiverName: selectedConversation ? conversations.find(c => c.id === selectedConversation)?.participantNames[receiverId] : recipientName,
          content: messageText,
        }),
      });

      if (response.ok) {
        setMessageText('');
        fetchConversations();
        if (selectedConversation) {
          fetchMessagesForConversation();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    const otherId = conv.participants.find((p) => p !== user?.id);
    return otherId ? conv.participantNames[otherId] : 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-4">
        <button
          onClick={() => {
            setTab('conversations');
            setSelectedConversation(null);
          }}
          className={`px-4 py-2 rounded transition font-semibold ${
            tab === 'conversations'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          💬 Conversations
        </button>
        <button
          onClick={() => setTab('new')}
          className={`px-4 py-2 rounded transition font-semibold ${
            tab === 'new'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ✉️ New Message
        </button>
      </div>

      {/* Conversations List */}
      {tab === 'conversations' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">My Conversations</h3>
          {conversations.length === 0 ? (
            <div className="bg-white p-6 rounded-lg text-center text-gray-600">
              No conversations yet. Start a new message!
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv.id);
                    setTab('conversations');
                  }}
                  className={`w-full text-left p-4 rounded-lg transition ${
                    selectedConversation === conv.id
                      ? 'bg-indigo-100 border-2 border-indigo-500'
                      : 'bg-white border border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {getOtherParticipant(conv)}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {conv.lastMessage}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(conv.lastMessageTime).toLocaleDateString()}
                      </p>
                      <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs mt-1">
                        {conv.messageCount} msgs
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Message Form */}
      {tab === 'new' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Send New Message</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Name
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter peer name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-32"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !messageText.trim() || !recipientName.trim()}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-semibold"
          >
            {loading ? '⏳ Sending...' : '📤 Send Message'}
          </button>
        </div>
      )}

      {/* Message Thread */}
      {selectedConversation && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-bold">
            Conversation with {getOtherParticipant(conversations.find(c => c.id === selectedConversation)!)}
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto bg-gray-50 p-4 rounded">
            {messages.length === 0 ? (
              <p className="text-center text-gray-600">No messages yet</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-xs ${
                    msg.senderId === user?.id
                      ? 'ml-auto bg-indigo-100 text-indigo-900'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm font-semibold mb-1">{msg.senderName}</p>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !messageText.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
