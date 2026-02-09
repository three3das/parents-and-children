import { db } from '../server/db';
import { userAnswers, words } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function addDemoData() {
  try {
    // Get current session ID from the test user or use a default
    const sessionId = process.argv[2] || 'demo-session';

    console.log(`Adding demo progress data for session: ${sessionId}`);

    // Get some word IDs from the database
    const allWords = await db.select({ id: words.id }).from(words).limit(10);

    if (allWords.length === 0) {
      console.log('No words found in database. Please run the app first to initialize words.');
      process.exit(1);
    }

    const wordIds = allWords.map(w => w.id);

    // Game types to add data for
    const gameTypes = [
      'picture-match',
      'missing-letter',
      'extra-letter',
      'spell-word',
      'syllables',
      'sentence-game',
      'audio-picture',
    ];

    // Generate demo data for each game type
    const demoData: Array<{
      wordId: string;
      isCorrect: boolean;
      sessionId: string;
      gameType: string;
    }> = [];

    for (const gameType of gameTypes) {
      // Random number of attempts per game (5-15)
      const attempts = Math.floor(Math.random() * 11) + 5;

      for (let i = 0; i < attempts; i++) {
        // 70% chance of correct answer
        const isCorrect = Math.random() < 0.7;
        const wordId = wordIds[Math.floor(Math.random() * wordIds.length)];

        demoData.push({
          wordId,
          isCorrect,
          sessionId,
          gameType,
        });
      }
    }

    // Insert all demo data
    await db.insert(userAnswers).values(demoData);

    console.log(`Added ${demoData.length} demo answers for ${gameTypes.length} game types`);
    console.log('\nBreakdown:');

    for (const gameType of gameTypes) {
      const gameData = demoData.filter(d => d.gameType === gameType);
      const correct = gameData.filter(d => d.isCorrect).length;
      const incorrect = gameData.length - correct;
      console.log(`  ${gameType}: ${correct} correct, ${incorrect} incorrect`);
    }

    console.log('\nDone! Open the Progress modal to see the chart.');

  } catch (error) {
    console.error('Error adding demo data:', error);
  }

  process.exit(0);
}

addDemoData();
