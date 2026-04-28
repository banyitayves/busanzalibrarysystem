import { NextRequest, NextResponse } from 'next/server';
import { generateAnswer } from '@/lib/ai-service';
import { getDatabase } from '@/lib/mongodb';
import { getMockQuestions, findMockQuestion, findMockQuestions, addMockQuestion, updateMockQuestion, getMockBooks } from '@/lib/mock-storage';

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
        const question = findMockQuestion({ _id: qId });
        return question
          ? NextResponse.json(question)
          : NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      return NextResponse.json(getMockQuestions());
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

    // Search for relevant book content to use as context
    let context = '';
    const db = await getDatabase();
    
    if (bookId) {
      // If a specific book is mentioned, get its content
      if (db) {
        const booksCollection = db.collection('books');
        const book = await booksCollection.findOne({ _id: bookId });
        if (book && book.file_content) {
          context = book.file_content.substring(0, 2000); // Use first 2000 chars as context
        }
      } else {
        // Search in mock storage
        const mockBooks = getMockBooks();
        const book = mockBooks.find(b => b._id === bookId);
        if (book && book.file_content) {
          context = book.file_content.substring(0, 2000);
        }
      }
    } else {
      // Try to find relevant books by searching content for keywords
      const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      let relevantBooks: any[] = [];
      
      if (db) {
        const booksCollection = db.collection('books');
        relevantBooks = await booksCollection
          .find({})
          .toArray();
      } else {
        relevantBooks = getMockBooks();
      }
      
      // Find books with content matching the question
      for (const book of relevantBooks) {
        if (book.file_content) {
          const bookContent = book.file_content.toLowerCase();
          const matchCount = questionWords.filter(word => bookContent.includes(word)).length;
          
          if (matchCount > 0) {
            context += `\n\n[From "${book.title}"]:\n${book.file_content.substring(0, 1000)}`;
            if (context.length > 3000) break; // Limit context size
          }
        }
      }
    }

    // Generate AI answer with context
    let answer;
    try {
      answer = await generateAnswer(question, context || undefined);
    } catch (aiError) {
      console.error('AI answer generation failed:', aiError);
      answer = `I'm having trouble generating an answer right now. This question has been recorded and will be reviewed by our teaching team. Thank you for your inquiry!`;
    }

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
      addMockQuestion({
        _id: questionId,
        student_id: newQuestion.studentId,
        student_name: newQuestion.studentName,
        question_text: question,
        answer_text: answer,
        status: 'answered',
        created_at: newQuestion.createdAt,
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
      const question = findMockQuestion({ _id: id });
      if (!question) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      if (likes !== undefined) {
        updateMockQuestion({ _id: id }, { likes });
      }

      const updated = findMockQuestion({ _id: id });
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}
