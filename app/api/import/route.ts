import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';
import { addMockUser, getMockUsers } from '@/lib/mock-storage';

interface ImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  errors: string[];
  warnings: string[];
}

interface DatabaseStatus {
  provider: 'sqlite' | 'memory';
  sqliteConfigured: boolean;
  message: string;
}

// In-memory storage for imported books
let importedBooks: any[] = [];

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function getDatabaseStatus(): DatabaseStatus {
  const sqliteConfigured = Boolean(process.env.SQLITE_DB_PATH);

  return {
    provider: sqliteConfigured ? 'sqlite' : 'memory',
    sqliteConfigured,
    message: sqliteConfigured
      ? 'SQLite is configured for imports and persistence.'
      : 'SQLite DB path is not set. Set SQLITE_DB_PATH to enable persistence.',
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const importType = formData.get('importType') as string;
    const targetClass = ((formData.get('className') as string) || '').trim().toUpperCase();

    if (!file || !importType) {
      return NextResponse.json(
        { error: 'File and importType required' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      );
    }

    const fileText = await file.text();
    const lines = fileText.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must contain headers and at least one row' },
        { status: 400 }
      );
    }

    const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
    const result: ImportResult = {
      success: true,
      importedCount: 0,
      failedCount: 0,
      errors: [],
      warnings: [],
    };

    const db = await getDatabase();
    const importRun = Date.now();

    if (importType === 'books') {
      const requiredHeaders = ['title', 'author', 'isbn', 'category', 'quantity'];
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

      if (missingHeaders.length > 0) {
        return NextResponse.json(
          {
            error: `Missing required headers: ${missingHeaders.join(', ')}`,
          },
          { status: 400 }
        );
      }

      const booksToImport: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.filter((v) => v).length === 0) continue;

        const title = values[headers.indexOf('title')] || '';
        const author = values[headers.indexOf('author')] || '';
        const isbn = values[headers.indexOf('isbn')] || '';
        const category = values[headers.indexOf('category')] || '';
        const quantity = values[headers.indexOf('quantity')] || '';

        if (!title || !author || !isbn) {
          result.failedCount++;
          result.errors.push(`Row ${i + 1}: Missing title, author, or ISBN`);
          continue;
        }

        if (isNaN(Number(quantity))) {
          result.failedCount++;
          result.errors.push(`Row ${i + 1}: Invalid quantity (must be a number)`);
          continue;
        }

        booksToImport.push({
          title,
          author,
          isbn,
          category,
          quantity: Number(quantity),
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      if (booksToImport.length > 0) {
        try {
          const booksCollection = db.collection('book_catalog');
          await booksCollection.insertMany(booksToImport as any[]);
          result.importedCount = booksToImport.length;
          console.log(`✓ Imported ${booksToImport.length} books to SQLite`);
        } catch (err) {
          console.error('SQLite insert error (books):', err);
          importedBooks.push(...booksToImport);
          result.importedCount = booksToImport.length;
          result.warnings.push('Stored in memory because SQLite insert failed');
        }
      }
    } else if (importType === 'members') {
      const requiredHeaders = ['name', 'role', 'joindate'];
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

      if (missingHeaders.length > 0) {
        return NextResponse.json(
          {
            error: `Missing required headers: ${missingHeaders.join(', ')}`,
          },
          { status: 400 }
        );
      }

      const classHeaderIndex = headers.findIndex((header) => ['class', 'classname', 'class_name'].includes(header));

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.filter((v) => v).length === 0) continue;

        const name = values[headers.indexOf('name')] || '';
        const role = values[headers.indexOf('role')] || '';
        const joindate = values[headers.indexOf('joindate')] || '';
        const csvClass = classHeaderIndex >= 0 ? values[classHeaderIndex] || '' : '';
        const normalizedRole = role.toLowerCase();

        if (!name || !role) {
          result.failedCount++;
          result.errors.push(`Row ${i + 1}: Missing name or role`);
          continue;
        }

        if (!['student', 'teacher', 'librarian', 'deputy_head_teacher'].includes(normalizedRole)) {
          result.failedCount++;
          result.errors.push(`Row ${i + 1}: Invalid role (must be student, teacher, librarian, or deputy_head_teacher)`);
          continue;
        }

        const className = (csvClass || targetClass || 'NO CLASS').trim().toUpperCase();
        const generatedId = `imported-${importRun}-${i}`;
        const usernameBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'member';
        const userRecord: any = {
          _id: generatedId,
          id: generatedId,
          username: `${usernameBase}${i}`,
          password: 'changeme123',
          name,
          role: normalizedRole,
          joindate,
          created_at: new Date(),
        };

        if (normalizedRole === 'student') {
          // assign class and a unique student number
          userRecord.class_name = className;
          userRecord.level = className;
          userRecord.student_no = `STU-${importRun}-${i}`;
        }

        try {
          const usersCollection = db.collection('users');
          await usersCollection.insertOne(userRecord as any);
          result.importedCount++;
        } catch (err) {
          console.error('SQLite member insert error:', err);
          result.failedCount++;
          result.errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : 'Failed to save member'}`);
        }
      }

      if (result.importedCount > 0 && !db) {
        result.warnings.push('Members were stored in memory because SQLite is unavailable.');
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid import type. Use "books" or "members"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: result.failedCount === 0,
      result,
      databaseStatus: getDatabaseStatus(),
      message: `Import completed: ${result.importedCount} records imported, ${result.failedCount} failed`,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV file', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDatabase();

    if (db) {
      try {
        const booksCollection = db.collection('book_catalog');
        const books = await booksCollection.find({}).toArray();
        return NextResponse.json({
          source: 'sqlite',
          count: books.length,
          books,
          databaseStatus: getDatabaseStatus(),
        });
      } catch (err) {
        console.error('SQLite read error:', err);
      }
    }

    return NextResponse.json({
      source: 'memory',
      count: importedBooks.length,
      books: importedBooks,
      databaseStatus: getDatabaseStatus(),
    });
  } catch (error) {
    console.error('Error retrieving books:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve books' },
      { status: 500 }
    );
  }
}
