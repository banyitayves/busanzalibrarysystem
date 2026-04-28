'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'librarian' | 'student' | 'teacher' | null;

interface User {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  registeredAt?: string;
  username?: string;
  studyProgram?: string; // For students
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: UserRole) => Promise<void>;
  register: (username: string, password: string, name: string, role: UserRole, studyProgram?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-memory user storage (in production, use a database)
let registeredUsers: User[] = [
  {
    id: 'lib-001',
    email: 'nshimiyeyves12@gmail.com',
    name: 'Librarian YVES',
    role: 'librarian',
    registeredAt: new Date().toISOString(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, role: UserRole) => {
    // Check for librarian login
    if (username === 'nshimiyeyves12@gmail.com' && password === 'Nshimiye2004' && role === 'librarian') {
      const librarianUser = registeredUsers[0]; // Get pre-registered librarian
      setUser(librarianUser);
      localStorage.setItem('user', JSON.stringify(librarianUser));
      return;
    }

    // Check if user exists in registered users
    const existingUser = registeredUsers.find(
      (u) => u.username === username && u.role === role
    );

    if (!existingUser) {
      throw new Error('Username or password incorrect');
    }

    // In production, would verify password hash
    const newUser: User = {
      id: existingUser.id,
      username,
      name: existingUser.name,
      role,
      studyProgram: existingUser.studyProgram,
      registeredAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const register = async (
    username: string,
    password: string,
    name: string,
    role: UserRole,
    studyProgram?: string
  ) => {
    // Check if user already exists
    const existingUser = registeredUsers.find((u) => u.username === username);
    if (existingUser) {
      throw new Error('Username already taken');
    }

    // Validate inputs
    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters');
    }

    if (name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      username,
      name,
      role,
      studyProgram,
      registeredAt: new Date().toISOString(),
    };

    registeredUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
