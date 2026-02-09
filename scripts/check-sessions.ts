import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function check() {
  const result = await db.execute(sql`
    SELECT DISTINCT session_id, COUNT(*) as count
    FROM user_answers
    WHERE answered_at > NOW() - INTERVAL '1 day'
    GROUP BY session_id
  `);
  console.log('SessionIDs in database today:');
  for (const row of result.rows as any[]) {
    console.log('  ' + row.session_id + ' (' + row.count + ' answers)');
  }
  process.exit(0);
}
check();
