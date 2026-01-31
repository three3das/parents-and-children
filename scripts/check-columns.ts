import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function check() {
  const result = await db.execute(sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'words'
  `);
  console.log('Words table columns:', result.rows);
  process.exit(0);
}

check();
