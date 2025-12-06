import 'dotenv/config';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  
  try {
    console.log('Starting PR seeding...');
    
    await client.query('BEGIN');

    // Check if we have users and acts
    const usersResult = await client.query("SELECT id FROM users WHERE role = 'expert' OR role = 'admin' LIMIT 1");
    const actsResult = await client.query('SELECT id FROM acts LIMIT 1');

    if (usersResult.rows.length === 0) {
      throw new Error('No expert users found. Run seed_db.ts first.');
    }

    if (actsResult.rows.length === 0) {
      throw new Error('No acts found. Run seed_db.ts first.');
    }

    const expertUserId = usersResult.rows[0].id;
    const actId = actsResult.rows[0].id;

    // Get a regular user for comments
    const regularUserResult = await client.query("SELECT id FROM users WHERE role = 'default' LIMIT 1");
    const regularUserId = regularUserResult.rows[0]?.id || expertUserId;

    // Seed Pull Requests
    console.log('Seeding pull requests...');
    
    const pr1 = await client.query(
      `INSERT INTO pull_requests (act_id, title, description, author_id, status, is_public)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        actId,
        'Usprawnienie języka Artykułu 5',
        'Propozycja uproszczenia sformułowań w Artykule 5 zgodnie z wytycznymi dotyczącymi jasności języka prawnego.',
        expertUserId,
        'open',
        true
      ]
    );
    console.log(`Created PR #${pr1.rows[0].id}`);

    const pr2 = await client.query(
      `INSERT INTO pull_requests (act_id, title, description, author_id, status, is_public)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        actId,
        'Aktualizacja terminologii cyfrowej',
        'Dostosowanie terminów technicznych do współczesnych standardów technologicznych.',
        expertUserId,
        'draft',
        true
      ]
    );
    console.log(`Created PR #${pr2.rows[0].id}`);

    const pr3 = await client.query(
      `INSERT INTO pull_requests (act_id, title, description, author_id, status, is_public)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        actId,
        'Korekta błędów interpunkcyjnych',
        'Poprawki związane z błędami interpunkcyjnymi w całym dokumencie.',
        expertUserId,
        'merged',
        true
      ]
    );
    console.log(`Created PR #${pr3.rows[0].id}`);

    const pr4 = await client.query(
      `INSERT INTO pull_requests (act_id, title, description, author_id, status, is_public)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        actId,
        'Propozycja restrukturyzacji Rozdziału 3',
        'Wewnętrzna propozycja zmian strukturalnych.',
        expertUserId,
        'open',
        false
      ]
    );
    console.log(`Created PR #${pr4.rows[0].id} (private)`);

    // Seed PR Changes
    console.log('Seeding PR changes...');

    await client.query(
      `INSERT INTO pr_changes (pull_request_id, old_content_md, new_content_md, change_summary)
       VALUES ($1, $2, $3, $4)`,
      [
        pr1.rows[0].id,
        'Obywatel ma prawo do informacji o środowisku naturalnym, zgodnie z przepisami ustawy z dnia 3 października 2008 r. o udostępnianiu informacji o środowisku i jego ochronie, udziale społeczeństwa w ochronie środowiska oraz o ocenach oddziaływania na środowisko.',
        'Każdy ma prawo dostępu do informacji o środowisku zgodnie z ustawą o ochronie środowiska z 2008 roku.',
        'Uproszczenie zdania poprzez skrócenie referencji prawnych'
      ]
    );

    await client.query(
      `INSERT INTO pr_changes (pull_request_id, new_content_md, change_summary)
       VALUES ($1, $2, $3)`,
      [
        pr2.rows[0].id,
        'Dokumenty elektroniczne w rozumieniu niniejszej ustawy oznaczają dane w postaci cyfrowej zapisane na nośnikach elektronicznych lub przesyłane środkami komunikacji elektronicznej.',
        'Dodanie definicji dokumentu elektronicznego'
      ]
    );

    await client.query(
      `INSERT INTO pr_changes (pull_request_id, old_content_md, new_content_md, change_summary)
       VALUES ($1, $2, $3, $4)`,
      [
        pr3.rows[0].id,
        'W przypadku gdy organ nie może załatwić sprawy w terminie; powinien zawiadomić stronę o przyczynach opóźnienia',
        'W przypadku gdy organ nie może załatwić sprawy w terminie, powinien zawiadomić stronę o przyczynach opóźnienia.',
        'Poprawka przecinka - usunięcie średnika'
      ]
    );

    // Seed PR Comments
    console.log('Seeding PR comments...');

    await client.query(
      `INSERT INTO pr_comments (pull_request_id, author_id, content)
       VALUES ($1, $2, $3)`,
      [
        pr1.rows[0].id,
        regularUserId,
        'Świetna propozycja! To rzeczywiście znacznie upraszcza zrozumienie artykułu.'
      ]
    );

    await client.query(
      `INSERT INTO pr_comments (pull_request_id, author_id, content)
       VALUES ($1, $2, $3)`,
      [
        pr1.rows[0].id,
        expertUserId,
        'Dziękuję za feedback. Zamierzam również dodać przypis do pełnego brzmienia przepisu.'
      ]
    );

    await client.query(
      `INSERT INTO pr_comments (pull_request_id, author_id, content)
       VALUES ($1, $2, $3)`,
      [
        pr2.rows[0].id,
        regularUserId,
        'Czy ta definicja jest zgodna z aktualnym rozporządzeniem eIDAS?'
      ]
    );

    await client.query(
      `INSERT INTO pr_comments (pull_request_id, author_id, content)
       VALUES ($1, $2, $3)`,
      [
        pr3.rows[0].id,
        expertUserId,
        'Scalono po weryfikacji przez zespół językowy.'
      ]
    );

    await client.query('COMMIT');
    console.log('✅ PRs seeded successfully!');

    // Print summary
    const prCount = await client.query('SELECT COUNT(*) FROM pull_requests');
    const changesCount = await client.query('SELECT COUNT(*) FROM pr_changes');
    const commentsCount = await client.query('SELECT COUNT(*) FROM pr_comments');

    console.log('\nSummary:');
    console.log(`- Pull Requests: ${prCount.rows[0].count}`);
    console.log(`- PR Changes: ${changesCount.rows[0].count}`);
    console.log(`- PR Comments: ${commentsCount.rows[0].count}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ PR seeding failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
