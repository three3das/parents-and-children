import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fix() {
  // Update old answers with NULL gameType to 'picture-match'
  await db.execute(sql`
    UPDATE user_answers
    SET game_type = 'picture-match'
    WHERE game_type IS NULL
    AND answered_at > NOW() - INTERVAL '1 day'
  `);
  console.log('Updated recent NULL gameType answers to picture-match');

  // Check result
  const counts = await db.execute(sql`
    SELECT game_type, COUNT(*) as count,
           SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct
    FROM user_answers
    WHERE answered_at > NOW() - INTERVAL '1 day'
    GROUP BY game_type
  `);
  console.log('Counts now:', counts.rows);

  process.exit(0);
}
fix();
