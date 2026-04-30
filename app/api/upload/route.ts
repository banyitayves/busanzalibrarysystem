import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { extractTextFromFile, cleanText } from '@/lib/file-processor';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['text/plain', 'application/pdf', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.md') && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
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

    // Save file temporarily to extract text
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = path.join(uploadsDir, fileName);

    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Extract text using proper text extraction
    let fileContent;
    try {
      fileContent = await extractTextFromFile(filePath);
    } catch (extractError) {
      console.error(`Error extracting from ${fileName}:`, extractError);
      // Return error response instead of fallback
      return NextResponse.json(
        { error: 'Failed to extract text from file. Please try a different file.' },
        { status: 400 }
      );
    }

    const cleanedContent = cleanText(fileContent.text);

    // Return file content
    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      content: cleanedContent.substring(0, 10000), // Limit to 10k chars for AI processing
      fullContent: cleanedContent,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
