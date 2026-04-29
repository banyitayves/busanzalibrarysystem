import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';

// In-memory enrollment storage as fallback
let enrollments: Array<{
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: Date;
  progress: number;
  completed: boolean;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, courseId } = body;

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'Student ID and Course ID are required' },
        { status: 400 }
      );
    }

    // Check if student already enrolled
    const existingEnrollment = enrollments.find(
      e => e.student_id === studentId && e.course_id === courseId
    );

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course', alreadyEnrolled: true },
        { status: 409 }
      );
    }

    // Try to save to database first
    try {
      const pool = getPool();
      const connection = await pool.getConnection();

      try {
        // Check if student already enrolled
        const [existingEnrollment] = await connection.query(
          'SELECT id FROM course_enrollments WHERE student_id = ? AND course_id = ?',
          [studentId, courseId]
        ) as any[];

        if (existingEnrollment.length > 0) {
          return NextResponse.json(
            { error: 'Already enrolled in this course', alreadyEnrolled: true },
            { status: 409 }
          );
        }

        // Create enrollment
        const [result] = await connection.query(
          'INSERT INTO course_enrollments (student_id, course_id, enrolled_at) VALUES (?, ?, NOW())',
          [studentId, courseId]
        ) as any[];

        // Increment course students count
        await connection.query(
          'UPDATE courses SET students_count = students_count + 1 WHERE id = ?',
          [courseId]
        );

        console.log(`✅ Student ${studentId} enrolled in course ${courseId}`);

        return NextResponse.json(
          {
            success: true,
            enrollmentId: result.insertId,
            message: 'Successfully enrolled in course!',
          },
          { status: 201 }
        );
      } finally {
        await connection.end();
      }
    } catch (dbError) {
      console.log('Database unavailable, using in-memory fallback for enrollment');
      
      // Fallback to in-memory storage
      const enrollmentId = `enroll_${Date.now()}`;
      enrollments.push({
        id: enrollmentId,
        student_id: studentId,
        course_id: courseId,
        enrolled_at: new Date(),
        progress: 0,
        completed: false,
      });

      console.log(`✅ Student ${studentId} enrolled in course ${courseId} (in-memory)`);

      return NextResponse.json(
        {
          success: true,
          enrollmentId,
          message: 'Successfully enrolled in course!',
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Try to fetch from database first
    try {
      const pool = getPool();
      const connection = await pool.getConnection();

      try {
        // Get enrolled courses for student
        const [enrolledCourses] = await connection.query(
          `SELECT c.*, ce.enrolled_at, ce.progress, ce.completed
           FROM course_enrollments ce
           JOIN courses c ON ce.course_id = c.id
           WHERE ce.student_id = ?
           ORDER BY ce.enrolled_at DESC`,
          [studentId]
        ) as any[];

        return NextResponse.json(enrolledCourses || []);
      } finally {
        await connection.end();
      }
    } catch (dbError) {
      console.log('Database unavailable, using in-memory fallback');
    }

    // Fallback to in-memory storage
    const studentEnrollments = enrollments.filter(e => e.student_id === studentId);
    return NextResponse.json(studentEnrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments', details: String(error) },
      { status: 500 }
    );
  }
}
