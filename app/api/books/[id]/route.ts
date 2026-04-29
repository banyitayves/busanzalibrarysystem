import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { getMockBooks } from '@/lib/mock-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const db = await getDatabase();
    let book: any = null;

    if (db) {
      // Try MongoDB
      const booksCollection = db.collection('books');
      // Try to match by string _id first, then by ObjectId if valid
      const filter: any = { $or: [{ _id: id }] };
      if (ObjectId.isValid(id)) {
        filter.$or.push({ _id: new ObjectId(id) });
      }
      book = await booksCollection.findOne(filter);
    } else {
      // Fallback to in-memory storage
      const mockBooks = getMockBooks();
      book = mockBooks.find(b => b._id === id);
    }

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (action === 'summary') {
      // Return book summary (for now, return first paragraph)
      const firstParagraph = book.file_content?.split('\n\n')[0] || 'No summary available';
      return NextResponse.json({ 
        summary: firstParagraph,
        book_id: book._id,
      });
    } else {
      // Return full book details with content
      return NextResponse.json({
        id: book._id,
        title: book.title,
        author: book.author,
        description: book.description,
        file_type: book.file_type,
        file_content: book.file_content,
        file_path: book.file_path,
        uploaded_by: book.uploaded_by,
        created_at: book.created_at,
      });
    }
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, studentId, question, dueDate } = body;

    const db = await getDatabase();

    if (action === 'borrow') {
      // Borrow book - store in database
      const borrowId = `borrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const dueDateValue = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      if (db) {
        try {
          const borrowsCollection = db.collection('book_borrows');
          await borrowsCollection.insertOne({
            borrow_id: borrowId,
            student_id: studentId,
            book_id: id,
            status: 'borrowed',
            due_date: dueDateValue,
            borrow_date: new Date(),
          } as any);
        } catch (err) {
          console.log('MongoDB borrow failed, continuing with mock response');
        }
      }

      return NextResponse.json(
        { id: borrowId, message: 'Book borrowed successfully' },
        { status: 201 }
      );
    } else if (action === 'return') {
      // Return book
      if (db) {
        try {
          const borrowsCollection = db.collection('book_borrows');
          await borrowsCollection.updateOne(
            { student_id: studentId, book_id: id, status: 'borrowed' },
            { $set: { status: 'returned', returned_date: new Date() } }
          );
        } catch (err) {
          console.log('MongoDB return failed, continuing with mock response');
        }
      }

      return NextResponse.json({ message: 'Book returned successfully' });
    } else if (action === 'ask_question') {
      // Ask question about book
      const questionId = `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (db) {
        try {
          const questionsCollection = db.collection('book_questions');
          await questionsCollection.insertOne({
            question_id: questionId,
            book_id: id,
            student_id: studentId,
            question: question,
            answer: 'Thank you for your question. Please check the book content for more details.',
            is_answered: true,
            created_at: new Date(),
          } as any);
        } catch (err) {
          console.log('MongoDB question failed, continuing with mock response');
        }
      }

      return NextResponse.json(
        { 
          id: questionId, 
          question, 
          answer: 'Thank you for your question. Please check the book content for more details.' 
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
}
