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
    const prId = parseInt(id);
    const body = await request.json();

    const { status, isPublic } = body;

    // Validate status
    if (!status || !['draft', 'open', 'merged', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update PR
    await db.query(
      `UPDATE pull_requests 
       SET status = $1, is_public = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [status, isPublic, prId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating pull request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
