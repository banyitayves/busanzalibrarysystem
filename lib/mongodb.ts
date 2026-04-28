import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let isConnected = false;

// Mock in-memory storage for when MongoDB is not available
let mockUsers: any[] = [
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

async function connectToDatabase(): Promise<{ client: MongoClient | null; db: Db | null }> {
  if (cachedClient && cachedDb && isConnected) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set - using in-memory storage');
    return { client: null, db: null };
  }

  try {
    const client = new MongoClient(uri, { 
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    await client.connect();
    
    const db = client.db(process.env.MONGODB_DB_NAME || 'smart_library');
    
    cachedClient = client;
    cachedDb = db;
    isConnected = true;
    
    console.log('✅ Connected to MongoDB');
    return { client, db };
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed - using in-memory storage:', String(error).split('\n')[0]);
    isConnected = false;
    cachedClient = null;
    cachedDb = null;
    return { client: null, db: null };
  }
}

export async function getDatabase(): Promise<Db | null> {
  const { db } = await connectToDatabase();
  return db;
}

export function getMockUsers() {
  return mockUsers;
}

export function setMockUsers(users: any[]) {
  mockUsers = users;
}

export async function closeDatabase(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    isConnected = false;
  }
}
