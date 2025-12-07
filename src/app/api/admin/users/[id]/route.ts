import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken, isAdmin } from '@/lib/auth';
import { db } from '@/lib/database';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const user = token ? verifyToken(token) : null;

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();

    const { role } = body;

    // Validate role
    if (!role || !['default', 'expert', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Update user role
    await db.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      [role, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
