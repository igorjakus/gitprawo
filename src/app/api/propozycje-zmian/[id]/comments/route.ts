import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { PRComment } from '@/types';

// GET all comments for a pull request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prId = parseInt(id);

    const result = await db.query(
      `SELECT 
        c.id,
        c.pull_request_id as "pullRequestId",
        c.author_id as "authorId",
        u.first_name as "authorFirstName",
        u.last_name as "authorLastName",
        c.content,
        c.created_at as "createdAt",
        c.updated_at as "updatedAt"
      FROM pr_comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.pull_request_id = $1
      ORDER BY c.created_at ASC`,
      [prId]
    );

    return NextResponse.json(result.rows as PRComment[]);
  } catch (error) {
    console.error('Error fetching PR comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add comment to pull request (only logged in users)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in to comment' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const prId = parseInt(id);
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Verify PR exists
    const prResult = await db.query(
      'SELECT id FROM pull_requests WHERE id = $1',
      [prId]
    );

    if (prResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pull request not found' },
        { status: 404 }
      );
    }

    const result = await db.query(
      `INSERT INTO pr_comments (pull_request_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING 
         id,
         pull_request_id as "pullRequestId",
         author_id as "authorId",
         content,
         created_at as "createdAt",
         updated_at as "updatedAt"`,
      [prId, user.id, content]
    );

    // Add author name to the response
    const comment = {
      ...result.rows[0],
      authorFirstName: user.login.split('@')[0].split('.')[0] || 'Unknown',
      authorLastName: user.login.split('@')[0].split('.')[1] || 'User',
    };

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
