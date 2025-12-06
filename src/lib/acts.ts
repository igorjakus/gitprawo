import { db } from './database';
import { Act, ActVersion } from '../types';

export async function getAllActs(): Promise<Act[]> {
  const result = await db.query(`
    SELECT 
      a.id,
      a.title,
      a.short_title,
      a.type,
      a.publish_date,
      a.journal_number,
      a.status,
      a.legislative_stages,
      a.created_at
    FROM acts a
    ORDER BY a.created_at DESC
  `);

  const acts: Act[] = [];

  for (const row of result.rows) {
    const versionsResult = await db.query(`
      SELECT 
        v.id,
        v.version_number,
        v.commit_message,
        v.created_at,
        u.login as author
      FROM act_versions v
      JOIN users u ON v.author_id = u.id
      WHERE v.act_id = $1
      ORDER BY v.created_at DESC
    `, [row.id]);

    const versions: ActVersion[] = versionsResult.rows.map((v) => ({
      id: v.id.toString(),
      version: v.version_number,
      date: new Date(v.created_at).toISOString().split('T')[0],
      author: v.author,
      commitMessage: v.commit_message || '',
      changes: 0, // We can calculate this later from diffs
    }));

    acts.push({
      id: row.id.toString(),
      title: row.title,
      shortTitle: row.short_title,
      type: row.type,
      publishDate: new Date(row.publish_date).toISOString().split('T')[0],
      status: row.status === 'aktywny' ? 'active' : row.status === 'projekt' ? 'draft' : 'archived',
      versions,
      legislativeStages: row.legislative_stages || [],
      description: '', // We can add description field to DB later
    });
  }

  return acts;
}

export async function getActById(id: string): Promise<Act | null> {
  const result = await db.query(`
    SELECT 
      a.id,
      a.title,
      a.short_title,
      a.type,
      a.publish_date,
      a.journal_number,
      a.status,
      a.legislative_stages,
      a.created_at
    FROM acts a
    WHERE a.id = $1
  `, [id]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  const versionsResult = await db.query(`
    SELECT 
      v.id,
      v.version_number,
      v.commit_message,
      v.created_at,
      u.login as author
    FROM act_versions v
    JOIN users u ON v.author_id = u.id
    WHERE v.act_id = $1
    ORDER BY v.created_at DESC
  `, [row.id]);

  const versions: ActVersion[] = versionsResult.rows.map((v) => ({
    id: v.id.toString(),
    version: v.version_number,
    date: new Date(v.created_at).toISOString().split('T')[0],
    author: v.author,
    commitMessage: v.commit_message || '',
    changes: 0,
  }));

  return {
    id: row.id.toString(),
    title: row.title,
    shortTitle: row.short_title,
    type: row.type,
    publishDate: new Date(row.publish_date).toISOString().split('T')[0],
    status: row.status === 'aktywny' ? 'active' : row.status === 'projekt' ? 'draft' : 'archived',
    versions,
    legislativeStages: row.legislative_stages || [],
    description: '',
  };
}

export async function getVersionContent(versionId: string): Promise<string | null> {
  const result = await db.query(`
    SELECT content_md
    FROM act_versions
    WHERE id = $1
  `, [versionId]);

  if (result.rows.length === 0) return null;
  return result.rows[0].content_md;
}
