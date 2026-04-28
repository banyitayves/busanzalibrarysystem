import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';
import { initializeDatabase } from '@/lib/db-init';

export async function POST(request: NextRequest) {
  let connection = null;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const title = formData.get('title') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      );
    }

    // Initialize database if needed
    try {
      await initializeDatabase();
    } catch (initError) {
      console.error('Database initialization error:', initError);
    }

    const pool = getPool();
    connection = await pool.getConnection();

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;

    // Insert book/document record
    const [result] = await connection.execute(
      `INSERT INTO books (title, file_path, file_type, file_size, uploaded_by, is_document, created_at)
       VALUES (?, ?, ?, ?, ?, TRUE, NOW())`,
      [title || fileName, fileName, fileType, fileSize, userId]
    );

    const documentId = (result as any).insertId;

    return NextResponse.json(
      {
        message: 'Document uploaded successfully',
        document: {
          id: documentId,
          title: title || fileName,
          fileName,
          fileType,
          fileSize,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
