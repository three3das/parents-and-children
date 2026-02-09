import { type Word, type InsertWord, type SentenceAndPhrase, type InsertSentence, type GameProgress, type InsertGameProgress, type UserAnswer, type InsertUserAnswer, type User, type InsertUser, type PasswordResetToken, type WordTranslation, words, sentencesAndPhrases, userAnswers, users, passwordResetTokens, wordTranslations } from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, sql, notInArray } from "drizzle-orm";
import { randomUUID } from "crypto";

// Import blacklist from constants
// These are words with non-standard spelling or rare letters that are 
// exceptions and too complicated for beginner language learners
const LEARNING_BLACKLIST = {
  words: [] as string[],   // No words blacklisted - show all 150 words
  letters: ['Ъ']       // hard sign - rare and complex usage rules
} as const;

export interface IStorage {
  // User management
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;

  // Password reset tokens
  createPasswordResetToken(userId: string): Promise<string>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markTokenAsUsed(tokenId: string): Promise<void>;

  // Word management
  getAllWords(): Promise<Word[]>;
  getWord(id: string): Promise<Word | undefined>;
  createWord(word: InsertWord): Promise<Word>;

  // Sentence and phrase management
  getAllSentences(): Promise<SentenceAndPhrase[]>;
  getSentence(id: string): Promise<SentenceAndPhrase | undefined>;
  createSentence(sentence: InsertSentence): Promise<SentenceAndPhrase>;
  getSentencesByCategory(category: string): Promise<SentenceAndPhrase[]>;
  getSentencesByDifficulty(difficulty: string): Promise<SentenceAndPhrase[]>;

  // Material world calendar management
  getMaterialWorldActivities(): Promise<any[]>;

  // Game progress management
  getGameProgress(id: string): Promise<GameProgress | undefined>;
  createGameProgress(progress: InsertGameProgress): Promise<GameProgress>;
  updateGameProgress(id: string, progress: Partial<GameProgress>): Promise<GameProgress | undefined>;

  // User answer tracking
  recordAnswer(answer: InsertUserAnswer): Promise<UserAnswer>;
  getCorrectAnswersInLastMonth(sessionId: string): Promise<string[]>;
  getTodayCorrectAnswersCount(sessionId: string): Promise<number>;
  getProgressStats(sessionId: string, fromDate: string, toDate: string): Promise<{
    stats: Array<{
      gameType: string;
      gameName: string;
      attempted: number;
      correct: number;
      incorrect: number;
      skipped: number;
    }>;
    totals: {
      attempted: number;
      correct: number;
      incorrect: number;
      skipped: number;
    };
  }>;

  // Game logic helpers
  getRandomWords(excludeId: string, count: number): Promise<Word[]>;
  getAvailableWords(sessionId: string): Promise<Word[]>;

  // Word translations
  getWordTranslation(wordId: string, language: string): Promise<WordTranslation | undefined>;
  getWordTranslations(wordId: string): Promise<WordTranslation[]>;
  createWordTranslation(wordId: string, language: string, translation: string): Promise<WordTranslation>;
  getWordWithTranslation(wordId: string, language: string): Promise<(Word & { translatedWord?: string }) | undefined>;
  getAllWordsWithTranslations(language: string): Promise<(Word & { translatedWord?: string })[]>;
}

export class DatabaseStorage implements IStorage {
  private initialized = false;

  // Helper function to check if a word is blacklisted
  private isWordBlacklisted(word: string): boolean {
    return LEARNING_BLACKLIST.words.includes(word.toUpperCase() as any);
  }

  // Helper function to check if a word contains blacklisted letters
  private containsBlacklistedLetters(word: string): boolean {
    return LEARNING_BLACKLIST.letters.some(letter => word.toUpperCase().includes(letter));
  }

  // Filter words to exclude blacklisted ones
  private filterBlacklistedWords(words: Word[]): Word[] {
    return words.filter(word =>
      !this.isWordBlacklisted(word.word) &&
      !this.containsBlacklistedLetters(word.word)
    );
  }

  // User management methods
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  }

  // Password reset token methods
  async createPasswordResetToken(userId: string): Promise<string> {
    const token = randomUUID() + '-' + randomUUID(); // Generate a long unique token
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
      used: false,
    });

    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      );
    return resetToken || undefined;
  }

  async markTokenAsUsed(tokenId: string): Promise<void> {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, tokenId));
  }

  private async ensureInitialized() {
    if (this.initialized) return;

    await this.initializeWords();
    await this.initializeSentences();
    this.initialized = true;
  }

  private async initializeWords() {
    // Check if words already exist
    const existingWords = await db.select().from(words).limit(1);
    if (existingWords.length > 0) {
      // Check if we need to add new words (current count vs expected)
      const currentCount = await db.select({ count: sql<number>`count(*)` }).from(words);
      const expectedCount = 69; // Original 39 + 30 new words

      if (Number(currentCount[0]?.count || 0) >= expectedCount) {
        return; // Already has all words
      }

      // Need to reinitialize with new words
      console.log('Adding new words to existing database...');
    }

    const initialWords: InsertWord[] = [
      { word: "СЛОН", image: "elephant", audio: "slon.mp3" },
      { word: "КОТ", image: "cat", audio: "kot.mp3" },
      { word: "ДОМ", image: "house", audio: "dom.mp3" },
      { word: "МЯЧ", image: "ball", audio: "myach.mp3" },
      { word: "ЛИСА", image: "fox", audio: "lisa.mp3" },
      { word: "СТОЛ", image: "table", audio: "stol.mp3" },
      { word: "РЫБА", image: "fish", audio: "ryba.mp3" },
      { word: "СОБАКА", image: "dog", audio: "sobaka.mp3" },
      { word: "ЦВЕТОК", image: "flower", audio: "tsvetok.mp3" },
      { word: "МАШИНА", image: "car", audio: "mashina.mp3" },
      { word: "ДЕРЕВО", image: "tree", audio: "derevo.mp3" },
      { word: "СОЛНЦЕ", image: "sun", audio: "solntse.mp3" },
      { word: "ЛУНА", image: "moon", audio: "luna.mp3" },
      { word: "ЗВЕЗДА", image: "star", audio: "zvezda.mp3" },
      { word: "ОБЛАКО", image: "cloud", audio: "oblako.mp3" },
      { word: "ПТИЦА", image: "bird", audio: "ptitsa.mp3" },
      { word: "ХЛЕБ", image: "bread", audio: "hleb.mp3" },
      { word: "МОЛОКО", image: "milk", audio: "moloko.mp3" },
      { word: "ЯБЛОКО", image: "apple", audio: "yabloko.mp3" },
      { word: "КНИГА", image: "book", audio: "kniga.mp3" },
      { word: "КАРАНДАШ", image: "pencil", audio: "karandash.mp3" },
      { word: "СТУЛ", image: "chair", audio: "stul.mp3" },
      { word: "ОКНО", image: "window", audio: "okno.mp3" },
      { word: "ДВЕРЬ", image: "door", audio: "dver.mp3" },
      { word: "ЛАМПА", image: "lamp", audio: "lampa.mp3" },
      { word: "ЧАСЫ", image: "clock", audio: "chasy.mp3" },
      { word: "ТЕЛЕФОН", image: "phone", audio: "telefon.mp3" },
      { word: "ТЕЛЕВИЗОР", image: "tv", audio: "televizor.mp3" },
      { word: "КОМПЬЮТЕР", image: "computer", audio: "kompyuter.mp3" },
      { word: "САМОЛЕТ", image: "airplane", audio: "samolet.mp3" },
      { word: "ПОЕЗД", image: "train", audio: "poezd.mp3" },
      { word: "АВТОБУС", image: "bus", audio: "avtobus.mp3" },
      { word: "ВЕЛОСИПЕД", image: "bicycle", audio: "velosiped.mp3" },
      { word: "КОРАБЛЬ", image: "ship", audio: "korabl.mp3" },
      { word: "МЕДВЕДЬ", image: "bear", audio: "medved.mp3" },
      { word: "ЗАЯЦ", image: "rabbit", audio: "zayats.mp3" },
      { word: "ВОЛК", image: "wolf", audio: "volk.mp3" },
      { word: "ЛЯГУШКА", image: "frog", audio: "lyagushka.mp3" },
      { word: "БАБОЧКА", image: "butterfly", audio: "babochka.mp3" },
      { word: "ПЧЕЛА", image: "bee", audio: "pchela.mp3" },

      // Additional 30 words for more practice
      { word: "МАМА", image: "mother", audio: "mama.mp3" },
      { word: "ПАПА", image: "father", audio: "papa.mp3" },
      { word: "ДЯДЯ", image: "uncle", audio: "dyadya.mp3" },
      { word: "ТЁТЯ", image: "aunt", audio: "tyotya.mp3" },
      { word: "БРАТ", image: "brother", audio: "brat.mp3" },
      { word: "СЕСТРА", image: "sister", audio: "sestra.mp3" },
      { word: "ДЕДУШКА", image: "grandfather", audio: "dedushka.mp3" },
      { word: "БАБУШКА", image: "grandmother", audio: "babushka.mp3" },
      { word: "ВОДА", image: "water", audio: "voda.mp3" },
      { word: "ОГОНЬ", image: "fire", audio: "ogon.mp3" },
      { word: "ЗЕМЛЯ", image: "earth", audio: "zemlya.mp3" },
      { word: "НЕБО", image: "sky", audio: "nebo.mp3" },
      { word: "ВЕТЕР", image: "wind", audio: "veter.mp3" },
      { word: "СНЕГ", image: "snow", audio: "sneg.mp3" },
      { word: "ДОЖДЬ", image: "rain", audio: "dozhd.mp3" },
      { word: "ЛЕТО", image: "summer", audio: "leto.mp3" },
      { word: "ЗИМА", image: "winter", audio: "zima.mp3" },
      { word: "ВЕСНА", image: "spring", audio: "vesna.mp3" },
      { word: "ОСЕНЬ", image: "autumn", audio: "osen.mp3" },
      { word: "УТРО", image: "morning", audio: "utro.mp3" },
      { word: "ДЕНЬ", image: "day", audio: "den.mp3" },
      { word: "ВЕЧЕР", image: "evening", audio: "vecher.mp3" },
      { word: "НОЧЬ", image: "night", audio: "noch.mp3" },
      { word: "ШКОЛА", image: "school", audio: "shkola.mp3" },
      { word: "ПАРК", image: "park", audio: "park.mp3" },
      { word: "МАГАЗИН", image: "store", audio: "magazin.mp3" },
      { word: "БОЛЬНИЦА", image: "hospital", audio: "bolnitsa.mp3" },
      { word: "ТЕАТР", image: "theater", audio: "teatr.mp3" },
      { word: "МУЗЕЙ", image: "museum", audio: "muzey.mp3" },
      { word: "РЫНОК", image: "market", audio: "rynok.mp3" }
    ];

    // Insert all words at once
    await db.insert(words).values(initialWords);
  }

  async getAllWords(): Promise<Word[]> {
    await this.ensureInitialized();
    const allWords = await db.select().from(words);
    return this.filterBlacklistedWords(allWords);
  }

  async getWord(id: string): Promise<Word | undefined> {
    await this.ensureInitialized();
    const [word] = await db.select().from(words).where(eq(words.id, id));
    return word || undefined;
  }

  async createWord(insertWord: InsertWord): Promise<Word> {
    const [word] = await db.insert(words).values(insertWord).returning();
    return word;
  }

  // Sentence and phrase methods
  private async initializeSentences() {
    // Check if sentences already exist
    const existingSentences = await db.select().from(sentencesAndPhrases).limit(1);
    if (existingSentences.length > 0) {
      return; // Already has sentences
    }

    const initialSentences: InsertSentence[] = [
      // Easy sentences
      { sentence: "Мама дома", translation: "Mom is home", audio: "mama_doma.mp3", difficulty: "easy", category: "family" },
      { sentence: "Папа работает", translation: "Dad works", audio: "papa_rabotaet.mp3", difficulty: "easy", category: "family" },
      { sentence: "Солнце светит", translation: "The sun shines", audio: "solntse_svetit.mp3", difficulty: "easy", category: "nature" },
      { sentence: "Кот спит", translation: "The cat sleeps", audio: "kot_spit.mp3", difficulty: "easy", category: "animals" },
      { sentence: "Я играю", translation: "I play", audio: "ya_igrayu.mp3", difficulty: "easy", category: "general" },

      // Medium sentences
      { sentence: "Мы идём в школу", translation: "We go to school", audio: "mi_idyom_v_shkolu.mp3", difficulty: "medium", category: "education" },
      { sentence: "Дождь идёт", translation: "It's raining", audio: "dozhd_idyot.mp3", difficulty: "medium", category: "nature" },
      { sentence: "Мальчик читает книгу", translation: "The boy reads a book", audio: "malchik_chitaet_knigu.mp3", difficulty: "medium", category: "education" },
      { sentence: "Собака бежит", translation: "The dog runs", audio: "sobaka_bezhit.mp3", difficulty: "medium", category: "animals" },
      { sentence: "Цветы красивые", translation: "The flowers are beautiful", audio: "cvety_krasivye.mp3", difficulty: "medium", category: "nature" },

      // Hard sentences
      { sentence: "Вечером мы смотрим телевизор", translation: "In the evening we watch TV", audio: "vecherom_mi_smotrim_televizor.mp3", difficulty: "hard", category: "general" },
      { sentence: "Зимой холодно, а летом тепло", translation: "It's cold in winter and warm in summer", audio: "zimoy_holodno_a_letom teplo.mp3", difficulty: "hard", category: "nature" },
      { sentence: "Бабушка печёт пироги", translation: "Grandmother bakes pies", audio: "babushka_pechyot_pirogi.mp3", difficulty: "hard", category: "family" },
      { sentence: "Самолёт летит высоко", translation: "The airplane flies high", audio: "samolyot_letit_vysoko.mp3", difficulty: "hard", category: "transport" },
      { sentence: "В библиотеке много книг", translation: "There are many books in the library", audio: "v_biblioteke_mnogo_knig.mp3", difficulty: "hard", category: "education" }
    ];

    // Insert all sentences at once
    await db.insert(sentencesAndPhrases).values(initialSentences);
  }

  async getAllSentences(): Promise<SentenceAndPhrase[]> {
    await this.ensureInitialized();
    return await db.select().from(sentencesAndPhrases);
  }

  async getSentence(id: string): Promise<SentenceAndPhrase | undefined> {
    await this.ensureInitialized();
    const [sentence] = await db.select().from(sentencesAndPhrases).where(eq(sentencesAndPhrases.id, id));
    return sentence || undefined;
  }

  async createSentence(insertSentence: InsertSentence): Promise<SentenceAndPhrase> {
    const [sentence] = await db.insert(sentencesAndPhrases).values(insertSentence).returning();
    return sentence;
  }

  async getSentencesByCategory(category: string): Promise<SentenceAndPhrase[]> {
    await this.ensureInitialized();
    return await db.select().from(sentencesAndPhrases).where(eq(sentencesAndPhrases.category, category));
  }

  async getSentencesByDifficulty(difficulty: string): Promise<SentenceAndPhrase[]> {
    await this.ensureInitialized();
    return await db.select().from(sentencesAndPhrases).where(eq(sentencesAndPhrases.difficulty, difficulty));
  }

  async getGameProgress(id: string): Promise<GameProgress | undefined> {
    // Implementation for game progress (not changed)
    return undefined;
  }

  async createGameProgress(insertProgress: InsertGameProgress): Promise<GameProgress> {
    // Implementation for game progress (not changed)
    throw new Error("Not implemented");
  }

  async updateGameProgress(id: string, updates: Partial<GameProgress>): Promise<GameProgress | undefined> {
    // Implementation for game progress (not changed)
    return undefined;
  }

  async recordAnswer(answer: InsertUserAnswer): Promise<UserAnswer> {
    const [userAnswer] = await db.insert(userAnswers).values(answer).returning();
    return userAnswer;
  }

  async getCorrectAnswersInLastMonth(sessionId: string): Promise<string[]> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const correctAnswers = await db
      .select({ wordId: userAnswers.wordId })
      .from(userAnswers)
      .where(
        and(
          eq(userAnswers.sessionId, sessionId),
          eq(userAnswers.isCorrect, true),
          gt(userAnswers.answeredAt, oneMonthAgo)
        )
      );

    return correctAnswers.map(answer => answer.wordId);
  }

  async getTodayCorrectAnswersCount(sessionId: string): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userAnswers)
      .where(
        and(
          eq(userAnswers.sessionId, sessionId),
          eq(userAnswers.isCorrect, true),
          gt(userAnswers.answeredAt, todayStart)
        )
      );

    return Number(result[0]?.count || 0);
  }

  async getProgressStats(sessionId: string, fromDate: string, toDate: string): Promise<{
    stats: Array<{
      gameType: string;
      gameName: string;
      attempted: number;
      correct: number;
      incorrect: number;
      skipped: number;
    }>;
    totals: {
      attempted: number;
      correct: number;
      incorrect: number;
      skipped: number;
    };
  }> {
    const fromDateTime = new Date(fromDate);
    const toDateTime = new Date(toDate);
    toDateTime.setHours(23, 59, 59, 999); // End of day

    // Get all answers for the session in the date range
    // Only select columns that exist in database (is_skipped might not exist)
    const answers = await db
      .select({
        id: userAnswers.id,
        wordId: userAnswers.wordId,
        isCorrect: userAnswers.isCorrect,
        answeredAt: userAnswers.answeredAt,
        sessionId: userAnswers.sessionId,
        gameType: userAnswers.gameType,
      })
      .from(userAnswers)
      .where(
        and(
          eq(userAnswers.sessionId, sessionId),
          sql`${userAnswers.answeredAt} >= ${fromDateTime}`,
          sql`${userAnswers.answeredAt} <= ${toDateTime}`
        )
      );

    // Game type names mapping (matching UI labels)
    const gameNames: Record<string, string> = {
      'picture-match': 'Картинки',
      'missing-letter': 'Лупа',
      'extra-letter': 'Корзина',
      'spell-word': 'Буквы',
      'syllables': 'Слоги',
      'sentence-game': 'Предложения',
      'audio-picture': 'Аудио',
      'mix': 'Микс'
    };

    // Group answers by game type
    const statsByGameType = new Map<string, {
      attempted: number;
      correct: number;
      incorrect: number;
      skipped: number;
    }>();

    answers.forEach(answer => {
      const gameType = answer.gameType || 'unknown';
      if (!statsByGameType.has(gameType)) {
        statsByGameType.set(gameType, {
          attempted: 0,
          correct: 0,
          incorrect: 0,
          skipped: 0
        });
      }

      const stats = statsByGameType.get(gameType)!;
      stats.attempted++;

      if (answer.isCorrect) {
        stats.correct++;
      } else {
        // No isSkipped tracking - all non-correct answers are incorrect
        stats.incorrect++;
      }
    });

    // Convert to array format
    const stats = Array.from(statsByGameType.entries()).map(([gameType, stats]) => ({
      gameType,
      gameName: gameNames[gameType] || gameType,
      ...stats
    }));

    // Calculate totals
    const totals = stats.reduce((acc, stat) => ({
      attempted: acc.attempted + stat.attempted,
      correct: acc.correct + stat.correct,
      incorrect: acc.incorrect + stat.incorrect,
      skipped: acc.skipped + stat.skipped
    }), { attempted: 0, correct: 0, incorrect: 0, skipped: 0 });

    return { stats, totals };
  }

  async getAvailableWords(sessionId: string): Promise<Word[]> {
    await this.ensureInitialized();

    const correctWordIds = await this.getCorrectAnswersInLastMonth(sessionId);

    if (correctWordIds.length === 0) {
      return await this.getAllWords();
    }

    // Get words that haven't been answered correctly in the last month
    const availableWords = await db
      .select()
      .from(words)
      .where(notInArray(words.id, correctWordIds));

    const filteredWords = this.filterBlacklistedWords(availableWords);

    // If no words available (user completed all), return all words to keep playing
    if (filteredWords.length === 0) {
      console.log('All words completed! Returning all words for continued practice.');
      return await this.getAllWords();
    }

    return filteredWords;
  }

  async getRandomWords(excludeId: string, count: number): Promise<Word[]> {
    await this.ensureInitialized();

    // First get the word we're excluding to know its emoji
    const excludedWord = await db
      .select()
      .from(words)
      .where(eq(words.id, excludeId))
      .limit(1);

    const excludedImage = excludedWord[0]?.image;

    // Get more words than needed to account for filtering
    const allWords = await db
      .select()
      .from(words)
      .where(sql`${words.id} != ${excludeId}`)
      .orderBy(sql`RANDOM()`)
      .limit(count * 5); // Get even more words to account for duplicate emoji filtering

    // Filter out blacklisted words
    const filteredWords = this.filterBlacklistedWords(allWords);

    // Filter out words with duplicate emojis
    const seenImages = new Set<string>();
    if (excludedImage) {
      seenImages.add(excludedImage);
    }

    const uniqueEmojiWords: Word[] = [];
    for (const word of filteredWords) {
      if (!seenImages.has(word.image)) {
        seenImages.add(word.image);
        uniqueEmojiWords.push(word);
        if (uniqueEmojiWords.length >= count) {
          break;
        }
      }
    }

    return uniqueEmojiWords;
  }

  // Material world management
  async getMaterialWorldActivities(): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT id, event, syllables, image
        FROM public.material_world
        ORDER BY id
      `);

      console.log('Material world activities result:', result.rows);
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching material world activities:', error);
      return [];
    }
  }

  // Word translations methods
  async getWordTranslation(wordId: string, language: string): Promise<WordTranslation | undefined> {
    const [translation] = await db.select().from(wordTranslations)
      .where(and(
        eq(wordTranslations.wordId, wordId),
        eq(wordTranslations.language, language)
      ));
    return translation || undefined;
  }

  async getWordTranslations(wordId: string): Promise<WordTranslation[]> {
    return await db.select().from(wordTranslations)
      .where(eq(wordTranslations.wordId, wordId));
  }

  async createWordTranslation(wordId: string, language: string, translation: string): Promise<WordTranslation> {
    const [wordTranslation] = await db.insert(wordTranslations).values({
      wordId,
      language,
      translation,
    }).returning();
    return wordTranslation;
  }

  async getWordWithTranslation(wordId: string, language: string): Promise<(Word & { translatedWord?: string }) | undefined> {
    await this.ensureInitialized();

    const result = await db.execute(sql`
      SELECT w.*, wt.translation as translated_word
      FROM words w
      LEFT JOIN word_translations wt ON w.id = wt.word_id AND wt.language = ${language}
      WHERE w.id = ${wordId}
    `);

    if (!result.rows || result.rows.length === 0) {
      return undefined;
    }

    const row = result.rows[0] as any;
    return {
      id: row.id,
      word: row.word,
      image: row.image,
      audio: row.audio,
      word_english: row.word_english,
      translatedWord: row.translated_word || undefined,
    };
  }

  async getAllWordsWithTranslations(language: string): Promise<(Word & { translatedWord?: string })[]> {
    await this.ensureInitialized();

    const result = await db.execute(sql`
      SELECT w.*, wt.translation as translated_word
      FROM words w
      LEFT JOIN word_translations wt ON w.id = wt.word_id AND wt.language = ${language}
    `);

    if (!result.rows) {
      return [];
    }

    const allWords = result.rows.map((row: any) => ({
      id: row.id,
      word: row.word,
      image: row.image,
      audio: row.audio,
      word_english: row.word_english,
      translatedWord: row.translated_word || undefined,
    }));

    return this.filterBlacklistedWords(allWords as Word[]).map(w => ({
      ...w,
      translatedWord: allWords.find(aw => aw.id === w.id)?.translatedWord,
    }));
  }
}

export const storage = new DatabaseStorage();
