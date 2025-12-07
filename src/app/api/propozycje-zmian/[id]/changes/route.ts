import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { verifyToken, isExpert, isAdmin } from '@/lib/auth';
import { PRChange } from '@/types';

// GET all changes for a pull request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prId = parseInt(id);

    const result = await db.query(
      `SELECT 
        id,
        pull_request_id as "pullRequestId",
        old_content_md as "oldContentMd",
        new_content_md as "newContentMd",
        change_summary as "changeSummary",
        created_at as "createdAt"
      FROM pr_changes
      WHERE pull_request_id = $1
      ORDER BY created_at DESC`,
      [prId]
    );

    return NextResponse.json(result.rows as PRChange[]);
  } catch (error) {
    console.error('Error fetching PR changes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add change to pull request (only by PR author or expert)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: 'Only experts can add changes to pull requests' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const prId = parseInt(id);
    const { oldContentMd, newContentMd, changeSummary } = await request.json();

    if (!newContentMd) {
      return NextResponse.json(
        { error: 'New content is required' },
        { status: 400 }
      );
    }

    // Verify PR exists and user has permission
    const prResult = await db.query(
      'SELECT author_id FROM pull_requests WHERE id = $1',
      [prId]
    );

    if (prResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pull request not found' },
        { status: 404 }
      );
    }

    const prAuthorId = prResult.rows[0].author_id;
    if (prAuthorId !== user.id && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'You can only modify your own pull requests' },
        { status: 403 }
      );
    }

    const result = await db.query(
      `INSERT INTO pr_changes (pull_request_id, old_content_md, new_content_md, change_summary)
       VALUES ($1, $2, $3, $4)
       RETURNING 
         id,
         pull_request_id as "pullRequestId",
         old_content_md as "oldContentMd",
         new_content_md as "newContentMd",
         change_summary as "changeSummary",
         created_at as "createdAt"`,
      [prId, oldContentMd || null, newContentMd, changeSummary || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error adding PR change:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
