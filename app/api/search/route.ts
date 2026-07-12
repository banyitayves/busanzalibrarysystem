import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getMockBooks } from '@/lib/mock-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const regex = q ? new RegExp(q, 'i') : null;

    const db = await getDatabase();

    const result: any = {
      classes: [],
      courses: [],
      books: [],
    };

    if (db) {
      try {
        const studentsCol = db.collection('students');
        const coursesCol = db.collection('courses');
        const booksCol = db.collection('books');

        // Classes: aggregate distinct class_name with counts
        const classMatch: any = { class_name: { $exists: true, $ne: '' } };
        if (regex) {
          classMatch.class_name = { $regex: regex };
        }

        const classes = await studentsCol
          .aggregate([
            { $match: classMatch },
            { $group: { _id: '$class_name', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $limit: 200 },
          ])
          .toArray();

        result.classes = classes.map((c: any) => ({ name: c._id, count: c.count }));

        // Courses
        const courseFilter: any = {};
        if (regex) {
          courseFilter.$or = [
            { title: { $regex: regex } },
            { description: { $regex: regex } },
          ];
        }
        const courses = await coursesCol.find(courseFilter).project({ _id: 1, title: 1, description: 1 }).limit(50).toArray();
        result.courses = courses.map((c: any) => ({ id: c._id, title: c.title, description: c.description }));

        // Books
        const bookFilter: any = {};
        if (regex) {
          bookFilter.$or = [
            { title: { $regex: regex } },
            { author: { $regex: regex } },
            { description: { $regex: regex } },
          ];
        }
        const books = await booksCol.find(bookFilter).project({ _id: 1, title: 1, author: 1, description: 1, file_type: 1 }).limit(20).toArray();
        result.books = books.map((b: any) => ({ id: b._id, title: b.title, author: b.author, description: b.description, file_type: b.file_type }));
      } catch (err) {
        console.error('DB search failed:', err);
      }
    }

    // Fallbacks when DB missing or collections empty
    if ((!db || result.books.length === 0) && (!q || q.length > 0)) {
      const mockBooks = getMockBooks();
      const bookRegex = regex || /.*/i;
      result.books = mockBooks
        .filter((b) => bookRegex.test(b.title) || bookRegex.test(b.author) || bookRegex.test(b.description))
        .map((b) => ({ id: b._id, title: b.title, author: b.author, description: b.description, file_type: b.file_type }))
        .slice(0, 20);
    }

    // If no query provided, ensure classes returns all distinct classes (fallback to students endpoint behavior)
    if (!q && (!db || result.classes.length === 0)) {
      try {
        if (db) {
          const studentsCol = db.collection('students');
          const classesAll = await studentsCol
            .aggregate([
              { $match: { class_name: { $exists: true, $ne: '' } } },
              { $group: { _id: '$class_name', count: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ])
            .toArray();
          result.classes = classesAll.map((c: any) => ({ name: c._id, count: c.count }));
        }
      } catch (err) {
        console.error('Fallback classes aggregation failed:', err);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in global search:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
