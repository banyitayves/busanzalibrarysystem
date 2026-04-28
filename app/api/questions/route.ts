import { NextRequest, NextResponse } from 'next/server';
import { generateAnswer } from '@/lib/ai-service';
import { getDatabase } from '@/lib/mongodb';

let mockQuestions: Array<{
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
  try {
    const { searchParams } = new URL(request.url);
    const qId = searchParams.get('id');

    const db = await getDatabase();

    if (db) {
      // Try MongoDB
      const questionsCollection = db.collection('questions');
      
      if (qId) {
        const question = await questionsCollection.findOne({ _id: qId });
        return question
          ? NextResponse.json(question)
          : NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      const questions = await questionsCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();
      return NextResponse.json(questions || []);
    } else {
      // Fallback to in-memory
      if (qId) {
        const question = mockQuestions.find((q) => q.id === qId);
        return question
          ? NextResponse.json(question)
          : NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      return NextResponse.json(mockQuestions);
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, studentId, studentName, bookTitle, bookId } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question cannot be empty' }, { status: 400 });
    }

    console.log(`❓ New question from ${studentName}: ${question.substring(0, 50)}...`);

    // Generate AI answer
    let answer;
    try {
      answer = await generateAnswer(question);
    } catch (aiError) {
      console.error('AI answer generation failed:', aiError);
      answer = `I'm having trouble generating an answer right now. This question has been recorded and will be reviewed by our teaching team. Thank you for your inquiry!`;
    }

    const db = await getDatabase();
    const questionId = `q_${Date.now()}`;
    
    const newQuestion = {
      _id: questionId,
      id: questionId,
      studentId: studentId || 'anonymous',
      studentName: studentName || 'Anonymous Student',
      question,
      answer,
      bookTitle: bookTitle || null,
      bookId: bookId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      status: 'answered',
    };

    if (db) {
      // Try MongoDB
      const questionsCollection = db.collection('questions');
      await questionsCollection.insertOne(newQuestion);
      console.log(`✅ Question saved to MongoDB: ${questionId}`);
    } else {
      // Fallback to in-memory
      mockQuestions.push({
        id: questionId,
        studentId: newQuestion.studentId,
        studentName: newQuestion.studentName,
        question,
        answer,
        createdAt: newQuestion.createdAt.toISOString(),
        likes: 0,
      });
      console.log(`✅ Question saved to memory: ${questionId}`);
    }

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error posting question:', error);
    return NextResponse.json(
      { error: 'Failed to post question', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, likes } = body;

    const db = await getDatabase();

    if (db) {
      const questionsCollection = db.collection('questions');
      const result = await questionsCollection.updateOne(
        { _id: id },
        { $set: { likes: likes || 0, updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      const updated = await questionsCollection.findOne({ _id: id });
      return NextResponse.json(updated);
    } else {
      // Fallback to in-memory
      const questionIndex = mockQuestions.findIndex((q) => q.id === id);
      if (questionIndex === -1) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      if (likes !== undefined) {
        mockQuestions[questionIndex].likes = likes;
      }

      return NextResponse.json(mockQuestions[questionIndex]);
    }
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}
