import 'dotenv/config';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  
  try {
    console.log('Adding pr_votes table...');
    
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS pr_votes (
        id SERIAL PRIMARY KEY,
        pull_request_id INTEGER NOT NULL REFERENCES pull_requests(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('like', 'dislike')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(pull_request_id, user_id)
      );
    `);

    await client.query('COMMIT');
    console.log('Table "pr_votes" created successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding table:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
