import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';

// Mock users - stored in memory for testing
const MOCK_USERS = [
  {
    id: 1,
    username: 'student1',
    password: 'password123',
    name: 'John Student',
    role: 'student',
    level: 'S6',
    class_name: 'S6 LFK',
  },
  {
    id: 2,
    username: 'teacher1',
    password: 'password123',
    name: 'Jane Teacher',
    role: 'teacher',
  },
  {
    id: 3,
    username: 'librarian1',
    password: 'password123',
    name: 'Admin Librarian',
    role: 'librarian',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Find user in mock data
    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');

    return NextResponse.json(
      {
        message: 'Login successful (MOCK MODE - No Database)',
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          class_name: user.class_name,
          level: user.level,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: String(error) },
      { status: 500 }
    );
  }
}
