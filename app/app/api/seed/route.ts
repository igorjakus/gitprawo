import { db } from "../../../lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        link VARCHAR(255) NOT NULL
      );
    `);


    const countResult = await db.query('SELECT COUNT(*) FROM articles');
    const count = parseInt(countResult.rows[0].count, 10);

    if (count === 0) {
        await db.query(`
        INSERT INTO articles (title, link) VALUES
        ('Article 1 from DB', '/posts/post-1'),
        ('Article 2 from DB', '/posts/post-2'),
        ('Article 3 from DB', '/posts/post-3'),
        ('Article 4 from DB', '/posts/post-4');
        `);
        return NextResponse.json({ message: "Database seeded successfully with 4 articles." });
    } else {
        return NextResponse.json({ message: "Database already has data. No new data inserted." });
    }

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
