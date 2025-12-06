import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { getAIFeedback } from '@/lib/ai-feedback';
import { AIFeedback } from '@/types';

// GET AI feedback for a pull request
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

    // Check if PR exists
    const prResult = await db.query(
      `SELECT pr.id, pr.is_public as "isPublic"
       FROM pull_requests pr
       WHERE pr.id = $1`,
      [prId]
    );

    if (prResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pull request not found' },
        { status: 404 }
      );
    }

    const pr = prResult.rows[0];

    // Check visibility
    if (!pr.isPublic && !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all changes for this PR
    const changesResult = await db.query(
      `SELECT new_content_md as "newContentMd"
       FROM pr_changes
       WHERE pull_request_id = $1
       ORDER BY created_at DESC`,
      [prId]
    );

    if (changesResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'No changes found in pull request' },
        { status: 400 }
      );
    }

    // Concatenate all new content (latest first, which is most important)
    const textToAnalyze = changesResult.rows
      .map((change: { newContentMd: string }) => change.newContentMd)
      .join('\n\n---\n\n');

    // Get AI feedback from Gemini
    const feedback = await getAIFeedback(textToAnalyze);

    return NextResponse.json(feedback as AIFeedback);
  } catch (error) {
    console.error('Error getting AI feedback:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
