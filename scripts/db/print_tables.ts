import 'dotenv/config';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function printTables() {
  const client = await pool.connect();

  try {
    console.log('Fetching data from tables...');

    // Fetch data from users table
    const users = await client.query('SELECT * FROM users');
    console.log('Users Table:');
    console.table(users.rows);

    // Fetch data from acts table
    const acts = await client.query('SELECT * FROM acts');
    console.log('Acts Table:');
    console.table(acts.rows);

    // Fetch data from act_versions table
    const actVersions = await client.query('SELECT * FROM act_versions');
    console.log('Act Versions Table:');
    console.table(actVersions.rows);

    // Fetch data from pull_requests table
    const pullRequests = await client.query('SELECT * FROM pull_requests');
    console.log('Pull Requests Table:');
    console.table(pullRequests.rows);

    // Fetch data from pr_changes table
    const prChanges = await client.query('SELECT * FROM pr_changes');
    console.log('PR Changes Table:');
    console.table(prChanges.rows);

    // Fetch data from pr_comments table
    const prComments = await client.query('SELECT * FROM pr_comments');
    console.log('PR Comments Table:');
    console.table(prComments.rows);

  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

printTables();