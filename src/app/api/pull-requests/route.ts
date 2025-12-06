import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { verifyToken, isExpert } from '@/lib/auth';
import { PullRequest } from '@/types';

// GET all pull requests (with visibility rules)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const user = token ? verifyToken(token) : null;

    const { searchParams } = new URL(request.url);
    const actId = searchParams.get('actId');
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility'); // 'public' or 'private'

    let query = `
      SELECT 
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
        a.title as "actTitle"
      FROM pull_requests pr
      JOIN users u ON pr.author_id = u.id
      JOIN acts a ON pr.act_id = a.id
      WHERE 1=1
    `;

    const params: unknown[] = [];

    // Apply visibility rules
    if (!user) {
      // Non-authenticated users can only see public PRs
      query += ' AND pr.is_public = true';
    }

    if (actId) {
      query += ` AND pr.act_id = $${params.length + 1}`;
      params.push(parseInt(actId));
    }

    if (status) {
      query += ` AND pr.status = $${params.length + 1}`;
      params.push(status);
    }

    if (visibility === 'public') {
      query += ' AND pr.is_public = true';
    } else if (visibility === 'private') {
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      query += ' AND pr.is_public = false';
    }

    query += ' ORDER BY pr.created_at DESC';

    const result = await db.query(query, params);
    
    return NextResponse.json(result.rows as PullRequest[]);
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// POST - Create new pull request (only experts)
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
        { error: 'Only experts can create pull requests' },
        { status: 403 }
      );
    }

    const { actId, title, description, isPublic } = await request.json();

    if (!actId || !title) {
      return NextResponse.json(
        { error: 'Act ID and title are required' },
        { status: 400 }
      );
    }

    // Verify act exists
    const actCheck = await db.query('SELECT id FROM acts WHERE id = $1', [actId]);
    if (actCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Act not found' },
        { status: 404 }
      );
    }

    const result = await db.query(
      `INSERT INTO pull_requests (act_id, title, description, author_id, is_public, status)
       VALUES ($1, $2, $3, $4, $5, 'open')
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
      [actId, title, description || null, user.id, isPublic !== false]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating pull request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
