import { NextRequest, NextResponse } from 'next/server';

// In-memory database for demonstration
let books: Array<{
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  quantity: number;
  status: 'available' | 'borrowed' | 'reserved';
}> = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    publishedYear: 1925,
    quantity: 5,
    status: 'available',
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0-06-112008-4',
    publishedYear: 1960,
    quantity: 3,
    status: 'available',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0-452-26249-2',
    publishedYear: 1949,
    quantity: 2,
    status: 'borrowed',
  },
];

export async function GET() {
  return NextResponse.json(books);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newBook = {
      id: Date.now().toString(),
      ...body,
    };
    books.push(newBook);
    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const bookIndex = books.findIndex((b) => b.id === body.id);
    if (bookIndex === -1) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    books[bookIndex] = { ...books[bookIndex], ...body };
    return NextResponse.json(books[bookIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    books = books.filter((b) => b.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
