// Shared in-memory storage for development when MongoDB is unavailable

export interface MockBook {
  _id: string;
  title: string;
  author: string;
  description: string;
  file_type: string;
  file_content: string;
  file_path: string;
  uploaded_by: string;
  created_at: Date;
}

export interface MockUser {
  _id: string;
  username: string;
  password: string;
  name: string;
  role: string;
  level?: string;
  class_name?: string;
  created_at: Date;
}

export interface MockQuestion {
  _id: string;
  student_id: string;
  student_name: string;
  book_id?: string;
  question_text: string;
  answer_text: string;
  status: string;
  likes: number;
  created_at: Date;
}

let mockBooks: MockBook[] = [
  {
    _id: 'book_introduction_to_mathematics',
    title: '📘 Introduction to Mathematics',
    author: 'Prof. James Wilson',
    description: 'A comprehensive guide to basic mathematics concepts including algebra, geometry, and calculus fundamentals.',
    file_type: 'txt',
    file_content: `Chapter 1: Fundamentals of Mathematics
    
This course covers the basic principles of mathematics including:
- Algebra: Variables, equations, functions, and polynomials
- Geometry: Shapes, angles, area, and volume calculations
- Trigonometry: Sine, cosine, tangent, and applications
- Calculus: Limits, derivatives, integrals

Mathematics is the foundation of all sciences and engineering disciplines. Understanding these concepts is essential for academic success.`,
    file_path: '/samples/introduction_to_mathematics',
    uploaded_by: 'librarian1',
    created_at: new Date(),
  },
  {
    _id: 'book_physics_for_beginners',
    title: '🔬 Physics for Beginners',
    author: 'Dr. Sarah Chen',
    description: 'An engaging introduction to classical mechanics, thermodynamics, and modern physics concepts.',
    file_type: 'txt',
    file_content: `Physics: Understanding the Universe

Chapter 1: Motion and Forces
- Newton's Laws of Motion
- Velocity and Acceleration
- Work and Energy

Chapter 2: Thermodynamics
- Heat and Temperature
- Entropy and Disorder
- Energy Conservation

Physics helps us understand how the world works, from the motion of planets to the behavior of atoms.`,
    file_path: '/samples/physics_for_beginners',
    uploaded_by: 'librarian1',
    created_at: new Date(),
  },
  {
    _id: 'book_english_literature_classics',
    title: '📚 English Literature Classics',
    author: 'Prof. Elizabeth Brown',
    description: 'Exploration of classic English literature, writing techniques, and literary analysis.',
    file_type: 'txt',
    file_content: `English Literature: A Journey Through Words

Module 1: Classic Authors
- William Shakespeare: Drama and Poetry
- Jane Austen: Social Commentary in Novels
- Charles Dickens: Victorian Era Fiction

Module 2: Literary Devices
- Metaphor and Symbolism
- Character Development
- Plot Structure and Narrative

Understanding literature enhances critical thinking and communication skills essential for success in all fields.`,
    file_path: '/samples/english_literature_classics',
    uploaded_by: 'librarian1',
    created_at: new Date(),
  },
  {
    _id: 'book_world_history_overview',
    title: '🌍 World History Overview',
    author: 'Prof. Michael Davis',
    description: 'A comprehensive overview of major historical events and civilizations that shaped our world.',
    file_type: 'txt',
    file_content: `World History: From Ancient Times to Modern Era

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
    file_path: '/samples/world_history_overview',
    uploaded_by: 'librarian1',
    created_at: new Date(),
  },
  {
    _id: 'book_computer_science_fundamentals',
    title: '💻 Computer Science Fundamentals',
    author: 'Prof. Alex Kumar',
    description: 'Introduction to programming, algorithms, and computer systems for beginners.',
    file_type: 'txt',
    file_content: `Computer Science: Building the Digital World

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
    file_path: '/samples/computer_science_fundamentals',
    uploaded_by: 'librarian1',
    created_at: new Date(),
  },
  {
    _id: 'book_biology_life_sciences',
    title: '🧬 Biology: Life Sciences',
    author: 'Dr. Emma Watson',
    description: 'Comprehensive study of living organisms, cells, genetics, and evolution.',
    file_type: 'txt',
    file_content: `Biology: The Science of Life

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
    file_path: '/samples/biology_life_sciences',
    uploaded_by: 'librarian1',
    created_at: new Date(),
  },
];
let mockUsers: MockUser[] = [];
let mockQuestions: MockQuestion[] = [];

// Initialize with default users
mockUsers = [
  {
    _id: '1',
    username: 'student1',
    password: 'password123',
    name: 'John Student',
    role: 'student',
    level: 'S6',
    class_name: 'S6 LFK',
    created_at: new Date(),
  },
  {
    _id: '2',
    username: 'teacher1',
    password: 'password123',
    name: 'Jane Teacher',
    role: 'teacher',
    created_at: new Date(),
  },
  {
    _id: '3',
    username: 'librarian1',
    password: 'password123',
    name: 'Admin Librarian',
    role: 'librarian',
    created_at: new Date(),
  },
];

// Books management
export function getMockBooks(): MockBook[] {
  return mockBooks;
}

export function setMockBooks(books: MockBook[]): void {
  mockBooks = books;
}

export function addMockBook(book: MockBook): void {
  mockBooks.push(book);
}

export function findMockBooks(filter?: any): MockBook[] {
  if (!filter) return mockBooks;
  return mockBooks.filter(book => {
    for (const key in filter) {
      if (book[key as keyof MockBook] !== filter[key]) {
        return false;
      }
    }
    return true;
  });
}

// Users management
export function getMockUsers(): MockUser[] {
  return mockUsers;
}

export function setMockUsers(users: MockUser[]): void {
  mockUsers = users;
}

export function addMockUser(user: MockUser): void {
  mockUsers.push(user);
}

export function findMockUser(filter: any): MockUser | undefined {
  return mockUsers.find(user => {
    for (const key in filter) {
      if (user[key as keyof MockUser] !== filter[key]) {
        return false;
      }
    }
    return true;
  });
}

export function findMockUsers(filter?: any): MockUser[] {
  if (!filter) return mockUsers;
  return mockUsers.filter(user => {
    for (const key in filter) {
      if (user[key as keyof MockUser] !== filter[key]) {
        return false;
      }
    }
    return true;
  });
}

// Questions management
export function getMockQuestions(): MockQuestion[] {
  return mockQuestions;
}

export function setMockQuestions(questions: MockQuestion[]): void {
  mockQuestions = questions;
}

export function addMockQuestion(question: MockQuestion): void {
  mockQuestions.push(question);
}

export function findMockQuestion(filter: any): MockQuestion | undefined {
  return mockQuestions.find(q => {
    for (const key in filter) {
      if (q[key as keyof MockQuestion] !== filter[key]) {
        return false;
      }
    }
    return true;
  });
}

export function findMockQuestions(filter?: any): MockQuestion[] {
  if (!filter) return mockQuestions;
  return mockQuestions.filter(q => {
    for (const key in filter) {
      if (q[key as keyof MockQuestion] !== filter[key]) {
        return false;
      }
    }
    return true;
  });
}

export function updateMockQuestion(filter: any, updates: any): MockQuestion | undefined {
  const question = findMockQuestion(filter);
  if (question) {
    Object.assign(question, updates);
  }
  return question;
}
