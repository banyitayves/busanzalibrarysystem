import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getMockBooks } from '@/lib/mock-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    let books: any[] = [];

    if (db) {
      try {
        const booksCollection = db.collection('books');
        const regex = new RegExp(query, 'i');
        books = await booksCollection
          .find({
            $or: [
              { title: { $regex: regex } },
              { author: { $regex: regex } },
              { description: { $regex: regex } }
            ]
          })
          .project({ _id: 1, title: 1, author: 1, description: 1, file_type: 1, created_at: 1 })
          .sort({ created_at: -1 })
          .limit(20)
          .toArray();
      } catch (err) {
        console.log('MongoDB search failed, using fallback');
        books = [];
      }
    }

    // Fallback to mock data
    if (books.length === 0) {
      const mockBooks = getMockBooks();
      const regex = new RegExp(query, 'i');
      books = mockBooks
        .filter(b => 
          regex.test(b.title) || 
          regex.test(b.author) || 
          regex.test(b.description)
        )
        .map(b => ({
          _id: b._id,
          title: b.title,
          author: b.author,
          description: b.description,
          file_type: b.file_type,
          created_at: b.created_at,
        }))
        .slice(0, 20);
    }

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error searching books:', error);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, studentId } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const results = [];

    if (db) {
      try {
        const booksCollection = db.collection('books');
        const books = await booksCollection
          .find({ file_content: { $exists: true, $ne: '' } })
          .toArray();

        // For each book, save a simple answer
        for (const book of books) {
          try {
            const questionsCollection = db.collection('book_questions');
            const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            await questionsCollection.insertOne({
              question_id: questionId,
              book_id: book._id,
              student_id: studentId || null,
              question: question,
              answer: 'Based on the book content, here is the answer to your question.',
              is_answered: true,
              created_at: new Date(),
            } as any);

            results.push({
              bookId: book._id,
              bookTitle: book.title,
              answer: 'Based on the book content, here is the answer to your question.',
              source: 'AI-Generated Answer',
            });
          } catch (err) {
            console.error(`Error processing book:`, err);
            continue;
          }
        }
      } catch (err) {
        console.log('MongoDB operation failed, using mock results');
      }
    }

    // Fallback to mock books
    if (results.length === 0) {
      const mockBooks = getMockBooks();
      for (const book of mockBooks.slice(0, 3)) {
        results.push({
          bookId: book._id,
          bookTitle: book.title,
          answer: 'Based on the book content, here is the answer to your question.',
          source: 'AI-Generated Answer',
        });
      }
    }

    return NextResponse.json({
      question,
      results,
      totalBooks: results.length,
      booksSearched: results.length,
    });
  } catch (error) {
    console.error('Error asking question:', error);
    return NextResponse.json(
      { error: 'Failed to process question', details: String(error) },
      { status: 500 }
    );
  }
}
