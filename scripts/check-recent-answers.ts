import { db } from '../server/db';
import { userAnswers } from '../shared/schema';
import { desc, sql } from 'drizzle-orm';

async function check() {
  // Get recent answers
  const recent = await db.select().from(userAnswers).orderBy(desc(userAnswers.answeredAt)).limit(10);

  console.log('=== Recent 10 answers ===');
  for (const answer of recent) {
    console.log(`  sessionId: ${answer.sessionId?.substring(0, 20)}..., gameType: ${answer.gameType || 'NULL'}, isCorrect: ${answer.isCorrect}, date: ${answer.answeredAt}`);
  }

  // Count by gameType
  const counts = await db.execute(sql`
    SELECT game_type, COUNT(*) as count,
           SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct
    FROM user_answers
    WHERE game_type IS NOT NULL
    GROUP BY game_type
  `);

  console.log('\n=== Counts by gameType ===');
  console.log(counts.rows);

  process.exit(0);
}

check();
