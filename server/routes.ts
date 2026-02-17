import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameProgressSchema, insertUserAnswerSchema, insertSentenceSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import { sendPasswordResetEmail } from "./email";

// Blacklist for difficult letters - exclude from letter generation
const BLACKLISTED_LETTERS = ['Ъ'];

// Retry wrapper for database operations
async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error?.code === 'ECONNREFUSED' ||
        error?.code === 'ETIMEDOUT' ||
        error?.code === 'ECONNRESET' ||
        error?.code === 'CONNECTION_ENDED' ||
        error?.message?.includes('Connection terminated') ||
        error?.message?.includes('timeout');

      if (attempt < retries && isRetryable) {
        console.warn(`DB retry attempt ${attempt + 1}/${retries}:`, error.message);
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Retry exhausted');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // === AUTHENTICATION API ===

  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user with hashed password
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error registering user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Login user
  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("Login attempt with body:", JSON.stringify(req.body));

      const loginSchema = z.object({
        email: z.string().email(),
        password: z.string().min(1)
      });

      const { email, password } = loginSchema.parse(req.body);
      console.log(`Parsed login request for email: ${email}`);

      // Find user by email
      console.log(`Looking up user by email: ${email}`);
      const user = await storage.getUserByEmail(email);
      console.log(`User lookup result:`, user ? `Found user ${user.id}` : 'Not found');

      if (!user) {
        console.log(`Login failed: User not found for email ${email}`);
        return res.status(401).json({ message: "Неверный email або пароль" });
      }

      // Check if user has a password (might be Google-only user)
      if (!user.password) {
        console.log(`Login failed: User ${email} has no password (Google account?)`);
        return res.status(401).json({ message: "Цей акаунт використовує вхід через Google" });
      }

      // Check password
      console.log(`Comparing password for user ${email}`);
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log(`Password comparison result: ${isValidPassword}`);

      if (!isValidPassword) {
        console.log(`Login failed: Invalid password for ${email}`);
        return res.status(401).json({ message: "Неверный email або пароль" });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      console.log(`Login successful for ${email}`);
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Error logging in:", error);
      console.error("Error stack:", error?.stack);
      console.error("Error message:", error?.message);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные для входа", errors: error.errors });
      }
      res.status(500).json({ message: `Помилка сервера: ${error?.message || 'Unknown error'}` });
    }
  });

  // Google OAuth login/register
  app.post("/api/auth/google", async (req, res) => {
    try {
      const googleSchema = z.object({
        credential: z.string()
      });

      const { credential } = googleSchema.parse(req.body);

      // Decode the JWT token from Google (base64 encoded payload)
      const parts = credential.split('.');
      if (parts.length !== 3) {
        return res.status(400).json({ message: "Invalid Google credential" });
      }

      // Decode the payload (second part of JWT)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      const { email, given_name, family_name, sub: googleId } = payload;

      if (!email) {
        return res.status(400).json({ message: "Email not provided by Google" });
      }

      // Check if user exists
      let user = await storage.getUserByEmail(email);

      if (!user) {
        // Create new user with Google data
        // Generate a random password for Google users (they won't use it)
        const randomPassword = await bcrypt.hash(googleId + Date.now(), 10);

        user = await storage.createUser({
          email,
          firstName: given_name || 'User',
          lastName: family_name || '',
          password: randomPassword,
          newsletter: false
        });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error with Google auth:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid Google data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to authenticate with Google" });
    }
  });

  // Forgot password request
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);

      if (user) {
        // Generate reset token
        const resetToken = await storage.createPasswordResetToken(user.id);
        console.log(`Password reset token created for: ${email}`);

        // Send email with reset link
        const emailSent = await sendPasswordResetEmail(email, resetToken, user.firstName);
        if (emailSent) {
          console.log(`Password reset email sent to: ${email}`);
        } else {
          console.log(`Password reset email could not be sent. Token: ${resetToken}`);
        }
      } else {
        console.log(`Password reset requested for non-existent email: ${email}`);
      }

      // Always return success for security (don't reveal if email exists)
      res.json({ message: "If this email exists, reset instructions have been sent" });
    } catch (error) {
      console.error("Error processing forgot password:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      // Verify token
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password
      await storage.updateUserPassword(resetToken.userId, hashedPassword);

      // Mark token as used
      await storage.markTokenAsUsed(resetToken.id);

      console.log(`Password reset successful for user: ${resetToken.userId}`);
      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Get available words (excluding correctly answered ones in last month)
  // Pass ?all=true to get ALL words without filtering
  // Pass ?lang=uk to get words with translations for that language
  app.get("/api/words", async (req, res) => {
    try {
      // Cache words list for 2 minutes
      res.set('Cache-Control', 'public, max-age=120');
      const sessionId = req.query.sessionId as string || 'default-session';
      const getAllWords = req.query.all === 'true';
      const language = req.query.lang as string | undefined;

      // If language is specified, get words with translations
      if (language) {
        const wordsWithTranslations = await withRetry(() => storage.getAllWordsWithTranslations(language));
        return res.json(wordsWithTranslations);
      }

      // If all=true, return all words; otherwise filter by session progress
      const words = await withRetry(() =>
        getAllWords ? storage.getAllWords() : storage.getAvailableWords(sessionId)
      );
      res.json(words);
    } catch (error) {
      console.error("Error fetching words:", error);
      res.status(500).json({ message: "Failed to fetch words" });
    }
  });

  // Get a specific word by ID
  // Pass ?lang=uk to get word with translation for that language
  app.get("/api/words/:id", async (req, res) => {
    try {
      const language = req.query.lang as string | undefined;

      if (language) {
        const wordWithTranslation = await storage.getWordWithTranslation(req.params.id, language);
        if (!wordWithTranslation) {
          return res.status(404).json({ message: "Word not found" });
        }
        return res.json(wordWithTranslation);
      }

      const word = await storage.getWord(req.params.id);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }
      res.json(word);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch word" });
    }
  });

  // Get random words for distractors
  app.get("/api/words/:id/distractors", async (req, res) => {
    try {
      // Cache distractors for 5 minutes
      res.set('Cache-Control', 'public, max-age=300');
      const count = parseInt(req.query.count as string) || 3;
      const distractors = await withRetry(() => storage.getRandomWords(req.params.id, count));
      res.json(distractors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch distractors" });
    }
  });

  // Get letter options for spell word game
  app.get("/api/words/:id/spell-letters", async (req, res) => {
    try {
      const word = await storage.getWord(req.params.id);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }

      const wordText = word.word;

      // Get all letters from the word (including duplicates) and shuffle them
      const wordLetters = wordText.split('').sort(() => Math.random() - 0.5);

      res.json({
        availableLetters: wordLetters
      });
    } catch (error) {
      console.error("Error getting spell letters:", error);
      res.status(500).json({ message: "Failed to get spell letters" });
    }
  });

  // Get syllable options for syllables game
  app.get("/api/words/:id/syllables", async (req, res) => {
    try {
      const word = await storage.getWord(req.params.id);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }

      // Import splitIntoSyllables function
      const { splitIntoSyllables } = await import("../client/src/lib/utils");

      // Get correct syllables from the word
      const correctSyllables = splitIntoSyllables(word.word);

      // Generate random distractor syllables
      const allWords = await storage.getAllWords();
      const allSyllables = new Set<string>();

      // Collect syllables from all words (filter out empty strings)
      for (const w of allWords) {
        const wordSyllables = splitIntoSyllables(w.word);
        wordSyllables.forEach(syllable => {
          if (syllable && syllable.trim()) {
            allSyllables.add(syllable);
          }
        });
      }

      // Filter correct syllables to remove any empty strings
      const validCorrectSyllables = correctSyllables.filter(s => s && s.trim());

      // Remove correct syllables from distractors
      const distractorSyllables = Array.from(allSyllables).filter(
        syllable => syllable && syllable.trim() && !validCorrectSyllables.includes(syllable)
      );

      // Shuffle and select 3 random distractors
      const shuffledDistractors = distractorSyllables.sort(() => Math.random() - 0.5);
      const selectedDistractors = shuffledDistractors.slice(0, 3);

      // Combine correct syllables with distractors and shuffle (final filter for safety)
      const allOptions = [...validCorrectSyllables, ...selectedDistractors].filter(s => s && s.trim());
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

      res.json({
        syllables: shuffledOptions,
        correctSyllables: validCorrectSyllables
      });
    } catch (error) {
      console.error("Error getting syllables:", error);
      res.status(500).json({ message: "Failed to get syllables" });
    }
  });

  // Create game progress
  app.post("/api/game-progress", async (req, res) => {
    try {
      const validatedData = insertGameProgressSchema.parse(req.body);
      const progress = await storage.createGameProgress(validatedData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid game progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create game progress" });
    }
  });

  // Get game progress
  app.get("/api/game-progress/:id", async (req, res) => {
    try {
      const progress = await storage.getGameProgress(req.params.id);
      if (!progress) {
        return res.status(404).json({ message: "Game progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game progress" });
    }
  });

  // Update game progress
  app.patch("/api/game-progress/:id", async (req, res) => {
    try {
      const updates = req.body;
      const progress = await storage.updateGameProgress(req.params.id, updates);
      if (!progress) {
        return res.status(404).json({ message: "Game progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update game progress" });
    }
  });

  // Get today's progress (correct answers count)
  app.get("/api/progress/today", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string || 'default-session';
      const count = await withRetry(() => storage.getTodayCorrectAnswersCount(sessionId));
      res.json({ correctAnswersToday: count });
    } catch (error) {
      console.error("Error getting today's progress:", error);
      res.status(500).json({ message: "Failed to get today's progress" });
    }
  });

  // Get progress statistics for charts
  app.get("/api/progress/stats", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string || 'default-session';
      const fromDate = req.query.from as string;
      const toDate = req.query.to as string;

      if (!fromDate || !toDate) {
        return res.status(400).json({ message: "From and to dates are required" });
      }

      const stats = await storage.getProgressStats(sessionId, fromDate, toDate);
      res.json(stats);
    } catch (error) {
      console.error("Error getting progress stats:", error);
      res.status(500).json({ message: "Failed to get progress stats" });
    }
  });

  // Record user answer
  app.post("/api/answers", async (req, res) => {
    try {
      const validatedData = insertUserAnswerSchema.parse(req.body);
      const answer = await storage.recordAnswer(validatedData);
      res.status(201).json(answer);
    } catch (error) {
      console.error("Error recording answer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid answer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to record answer" });
    }
  });

  // === SENTENCES AND PHRASES API ===

  // Get all sentences
  app.get("/api/sentences", async (req, res) => {
    try {
      // Cache sentences list for 5 minutes
      res.set('Cache-Control', 'public, max-age=300');
      const sentences = await storage.getAllSentences();
      res.json(sentences);
    } catch (error) {
      console.error("Error fetching sentences:", error);
      res.status(500).json({ message: "Failed to fetch sentences" });
    }
  });

  // Get a specific sentence by ID
  app.get("/api/sentences/:id", async (req, res) => {
    try {
      const sentence = await storage.getSentence(req.params.id);
      if (!sentence) {
        return res.status(404).json({ message: "Sentence not found" });
      }
      res.json(sentence);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sentence" });
    }
  });

  // Get sentences by category
  app.get("/api/sentences/category/:category", async (req, res) => {
    try {
      // Cache category sentences for 5 minutes
      res.set('Cache-Control', 'public, max-age=300');
      const sentences = await storage.getSentencesByCategory(req.params.category);
      res.json(sentences);
    } catch (error) {
      console.error("Error fetching sentences by category:", error);
      res.status(500).json({ message: "Failed to fetch sentences by category" });
    }
  });

  // Get sentences by difficulty
  app.get("/api/sentences/difficulty/:difficulty", async (req, res) => {
    try {
      // Cache difficulty sentences for 5 minutes
      res.set('Cache-Control', 'public, max-age=300');
      const sentences = await storage.getSentencesByDifficulty(req.params.difficulty);
      res.json(sentences);
    } catch (error) {
      console.error("Error fetching sentences by difficulty:", error);
      res.status(500).json({ message: "Failed to fetch sentences by difficulty" });
    }
  });

  // Create new sentence
  app.post("/api/sentences", async (req, res) => {
    try {
      const validatedData = insertSentenceSchema.parse(req.body);
      const sentence = await storage.createSentence(validatedData);
      res.status(201).json(sentence);
    } catch (error) {
      console.error("Error creating sentence:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sentence data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sentence" });
    }
  });

  // === WORD TRANSLATIONS API ===

  // Get translations for a word
  app.get("/api/words/:id/translations", async (req, res) => {
    try {
      const translations = await storage.getWordTranslations(req.params.id);
      res.json(translations);
    } catch (error) {
      console.error("Error fetching word translations:", error);
      res.status(500).json({ message: "Failed to fetch word translations" });
    }
  });

  // Create a translation for a word
  app.post("/api/words/:id/translations", async (req, res) => {
    try {
      const { language, translation } = req.body;
      if (!language || !translation) {
        return res.status(400).json({ message: "Language and translation are required" });
      }
      const wordTranslation = await storage.createWordTranslation(req.params.id, language, translation);
      res.status(201).json(wordTranslation);
    } catch (error) {
      console.error("Error creating word translation:", error);
      res.status(500).json({ message: "Failed to create word translation" });
    }
  });

  // === MATERIAL WORLD ACTIVITIES API ===

  // Get material world activities
  app.get("/api/material-world", async (req, res) => {
    try {
      // Cache material world activities for 5 minutes
      res.set('Cache-Control', 'public, max-age=300');
      const activities = await withRetry(() => storage.getMaterialWorldActivities());
      res.json(activities);
    } catch (error) {
      console.error("Error fetching material world activities:", error);
      res.status(500).json({ message: "Failed to fetch material world activities" });
    }
  });

  // Get distractors for material world item (for audio-sentence game)
  app.get("/api/material-world/:id/distractors", async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Fetching distractors for material world id:', id);

      const distractors = await withRetry(() => storage.getRandomMaterialWorldItems(id, 3));
      console.log('Got material world distractors:', distractors.length);

      // If we don't have enough distractors with valid images, supplement with random words
      if (distractors.length < 3) {
        const neededCount = 3 - distractors.length;
        console.log('Need', neededCount, 'more distractors from words table');

        // Get all words and pick random ones
        const allWords = await storage.getAllWords();
        const shuffled = allWords.sort(() => Math.random() - 0.5).slice(0, neededCount);

        // Transform words to MaterialWorld-like objects for consistent UI
        const wordDistractors = shuffled.map(word => ({
          id: `word-${word.id}`,
          event: word.word,
          syllables: null,
          image: word.image,
          audio: null,
          event_en: null,
          event_uk: null,
          audio_ru: null,
          audio_en: null,
          audio_uk: null
        }));

        console.log('Added word distractors:', wordDistractors.length);
        distractors.push(...wordDistractors);
      }

      console.log('Total distractors:', distractors.length);
      res.json(distractors);
    } catch (error) {
      console.error("Error fetching material world distractors:", error);
      res.status(500).json({ message: "Failed to fetch distractors" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
