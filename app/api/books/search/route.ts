import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateAnswerFromContext, findRelevantContext } from '@/lib/openai-service';
import { splitTextIntoChunks } from '@/lib/file-processor';

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

    const connection = await pool.getConnection();
    try {
      // Search for books by title, author, or description
      const [books] = await connection.execute(
        `SELECT id, title, author, description, file_type, created_at FROM books 
         WHERE title LIKE ? OR author LIKE ? OR description LIKE ?
         ORDER BY created_at DESC LIMIT 20`,
        [`%${query}%`, `%${query}%`, `%${query}%`]
      );

      return NextResponse.json(books);
    } finally {
      await connection.end();
    }
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

    const connection = await pool.getConnection();
    try {
      // Get all books
      const [books] = await connection.execute(
        `SELECT id, title, file_content FROM books WHERE file_content IS NOT NULL AND file_content != ''`
      );

      if (!books || (books as any[]).length === 0) {
        return NextResponse.json(
          { error: 'No books available' },
          { status: 404 }
        );
      }

      const booksList = books as any[];
      const results = [];

      // Search through all books for relevant answers
      for (const book of booksList) {
        try {
          const chunks = splitTextIntoChunks(book.file_content, 2000, 200);
          const context = await findRelevantContext(question, chunks, 2);

          if (context && context.length > 0) {
            const answer = await generateAnswerFromContext(question, context, book.title);

            // Save the question and answer
            await connection.execute(
              `INSERT INTO book_questions (book_id, student_id, question, answer, is_answered) 
               VALUES (?, ?, ?, ?, TRUE)`,
              [book.id, studentId || null, question, answer]
            );

            results.push({
              bookId: book.id,
              bookTitle: book.title,
              answer,
              source: 'AI-Generated Answer',
            });
          }
        } catch (err) {
          console.error(`Error processing book ${book.id}:`, err);
          continue;
        }
      }

      return NextResponse.json({
        question,
        results,
        totalBooks: booksList.length,
        booksSearched: results.length,
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error asking question:', error);
    return NextResponse.json(
      { error: 'Failed to process question', details: String(error) },
      { status: 500 }
    );
  }
}
