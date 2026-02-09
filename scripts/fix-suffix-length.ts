import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fix() {
  // ДЯДЯ -> ЯДЯ (последние 3 буквы)
  await db.execute(sql`UPDATE words SET suffix = 'ЯДЯ' WHERE word = 'ДЯДЯ'`);
  console.log('ДЯДЯ -> ЯДЯ');

  // ПОЛИЦИЯ -> ЦИЯ (последние 3 буквы)
  await db.execute(sql`UPDATE words SET suffix = 'ЦИЯ' WHERE word = 'ПОЛИЦИЯ'`);
  console.log('ПОЛИЦИЯ -> ЦИЯ');

  // Verify all suffixes are now 3 letters
  const result = await db.execute(sql`
    SELECT word, suffix, LENGTH(suffix) as len
    FROM words
    WHERE LENGTH(suffix) != 3
  `);

  if (result.rows.length === 0) {
    console.log('✅ All suffixes are now 3 letters!');
  } else {
    console.log('⚠️ Still have incorrect suffixes:', result.rows);
  }

  process.exit(0);
}
fix();
