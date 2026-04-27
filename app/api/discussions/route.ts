import { NextRequest, NextResponse } from 'next/server';

interface Discussion {
  id: string;
  title: string;
  topic: string;
  authorId: string;
  authorName: string;
  content: string;
  type: 'sync' | 'async'; // synchronous (live chat) or asynchronous (forum)
  status: 'active' | 'closed';
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
}

interface Reply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

let discussions: Discussion[] = [
  {
    id: '1',
    title: 'How to implement authentication in Next.js?',
    topic: 'Next.js',
    authorId: 'user1',
    authorName: 'Alex',
    content: 'I am building a Next.js app and need help implementing user authentication. Has anyone done this before?',
    type: 'async',
    status: 'active',
    replies: [
      {
        id: '1-1',
        userId: 'user2',
        userName: 'Jordan',
        content: 'Check out NextAuth.js - it makes authentication super easy!',
        timestamp: new Date().toISOString(),
      },
      {
        id: '1-2',
        userId: 'user3',
        userName: 'Casey',
        content: 'I prefer Auth0. Their Next.js SDK is excellent.',
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Best practices for React hooks',
    topic: 'React',
    authorId: 'user4',
    authorName: 'Morgan',
    content: 'Let\'s discuss React hooks best practices and common mistakes to avoid.',
    type: 'sync',
    status: 'active',
    replies: [
      {
        id: '2-1',
        userId: 'user5',
        userName: 'Taylor',
        content: 'Always define hooks at the top level of your components!',
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dId = searchParams.get('id');
  const topic = searchParams.get('topic');
  const type = searchParams.get('type');

  let filtered: Discussion[] = discussions;

  if (dId) {
    return NextResponse.json(
      discussions.find((d) => d.id === dId) || { error: 'Discussion not found' },
      discussions.find((d) => d.id === dId) ? { status: 200 } : { status: 404 }
    );
  }

  if (topic) {
    filtered = filtered.filter((d) => d.topic === topic);
  }

  if (type) {
    filtered = filtered.filter((d) => d.type === type);
  }

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, topic, content, authorId, authorName, type = 'async' } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content required' },
        { status: 400 }
      );
    }

    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      title,
      topic: topic || 'General',
      authorId: authorId || 'anonymous',
      authorName: authorName || 'Anonymous',
      content,
      type,
      status: 'active',
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    discussions.push(newDiscussion);
    return NextResponse.json(newDiscussion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// Add reply to discussion
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, reply } = body;

    const discussion = discussions.find((d) => d.id === id);
    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    if (action === 'reply' && reply) {
      const newReply: Reply = {
        id: `${id}-${Date.now()}`,
        userId: reply.userId || 'anonymous',
        userName: reply.userName || 'Anonymous',
        content: reply.content,
        timestamp: new Date().toISOString(),
      };
      discussion.replies.push(newReply);
      discussion.updatedAt = new Date().toISOString();
    }

    return NextResponse.json(discussion);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    discussions = discussions.filter((d) => d.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
