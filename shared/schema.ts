import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  newsletter: boolean("newsletter").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

export const words = pgTable("words", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  word: text("word").notNull(),
  image: text("image").notNull(),
  audio: text("audio").notNull(),
  word_english: text("word_english"),
});

export const wordTranslations = pgTable("word_translations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wordId: varchar("word_id").notNull(),
  language: varchar("language", { length: 5 }).notNull(),
  translation: text("translation").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});
export const sentencesAndPhrases = pgTable("sentences_and_phrases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sentence: text("sentence").notNull(),
  translation: text("translation").notNull(),
  audio: text("audio").notNull(),
  difficulty: varchar("difficulty").notNull().default("easy"), // easy, medium, hard
  category: varchar("category").notNull().default("general"), // general, family, nature, etc.
});
export const gameProgress = pgTable("game_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  currentWordIndex: integer("current_word_index").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(10),
});
export const userAnswers = pgTable("user_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wordId: varchar("word_id").notNull(),
  isCorrect: boolean("is_correct").default(false),
  answeredAt: timestamp("answered_at", { withTimezone: true }).default(sql`now()`),
  sessionId: varchar("session_id").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWordSchema = createInsertSchema(words).omit({
  id: true,
});

export const insertSentenceSchema = createInsertSchema(sentencesAndPhrases).omit({
  id: true,
});

export const insertGameProgressSchema = createInsertSchema(gameProgress).omit({
  id: true,
});
export const insertUserAnswerSchema = createInsertSchema(userAnswers).omit({
  id: true,
  answeredAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertWord = z.infer<typeof insertWordSchema>;
export type Word = typeof words.$inferSelect;
export type User = typeof users.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertSentence = z.infer<typeof insertSentenceSchema>;
export type SentenceAndPhrase = typeof sentencesAndPhrases.$inferSelect;
export type InsertGameProgress = z.infer<typeof insertGameProgressSchema>;
export type GameProgress = typeof gameProgress.$inferSelect;
export type InsertUserAnswer = z.infer<typeof insertUserAnswerSchema>;
export type UserAnswer = typeof userAnswers.$inferSelect;
export type WordTranslation = typeof wordTranslations.$inferSelect;
// Game types
export type GameType = 'picture-match' | 'missing-letter' | 'extra-letter' | 'spell-word' | 'mix' | 'syllables' | 'sentence-game';
// Letter audio mapping for Russian alphabet
export const RUSSIAN_LETTERS = {
  'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ё': 'yo',
  'Ж': 'zh', 'З': 'z', 'И': 'i', 'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm',
  'Н': 'n', 'О': 'o', 'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u',
  'Ф': 'f', 'Х': 'h', 'Ц': 'ts', 'Ч': 'ch', 'Ш': 'sh', 'Щ': 'sch',
  'Ъ': 'hard', 'Ы': 'y', 'Ь': 'soft', 'Э': 'e', 'Ю': 'yu', 'Я': 'ya'
} as const;