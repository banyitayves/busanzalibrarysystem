import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// Mock data for fallback
const mockUsers = [
  { _id: 'student1', username: 'john_doe', name: 'John Student', class_name: 'S6 LFK', role: 'student', is_active: true },
  { _id: 'student2', username: 'jane_smith', name: 'Jane Smith', class_name: 'S6 LFK', role: 'student', is_active: true },
  { _id: 'student3', username: 'mike_wilson', name: 'Mike Wilson', class_name: 'S6 LFK', role: 'student', is_active: true },
  { _id: 'student4', username: 'alice_brown', name: 'Alice Brown', class_name: 'S6 LFK', role: 'student', is_active: true },
];

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const classNameParam = request.nextUrl.searchParams.get('class');

    if (!userId && !classNameParam) {
      return NextResponse.json(
        { error: 'User ID or class parameter required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    let classmates: any[] = [];

    if (db) {
      // Try MongoDB
      const usersCollection = db.collection('users');

      if (userId) {
        // Get classmates for a specific user
        const user = await usersCollection.findOne({ _id: userId });

        if (user && user.class_name) {
          classmates = await usersCollection
            .find({ 
              class_name: user.class_name,
              is_active: { $ne: false }
            })
            .project({ 
              _id: 1, 
              username: 1, 
              name: 1, 
              class_name: 1, 
              role: 1 
            })
            .sort({ name: 1 })
            .toArray();
        } else if (classNameParam) {
          // Fallback to using classNameParam if user not found
          classmates = await usersCollection
            .find({ 
              class_name: classNameParam,
              is_active: { $ne: false }
            })
            .project({ 
              _id: 1, 
              username: 1, 
              name: 1, 
              class_name: 1, 
              role: 1 
            })
            .sort({ name: 1 })
            .toArray();
        }
      } else if (classNameParam) {
        // Get all students in a specific class
        classmates = await usersCollection
          .find({ 
            class_name: classNameParam,
            is_active: { $ne: false }
          })
          .project({ 
            _id: 1, 
            username: 1, 
            name: 1, 
            class_name: 1, 
            role: 1 
          })
          .sort({ name: 1 })
          .toArray();
      }
    } else {
      // Fallback to mock data
      if (userId) {
        const user = mockUsers.find(u => u._id === userId);
        if (user) {
          classmates = mockUsers
            .filter(u => u.class_name === user.class_name && u.is_active)
            .map(u => ({
              _id: u._id,
              username: u.username,
              name: u.name,
              class_name: u.class_name,
              role: u.role
            }));
        } else if (classNameParam) {
          // Fallback to using classNameParam if user not found
          classmates = mockUsers
            .filter(u => u.class_name === classNameParam && u.is_active)
            .map(u => ({
              _id: u._id,
              username: u.username,
              name: u.name,
              class_name: u.class_name,
              role: u.role
            }));
        }
      } else if (classNameParam) {
        classmates = mockUsers
          .filter(u => u.class_name === classNameParam && u.is_active)
          .map(u => ({
            _id: u._id,
            username: u.username,
            name: u.name,
            class_name: u.class_name,
            role: u.role
          }));
      }
    }

    return NextResponse.json(
      {
        classmates,
        count: classmates.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching classmates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classmates', details: String(error) },
      { status: 500 }
    );
  }
}
