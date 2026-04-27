import { NextRequest, NextResponse } from 'next/server';
import { generateAnswer } from '@/lib/ai-service';

let questions: Array<{
  id: string;
  studentId: string;
  studentName: string;
  question: string;
  answer?: string;
  createdAt: string;
  likes: number;
}> = [
  {
    id: '1',
    studentId: 'demo1',
    studentName: 'John',
    question: 'What is the difference between var, let, and const in JavaScript?',
    answer: 'var is function-scoped and can be redeclared. let and const are block-scoped. const cannot be reassigned after initialization. Best practice: use const by default, let when you need to reassign.',
    createdAt: new Date().toISOString(),
    likes: 5,
  },
  {
    id: '2',
    studentId: 'demo2',
    studentName: 'Sarah',
    question: 'How do I optimize database queries?',
    answer: 'Use indexing on frequently queried columns, avoid SELECT *, use query optimization tools, implement caching, and monitor slow queries. Consider denormalization for read-heavy operations.',
    createdAt: new Date().toISOString(),
    likes: 3,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const qId = searchParams.get('id');

  if (qId) {
    const question = questions.find((q) => q.id === qId);
    return question
      ? NextResponse.json(question)
      : NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  return NextResponse.json(questions);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, studentId, studentName } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 });
    }

    // Generate AI answer
    const answer = await generateAnswer(question);

    const newQuestion = {
      id: Date.now().toString(),
      studentId: studentId || 'anonymous',
      studentName: studentName || 'Anonymous',
      question,
      answer,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    questions.push(newQuestion);
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, likes } = body;

    const questionIndex = questions.findIndex((q) => q.id === id);
    if (questionIndex === -1) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    if (likes !== undefined) {
      questions[questionIndex].likes = likes;
    }

    return NextResponse.json(questions[questionIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
