import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { getDatabase, getMockUsers } from '@/lib/mongodb';

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

    const db = await getDatabase();
    let user;

    if (db) {
      // Try MongoDB
      const usersCollection = db.collection('users');
      user = await usersCollection.findOne({
        username: username.toLowerCase(),
        password: password,
      });
    } else {
      // Fallback to in-memory storage
      const mockUsers = getMockUsers();
      user = mockUsers.find(
        (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );
    }

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
        message: 'Login successful',
        user: {
          id: user._id?.toString?.() || user.id || '1',
          username: user.username,
          name: user.name,
          role: user.role,
          class_name: user.class_name || null,
          level: user.level || null,
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
