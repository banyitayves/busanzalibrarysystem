import { NextResponse } from 'next/server';

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

// In-memory storage
let messages: Message[] = [];
let conversations: Conversation[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const conversationId = searchParams.get('conversationId');
  const action = searchParams.get('action');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // Get conversations
  if (action === 'conversations') {
    const userConversations = conversations.filter((conv) =>
      conv.participants.includes(userId)
    );
    return NextResponse.json(userConversations);
  }

  // Get messages in a conversation
  if (conversationId) {
    const conversationMessages = messages.filter(
      (msg) => msg.id.includes(conversationId)
    );
    return NextResponse.json(conversationMessages);
  }

  // Get all messages for user (unread)
  const userMessages = messages.filter(
    (msg) => msg.receiverId === userId && !msg.read
  );

  return NextResponse.json(userMessages);
}

export async function POST(request: Request) {
  const { senderId, senderName, receiverId, receiverName, content } =
    await request.json();

  if (!senderId || !receiverId || !content) {
    return NextResponse.json(
      { error: 'senderId, receiverId, and content required' },
      { status: 400 }
    );
  }

  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    senderId,
    senderName,
    receiverId,
    receiverName,
    content,
    timestamp: new Date().toISOString(),
    read: false,
  };

  messages.push(newMessage);

  // Update or create conversation
  const conversationId = [senderId, receiverId].sort().join('_');
  const existingConv = conversations.find((c) => c.id === conversationId);

  if (existingConv) {
    existingConv.lastMessage = content;
    existingConv.lastMessageTime = newMessage.timestamp;
    existingConv.messageCount += 1;
  } else {
    conversations.push({
      id: conversationId,
      participants: [senderId, receiverId],
      participantNames: {
        [senderId]: senderName,
        [receiverId]: receiverName,
      },
      lastMessage: content,
      lastMessageTime: newMessage.timestamp,
      messageCount: 1,
    });
  }

  return NextResponse.json({ success: true, message: newMessage });
}

export async function PUT(request: Request) {
  const { messageId } = await request.json();

  if (!messageId) {
    return NextResponse.json({ error: 'messageId required' }, { status: 400 });
  }

  const message = messages.find((m) => m.id === messageId);
  if (message) {
    message.read = true;
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json(
      { error: 'conversationId required' },
      { status: 400 }
    );
  }

  messages = messages.filter((m) => !m.id.includes(conversationId));
  conversations = conversations.filter((c) => c.id !== conversationId);

  return NextResponse.json({ success: true, message: 'Conversation deleted' });
}
