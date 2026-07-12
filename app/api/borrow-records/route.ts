import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

const mockBorrowRecords = [
  {
    borrow_id: 'borrow_001',
    student_id: 'student1',
    student_name: 'John Student',
    book_id: 'book_1',
    book_title: 'Introduction to Mathematics',
    status: 'borrowed',
    borrow_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    borrow_id: 'borrow_002',
    student_id: 'student2',
    student_name: 'Jane Smith',
    book_id: 'book_2',
    book_title: 'World History Overview',
    status: 'returned',
    borrow_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    returned_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    borrow_id: 'borrow_003',
    student_id: 'student3',
    student_name: 'Mike Wilson',
    book_id: 'book_3',
    book_title: 'Computer Science Fundamentals',
    status: 'overdue',
    borrow_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET() {
  const db = await getDatabase();

  if (db) {
    try {
      const borrowsCollection = db.collection('book_borrows');
      const records = await borrowsCollection
        .find({})
        .project({ borrow_id: 1, student_id: 1, student_name: 1, book_id: 1, book_title: 1, status: 1, borrow_date: 1, due_date: 1, returned_date: 1 })
        .toArray();

      return NextResponse.json(records.map((record: any) => ({
        borrow_id: record.borrow_id,
        student_id: record.student_id,
        student_name: record.student_name,
        book_id: record.book_id,
        book_title: record.book_title,
        status: record.status,
        borrow_date: record.borrow_date,
        due_date: record.due_date,
        returned_date: record.returned_date,
      })));
    } catch (error) {
      console.error('Error fetching borrow records from DB:', error);
    }
  }

  return NextResponse.json(mockBorrowRecords);
}
