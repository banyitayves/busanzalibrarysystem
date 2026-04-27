'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'librarian' | 'student' | 'teacher' | null;

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  registeredAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (email: string, name: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-memory user storage (in production, use a database)
let registeredUsers: User[] = [];

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

  const login = async (email: string, password: string, role: UserRole) => {
    // Simulate authentication
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      role,
      registeredAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const register = async (email: string, name: string, password: string, role: UserRole) => {
    // Check if user already exists
    const existingUser = registeredUsers.find((u) => u.email === email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
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
