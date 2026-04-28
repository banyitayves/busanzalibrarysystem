import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';
import * as crypto from 'crypto';
import { initializeDatabase } from '@/lib/db-init';

// Simple password hashing function
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Initialize database if needed
    try {
      await initializeDatabase();
    } catch (initError) {
      console.error('Database initialization error:', initError);
      // Continue - tables might already exist
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Find user by username
      const [users] = await connection.execute(
        'SELECT id, username, name, role, class_name, level FROM users WHERE username = ? AND is_active = TRUE',
        [username]
      );

      const user = (users as any[])[0];

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        );
      }

      // Get stored password hash
      const [userWithPassword] = await connection.execute(
        'SELECT password FROM users WHERE id = ?',
        [user.id]
      );

      const storedHash = (userWithPassword as any[])[0].password;
      const hashedPassword = hashPassword(password);

      if (storedHash !== hashedPassword) {
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        );
      }

      // Generate session token (simple JWT-like token)
      const token = crypto.randomBytes(32).toString('hex');

      return NextResponse.json(
        {
          message: 'Login successful',
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            class_name: user.class_name,
            level: user.level,
          },
          token,
        },
        { status: 200 }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: String(error) },
      { status: 500 }
    );
  }
}
