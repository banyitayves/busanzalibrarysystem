import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getDatabase } from '@/lib/mongodb';
import { extractTextFromFile, splitTextIntoChunks, cleanText } from '@/lib/file-processor';
import { generateBookSummary } from '@/lib/gemini-service';
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

    let fileContent;
    let fileSaved = false;
    const fileName = `${uuidv4()}-${file.name}`;
    let fileUrl = `/uploads/${fileName}`;

    // Try to save file to disk (will work locally, may fail on Vercel)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, fileName);
      const buffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
      fileSaved = true;
      console.log(`📄 File saved to disk: ${fileName} (${file.size} bytes)`);

      // Extract text from saved file
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
    } catch (diskError) {
      // Fall back to in-memory extraction if file system write fails (Vercel environment)
      console.warn(`⚠️ Could not save file to disk (likely on Vercel), using in-memory storage:`, diskError);
      
      const buffer = await file.arrayBuffer();
      const bufferData = Buffer.from(buffer);
      
      // For in-memory storage, just store basic file content
      fileContent = {
        text: file.type === 'application/pdf' 
          ? `PDF Document: ${fileName} (${file.size} bytes)` 
          : bufferData.toString('utf-8').substring(0, 100000), // Limit to 100k chars
        fileName,
        fileType: file.type.includes('pdf') ? 'pdf' : 'txt',
      };
      
      fileUrl = `/memory/${fileName}`; // Mark as in-memory file
      console.log(`📄 File stored in memory: ${fileName} (${file.size} bytes)`);
    }

    const cleanedContent = cleanText(fileContent.text);

    const db = await getDatabase();
    const bookId = uuidv4();
    const newBook = {
      _id: bookId,
      book_id: bookId,
      title,
      author: author || 'Unknown',
      description: description || 'No description provided',
      file_path: fileUrl,
      file_type: fileContent.fileType,
      file_content: cleanedContent,
      uploaded_by: userId || null,
      created_at: new Date(),
    };

    if (db) {
      const booksCollection = db.collection('books');
      await booksCollection.insertOne(newBook as any);
      console.log(`✅ Book saved to MongoDB: ${title}`);
    } else {
      addMockBook(newBook as any);
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
    const errorDetails = error instanceof Error ? error.message : String(error);
    console.error('Error uploading book:', error);
    return NextResponse.json(
      { error: `Failed to upload book: ${errorDetails}` },
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
        .project({ book_id: 1, title: 1, author: 1, description: 1, file_type: 1, created_at: 1 })
        .sort({ created_at: -1 })
        .limit(100)
        .toArray();
      
      // Map book_id to id for API response
      books = books.map(b => ({
        id: b.book_id || b._id,
        title: b.title,
        author: b.author,
        description: b.description,
        file_type: b.file_type,
        created_at: b.created_at,
      }));
    } else {
      // Fallback to in-memory storage
      const mockBooks = getMockBooks();
      books = mockBooks
        .map(b => ({
          id: b.book_id || b._id,
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
