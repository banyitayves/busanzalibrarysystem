import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getMockUsers } from '@/lib/mock-storage';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    let students: any[] = [];

    if (db) {
      // Try MongoDB - fetch users collection and filter for students
      const usersCollection = db.collection('users');
      students = await usersCollection
        .find({ role: 'student' })
        .project({
          _id: 1,
          id: 1,
          name: 1,
          email: 1,
          role: 1,
          class_name: 1,
        })
        .toArray();
    } else {
      // Fallback to mock storage
      const mockUsers = getMockUsers();
      students = mockUsers
        .filter((u: any) => u.role === 'student')
        .map((u: any) => ({
          id: u.id || u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          class_name: u.class_name || 'No Class',
        }));
    }

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
