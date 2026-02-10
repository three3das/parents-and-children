import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Adding translation columns to material_world table...\n");

  try {
    // Add event_en column for English translations
    await db.execute(sql`
      ALTER TABLE public.material_world
      ADD COLUMN IF NOT EXISTS event_en TEXT
    `);
    console.log("✅ event_en column added");

    // Add event_uk column for Ukrainian translations
    await db.execute(sql`
      ALTER TABLE public.material_world
      ADD COLUMN IF NOT EXISTS event_uk TEXT
    `);
    console.log("✅ event_uk column added");

    // Verify columns exist
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'material_world'
        AND column_name IN ('event_en', 'event_uk', 'audio_ru', 'audio_en', 'audio_uk')
      ORDER BY column_name
    `);

    console.log("\n📋 All columns for multilingual support:");
    if (result.rows) {
      result.rows.forEach((row: any) => {
        console.log(`   ✅ ${row.column_name}`);
      });
    }

    console.log("\n✅ Translation columns added successfully!");

  } catch (error) {
    console.error("Error:", error);
  }

  process.exit(0);
}

main().catch(console.error);
