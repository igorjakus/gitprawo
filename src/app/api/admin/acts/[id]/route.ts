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
    const actId = parseInt(id);
    const body = await request.json();

    const { title, shortTitle, type, publishDate, journalNumber, status } = body;

    // Validate required fields
    if (!title || !shortTitle || !type || !publishDate || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update act metadata
    await db.query(
      `UPDATE acts 
       SET title = $1, short_title = $2, type = $3, publish_date = $4, 
           journal_number = $5, status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [title, shortTitle, type, publishDate, journalNumber || null, status, actId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating act:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
