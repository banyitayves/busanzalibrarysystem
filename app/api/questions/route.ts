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
        const question = await questionsCollection.findOne({ question_id: qId } as any);
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
          context = `[From: "${book.title}" by ${book.author || 'Unknown'}]\n\n${book.file_content.substring(0, 3000)}`;
        }
      } else {
        // Search in mock storage
        const mockBooks = getMockBooks();
        const book = mockBooks.find(b => b._id === bookId);
        if (book && book.file_content) {
          context = `[From: "${book.title}" by ${book.author || 'Unknown'}]\n\n${book.file_content.substring(0, 3000)}`;
        }
      }
    } else {
      // Smart search: find relevant books by scoring keyword matches
      const questionLower = question.toLowerCase();
      const questionWords = questionLower
        .split(/[\s\-,.!?;:]+/)
        .filter((w: string) => w.length > 2);
      
      let relevantBooks: any[] = [];
      
      if (db) {
        const booksCollection = db.collection('books');
        relevantBooks = await booksCollection.find({}).toArray();
      } else {
        relevantBooks = getMockBooks();
      }
      
      // Score books by relevance
      const scoredBooks = relevantBooks
        .map(book => {
          const bookContent = (book.file_content || '').toLowerCase();
          const titleMatch = (book.title || '').toLowerCase();
          const descriptionMatch = (book.description || '').toLowerCase();
          
          // Count keyword matches in different sections
          let score = 0;
          for (const word of questionWords) {
            // Title matches are worth more (5 points)
            if (titleMatch.includes(word)) score += 5;
            // Description matches (3 points)
            if (descriptionMatch.includes(word)) score += 3;
            // Content matches (1 point)
            if (bookContent.includes(word)) score += 1;
          }
          
          return { book, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);
      
      // Use top 3 most relevant books
      const topBooks = scoredBooks.slice(0, 3);
      
      for (const { book } of topBooks) {
        if (book.file_content) {
          context += `\n\n[📖 From: "${book.title}" by ${book.author || 'Unknown'}]\n${book.file_content.substring(0, 1500)}`;
        }
      }
      
      // If no matches found, include all available books as fallback
      if (topBooks.length === 0 && relevantBooks.length > 0) {
        for (const book of relevantBooks.slice(0, 2)) {
          if (book.file_content) {
            context += `\n\n[📖 Available: "${book.title}" by ${book.author || 'Unknown'}]\n${book.file_content.substring(0, 1000)}`;
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
      question_id: questionId,
      id: questionId,
      student_id: studentId || 'anonymous',
      student_name: studentName || 'Anonymous Student',
      question_text: question,
      answer_text: answer,
      book_title: bookTitle || null,
      book_id: bookId || null,
      created_at: new Date(),
      updated_at: new Date(),
      likes: 0,
      status: 'answered',
    };

    if (db) {
      // Try MongoDB
      const questionsCollection = db.collection('questions');
      await questionsCollection.insertOne(newQuestion as any);
      console.log(`✅ Question saved to MongoDB: ${questionId}`);
    } else {
      // Fallback to in-memory
      addMockQuestion({
        _id: questionId,
        student_id: newQuestion.student_id,
        student_name: newQuestion.student_name,
        question_text: question,
        answer_text: answer,
        status: 'answered',
        created_at: newQuestion.created_at,
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
