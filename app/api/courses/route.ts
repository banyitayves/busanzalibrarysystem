import { NextRequest, NextResponse } from 'next/server';

let courses: Array<{
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

  let filtered = courses;

  if (cId) {
    return NextResponse.json(
      courses.find((c) => c.id === cId) || { error: 'Course not found' },
      courses.find((c) => c.id === cId) ? { status: 200 } : { status: 404 }
    );
  }

  if (category) {
    filtered = courses.filter((c) => c.category === category);
  }

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, instructor, category, videoUrl, sampleQuestions, duration } =
      body;

    if (!title || !description || !instructor) {
      return NextResponse.json(
        { error: 'Title, description, and instructor required' },
        { status: 400 }
      );
    }

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

    courses.push(newCourse);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const courseIndex = courses.findIndex((c) => c.id === id);
    if (courseIndex === -1) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    courses[courseIndex] = { ...courses[courseIndex], ...updates };
    return NextResponse.json(courses[courseIndex]);
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

    courses = courses.filter((c) => c.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
