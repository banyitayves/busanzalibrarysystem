import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getDatabase } from '@/lib/mongodb';
import { extractTextFromFile, splitTextIntoChunks, cleanText } from '@/lib/file-processor';
import { generateBookSummary } from '@/lib/openai-service';
import { addMockBook, getMockBooks } from '@/lib/mock-storage';
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

    console.log(`📄 Processing file: ${fileName} (${file.size} bytes)`);

    // Extract text from file
    let fileContent;
    try {
      fileContent = await extractTextFromFile(filePath);
    } catch (extractError) {
      console.error(`Error extracting from ${fileName}:`, extractError);
      fileContent = {
        text: `Document: ${fileName}`,
        fileName,
        fileType: file.type.includes('pdf') ? 'pdf' : 'txt',
      };
    }

    const cleanedContent = cleanText(fileContent.text);

    const db = await getDatabase();
    const bookId = uuidv4();
    const newBook = {
      _id: bookId,
      title,
      author: author || 'Unknown',
      description: description || 'No description provided',
      file_path: `/uploads/${fileName}`,
      file_type: fileContent.fileType,
      file_content: cleanedContent,
      uploaded_by: userId || null,
      created_at: new Date(),
    };

    if (db) {
      const booksCollection = db.collection('books');
      await booksCollection.insertOne(newBook);
      console.log(`✅ Book saved to MongoDB: ${title}`);
    } else {
      addMockBook(newBook);
      console.log(`✅ Book saved to memory: ${title}`);
    }

    // Generate summary (async, don't block the response)
    generateSummaryAsync(cleanedContent, title, bookId, db).catch(err => 
      console.error(`Summary generation failed for ${title}:`, err)
    );

    return NextResponse.json(
      { 
        id: bookId, 
        message: '✅ Book uploaded successfully! AI summary is being generated in the background.',
        title,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading book:', error);
    return NextResponse.json(
      { error: 'Failed to upload book', details: String(error) },
      { status: 500 }
    );
  }
}

// Generate summary asynchronously without blocking
async function generateSummaryAsync(content: string, title: string, bookId: string, db: any) {
  try {
    const summary = await generateBookSummary(content, title);
    if (db) {
      const summariesCollection = db.collection('book_summaries');
      await summariesCollection.insertOne({
        book_id: bookId,
        summary,
        created_at: new Date(),
      });
      console.log(`✅ Summary saved for: ${title}`);
    }
  } catch (err) {
    console.error(`Failed to generate summary for ${title}:`, err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    let books: any[] = [];

    if (db) {
      // Try MongoDB
      const booksCollection = db.collection('books');
      books = await booksCollection
        .find({})
        .project({ id: 1, title: 1, author: 1, description: 1, file_type: 1, created_at: 1 })
        .sort({ created_at: -1 })
        .limit(100)
        .toArray();
    } else {
      // Fallback to in-memory storage
      const mockBooks = getMockBooks();
      books = mockBooks
        .map(b => ({
          id: b._id,
          title: b.title,
          author: b.author,
          description: b.description,
          file_type: b.file_type,
          created_at: b.created_at,
        }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 100);
    }

    return NextResponse.json(books || []);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}
