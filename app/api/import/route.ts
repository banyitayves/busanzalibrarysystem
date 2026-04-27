import { NextResponse } from 'next/server';

interface ImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  errors: string[];
  warnings: string[];
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const importType = formData.get('importType') as string;

    if (!file || !importType) {
      return NextResponse.json(
        { error: 'File and importType required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      );
    }

    // Read file content
    const fileText = await file.text();
    const lines = fileText.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must contain headers and at least one row' },
        { status: 400 }
      );
    }

    // Parse CSV
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const result: ImportResult = {
      success: true,
      importedCount: 0,
      failedCount: 0,
      errors: [],
      warnings: [],
    };

    if (importType === 'books') {
      const requiredHeaders = ['title', 'author', 'isbn', 'category', 'quantity'];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );

      if (missingHeaders.length > 0) {
        return NextResponse.json(
          {
            error: `Missing required headers: ${missingHeaders.join(', ')}`,
          },
          { status: 400 }
        );
      }

      // Process book records
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());

        if (values.filter((v) => v).length === 0) continue; // Skip empty rows

        const title = values[headers.indexOf('title')];
        const author = values[headers.indexOf('author')];
        const isbn = values[headers.indexOf('isbn')];
        const category = values[headers.indexOf('category')];
        const quantity = values[headers.indexOf('quantity')];

        if (!title || !author || !isbn) {
          result.failedCount++;
          result.errors.push(`Row ${i + 1}: Missing title, author, or ISBN`);
          continue;
        }

        if (isNaN(Number(quantity))) {
          result.failedCount++;
          result.errors.push(
            `Row ${i + 1}: Invalid quantity (must be a number)`
          );
          continue;
        }

        result.importedCount++;
      }
    } else if (importType === 'members') {
      const requiredHeaders = ['name', 'role', 'joindate'];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );

      if (missingHeaders.length > 0) {
        return NextResponse.json(
          {
            error: `Missing required headers: ${missingHeaders.join(', ')}`,
          },
          { status: 400 }
        );
      }

      // Process member records
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());

        if (values.filter((v) => v).length === 0) continue; // Skip empty rows

        const name = values[headers.indexOf('name')];
        const role = values[headers.indexOf('role')];
        const joindate = values[headers.indexOf('joindate')];

        if (!name || !role) {
          result.failedCount++;
          result.errors.push(`Row ${i + 1}: Missing name or role`);
          continue;
        }

        if (!['student', 'teacher', 'librarian'].includes(role.toLowerCase())) {
          result.failedCount++;
          result.errors.push(
            `Row ${i + 1}: Invalid role (must be student, teacher, or librarian)`
          );
          continue;
        }

        result.importedCount++;
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid import type. Use "books" or "members"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      result,
      message: `Import completed: ${result.importedCount} records imported, ${result.failedCount} failed`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process CSV file' },
      { status: 500 }
    );
  }
}
