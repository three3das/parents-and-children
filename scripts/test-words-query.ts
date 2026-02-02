import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function test() {
  try {
    console.log("Testing getAllWordsWithTranslations query...");

    const result = await db.execute(sql`
      SELECT w.*, wt.translation as translated_word
      FROM words w
      LEFT JOIN word_translations wt ON w.id = wt.word_id AND wt.language = 'uk'
      LIMIT 3
    `);

    console.log("Result rows:", result.rows);

  } catch (error) {
    console.error("Error:", error);
  }

  process.exit(0);
}

test();
