import { NextRequest, NextResponse } from 'next/server';
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
      book = await booksCollection.findOne({ _id: id });
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

    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      if (action === 'borrow') {
        // Borrow book
        const dueDateValue = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // Default 14 days

        const [result] = await connection.execute(
          `INSERT INTO book_borrowing (student_id, book_id, due_date) VALUES (?, ?, ?)`,
          [studentId, id, dueDateValue]
        );

        return NextResponse.json(
          { id: (result as any).insertId, message: 'Book borrowed successfully' },
          { status: 201 }
        );
      } else if (action === 'return') {
        // Return book
        await connection.execute(
          `UPDATE book_borrowing SET status = 'returned', returned_date = NOW() WHERE student_id = ? AND book_id = ? AND status = 'borrowed'`,
          [studentId, id]
        );

        return NextResponse.json({ message: 'Book returned successfully' });
      } else if (action === 'ask_question') {
        // Ask question about book
        const [book] = await connection.execute(
          `SELECT file_content FROM books WHERE id = ?`,
          [id]
        );

        if (!book || (book as any[]).length === 0) {
          return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        const bookContent = (book as any)[0].file_content;
        const bookTitle = body.bookTitle || 'Unknown Book';

        // Split content into chunks
        const chunks = splitTextIntoChunks(bookContent, 2000, 200);

        // Find relevant context
        let answer = '';
        try {
          const context = await findRelevantContext(question, chunks, 3);
          answer = await generateAnswerFromContext(question, context, bookTitle);
        } catch (answerError) {
          console.error('Error generating answer:', answerError);
          answer = 'Unable to generate answer at this time.';
        }

        // Save question and answer
        const [result] = await connection.execute(
          `INSERT INTO book_questions (book_id, student_id, question, answer, is_answered) 
           VALUES (?, ?, ?, ?, TRUE)`,
          [id, studentId, question, answer]
        );

        return NextResponse.json(
          { id: (result as any).insertId, question, answer },
          { status: 201 }
        );
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
}
