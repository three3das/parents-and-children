import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function check() {
  const result = await db.execute(sql`
    SELECT word, suffix, LENGTH(suffix) as len
    FROM words
    WHERE LENGTH(suffix) != 3
    ORDER BY LENGTH(suffix)
  `);
  console.log('Words with suffix not equal to 3 letters:');
  console.log(result.rows);
  process.exit(0);
}
check();
