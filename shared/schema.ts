import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, uuid, numeric, primaryKey, jsonb } from "drizzle-orm/pg-core";
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
  suffix: varchar("suffix", { length: 10 }), // 3-letter ending for syllables game
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

export const materialWorld = pgTable("material_world", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  event: text("event").notNull(), // Russian sentence
  event_en: text("event_en"), // English translation
  event_uk: text("event_uk"), // Ukrainian translation
  syllables: text("syllables"),
  image: text("image").notNull(),
  audio_ru: text("audio_ru"), // Russian audio file path
  audio_en: text("audio_en"), // English audio file path
  audio_uk: text("audio_uk"), // Ukrainian audio file path
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
  gameType: varchar("game_type").notNull(),
});

// ─────────────────────────────────────────────────────────────────
// Таблицы системы P2P-платежей (server/routes/p2p-payments.ts).
// Раньше существовали только в реальной базе (созданы вручную через
// Supabase Table Editor), но не были описаны здесь — из-за этого
// `drizzle-kit push` считал их "лишними" и предлагал удалить при
// каждой миграции. Структура ниже взята из актуальной базы данных,
// 1:1 с уже существующими таблицами (см. Supabase Table Editor).
// ─────────────────────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  status: text("status").notNull(),
  plan: text("plan"),
  startedAt: timestamp("started_at", { withTimezone: true }).default(sql`now()`),
});

export const pendingPayments = pgTable("pending_payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: numeric("amount").notNull(),
  currency: text("currency").default("UAH"),
  status: text("status").notNull().default("pending"),
  // ⚠️ provider / providerPaymentId / metadata: судя по всему,
  // задел на будущее для интеграции со сторонним платёжным провайдером
  // (например NOWPayments, см. server/index.ts) — сейчас всегда NULL,
  // так как активная логика (p2p-payments.ts) их не заполняет.
  provider: text("provider"),
  providerPaymentId: text("provider_payment_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
  // ⚠️ Тип в реальной базе — text, не varchar (важно для drizzle-kit push,
  // иначе он считает это изменением типа и требует пересоздания колонки).
  userEmail: text("user_email").notNull(),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  activatedBy: text("activated_by"),
  notes: text("notes"),
  method: text("method"),
});

export const monthlyActivations = pgTable(
  "monthly_activations",
  {
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.year, table.month] }),
  })
);

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

export const insertMaterialWorldSchema = createInsertSchema(materialWorld).omit({
  id: true,
});

export const insertGameProgressSchema = createInsertSchema(gameProgress).omit({
  id: true,
});
export const insertUserAnswerSchema = createInsertSchema(userAnswers).omit({
  id: true,
  answeredAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  startedAt: true,
});
export const insertPendingPaymentSchema = createInsertSchema(pendingPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  activatedAt: true,
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
export type InsertMaterialWorld = z.infer<typeof insertMaterialWorldSchema>;
export type MaterialWorld = typeof materialWorld.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertPendingPayment = z.infer<typeof insertPendingPaymentSchema>;
export type PendingPayment = typeof pendingPayments.$inferSelect;
export type MonthlyActivation = typeof monthlyActivations.$inferSelect;
// Game types
export type GameType = 'alphabet-placeholder' | 'picture-match' | 'spell-word' | 'syllables' | 'sentence-game' | 'audio-picture' | 'audio-sentence';
// Letter audio mapping for Russian alphabet
export const RUSSIAN_LETTERS = {
  'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ё': 'yo',
  'Ж': 'zh', 'З': 'z', 'И': 'i', 'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm',
  'Н': 'n', 'О': 'o', 'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u',
  'Ф': 'f', 'Х': 'h', 'Ц': 'ts', 'Ч': 'ch', 'Ш': 'sh', 'Щ': 'sch',
  'Ъ': 'hard', 'Ы': 'y', 'Ь': 'soft', 'Э': 'e', 'Ю': 'yu', 'Я': 'ya'
} as const;