import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Check if users already exist
    const userCount = await usersCollection.countDocuments();
    
    if (userCount > 0) {
      return NextResponse.json(
        { message: '✅ Database already seeded', users_count: userCount },
        { status: 200 }
      );
    }

    // Create test users
    const testUsers = [
      {
        username: 'student1',
        password: 'password123',
        name: 'John Student',
        role: 'student',
        level: 'S6',
        class_name: 'S6 LFK',
        created_at: new Date(),
      },
      {
        username: 'student2',
        password: 'password123',
        name: 'Alice Wonder',
        role: 'student',
        level: 'S5',
        class_name: 'S5 LFK',
        created_at: new Date(),
      },
      {
        username: 'teacher1',
        password: 'password123',
        name: 'Jane Teacher',
        role: 'teacher',
        created_at: new Date(),
      },
      {
        username: 'teacher2',
        password: 'password123',
        name: 'Mr. Smith',
        role: 'teacher',
        created_at: new Date(),
      },
      {
        username: 'librarian1',
        password: 'password123',
        name: 'Admin Librarian',
        role: 'librarian',
        created_at: new Date(),
      },
    ];

    const result = await usersCollection.insertMany(testUsers);

    return NextResponse.json(
      {
        message: '✅ Database seeded successfully',
        inserted: result.insertedCount,
        test_credentials: {
          student: { username: 'student1', password: 'password123' },
          teacher: { username: 'teacher1', password: 'password123' },
          librarian: { username: 'librarian1', password: 'password123' },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Seeding failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
