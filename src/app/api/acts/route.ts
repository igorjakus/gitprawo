import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { Act } from '@/types';

export async function GET() {
  try {
    const result = await db.query(
      `SELECT 
        id,
        title,
        short_title as "shortTitle",
        type,
        publish_date as "publishDate",
        status
      FROM acts
      ORDER BY publish_date DESC`
    );

    const acts = result.rows.map((row) => ({
      id: row.id.toString(),
      title: row.title,
      shortTitle: row.shortTitle,
      type: row.type,
      publishDate: row.publishDate,
      status: row.status,
      versions: [],
      legislativeStages: [],
    })) as Act[];

    return NextResponse.json(acts);
  } catch (error) {
    console.error('Error fetching acts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
