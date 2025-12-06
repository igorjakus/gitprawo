import 'dotenv/config';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database cleanup...');
    
    // Start transaction
    await client.query('BEGIN');

    // Drop tables in correct order (reverse of creation due to foreign keys)
    console.log('Dropping table "pr_votes"...');
    await client.query('DROP TABLE IF EXISTS pr_votes CASCADE');

    console.log('Dropping table "pr_comments"...');
    await client.query('DROP TABLE IF EXISTS pr_comments CASCADE');

    console.log('Dropping table "pr_changes"...');
    await client.query('DROP TABLE IF EXISTS pr_changes CASCADE');
    
    console.log('Dropping table "pull_requests"...');
    await client.query('DROP TABLE IF EXISTS pull_requests CASCADE');

    console.log('Dropping table "act_versions"...');
    await client.query('DROP TABLE IF EXISTS act_versions CASCADE');
    
    console.log('Dropping table "acts"...');
    await client.query('DROP TABLE IF EXISTS acts CASCADE');
    
    console.log('Dropping table "users"...');
    await client.query('DROP TABLE IF EXISTS users CASCADE');

    await client.query('COMMIT');
    console.log('✅ Database tables dropped successfully');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ DB cleanup failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
