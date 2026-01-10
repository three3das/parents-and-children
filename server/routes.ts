import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameProgressSchema, insertUserAnswerSchema, insertSentenceSchema } from "@shared/schema";
import { z } from "zod";

// Blacklist for difficult letters - exclude from letter generation
const BLACKLISTED_LETTERS = ['Ъ'];

export async function registerRoutes(app: Express): Promise<Server> {
  // Get available words (excluding correctly answered ones in last month)
  app.get("/api/words", async (req, res) => {
    try {
      // Cache words list for 2 minutes
      res.set('Cache-Control', 'public, max-age=120');
      const sessionId = req.query.sessionId as string || 'default-session';
      const words = await storage.getAvailableWords(sessionId);
      res.json(words);
    } catch (error) {
      console.error("Error fetching words:", error);
      res.status(500).json({ message: "Failed to fetch words" });
    }
  });

  // Get a specific word by ID
  app.get("/api/words/:id", async (req, res) => {
    try {
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
      const distractors = await storage.getRandomWords(req.params.id, count);
      res.json(distractors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch distractors" });
    }
  });

  // Get letter options for missing letter game
  app.get("/api/words/:id/letter-options", async (req, res) => {
    try {
      const word = await storage.getWord(req.params.id);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }

      const wordText = word.word;
      const russianLetters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';

      // Filter out blacklisted letters
      const availableLettersForGeneration = russianLetters.split('')
        .filter(letter => !BLACKLISTED_LETTERS.includes(letter));

      // Choose a random position to remove (not first or last position for easier gameplay)
      const missingLetterIndex = Math.floor(Math.random() * (wordText.length - 2)) + 1;
      const correctLetter = wordText[missingLetterIndex];

      // Generate 3 random incorrect letters that are not in the word
      const wordLetters = new Set(wordText.split(''));
      const availableLetters = availableLettersForGeneration.filter(letter => !wordLetters.has(letter));
      const incorrectLetters = availableLetters
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Combine correct and incorrect letters, then shuffle
      const allOptions = [correctLetter, ...incorrectLetters]
        .sort(() => Math.random() - 0.5);

      res.json({
        letterOptions: allOptions,
        missingLetterIndex,
        correctLetter
      });
    } catch (error) {
      console.error("Error getting letter options:", error);
      res.status(500).json({ message: "Failed to get letter options" });
    }
  });

  // Get word with extra letter for extra letter game
  app.get("/api/words/:id/extra-letter", async (req, res) => {
    try {
      const word = await storage.getWord(req.params.id);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }

      const wordText = word.word;
      const russianLetters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';

      // Filter out blacklisted letters
      const availableLettersForGeneration = russianLetters.split('')
        .filter(letter => !BLACKLISTED_LETTERS.includes(letter));

      // Choose a random position to insert extra letter (not at the very beginning or end)
      const insertPosition = Math.floor(Math.random() * (wordText.length - 1)) + 1;

      // Generate a random letter that's not in the word
      const wordLetters = new Set(wordText.split(''));
      const availableLetters = availableLettersForGeneration.filter(letter => !wordLetters.has(letter));
      const extraLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];

      // Insert the extra letter
      const wordArray = wordText.split('');
      wordArray.splice(insertPosition, 0, extraLetter);
      const wordWithExtraLetter = wordArray.join('');

      res.json({
        wordWithExtraLetter,
        extraLetterIndex: insertPosition,
        extraLetter
      });
    } catch (error) {
      console.error("Error getting extra letter word:", error);
      res.status(500).json({ message: "Failed to get extra letter word" });
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

      // Collect syllables from all words
      for (const w of allWords) {
        const wordSyllables = splitIntoSyllables(w.word);
        wordSyllables.forEach(syllable => allSyllables.add(syllable));
      }

      // Remove correct syllables from distractors
      const distractorSyllables = Array.from(allSyllables).filter(
        syllable => !correctSyllables.includes(syllable)
      );

      // Shuffle and select 3 random distractors
      const shuffledDistractors = distractorSyllables.sort(() => Math.random() - 0.5);
      const selectedDistractors = shuffledDistractors.slice(0, 3);

      // Combine correct syllables with distractors and shuffle
      const allOptions = [...correctSyllables, ...selectedDistractors];
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

      res.json({
        syllables: shuffledOptions,
        correctSyllables: correctSyllables
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
      const count = await storage.getTodayCorrectAnswersCount(sessionId);
      res.json({ correctAnswersToday: count });
    } catch (error) {
      console.error("Error getting today's progress:", error);
      res.status(500).json({ message: "Failed to get today's progress" });
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

  // === MATERIAL WORLD ACTIVITIES API ===

  // Get material world activities
  app.get("/api/material-world", async (req, res) => {
    try {
      // Cache material world activities for 5 minutes
      res.set('Cache-Control', 'public, max-age=300');
      const activities = await storage.getMaterialWorldActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching material world activities:", error);
      res.status(500).json({ message: "Failed to fetch material world activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
