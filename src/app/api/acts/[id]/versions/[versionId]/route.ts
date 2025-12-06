import { NextResponse } from 'next/server';
import { getActById, getVersionContent } from '@/lib/acts';

function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  const { id, versionId } = await params;

  const act = await getActById(id);
  if (!act) {
    return NextResponse.json({ error: 'Act not found' }, { status: 404 });
  }

  const version = act.versions.find((v) => v.id === versionId);
  if (!version) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 });
  }

  const content = await getVersionContent(versionId);
  if (!content) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }

  const namePart = slugify(act.shortTitle || act.title) || 'act';
  const versionPart = slugify(version.version) || 'version';
  const filename = `${namePart}-${versionPart}.md`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
