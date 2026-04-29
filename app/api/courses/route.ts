import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';

const DEFAULT_COURSES = [
  {
    title: 'React.js Fundamentals',
    description: 'Learn the basics of React including components, hooks, and state management',
    instructor: 'Sarah Johnson',
    category: 'Web Development',
    video_url: 'https://example.com/react-basics',
    duration: '8 weeks',
    sample_questions: JSON.stringify(['What is JSX?', 'How do hooks work?', 'What is the virtual DOM?']),
  },
  {
    title: 'Python for Data Science',
    description: 'Master Python programming for data analysis and machine learning',
    instructor: 'Dr. Michael Chen',
    category: 'Data Science',
    video_url: 'https://example.com/python-ds',
    duration: '10 weeks',
    sample_questions: JSON.stringify(['What are pandas and NumPy?', 'How do you handle missing data?', 'What is matplotlib?']),
  },
  {
    title: 'Web Design Essentials',
    description: 'Create beautiful and responsive websites with HTML, CSS, and JavaScript',
    instructor: 'Emma Davis',
    category: 'Design',
    video_url: 'https://example.com/web-design',
    duration: '6 weeks',
    sample_questions: JSON.stringify(['What is responsive design?', 'How do you use CSS Grid?', 'What is accessibility?']),
  },
];

async function seedCoursesIfEmpty() {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      const [courses] = await connection.query('SELECT COUNT(*) as count FROM courses') as any[];
      
      if (courses[0].count === 0) {
        for (const course of DEFAULT_COURSES) {
          await connection.query(
            `INSERT INTO courses (title, description, instructor, category, video_url, duration, students_count) 
             VALUES (?, ?, ?, ?, ?, ?, 0)`,
            [course.title, course.description, course.instructor, course.category, course.video_url, course.duration]
          );
        }
        console.log(`✅ ${DEFAULT_COURSES.length} default courses seeded`);
      }
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error seeding courses:', error);
    // Fail silently, will use in-memory fallback
  }
}

let inMemoryCourses: Array<{
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  videoUrl?: string;
  sampleQuestions?: string[];
  students: number;
  duration: string;
  createdAt: string;
}> = [
  {
    id: '1',
    title: 'React.js Fundamentals',
    description: 'Learn the basics of React including components, hooks, and state management',
    instructor: 'Sarah Johnson',
    category: 'Web Development',
    videoUrl: 'https://example.com/react-basics',
    sampleQuestions: [
      'What is JSX?',
      'How do hooks work?',
      'What is the virtual DOM?',
    ],
    students: 245,
    duration: '8 weeks',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Python for Data Science',
    description: 'Master Python programming for data analysis and machine learning',
    instructor: 'Dr. Michael Chen',
    category: 'Data Science',
    videoUrl: 'https://example.com/python-ds',
    sampleQuestions: [
      'What are pandas and NumPy?',
      'How do you handle missing data?',
      'What is matplotlib?',
    ],
    students: 189,
    duration: '10 weeks',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Web Design Essentials',
    description: 'Create beautiful and responsive websites with HTML, CSS, and JavaScript',
    instructor: 'Emma Davis',
    category: 'Design',
    videoUrl: 'https://example.com/web-design',
    sampleQuestions: [
      'What is responsive design?',
      'How do you use CSS Grid?',
      'What is accessibility?',
    ],
    students: 312,
    duration: '6 weeks',
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cId = searchParams.get('id');
  const category = searchParams.get('category');

  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      // Try to fetch from database
      const [dbCourses] = await connection.query(
        'SELECT id, title, description, instructor, category, video_url as videoUrl, duration, students_count as students, created_at as createdAt FROM courses'
      ) as any[];
      
      if (dbCourses && dbCourses.length > 0) {
        let filtered = dbCourses;
        
        if (cId) {
          return NextResponse.json(
            filtered.find((c: any) => c.id === parseInt(cId)) || { error: 'Course not found' },
            filtered.find((c: any) => c.id === parseInt(cId)) ? { status: 200 } : { status: 404 }
          );
        }
        
        if (category) {
          filtered = filtered.filter((c: any) => c.category === category);
        }
        
        return NextResponse.json(filtered);
      }
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Database error, falling back to in-memory:', error);
  }

  // Fallback to in-memory storage
  let filtered = inMemoryCourses;

  if (cId) {
    return NextResponse.json(
      inMemoryCourses.find((c) => c.id === cId) || { error: 'Course not found' },
      inMemoryCourses.find((c) => c.id === cId) ? { status: 200 } : { status: 404 }
    );
  }

  if (category) {
    filtered = inMemoryCourses.filter((c) => c.category === category);
  }

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, instructor, category, videoUrl, sampleQuestions, duration } = body;

    if (!title || !description || !instructor) {
      return NextResponse.json(
        { error: 'Title, description, and instructor required' },
        { status: 400 }
      );
    }

    // Try to save to database
    try {
      const pool = getPool();
      const connection = await pool.getConnection();
      
      try {
        const [result] = await connection.query(
          `INSERT INTO courses (title, description, instructor, category, video_url, duration, students_count) 
           VALUES (?, ?, ?, ?, ?, ?, 0)`,
          [title, description, instructor, category || 'General', videoUrl || '', duration || 'Self-paced']
        ) as any[];
        
        return NextResponse.json({
          id: result.insertId,
          title,
          description,
          instructor,
          category: category || 'General',
          videoUrl,
          sampleQuestions: sampleQuestions || [],
          students: 0,
          duration: duration || 'Self-paced',
          createdAt: new Date().toISOString(),
        }, { status: 201 });
      } finally {
        await connection.end();
      }
    } catch (dbError) {
      console.error('Database error, using in-memory:', dbError);
    }

    // Fallback to in-memory
    const newCourse = {
      id: Date.now().toString(),
      title,
      description,
      instructor,
      category: category || 'General',
      videoUrl,
      sampleQuestions: sampleQuestions || [],
      students: 0,
      duration: duration || 'Self-paced',
      createdAt: new Date().toISOString(),
    };

    inMemoryCourses.push(newCourse);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const courseIndex = inMemoryCourses.findIndex((c) => c.id === id);
    if (courseIndex === -1) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    inMemoryCourses[courseIndex] = { ...inMemoryCourses[courseIndex], ...updates };
    return NextResponse.json(inMemoryCourses[courseIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    inMemoryCourses = inMemoryCourses.filter((c) => c.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// Initialize courses when the module loads
seedCoursesIfEmpty();
