import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { verifyToken, isExpert } from '@/lib/auth';

// POST - Create new act (only experts/admins)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user || !isExpert(user)) {
      return NextResponse.json(
        { error: 'Only experts can create acts' },
        { status: 403 }
      );
    }

    const { title, shortTitle, type, publishDate, journalNumber, contentMd, commitMessage, legislativeStages } = await request.json();

    if (!title || !shortTitle || !type || !publishDate || !contentMd) {
      return NextResponse.json(
        { error: 'Title, short title, type, publish date, and content are required' },
        { status: 400 }
      );
    }

    const stagesJson = legislativeStages ? JSON.stringify(legislativeStages) : '[]';

    // Start transaction
    await db.query('BEGIN');

    try {
      // Insert act
      const actResult = await db.query(
        `INSERT INTO acts (title, short_title, type, publish_date, journal_number, status, legislative_stages, created_at)
         VALUES ($1, $2, $3, $4, $5, 'aktywny', $6::jsonb, CURRENT_TIMESTAMP)
         RETURNING id`,
        [title, shortTitle, type, publishDate, journalNumber || null, stagesJson]
      );

      const actId = actResult.rows[0].id;

      // Insert first version
      const versionResult = await db.query(
        `INSERT INTO act_versions (act_id, version_number, content_md, commit_message, author_id, created_at)
         VALUES ($1, 'v1.0.0', $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING id`,
        [actId, contentMd, commitMessage || 'Wersja początkowa', user.id]
      );

      const versionId = versionResult.rows[0].id;

      // Update act's current_version_id
      await db.query(
        `UPDATE acts SET current_version_id = $1 WHERE id = $2`,
        [versionId, actId]
      );

      await db.query('COMMIT');

      return NextResponse.json({ 
        message: 'Act created successfully',
        actId,
        versionId
      }, { status: 201 });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating act:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
