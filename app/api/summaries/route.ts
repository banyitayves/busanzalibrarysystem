import { NextRequest, NextResponse } from 'next/server';
import { generateSummary } from '@/lib/ai-service';

let summaries: Array<{
  id: string;
  userId: string;
  userName: string;
  bookTitle: string;
  originalText: string;
  summary: string;
  createdAt: string;
}> = [
  {
    id: '1',
    userId: 'demo1',
    userName: 'John',
    bookTitle: 'Introduction to Algorithms',
    originalText:
      'Algorithms are step-by-step procedures for solving a problem. They are fundamental to computer science. Good algorithms are efficient, correct, and scalable. Understanding complexity analysis helps us choose the right algorithm for different problems.',
    summary:
      'Algorithms are essential step-by-step procedures in computer science. Efficiency, correctness, and scalability are key factors in algorithm design. Complexity analysis helps determine the most appropriate algorithm for specific problem-solving needs.',
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sId = searchParams.get('id');

  if (sId) {
    const summary = summaries.find((s) => s.id === sId);
    return summary
      ? NextResponse.json(summary)
      : NextResponse.json({ error: 'Summary not found' }, { status: 404 });
  }

  return NextResponse.json(summaries);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookTitle, originalText, userId, userName } = body;

    if (!bookTitle || !originalText) {
      return NextResponse.json(
        { error: 'Book title and text required' },
        { status: 400 }
      );
    }

    // Generate AI summary
    const summary = await generateSummary(originalText);

    const newSummary = {
      id: Date.now().toString(),
      userId: userId || 'anonymous',
      userName: userName || 'Anonymous',
      bookTitle,
      originalText,
      summary,
      createdAt: new Date().toISOString(),
    };

    summaries.push(newSummary);
    return NextResponse.json(newSummary, { status: 201 });
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

    summaries = summaries.filter((s) => s.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
