import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';
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
      const booksCollection = db.collection('books');
      book = await booksCollection.findOne({ $or: [{ _id: id }, { book_id: id }] } as any);
    }

    if (!book) {
      const mockBooks = getMockBooks();
      book = mockBooks.find(b => b._id === id || b.book_id === id);
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

function getDueDateForRole(role: string, override?: string | Date) {
  if (override) return new Date(override);

  const days = role === 'teacher' ? 90 : 14;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, studentId, userId, question, dueDate, userRole, role } = body;
    const borrowerId = studentId || userId;
    const borrowerRole = String(userRole || role || 'student').toLowerCase();
    const isTeacher = borrowerRole === 'teacher';

    const db = await getDatabase();

    if (action === 'borrow') {
      if (db) {
        try {
          const borrowsCollection = db.collection('book_borrows');
          const booksCollection = db.collection('books');

          if (!isTeacher) {
            const existingBorrow = await borrowsCollection.findOne({
              student_id: borrowerId,
              status: 'borrowed',
            } as any);

            if (existingBorrow) {
              return NextResponse.json(
                { error: 'Students can borrow only one book at a time. Please return your current book first.' },
                { status: 400 }
              );
            }
          }

          const bookRecord = await booksCollection.findOne({ $or: [{ _id: id }, { book_id: id }] } as any);
          if (bookRecord?.kind === 'borrowable') {
            const availableCopies = Number(bookRecord.copies_available ?? bookRecord.copies_total ?? 0);
            if (availableCopies <= 0) {
              return NextResponse.json({ error: 'This title is currently out of copies.' }, { status: 400 });
            }
            await booksCollection.updateOne(
              { $or: [{ _id: id }, { book_id: id }] } as any,
              { $set: { copies_available: availableCopies - 1 } }
            );
          }
        } catch (err) {
          console.warn('Failed to update borrow inventory:', err);
        }
      }

      const borrowId = `borrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const dueDateValue = getDueDateForRole(borrowerRole, dueDate);

      if (db) {
        try {
          const borrowsCollection = db.collection('book_borrows');
          await borrowsCollection.insertOne({
            borrow_id: borrowId,
            student_id: borrowerId,
            user_role: borrowerRole,
            book_id: id,
            status: 'borrowed',
            due_date: dueDateValue,
            borrow_date: new Date(),
          } as any);
        } catch (err) {
          console.log('SQLite borrow failed, continuing with mock response');
        }
      }

      const returnWindow = borrowerRole === 'teacher' ? '3 months' : '2 weeks';
      return NextResponse.json(
        { id: borrowId, message: `Book borrowed successfully. Return deadline: ${returnWindow}.` },
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
          console.log('SQLite return failed, continuing with mock response');
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
          console.log('SQLite question failed, continuing with mock response');
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
