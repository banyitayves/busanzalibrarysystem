import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';

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

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      let classmates;

      if (userId) {
        // Get classmates for a specific user
        const [userResult] = await connection.execute(
          'SELECT class_name FROM users WHERE id = ? AND class_name IS NOT NULL',
          [userId]
        );

        const user = (userResult as any[])[0];
        if (!user) {
          return NextResponse.json(
            { error: 'User not found or has no class assigned' },
            { status: 404 }
          );
        }

        const [result] = await connection.execute(
          'SELECT id, username, name, class_name, role FROM users WHERE class_name = ? AND is_active = TRUE ORDER BY name ASC',
          [user.class_name]
        );

        classmates = result;
      } else {
        // Get all students in a specific class
        const [result] = await connection.execute(
          'SELECT id, username, name, class_name, role FROM users WHERE class_name = ? AND is_active = TRUE ORDER BY name ASC',
          [classNameParam]
        );

        classmates = result;
      }

      return NextResponse.json(
        {
          classmates,
          count: (classmates as any[]).length,
        },
        { status: 200 }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Classmates fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classmates', details: String(error) },
      { status: 500 }
    );
  }
}
