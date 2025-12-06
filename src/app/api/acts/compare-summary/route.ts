import { NextResponse, NextRequest } from 'next/server';
import { getAISupportSummary } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { from, to } = await request.json();

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing from or to content' },
        { status: 400 }
      );
    }

    const summary = await getAISupportSummary(from, to);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
