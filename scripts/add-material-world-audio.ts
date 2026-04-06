import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Adding 3 audio columns to material_world table...\n");

  try {
    // Add audio_ru column
    await db.execute(sql`
      ALTER TABLE public.material_world
      ADD COLUMN IF NOT EXISTS audio_ru TEXT
    `);
    console.log("✅ audio_ru column added");

    // Add audio_en column
    await db.execute(sql`
      ALTER TABLE public.material_world
      ADD COLUMN IF NOT EXISTS audio_en TEXT
    `);
    console.log("✅ audio_en column added");

    // Add audio_uk column
    await db.execute(sql`
      ALTER TABLE public.material_world
      ADD COLUMN IF NOT EXISTS audio_uk TEXT
    `);
    console.log("✅ audio_uk column added");

    // Verify columns exist
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'material_world'
        AND column_name IN ('audio_ru', 'audio_en', 'audio_uk')
      ORDER BY column_name
    `);

    console.log("\n📋 Verified columns:");
    if (result.rows) {
      result.rows.forEach((row: any) => {
        console.log(`   ✅ ${row.column_name}`);
      });
    }

    console.log("\n✅ All 3 audio columns added successfully!");

  } catch (error) {
    console.error("Error:", error);
  }

  process.exit(0);
}

main().catch(console.error);
