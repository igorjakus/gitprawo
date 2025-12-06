import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

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
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        hash_pass TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'default' CHECK (role IN ('default', 'expert', 'admin')),
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

    // 5. Create Pull Requests Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pull_requests (
        id SERIAL PRIMARY KEY,
        act_id INTEGER NOT NULL REFERENCES acts(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'merged', 'closed', 'draft')),
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        merged_at TIMESTAMP,
        merged_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log('Table "pull_requests" created');

    // 6. Create PR Changes Table (stores content changes)
    await client.query(`
      CREATE TABLE IF NOT EXISTS pr_changes (
        id SERIAL PRIMARY KEY,
        pull_request_id INTEGER NOT NULL REFERENCES pull_requests(id) ON DELETE CASCADE,
        old_content_md TEXT,
        new_content_md TEXT NOT NULL,
        change_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "pr_changes" created');

    // 7. Create PR Comments Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pr_comments (
        id SERIAL PRIMARY KEY,
        pull_request_id INTEGER NOT NULL REFERENCES pull_requests(id) ON DELETE CASCADE,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "pr_comments" created');

    // 7b. Create PR AI Feedback Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pr_ai_feedback (
        id SERIAL PRIMARY KEY,
        pull_request_id INTEGER NOT NULL REFERENCES pull_requests(id) ON DELETE CASCADE UNIQUE,
        message TEXT NOT NULL,
        approved BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "pr_ai_feedback" created');

    // 7c. Create PR Votes Table
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
    console.log('Table "pr_votes" created');

    // 8. Create Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_act_versions_act_id ON act_versions(act_id);
      CREATE INDEX IF NOT EXISTS idx_act_versions_parent ON act_versions(parent_version_id);
      CREATE INDEX IF NOT EXISTS idx_acts_type ON acts(type);
      CREATE INDEX IF NOT EXISTS idx_acts_status ON acts(status);
      CREATE INDEX IF NOT EXISTS idx_pr_act_id ON pull_requests(act_id);
      CREATE INDEX IF NOT EXISTS idx_pr_author_id ON pull_requests(author_id);
      CREATE INDEX IF NOT EXISTS idx_pr_status ON pull_requests(status);
      CREATE INDEX IF NOT EXISTS idx_pr_changes_pr_id ON pr_changes(pull_request_id);
      CREATE INDEX IF NOT EXISTS idx_pr_comments_pr_id ON pr_comments(pull_request_id);
      CREATE INDEX IF NOT EXISTS idx_pr_ai_feedback_pr_id ON pr_ai_feedback(pull_request_id);
      CREATE INDEX IF NOT EXISTS idx_pr_votes_pr_id ON pr_votes(pull_request_id);
    `);
    console.log('Indexes created');

    // 6. Create Seed Users
    const userCheck = await client.query('SELECT count(*) FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      // Hash password 'secret' with bcrypt
      const hashedPassword = await bcrypt.hash('secret', 10);
      
      await client.query(`
        INSERT INTO users (login, first_name, last_name, hash_pass, role) VALUES 
        ('jan.nowak@example.com', 'Jan', 'Nowak', $1, 'admin'),
        ('anna.kowalska@example.com', 'Anna', 'Kowalska', $1, 'expert'),
        ('piotr.lewandowski@example.com', 'Piotr', 'Lewandowski', $1, 'default'),
        ('maria.wisniewski@example.com', 'Maria', 'Wiśniewska', $1, 'admin');
      `, [hashedPassword]);
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
