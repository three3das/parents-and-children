import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Deleting records with null game_type...\n");

  try {
    // Delete records with null game_type
    await db.execute(sql`
      DELETE FROM public.user_answers
      WHERE game_type IS NULL
    `);
    console.log("✅ Deleted records with null game_type");

    // Show remaining game types
    const remaining = await db.execute(sql`
      SELECT game_type, COUNT(*) as count
      FROM public.user_answers
      GROUP BY game_type
      ORDER BY game_type
    `);

    console.log("\n📊 Remaining game types:");
    if (remaining.rows) {
      remaining.rows.forEach((row: any) => {
        console.log(`  - ${row.game_type}: ${row.count} records`);
      });
    }

  } catch (error) {
    console.error("Error:", error);
  }

  process.exit(0);
}

main().catch(console.error);
