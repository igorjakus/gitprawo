// scripts/check-db.ts
import 'dotenv/config';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    const res = await pool.query('SELECT 1 as ok');
    console.log('DB OK:', res.rows[0]);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('DB check failed:', err);
  process.exit(1);
});