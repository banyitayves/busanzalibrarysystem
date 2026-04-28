import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import getPool from '@/lib/db';
import { extractTextFromFile, splitTextIntoChunks, cleanText } from '@/lib/file-processor';
import { generateBookSummary } from '@/lib/openai-service';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const description = formData.get('description') as string;
    const userId = formData.get('userId') as string;

    if (!file || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 100MB allowed' }, { status: 413 });
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF and TXT files are supported' }, { status: 400 });
    }

    // Save file to public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = path.join(uploadsDir, fileName);

    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Extract text from file
    const fileContent = await extractTextFromFile(filePath);
    const cleanedContent = cleanText(fileContent.text);

    // Save to database
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO books (title, author, description, file_path, file_type, file_content, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          author,
          description,
          `/uploads/${fileName}`,
          fileContent.fileType,
          cleanedContent,
          userId || null,
        ]
      );

      const bookId = (result as any).insertId;

      // Generate and save summary
      try {
        const summary = await generateBookSummary(cleanedContent, title);
        await connection.execute(
          `INSERT INTO book_summaries (book_id, summary) VALUES (?, ?)`,
          [bookId, summary]
        );
      } catch (summaryError) {
        console.error('Error generating summary:', summaryError);
        // Continue even if summary generation fails
      }

      return NextResponse.json(
        { id: bookId, message: 'Book uploaded successfully' },
        { status: 201 }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error uploading book:', error);
    return NextResponse.json(
      { error: 'Failed to upload book', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [books] = await connection.execute(
        `SELECT id, title, author, description, file_type, created_at FROM books ORDER BY created_at DESC LIMIT 100`
      );

      return NextResponse.json(books);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}
