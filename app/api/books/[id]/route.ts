import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateAnswerFromContext, findRelevantContext } from '@/lib/openai-service';
import { splitTextIntoChunks } from '@/lib/file-processor';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const connection = await pool.getConnection();
    try {
      if (action === 'summary') {
        // Get book summary
        const [summary] = await connection.execute(
          `SELECT summary FROM book_summaries WHERE book_id = ?`,
          [id]
        );

        if (!summary || (summary as any[]).length === 0) {
          return NextResponse.json({ summary: 'No summary available' });
        }

        return NextResponse.json((summary as any)[0]);
      } else {
        // Get book details
        const [book] = await connection.execute(
          `SELECT id, title, author, description, file_type, file_content, created_at FROM books WHERE id = ?`,
          [id]
        );

        if (!book || (book as any[]).length === 0) {
          return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json((book as any)[0]);
      }
    } finally {
      await connection.end();
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
