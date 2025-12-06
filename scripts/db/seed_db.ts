import 'dotenv/config';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database seeding...');
    
    await client.query('BEGIN');

    // Get default user as author
    const userResult = await client.query('SELECT id FROM users WHERE login = $1', ['piotr.lewandowski@example.com']);
    const authorId = userResult.rows[0].id;

    // 1. Insert Kodeks Cywilny
    console.log('Inserting Kodeks Cywilny...');
    const kc = await client.query(`
      INSERT INTO acts (
        title, 
        short_title, 
        type, 
        publish_date, 
        journal_number, 
        status,
        legislative_stages
      ) VALUES (
        'Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny',
        'Kodeks cywilny',
        'ustawa',
        '1964-04-23',
        'Dz.U. 1964 nr 16 poz. 93',
        'aktywny',
        '[
          {"name": "Projekt", "status": "completed", "date": "2024-10-01"},
          {"name": "Komisja", "status": "completed", "date": "2024-10-15"},
          {"name": "Sejm", "status": "completed", "date": "2024-11-01"},
          {"name": "Senat", "status": "completed", "date": "2024-11-10"},
          {"name": "Publikacja", "status": "completed", "date": "2024-11-15"}
        ]'::jsonb
      )
      RETURNING id
    `);
    const kcId = kc.rows[0].id;

    // KC Versions
    const kcV1 = await client.query(`
      INSERT INTO act_versions (act_id, author_id, version_number, content_md, commit_message, parent_version_id)
      VALUES ($1, $2, 'v1.2.1', $3, 'Poprawki techniczne i doprecyzowanie artykułów', NULL)
      RETURNING id
    `, [kcId, authorId, `Art. 1. [Podstawy stosunków cywilnoprawnych]
Kodeks cywilny normuje stosunki cywilnoprawne między osobami fizycznymi i prawnymi.

Art. 2. [Zasada ochrony konsumenta]
§ 1. Konsument jest chroniony na zasadach określonych w niniejszym kodeksie.
§ 2. Przez konsumenta rozumie się osobę fizyczną.

Art. 3. [Zdolność prawna]
Każdy człowiek od chwili urodzenia ma zdolność prawną.`]);

    const kcV2 = await client.query(`
      INSERT INTO act_versions (act_id, author_id, version_number, content_md, commit_message, parent_version_id)
      VALUES ($1, $2, 'v1.2.2', $3, 'Aktualizacja przepisów o ochronie konsumentów', $4)
      RETURNING id
    `, [kcId, authorId, `Art. 1. [Podstawy stosunków cywilnoprawnych]
Kodeks cywilny normuje stosunki cywilnoprawne między osobami fizycznymi i prawnymi.

Art. 2. [Zasada ochrony konsumenta]
§ 1. Konsument podlega szczególnej ochronie prawnej zgodnie z przepisami niniejszego kodeksu oraz regulacjami UE.
§ 2. Przez konsumenta rozumie się osobę fizyczną dokonującą czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.

Art. 3. [Zdolność prawna]
Każdy człowiek od chwili urodzenia ma zdolność prawną.`, kcV1.rows[0].id]);

    const kcV3 = await client.query(`
      INSERT INTO act_versions (act_id, author_id, version_number, content_md, commit_message, parent_version_id)
      VALUES ($1, $2, 'v1.2.3', $3, 'Nowelizacja dotycząca umów elektronicznych', $4)
      RETURNING id
    `, [kcId, authorId, `Art. 1. [Podstawy stosunków cywilnoprawnych]
Kodeks cywilny normuje stosunki cywilnoprawne między osobami fizycznymi i prawnymi.

Art. 2. [Zasada ochrony konsumenta]
§ 1. Konsument podlega szczególnej ochronie prawnej zgodnie z przepisami niniejszego kodeksu oraz regulacjami UE.
§ 2. Przez konsumenta rozumie się osobę fizyczną dokonującą czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.

Art. 3. [Zdolność prawna]
Każdy człowiek od chwili urodzenia ma zdolność prawną.

Art. 15. [Umowy elektroniczne]
§ 1. Umowa zawarta drogą elektroniczną jest równoważna z umową zawartą w formie pisemnej, chyba że przepis szczególny stanowi inaczej.
§ 2. Za moment zawarcia umowy drogą elektroniczną uznaje się moment, w którym oferta doszła do oferenta w sposób umożliwiający zapoznanie się z jej treścią.

Art. 15a. [Podpis elektroniczny]
§ 1. Dokument w postaci elektronicznej opatrzony kwalifikowanym podpisem elektronicznym jest równoważny z dokumentem w postaci papierowej opatrzonym podpisem własnoręcznym.
§ 2. Dokument elektroniczny może być również uwierzytelniony za pomocą innych środków identyfikacji elektronicznej, jeżeli zapewniają one porównywalny poziom bezpieczeństwa.

Art. 16. [Forma szczególna]
Czynność prawna wymaga formy szczególnej tylko wtedy, gdy przepis prawa tak stanowi.`, kcV2.rows[0].id]);

    // Set current version
    await client.query('UPDATE acts SET current_version_id = $1 WHERE id = $2', [kcV3.rows[0].id, kcId]);

    // 2. Insert Kodeks Karny
    console.log('Inserting Kodeks Karny...');
    const kk = await client.query(`
      INSERT INTO acts (
        title, 
        short_title, 
        type, 
        publish_date, 
        journal_number, 
        status,
        legislative_stages
      ) VALUES (
        'Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny',
        'Kodeks karny',
        'ustawa',
        '1997-06-06',
        'Dz.U. 1997 nr 88 poz. 553',
        'aktywny',
        '[
          {"name": "Projekt", "status": "completed", "date": "2024-08-01"},
          {"name": "Komisja", "status": "completed", "date": "2024-08-20"},
          {"name": "Sejm", "status": "in-progress", "date": "2024-09-05"},
          {"name": "Senat", "status": "pending"},
          {"name": "Publikacja", "status": "pending"}
        ]'::jsonb
      )
      RETURNING id
    `);
    const kkId = kk.rows[0].id;

    const kkV1 = await client.query(`
      INSERT INTO act_versions (act_id, author_id, version_number, content_md, commit_message, parent_version_id)
      VALUES ($1, $2, 'v2.1.0', $3, 'Zaostrzenie kar za przestępstwa w cyberprzestrzeni', NULL)
      RETURNING id
    `, [kkId, authorId, `Art. 1. [Zasada legalności]
Odpowiedzialności karnej podlega ten tylko, kto popełnia czyn zabroniony pod groźbą kary przez ustawę obowiązującą w czasie jego popełnienia.

Art. 2. [Cyberprzestępstwa]
§ 1. Kto bezprawnie uzyskuje dostęp do informacji dla niego nieprzeznaczonej, otwierając zamknięte pismo, podłączając się do sieci telekomunikacyjnej lub przełamując albo omijając elektroniczne, magnetyczne, informatyczne lub inne szczególne jej zabezpieczenie, podlega grzywnie, karze ograniczenia wolności albo pozbawienia wolności do lat 2.`]);

    await client.query('UPDATE acts SET current_version_id = $1 WHERE id = $2', [kkV1.rows[0].id, kkId]);

    // 3. Insert Konstytucja RP
    console.log('Inserting Konstytucja RP...');
    const kr = await client.query(`
      INSERT INTO acts (
        title, 
        short_title, 
        type, 
        publish_date, 
        journal_number, 
        status,
        legislative_stages
      ) VALUES (
        'Ustawa z dnia 2 kwietnia 1997 r. - Konstytucja Rzeczypospolitej Polskiej',
        'Konstytucja RP',
        'konstytucja',
        '1997-04-02',
        'Dz.U. 1997 nr 78 poz. 483',
        'aktywny',
        '[
          {"name": "Projekt", "status": "completed", "date": "1997-01-15"},
          {"name": "ZN", "status": "completed", "date": "1997-04-02", "description": "Uchwalona przez Zgromadzenie Narodowe"},
          {"name": "Referendum", "status": "completed", "date": "1997-05-25", "description": "Przyjęta w referendum ogólnokrajowym"},
          {"name": "Publikacja", "status": "completed", "date": "1997-07-16"}
        ]'::jsonb
      )
      RETURNING id
    `);
    const krId = kr.rows[0].id;

    const krV1 = await client.query(`
      INSERT INTO act_versions (act_id, author_id, version_number, content_md, commit_message, parent_version_id)
      VALUES ($1, $2, 'v1.0.0', $3, 'Uchwalenie Konstytucji RP', NULL)
      RETURNING id
    `, [krId, authorId, `# KONSTYTUCJA RZECZYPOSPOLITEJ POLSKIEJ

## ROZDZIAŁ I - RZECZPOSPOLITA

Art. 1.
Rzeczpospolita Polska jest dobrem wspólnym wszystkich obywateli.

Art. 2.
Rzeczpospolita Polska jest demokratycznym państwem prawnym, urzeczywistniającym zasady sprawiedliwości społecznej.

Art. 3.
Rzeczpospolita Polska jest państwem jednolitym.`]);

    await client.query('UPDATE acts SET current_version_id = $1 WHERE id = $2', [krV1.rows[0].id, krId]);

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully with mock data');
    console.log(`   - Kodeks Cywilny: ${kcId} (3 wersje)`);
    console.log(`   - Kodeks Karny: ${kkId} (1 wersja)`);
    console.log(`   - Konstytucja RP: ${krId} (1 wersja)`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ DB seeding failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
