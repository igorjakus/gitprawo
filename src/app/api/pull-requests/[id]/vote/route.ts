import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

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
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const prId = parseInt(id);
    const { voteType } = await request.json();

    if (!['like', 'dislike'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      );
    }

    // Check existing vote
    const existingVote = await db.query(
      'SELECT id, vote_type FROM pr_votes WHERE pull_request_id = $1 AND user_id = $2',
      [prId, user.id]
    );

    if (existingVote.rows.length > 0) {
      const currentVote = existingVote.rows[0];
      if (currentVote.vote_type === voteType) {
        // Remove vote (toggle)
        await db.query(
          'DELETE FROM pr_votes WHERE id = $1',
          [currentVote.id]
        );
        return NextResponse.json({ message: 'Vote removed', action: 'removed' });
      } else {
        // Update vote
        await db.query(
          'UPDATE pr_votes SET vote_type = $1 WHERE id = $2',
          [voteType, currentVote.id]
        );
        return NextResponse.json({ message: 'Vote updated', action: 'updated' });
      }
    } else {
      // Insert new vote
      await db.query(
        'INSERT INTO pr_votes (pull_request_id, user_id, vote_type) VALUES ($1, $2, $3)',
        [prId, user.id, voteType]
      );
      return NextResponse.json({ message: 'Vote added', action: 'added' });
    }

  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
