import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getMockUsers, setMockUsers, getMockBooks, addMockBook } from '@/lib/mock-storage';

const SAMPLE_BOOKS = [
  {
    title: '📘 Introduction to Mathematics',
    author: 'Prof. James Wilson',
    description: 'A comprehensive guide to basic mathematics concepts including algebra, geometry, and calculus fundamentals.',
    content: `Chapter 1: Fundamentals of Mathematics
    
This course covers the basic principles of mathematics including:
- Algebra: Variables, equations, functions, and polynomials
- Geometry: Shapes, angles, area, and volume calculations
- Trigonometry: Sine, cosine, tangent, and applications
- Calculus: Limits, derivatives, integrals

Mathematics is the foundation of all sciences and engineering disciplines. Understanding these concepts is essential for academic success.`,
  },
  {
    title: '🔬 Physics for Beginners',
    author: 'Dr. Sarah Chen',
    description: 'An engaging introduction to classical mechanics, thermodynamics, and modern physics concepts.',
    content: `Physics: Understanding the Universe

Chapter 1: Motion and Forces
- Newton's Laws of Motion
- Velocity and Acceleration
- Work and Energy

Chapter 2: Thermodynamics
- Heat and Temperature
- Entropy and Disorder
- Energy Conservation

Physics helps us understand how the world works, from the motion of planets to the behavior of atoms.`,
  },
  {
    title: '📚 English Literature Classics',
    author: 'Prof. Elizabeth Brown',
    description: 'Exploration of classic English literature, writing techniques, and literary analysis.',
    content: `English Literature: A Journey Through Words

Module 1: Classic Authors
- William Shakespeare: Drama and Poetry
- Jane Austen: Social Commentary in Novels
- Charles Dickens: Victorian Era Fiction

Module 2: Literary Devices
- Metaphor and Symbolism
- Character Development
- Plot Structure and Narrative

Understanding literature enhances critical thinking and communication skills essential for success in all fields.`,
  },
  {
    title: '🌍 World History Overview',
    author: 'Prof. Michael Davis',
    description: 'A comprehensive overview of major historical events and civilizations that shaped our world.',
    content: `World History: From Ancient Times to Modern Era

Part 1: Ancient Civilizations
- Mesopotamian Empires
- Egyptian Dynasties
- Greek City-States
- Roman Republic and Empire

Part 2: Medieval and Renaissance
- European Middle Ages
- Islamic Golden Age
- Renaissance and Reformation

Part 3: Modern Era
- Industrial Revolution
- Nationalism and World Wars
- Contemporary Global Issues

History provides context for understanding our present and planning our future.`,
  },
  {
    title: '💻 Computer Science Fundamentals',
    author: 'Prof. Alex Kumar',
    description: 'Introduction to programming, algorithms, and computer systems for beginners.',
    content: `Computer Science: Building the Digital World

Chapter 1: Programming Basics
- Variables and Data Types
- Control Structures (if/else, loops)
- Functions and Modular Programming
- Object-Oriented Concepts

Chapter 2: Algorithms
- Sorting Algorithms
- Search Techniques
- Big O Complexity Analysis

Chapter 3: Computer Systems
- Binary and Number Systems
- Computer Architecture
- Networks and Internet

Computer science is increasingly important in all modern professions.`,
  },
  {
    title: '🧬 Biology: Life Sciences',
    author: 'Dr. Emma Watson',
    description: 'Comprehensive study of living organisms, cells, genetics, and evolution.',
    content: `Biology: The Science of Life

Unit 1: Cell Biology
- Cell Structure and Function
- Mitosis and Cell Division
- Photosynthesis and Respiration

Unit 2: Genetics
- DNA Structure and Replication
- Inheritance and Heredity
- Mutations and Genetic Engineering

Unit 3: Ecology
- Ecosystems and Biodiversity
- Food Chains and Energy Flow
- Population Dynamics

Biology helps us understand ourselves and our environment.`,
  },
];

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Use MongoDB if available, otherwise use in-memory storage
    let userCount = 0;
    let bookCount = 0;
    
    if (db) {
      // MongoDB available
      const usersCollection = db.collection('users');
      const booksCollection = db.collection('books');
      
      userCount = await usersCollection.countDocuments();
      bookCount = await booksCollection.countDocuments();
      
      if (userCount > 0 && bookCount > 5) {
        return NextResponse.json(
          { 
            message: '✅ Database already seeded', 
            users: userCount,
            books: bookCount,
            storage: 'MongoDB',
          },
          { status: 200 }
        );
      }

      // Create test users if needed
      if (userCount === 0) {
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
            username: 'librarian1',
            password: 'password123',
            name: 'Admin Librarian',
            role: 'librarian',
            created_at: new Date(),
          },
        ];

        await usersCollection.insertMany(testUsers);
        console.log('✅ Test users created in MongoDB');
      }

      // Add sample books if needed
      let booksAdded = 0;
      if (bookCount < 5) {
        for (const bookData of SAMPLE_BOOKS) {
          const existing = await booksCollection.findOne({ title: bookData.title });
          
          if (!existing) {
            await booksCollection.insertOne({
              _id: `book_${bookData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
              title: bookData.title,
              author: bookData.author,
              description: bookData.description,
              file_type: 'txt',
              file_content: bookData.content,
              file_path: `/samples/${bookData.title.replace(/[^a-z0-9]/gi, '_')}`,
              uploaded_by: 'librarian1',
              created_at: new Date(),
            });
            booksAdded++;
          }
        }
        console.log(`✅ ${booksAdded} sample books added to MongoDB`);
      }

      return NextResponse.json(
        {
          message: '✅ Database seeded successfully',
          users_created: userCount === 0 ? 4 : 0,
          books_added: booksAdded,
          storage: 'MongoDB',
          test_credentials: {
            student: { username: 'student1', password: 'password123' },
            teacher: { username: 'teacher1', password: 'password123' },
            librarian: { username: 'librarian1', password: 'password123' },
          },
        },
        { status: 201 }
      );
    } else {
      // Fallback to in-memory storage
      console.log('⚠️  MongoDB not available, using in-memory fallback for seeding');
      
      let mockUsers = getMockUsers();
      
      // Add sample books to mock storage
      const existingBooks = getMockBooks();
      if (existingBooks.length === 0) {
        for (const bookData of SAMPLE_BOOKS) {
          addMockBook({
            _id: `book_${bookData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            file_type: 'txt',
            file_content: bookData.content,
            file_path: `/samples/${bookData.title.replace(/[^a-z0-9]/gi, '_')}`,
            uploaded_by: 'librarian1',
            created_at: new Date(),
          });
        }
        console.log(`✅ ${SAMPLE_BOOKS.length} sample books added to in-memory storage`);
      }
      
      // If mock users are still at default, add test users
      if (mockUsers.length === 3) {
        const additionalUsers = [
          {
            _id: '4',
            username: 'student2',
            password: 'password123',
            name: 'Alice Wonder',
            role: 'student',
            level: 'S5',
            class_name: 'S5 LFK',
            created_at: new Date(),
          },
        ];
        mockUsers = [...mockUsers, ...additionalUsers];
        setMockUsers(mockUsers);
        console.log('✅ Additional test users added to in-memory storage');
      }
      
      return NextResponse.json(
        {
          message: '✅ In-memory storage initialized (MongoDB unavailable)',
          users_ready: mockUsers.length,
          books_added: SAMPLE_BOOKS.length,
          storage: 'In-Memory Fallback',
          test_credentials: {
            student: { username: 'student1', password: 'password123' },
            teacher: { username: 'teacher1', password: 'password123' },
            librarian: { username: 'librarian1', password: 'password123' },
          },
        },
        { status: 201 }
      );
    }
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
