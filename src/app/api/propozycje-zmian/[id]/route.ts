import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { verifyToken, isAdmin } from '@/lib/auth';
import { PullRequest } from '@/types';

// GET single pull request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const user = token ? verifyToken(token) : null;

    const { id } = await params;
    const prId = parseInt(id);
    const userId = user ? user.id : null;

    const result = await db.query(
      `SELECT 
        pr.id,
        pr.act_id as "actId",
        pr.title,
        pr.description,
        pr.author_id as "authorId",
        u.first_name as "authorFirstName",
        u.last_name as "authorLastName",
        pr.status,
        pr.is_public as "isPublic",
        pr.created_at as "createdAt",
        pr.updated_at as "updatedAt",
        pr.merged_at as "mergedAt",
        pr.merged_by_id as "mergedById",
        a.title as "actTitle",
        (SELECT COUNT(*)::int FROM pr_votes WHERE pull_request_id = pr.id AND vote_type = 'like') as "likesCount",
        (SELECT COUNT(*)::int FROM pr_votes WHERE pull_request_id = pr.id AND vote_type = 'dislike') as "dislikesCount",
        (SELECT vote_type FROM pr_votes WHERE pull_request_id = pr.id AND user_id = $2) as "userVote"
      FROM pull_requests pr
      JOIN users u ON pr.author_id = u.id
      JOIN acts a ON pr.act_id = a.id
      WHERE pr.id = $1`,
      [prId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pull request not found' },
        { status: 404 }
      );
    }

    const pr = result.rows[0] as PullRequest;

    // Check visibility
    if (!pr.isPublic && !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(pr);
  } catch (error) {
    console.error('Error fetching pull request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update pull request (only by expert author or admin)
export async function PATCH(
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
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const prId = parseInt(id);
    const { title, description, isPublic, status } = await request.json();

    // Check if PR exists and user has permission
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
        { error: 'You can only edit your own pull requests' },
        { status: 403 }
      );
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (isPublic !== undefined) {
      updates.push(`is_public = $${paramCount}`);
      values.push(isPublic);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(prId);

    const result = await db.query(
      `UPDATE pull_requests SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING 
         id,
         act_id as "actId",
         title,
         description,
         author_id as "authorId",
         status,
         is_public as "isPublic",
         created_at as "createdAt",
         updated_at as "updatedAt"`,
      values
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating pull request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete pull request (only by expert author or admin)
export async function DELETE(
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
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const prId = parseInt(id);

    // Check if PR exists and user has permission
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
        { error: 'You can only delete your own pull requests' },
        { status: 403 }
      );
    }

    await db.query('DELETE FROM pull_requests WHERE id = $1', [prId]);

    return NextResponse.json({ message: 'Pull request deleted' });
  } catch (error) {
    console.error('Error deleting pull request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
