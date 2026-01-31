import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function check() {
  const result = await db.execute(sql`
    SELECT w.word, wt.language, wt.translation
    FROM words w
    JOIN word_translations wt ON w.id = wt.word_id
    WHERE w.word = 'БАБОЧКА'
  `);
  console.log('Translations for БАБОЧКА:', result.rows);

  const count = await db.execute(sql`SELECT COUNT(*) as total FROM word_translations`);
  console.log('Total translations:', count.rows[0]);

  process.exit(0);
}

check();
