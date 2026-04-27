import { NextResponse } from 'next/server';

interface RecommendedBook {
  id: string;
  title: string;
  author: string;
  category: string;
  reason: string;
  rating: number;
}

// In-memory storage for recommendations
let recommendations: { [userId: string]: RecommendedBook[] } = {};

// Mock book database
const booksDatabase: RecommendedBook[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Fiction',
    reason: 'Classic novel exploring themes of wealth and ambition',
    rating: 4.8,
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'Fiction',
    reason: 'Powerful story about racial injustice and moral growth',
    rating: 4.9,
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    category: 'Fiction',
    reason: 'Dystopian novel about surveillance and authoritarianism',
    rating: 4.7,
  },
  {
    id: '4',
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    category: 'Technology',
    reason: 'Perfect for learning programming basics',
    rating: 4.8,
  },
  {
    id: '5',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self-Help',
    reason: 'Learn how small changes lead to remarkable results',
    rating: 4.9,
  },
  {
    id: '6',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Psychology',
    reason: 'Understand human decision-making and cognitive biases',
    rating: 4.6,
  },
  {
    id: '7',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    category: 'Fantasy',
    reason: 'Epic adventure with rich worldbuilding',
    rating: 4.8,
  },
  {
    id: '8',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    category: 'Science',
    reason: 'Explore the mysteries of the universe',
    rating: 4.5,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // Generate AI recommendations if not cached
  if (!recommendations[userId]) {
    // Simulate AI recommendation logic
    const userRecommendations = booksDatabase
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map((book) => ({
        ...book,
        reason: `Based on your interests, we recommend this ${book.category} book`,
      }));
    recommendations[userId] = userRecommendations;
  }

  return NextResponse.json(recommendations[userId]);
}

export async function POST(request: Request) {
  const { userId, interests } = await request.json();

  if (!userId || !interests) {
    return NextResponse.json(
      { error: 'userId and interests required' },
      { status: 400 }
    );
  }

  // AI recommendation logic based on interests
  const recommendedBooks = booksDatabase
    .filter((book) =>
      interests.some((interest: string) =>
        book.category.toLowerCase().includes(interest.toLowerCase()) ||
        book.title.toLowerCase().includes(interest.toLowerCase())
      )
    )
    .slice(0, 5);

  // If no matches, recommend popular books
  const finalRecommendations =
    recommendedBooks.length > 0
      ? recommendedBooks
      : booksDatabase.sort(() => Math.random() - 0.5).slice(0, 5);

  recommendations[userId] = finalRecommendations;

  return NextResponse.json({
    success: true,
    recommendations: finalRecommendations,
    message: 'AI recommendations generated based on your interests',
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  delete recommendations[userId];

  return NextResponse.json({ success: true, message: 'Recommendations cleared' });
}
