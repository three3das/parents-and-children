import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    await db.execute(sql`ALTER TABLE user_answers ADD COLUMN IF NOT EXISTS game_type VARCHAR(50)`);
    console.log('Column game_type added successfully');
  } catch (e: any) {
    console.log('Column may already exist or error:', e.message);
  }
  process.exit(0);
}

migrate();
