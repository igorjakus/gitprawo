import 'dotenv/config';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database initialization...');
    
    // Start transaction
    await client.query('BEGIN');

    // 1. Create Users Table with Separable Roles (Boolean Flags)
    // This allows a user to hold multiple roles simultaneously if needed.
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        login VARCHAR(50) NOT NULL UNIQUE,
        hash_pass TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        is_expert BOOLEAN DEFAULT FALSE,
        is_default BOOLEAN DEFAULT TRUE, -- explicit 'default' category as requested
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "users" created');

    // 2. Create Acts Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS acts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        current_version_id INTEGER -- Will be linked to act_versions later
      );
    `);
    console.log('Table "acts" created');

    // 3. Create Act Versions Table (Version Control History)
    await client.query(`
      CREATE TABLE IF NOT EXISTS act_versions (
        id SERIAL PRIMARY KEY,
        act_id INTEGER NOT NULL REFERENCES acts(id) ON DELETE CASCADE,
        author_id INTEGER NOT NULL REFERENCES users(id),
        content_md TEXT NOT NULL,
        commit_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        parent_version_id INTEGER REFERENCES act_versions(id),
        valid_from TIMESTAMP
      );
    `);
    console.log('Table "act_versions" created');

    // 4. Add Circular Foreign Key (Acts -> Latest Version)
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_acts_current_version'
        ) THEN 
          ALTER TABLE acts 
          ADD CONSTRAINT fk_acts_current_version 
          FOREIGN KEY (current_version_id) 
          REFERENCES act_versions(id);
        END IF; 
      END $$;
    `);
    console.log('Foreign Key constraints linked');

    // 5. Create Seed Users (One for each category + a multi-role user)
    const userCheck = await client.query('SELECT count(*) FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      // Note: In production, hash these passwords with bcrypt/argon2!
      await client.query(`
        INSERT INTO users (login, hash_pass, is_admin, is_expert, is_default) VALUES 
        ('admin_user',  'secret', true,  false, false),
        ('expert_user', 'secret', false, true,  false),
        ('norm_user',   'secret', false, false, true),
        ('super_user',  'secret', true,  true,  true); -- User with ALL categories
      `);
      console.log('Default users created');
    }

    await client.query('COMMIT');
    console.log('Database initialized successfully');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DB initialization failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
