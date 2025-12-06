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

    // 1. Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        login VARCHAR(50) NOT NULL UNIQUE,
        hash_pass TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        is_expert BOOLEAN DEFAULT FALSE,
        is_default BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "users" created');

    // 2. Create Acts Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS acts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        short_title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('ustawa', 'rozporządzenie', 'konstytucja')),
        publish_date DATE NOT NULL,
        journal_number VARCHAR(100),
        status VARCHAR(20) NOT NULL DEFAULT 'aktywny' CHECK (status IN ('aktywny', 'projekt', 'archiwalny')),
        legislative_stages JSONB DEFAULT '[]'::jsonb,
        current_version_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "acts" created');

    // 3. Create Act Versions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS act_versions (
        id SERIAL PRIMARY KEY,
        act_id INTEGER NOT NULL REFERENCES acts(id) ON DELETE CASCADE,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        version_number VARCHAR(20) NOT NULL CHECK (version_number ~ '^v[0-9]+\\.[0-9]+\\.[0-9]+$'),
        content_md TEXT NOT NULL,
        commit_message TEXT,
        parent_version_id INTEGER REFERENCES act_versions(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (act_id, version_number)
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

    // 5. Create Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_act_versions_act_id ON act_versions(act_id);
      CREATE INDEX IF NOT EXISTS idx_act_versions_parent ON act_versions(parent_version_id);
      CREATE INDEX IF NOT EXISTS idx_acts_type ON acts(type);
      CREATE INDEX IF NOT EXISTS idx_acts_status ON acts(status);
    `);
    console.log('Indexes created');

    // 6. Create Seed Users
    const userCheck = await client.query('SELECT count(*) FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      // Note: In production, hash these passwords with bcrypt!
      await client.query(`
        INSERT INTO users (login, hash_pass, is_admin, is_expert, is_default) VALUES 
        ('admin_user',  'secret', true,  false, false),
        ('expert_user', 'secret', false, true,  false),
        ('norm_user',   'secret', false, false, true),
        ('super_user',  'secret', true,  true,  true);
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
