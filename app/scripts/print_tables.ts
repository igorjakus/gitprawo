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

  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

printTables();