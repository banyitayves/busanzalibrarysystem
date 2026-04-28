import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';

// Mock registered users - persists during dev session
let registeredUsers = [
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

const VALID_CLASSES = {
  'S1': ['S1A', 'S1B', 'S1C', 'S1D'],
  'S2': ['S2A', 'S2B', 'S2C', 'S2D', 'S2E', 'S2F'],
  'S3': ['S3A', 'S3B', 'S3C', 'S3D'],
  'S4': ['S4 MS2', 'S4 ARTS', 'S4 LANG'],
  'S5': ['S5 LFK', 'S5 MCE', 'S5 HGL'],
  'S6': ['S6 LFK', 'S6 MCE', 'S6 HGL'],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, name, role, class_name, level } = body;

    // Validate inputs
    if (!username || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }

    if (role === 'student' && (!class_name || !level)) {
      return NextResponse.json(
        { error: 'Students must select a level and class' },
        { status: 400 }
      );
    }

    // Validate class if student
    if (role === 'student') {
      const validClasses = VALID_CLASSES[level as keyof typeof VALID_CLASSES];
      if (!validClasses || !validClasses.includes(class_name)) {
        return NextResponse.json(
          { error: 'Invalid class selection' },
          { status: 400 }
        );
      }
    }

    // Check if username already exists
    if (registeredUsers.some((u) => u.username === username)) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      id: registeredUsers.length + 1,
      username,
      password,
      name,
      role,
      class_name: class_name || undefined,
      level: level || undefined,
    };

    // Add to mock users
    registeredUsers.push(newUser);

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');

    return NextResponse.json(
      {
        message: 'Registration successful (MOCK MODE - No Database)',
        user: {
          id: newUser.id,
          username,
          name,
          role,
          class_name: class_name || null,
          level: level || null,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: String(error) },
      { status: 500 }
    );
  }
}
