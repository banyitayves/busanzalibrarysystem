import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';
import { getMockBooks, getMockUsers } from '@/lib/mock-storage';

const ALL_CLASSES = [
  'S1A',
  'S1B',
  'S1C',
  'S1D',
  'S2A',
  'S2B',
  'S2C',
  'S2D',
  'S2E',
  'S2F',
  'S3A',
  'S3B',
  'S3C',
  'S3D',
  'S4 MS2',
  'S4 ARTS',
  'S4 LANG',
  'S5 LFK',
  'S5 MCE',
  'S5 HGL',
  'S6 LFK',
  'S6 MCE',
  'S6 HGL',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const role = (searchParams.get('role') || 'guest').toLowerCase();
    const isLibrarian = role === 'librarian';
    const regex = q ? new RegExp(q, 'i') : null;

    const db = await getDatabase();
    const result: any = {
      classes: [],
      courses: [],
      books: [],
    };

    let classCounts: Record<string, number> = {};
    if (isLibrarian) {
      if (db) {
        try {
          const studentsCol = db.collection('students');
          const counts = await studentsCol
            .aggregate([
              { $match: { class_name: { $exists: true, $ne: '' } } },
              { $group: { _id: '$class_name', count: { $sum: 1 } } },
            ])
            .toArray();
          classCounts = counts.reduce((acc: Record<string, number>, item: any) => {
            acc[item._id] = item.count;
            return acc;
          }, {});
        } catch (err) {
          console.error('Class count aggregation failed:', err);
        }
      }

      if (Object.keys(classCounts).length === 0) {
        try {
          const mockUsers = getMockUsers();
          mockUsers.forEach((user) => {
            if (user.class_name) {
              classCounts[user.class_name] = (classCounts[user.class_name] || 0) + 1;
            }
          });
        } catch (err) {
          console.error('Mock class count fallback failed:', err);
        }
      }

      result.classes = ALL_CLASSES.filter((className) => !regex || regex.test(className)).map((className) => ({
        name: className,
        count: classCounts[className] || 0,
      }));
    }

    if (db) {
      try {
        const booksCol = db.collection('books');
        const bookFilter: any = {};
        if (regex) {
          bookFilter.$or = [
            { title: { $regex: regex } },
            { author: { $regex: regex } },
            { description: { $regex: regex } },
          ];
        }
        const books = await booksCol
          .find(bookFilter)
          .project({ _id: 1, title: 1, author: 1, description: 1, file_type: 1 })
          .limit(20)
          .toArray();
        result.books = books.map((b: any) => ({
          id: b._id,
          title: b.title,
          author: b.author,
          description: b.description,
          file_type: b.file_type,
        }));
      } catch (err) {
        console.error('DB books search failed:', err);
      }
    }

    if (!db || result.books.length === 0) {
      const mockBooks = getMockBooks();
      const bookRegex = regex || /.*/i;
      result.books = mockBooks
        .filter((b) => bookRegex.test(b.title) || bookRegex.test(b.author) || bookRegex.test(b.description))
        .map((b) => ({
          id: b._id,
          title: b.title,
          author: b.author,
          description: b.description,
          file_type: b.file_type,
        }))
        .slice(0, 20);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in global search:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
