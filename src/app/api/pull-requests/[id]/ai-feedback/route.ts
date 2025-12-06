import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { verifyToken, isExpert, isAdmin } from '@/lib/auth';
import { getAIFeedback } from '@/lib/ai-feedback';
import { AIFeedback, PRAIFeedback } from '@/types';

// GET AI feedback for a pull request
// GET: return cached AI feedback if exists
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

    const prResult = await db.query(
      `SELECT pr.id, pr.is_public as "isPublic"
       FROM pull_requests pr
       WHERE pr.id = $1`,
      [prId]
    );

    if (prResult.rows.length === 0) {
      return NextResponse.json({ error: 'Pull request not found' }, { status: 404 });
    }

    const pr = prResult.rows[0];

    if (!pr.isPublic && !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const feedbackResult = await db.query(
      `SELECT id, pull_request_id as "pullRequestId", message, approved, created_at as "createdAt"
       FROM pr_ai_feedback
       WHERE pull_request_id = $1`,
      [prId]
    );

    if (feedbackResult.rows.length === 0) {
      return NextResponse.json({ error: 'AI feedback not found' }, { status: 404 });
    }

    return NextResponse.json(feedbackResult.rows[0] as PRAIFeedback);
  } catch (error) {
    console.error('Error fetching AI feedback:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// POST: generate and store AI feedback
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || (!isExpert(user) && !isAdmin(user))) {
      return NextResponse.json({ error: 'Only experts can generate AI feedback' }, { status: 403 });
    }

    const { id } = await params;
    const prId = parseInt(id);

    // Validate PR exists
    const prResult = await db.query(
      `SELECT pr.id, pr.is_public as "isPublic"
       FROM pull_requests pr
       WHERE pr.id = $1`,
      [prId]
    );

    if (prResult.rows.length === 0) {
      return NextResponse.json({ error: 'Pull request not found' }, { status: 404 });
    }

    const pr = prResult.rows[0];

    if (!pr.isPublic && !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get changes
    const changesResult = await db.query(
      `SELECT new_content_md as "newContentMd"
       FROM pr_changes
       WHERE pull_request_id = $1
       ORDER BY created_at DESC`,
      [prId]
    );

    if (changesResult.rows.length === 0) {
      return NextResponse.json({ error: 'No changes found in pull request' }, { status: 400 });
    }

    const textToAnalyze = changesResult.rows
      .map((change: { newContentMd: string }) => change.newContentMd)
      .join('\n\n---\n\n');

    const feedback = await getAIFeedback(textToAnalyze);

    const insertResult = await db.query(
      `INSERT INTO pr_ai_feedback (pull_request_id, message, approved)
       VALUES ($1, $2, $3)
       ON CONFLICT (pull_request_id) DO UPDATE SET
         message = EXCLUDED.message,
         approved = EXCLUDED.approved,
         created_at = NOW()
       RETURNING id, pull_request_id as "pullRequestId", message, approved, created_at as "createdAt"`,
      [prId, feedback.message, feedback.approved]
    );

    return NextResponse.json(insertResult.rows[0] as PRAIFeedback);
  } catch (error) {
    console.error('Error generating AI feedback:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
