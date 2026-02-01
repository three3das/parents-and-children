import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function removeColumn() {
  console.log("Removing 'translations' column from words table...");

  await db.execute(sql`
    ALTER TABLE words DROP COLUMN IF EXISTS translations
  `);

  console.log("✅ Column removed successfully!");

  // Verify
  const result = await db.execute(sql`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'words'
  `);
  console.log("Current columns:", result.rows.map((r: any) => r.column_name));

  process.exit(0);
}

removeColumn();
