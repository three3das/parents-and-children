import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Cleaning up unknown game types from user_answers...\n");

  try {
    // First, show what we're going to delete
    const checkResult = await db.execute(sql`
      SELECT game_type, COUNT(*) as count
      FROM public.user_answers
      WHERE game_type NOT IN (
        'picture-match',
        'missing-letter',
        'extra-letter',
        'spell-word',
        'syllables',
        'sentence-game',
        'audio-picture',
        'audio-sentence'
      )
      GROUP BY game_type
    `);

    if (checkResult.rows && checkResult.rows.length > 0) {
      console.log("Found invalid game types:");
      checkResult.rows.forEach((row: any) => {
        console.log(`  - "${row.game_type}": ${row.count} records`);
      });

      // Delete invalid records
      const deleteResult = await db.execute(sql`
        DELETE FROM public.user_answers
        WHERE game_type NOT IN (
          'picture-match',
          'missing-letter',
          'extra-letter',
          'spell-word',
          'syllables',
          'sentence-game',
          'audio-picture',
          'audio-sentence'
        )
      `);

      console.log("\n✅ Deleted invalid game type records!");
    } else {
      console.log("No invalid game types found.");
    }

    // Show remaining game types
    const remaining = await db.execute(sql`
      SELECT game_type, COUNT(*) as count
      FROM public.user_answers
      GROUP BY game_type
      ORDER BY game_type
    `);

    console.log("\n📊 Remaining game types in database:");
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
