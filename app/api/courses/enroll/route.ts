import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// In-memory enrollment storage (for when MongoDB is unavailable)
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

    const db = await getDatabase();

    if (db) {
      try {
        const enrollmentsCollection = db.collection('course_enrollments');

        // Check if student already enrolled
        const existingEnrollment = await enrollmentsCollection.findOne({
          student_id: studentId,
          course_id: courseId,
        });

        if (existingEnrollment) {
          return NextResponse.json(
            { error: 'Already enrolled in this course', alreadyEnrolled: true },
            { status: 409 }
          );
        }

        // Create enrollment
        const result = await enrollmentsCollection.insertOne({
          student_id: studentId,
          course_id: courseId,
          enrolled_at: new Date(),
          progress: 0,
          completed: false,
        });

        // Update course student count
        const coursesCollection = db.collection('courses');
        await coursesCollection.updateOne(
          { _id: courseId },
          { $inc: { students_count: 1 } }
        );

        console.log(`✅ Student ${studentId} enrolled in course ${courseId}`);

        return NextResponse.json(
          {
            success: true,
            enrollmentId: result.insertedId.toString(),
            message: 'Successfully enrolled in course!',
          },
          { status: 201 }
        );
      } catch (dbError) {
        console.log('MongoDB error, using in-memory fallback for enrollment');
        throw dbError; // Will fall back to in-memory
      }
    } else {
      throw new Error('No database connection');
    }
  } catch (error) {
    console.error('Database error, using in-memory fallback:', error);
    
    // Fallback to in-memory storage
    const existingEnrollment = enrollments.find(
      e => e.student_id === body.studentId && e.course_id === body.courseId
    );

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course', alreadyEnrolled: true },
        { status: 409 }
      );
    }

    const enrollmentId = `enroll_${Date.now()}`;
    enrollments.push({
      id: enrollmentId,
      student_id: body.studentId,
      course_id: body.courseId,
      enrolled_at: new Date(),
      progress: 0,
      completed: false,
    });

    console.log(`✅ Student ${body.studentId} enrolled in course ${body.courseId} (in-memory)`);

    return NextResponse.json(
      {
        success: true,
        enrollmentId,
        message: 'Successfully enrolled in course!',
      },
      { status: 201 }
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

    const db = await getDatabase();

    if (db) {
      try {
        const enrollmentsCollection = db.collection('course_enrollments');
        const coursesCollection = db.collection('courses');

        // Get enrolled courses for student
        const studentEnrollments = await enrollmentsCollection
          .find({ student_id: studentId })
          .toArray();

        // Fetch course details for each enrollment
        const enrolledCourses = await Promise.all(
          studentEnrollments.map(async (enrollment: any) => {
            const course = await coursesCollection.findOne({ 
              _id: enrollment.course_id 
            });
            return { ...course, ...enrollment };
          })
        );

        return NextResponse.json(enrolledCourses);
      } catch (dbError) {
        console.log('MongoDB error, using in-memory fallback');
        throw dbError;
      }
    } else {
      throw new Error('No database connection');
    }
  } catch (error) {
    console.log('Database unavailable, using in-memory fallback');
    const { searchParams } = new URL(request.url);
    
    // Fallback to in-memory storage
    const studentEnrollments = enrollments.filter(e => e.student_id === searchParams.get('studentId'));
    return NextResponse.json(studentEnrollments);
  }
}
