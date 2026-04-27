import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['text/plain', 'application/pdf', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: TXT, PDF, MD, DOCX' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 5MB' },
        { status: 400 }
      );
    }

    // Read file content
    const buffer = await file.arrayBuffer();
    const text = Buffer.from(buffer).toString('utf-8');

    // Return file content
    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      content: text.substring(0, 10000), // Limit to 10k chars for AI processing
      fullContent: text,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
