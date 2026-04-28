import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { getDatabase } from '@/lib/mongodb';
import { getMockUsers, setMockUsers, addMockUser } from '@/lib/mock-storage';

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

    const db = await getDatabase();
    let existingUser;
    let newUser;
    let insertedId;

    if (db) {
      // Try MongoDB
      const usersCollection = db.collection('users');

      existingUser = await usersCollection.findOne({
        username: username.toLowerCase(),
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }

      newUser = {
        username: username.toLowerCase(),
        password: password,
        name,
        role,
        class_name: class_name || null,
        level: level || null,
        created_at: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      insertedId = result.insertedId.toString();
    } else {
      // Fallback to in-memory storage
      const mockUsers = getMockUsers();
      
      existingUser = mockUsers.find(
        (u) => u.username.toLowerCase() === username.toLowerCase()
      );

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }

      newUser = {
        _id: crypto.randomBytes(12).toString('hex'),
        username: username.toLowerCase(),
        password: password,
        name,
        role,
        class_name: class_name || null,
        level: level || null,
        created_at: new Date(),
      };

      addMockUser(newUser);
      insertedId = newUser._id;
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: insertedId,
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
