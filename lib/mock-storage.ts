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

let mockBooks: MockBook[] = [];
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
