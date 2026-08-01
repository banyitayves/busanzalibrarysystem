import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';
import { getMockUsers, setMockUsers } from '@/lib/mock-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') || 'guest').toLowerCase();
    const username = searchParams.get('username')?.toLowerCase();
    const filterRole = searchParams.get('filterRole');
    const isLibrarian = role === 'librarian';
    const isDeputyHeadTeacher = role === 'deputy_head_teacher';
    const canViewUsers = isLibrarian || isDeputyHeadTeacher;

    if (!canViewUsers && !username) {
      return NextResponse.json(
        { error: 'Only librarians may view the full user list' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    let users: any[] = [];

    if (db) {
      const usersCollection = db.collection('users');
      const filter: any = {};
      if (filterRole) filter.role = filterRole;
      if (!canViewUsers && username) filter.username = username;
      const rawUsers = await usersCollection
        .find(filter)
        .project({ _id: 1, username: 1, name: 1, role: 1, class_name: 1, level: 1, email: 1, theme: 1 })
        .toArray();
      users = rawUsers.map((u: any) => ({
        id: typeof u._id === 'string' ? u._id : String(u._id),
        username: u.username,
        name: u.name,
        role: u.role,
        class_name: u.class_name || null,
        level: u.level || null,
        email: u.email || null,
        theme: u.theme || 'system',
      }));
    } else {
      const mockUsers = getMockUsers();
      users = mockUsers
        .filter((u) => {
          if (!canViewUsers && username) {
            return u.username.toLowerCase() === username;
          }
          if (filterRole) {
            return u.role === filterRole;
          }
          return true;
        })
        .map((u) => ({
          id: u._id,
          username: u.username,
          name: u.name,
          role: u.role,
          class_name: u.class_name || null,
          level: u.level || null,
          email: (u as any).email || null,
          theme: (u as any).theme || 'system',
        }));
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, currentPassword, updates } = body;

    if (!username || !updates) {
      return NextResponse.json({ error: 'Missing username or updates' }, { status: 400 });
    }

    const db = await getDatabase();
    let user: any;
    let updatedUser: any;
    let usernameLower = username.toLowerCase();

    if (db) {
      const usersCollection = db.collection('users');
      user = await usersCollection.findOne({ username: usernameLower });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if ((updates.username || updates.password) && !currentPassword) {
        return NextResponse.json({ error: 'Current password required to change username or password' }, { status: 401 });
      }

      if (updates.username || updates.password) {
        const authUser = await usersCollection.findOne({ username: usernameLower, password: currentPassword });
        if (!authUser) {
          return NextResponse.json({ error: 'Invalid current password' }, { status: 401 });
        }
      }

      if (updates.username) {
        const newUsername = updates.username.toLowerCase();
        const existingUser = await usersCollection.findOne({ username: newUsername });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
          return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }
      }

      const updateFields: any = {};
      if (updates.username) updateFields.username = updates.username.toLowerCase();
      if (updates.password) updateFields.password = updates.password;
      if (updates.theme) updateFields.theme = updates.theme;
      if (updates.name) updateFields.name = updates.name;

      if (Object.keys(updateFields).length > 0) {
        await usersCollection.updateOne({ username: usernameLower }, { $set: updateFields });
      }

      updatedUser = await usersCollection.findOne({ username: updateFields.username || usernameLower });
    } else {
      const mockUsers = getMockUsers();
      const idx = mockUsers.findIndex((u) => u.username.toLowerCase() === usernameLower);
      if (idx === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      user = mockUsers[idx];
      if ((updates.username || updates.password) && !currentPassword) {
        return NextResponse.json({ error: 'Current password required to change username or password' }, { status: 401 });
      }

      if (updates.username || updates.password) {
        if (user.password !== currentPassword) {
          return NextResponse.json({ error: 'Invalid current password' }, { status: 401 });
        }
      }

      if (updates.username) {
        const newUsername = updates.username.toLowerCase();
        const existingUser = mockUsers.find((u) => u.username.toLowerCase() === newUsername);
        if (existingUser && existingUser._id !== user._id) {
          return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }
      }

      const nextUser = { ...user };
      if (updates.username) nextUser.username = updates.username.toLowerCase();
      if (updates.password) nextUser.password = updates.password;
      if (updates.theme) nextUser.theme = updates.theme;
      if (updates.name) nextUser.name = updates.name;
      mockUsers[idx] = nextUser;
      setMockUsers(mockUsers);
      updatedUser = nextUser;
    }

    return NextResponse.json({
      user: {
        id: updatedUser._id || updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role,
        class_name: updatedUser.class_name || null,
        level: updatedUser.level || null,
        email: updatedUser.email || null,
        theme: updatedUser.theme || 'system',
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
