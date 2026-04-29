import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

const DEFAULT_COURSES = [
  {
    title: 'React.js Fundamentals',
    description: 'Learn the basics of React including components, hooks, and state management',
    instructor: 'Sarah Johnson',
    category: 'Web Development',
    videoUrl: 'https://example.com/react-basics',
    sampleQuestions: ['What is JSX?', 'How do hooks work?', 'What is the virtual DOM?'],
    duration: '8 weeks',
    students_count: 245,
  },
  {
    title: 'Python for Data Science',
    description: 'Master Python programming for data analysis and machine learning',
    instructor: 'Dr. Michael Chen',
    category: 'Data Science',
    videoUrl: 'https://example.com/python-ds',
    sampleQuestions: ['What are pandas and NumPy?', 'How do you handle missing data?', 'What is matplotlib?'],
    duration: '10 weeks',
    students_count: 189,
  },
  {
    title: 'Web Design Essentials',
    description: 'Create beautiful and responsive websites with HTML, CSS, and JavaScript',
    instructor: 'Emma Davis',
    category: 'Design',
    videoUrl: 'https://example.com/web-design',
    sampleQuestions: ['What is responsive design?', 'How do you use CSS Grid?', 'What is accessibility?'],
    duration: '6 weeks',
    students_count: 312,
  },
];

async function seedCoursesIfEmpty() {
  try {
    const db = await getDatabase();
    if (!db) return;

    const coursesCollection = db.collection('courses');
    const count = await coursesCollection.countDocuments();
    
    if (count === 0) {
      await coursesCollection.insertMany(
        DEFAULT_COURSES.map((course, index) => ({
          course_id: `course_${index + 1}`,
          ...course,
          created_at: new Date(),
        })) as any
      );
      console.log(`✅ ${DEFAULT_COURSES.length} default courses seeded to MongoDB`);
    }
  } catch (error) {
    console.error('Error seeding courses to MongoDB:', error);
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
    const db = await getDatabase();
    if (db) {
      const coursesCollection = db.collection('courses');
      
      if (cId) {
        const course = await coursesCollection.findOne({ course_id: cId } as any);
        return NextResponse.json(
          course || { error: 'Course not found' },
          course ? { status: 200 } : { status: 404 }
        );
      }

      let query: any = {};
      if (category) {
        query.category = category;
      }

      const courses = await coursesCollection.find(query).toArray();
      return NextResponse.json(courses);
    }
  } catch (error) {
    console.error('MongoDB error, falling back to in-memory:', error);
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

    const db = await getDatabase();
    if (db) {
      const coursesCollection = db.collection('courses');
      const newCourse = {
        title,
        description,
        instructor,
        category: category || 'General',
        videoUrl,
        sampleQuestions: sampleQuestions || [],
        students_count: 0,
        duration: duration || 'Self-paced',
        created_at: new Date(),
      };

      const result = await coursesCollection.insertOne(newCourse);
      return NextResponse.json({
        id: result.insertedId,
        ...newCourse,
      }, { status: 201 });
    } else {
      // Fallback to in-memory if no database
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
    }
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const db = await getDatabase();
    if (db) {
      const coursesCollection = db.collection('courses');
      const result = await coursesCollection.findOneAndUpdate(
        { course_id: id },
        { $set: updates },
        { returnDocument: 'after' }
      );
      
      if (result && result.value) {
        return NextResponse.json(result.value);
      }
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    } else {
      // Fallback to in-memory if no database
      const courseIndex = inMemoryCourses.findIndex((c) => c.id === id);
      if (courseIndex === -1) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      inMemoryCourses[courseIndex] = { ...inMemoryCourses[courseIndex], ...updates };
      return NextResponse.json(inMemoryCourses[courseIndex]);
    }
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const db = await getDatabase();
    if (db) {
      const coursesCollection = db.collection('courses');
      await coursesCollection.deleteOne({ course_id: id });
      return NextResponse.json({ success: true });
    } else {
      // Fallback to in-memory
      inMemoryCourses = inMemoryCourses.filter((c) => c.id !== id);
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course', details: String(error) },
      { status: 500 }
    );
  }
}

// Initialize courses when the module loads
seedCoursesIfEmpty();

// Initialize courses when the module loads
seedCoursesIfEmpty();
