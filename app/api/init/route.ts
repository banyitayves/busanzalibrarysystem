import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // MongoDB collections are created automatically on first write
    // No initialization needed
    return NextResponse.json({ message: 'Database ready (MongoDB)' });
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json(
      { error: 'Database check failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // MongoDB collections are created automatically on first write
    // No initialization needed
    return NextResponse.json({ message: 'Database ready (MongoDB)' });
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json(
      { error: 'Database check failed', details: String(error) },
      { status: 500 }
    );
  }
}
