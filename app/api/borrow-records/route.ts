import { NextResponse } from 'next/server';

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
  return NextResponse.json(mockBorrowRecords);
}
