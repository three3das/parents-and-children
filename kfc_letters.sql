-- ─── kfc schema + letters table ────────────────────────────────────────────
-- Knowledge for Children (KFC) — isolated from KidRead (public schema)
-- Audio paths are relative to the /public directory of the web server
-- Run this script once in your Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Schema
CREATE SCHEMA IF NOT EXISTS kfc;

-- 2. Table
CREATE TABLE IF NOT EXISTS kfc.letters (
  id          SERIAL       PRIMARY KEY,
  letter      VARCHAR(10)  NOT NULL,
  locale      VARCHAR(5)   NOT NULL,   -- 'ru' or 'uk'
  sort_order  INTEGER      NOT NULL,
  audio_path  VARCHAR(255),
  UNIQUE (letter, locale)
);

-- 3. Index for fast locale lookups
CREATE INDEX IF NOT EXISTS kfc_letters_locale_sort
  ON kfc.letters (locale, sort_order);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Russian letters (31 letters present in /audio/letters/рос/)
--    Standard Russian alphabet: А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я
--    Note: Ё (7) and Й (11) audio files are absent — omitted below
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kfc.letters (letter, locale, sort_order, audio_path) VALUES
  ('А', 'ru',  1,  '/audio/letters/рос/А.mp3'),
  ('Б', 'ru',  2,  '/audio/letters/рос/Б.mp3'),
  ('В', 'ru',  3,  '/audio/letters/рос/В.mp3'),
  ('Г', 'ru',  4,  '/audio/letters/рос/Г.mp3'),
  ('Д', 'ru',  5,  '/audio/letters/рос/Д.mp3'),
  ('Е', 'ru',  6,  '/audio/letters/рос/Е.mp3'),
  ('Ж', 'ru',  8,  '/audio/letters/рос/Ж.mp3'),
  ('З', 'ru',  9,  '/audio/letters/рос/З.mp3'),
  ('И', 'ru', 10,  '/audio/letters/рос/И.mp3'),
  ('К', 'ru', 12,  '/audio/letters/рос/К.mp3'),
  ('Л', 'ru', 13,  '/audio/letters/рос/Л.mp3'),
  ('М', 'ru', 14,  '/audio/letters/рос/М.mp3'),
  ('Н', 'ru', 15,  '/audio/letters/рос/Н.mp3'),
  ('О', 'ru', 16,  '/audio/letters/рос/О.mp3'),
  ('П', 'ru', 17,  '/audio/letters/рос/П.mp3'),
  ('Р', 'ru', 18,  '/audio/letters/рос/Р.mp3'),
  ('С', 'ru', 19,  '/audio/letters/рос/С.mp3'),
  ('Т', 'ru', 20,  '/audio/letters/рос/Т.mp3'),
  ('У', 'ru', 21,  '/audio/letters/рос/У.mp3'),
  ('Ф', 'ru', 22,  '/audio/letters/рос/Ф.mp3'),
  ('Х', 'ru', 23,  '/audio/letters/рос/Х.mp3'),
  ('Ц', 'ru', 24,  '/audio/letters/рос/Ц.mp3'),
  ('Ч', 'ru', 25,  '/audio/letters/рос/Ч.mp3'),
  ('Ш', 'ru', 26,  '/audio/letters/рос/Ш.mp3'),
  ('Щ', 'ru', 27,  '/audio/letters/рос/Щ.mp3'),
  ('Ъ', 'ru', 28,  '/audio/letters/рос/Ъ.mp3'),
  ('Ы', 'ru', 29,  '/audio/letters/рос/Ы.mp3'),
  ('Ь', 'ru', 30,  '/audio/letters/рос/Ь.mp3'),
  ('Э', 'ru', 31,  '/audio/letters/рос/Э.mp3'),
  ('Ю', 'ru', 32,  '/audio/letters/рос/Ю.mp3'),
  ('Я', 'ru', 33,  '/audio/letters/рос/Я.mp3')
ON CONFLICT (letter, locale) DO UPDATE
  SET audio_path = EXCLUDED.audio_path,
      sort_order  = EXCLUDED.sort_order;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Ukrainian letters (31 letters present in /audio/letters/укр/)
--    Standard Ukrainian alphabet: А Б В Г Ґ Д Е Є Ж З И І Ї Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ь Ю Я
--    Notes:
--      • Ґ audio file is named "Г''===" on disk (see audio_path)
--      • Ї (13) and Й (14) audio files are absent — omitted below
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kfc.letters (letter, locale, sort_order, audio_path) VALUES
  ('А', 'uk',  1,  '/audio/letters/укр/А.mp3'),
  ('Б', 'uk',  2,  '/audio/letters/укр/Б.mp3'),
  ('В', 'uk',  3,  '/audio/letters/укр/В.mp3'),
  ('Г', 'uk',  4,  '/audio/letters/укр/Г.mp3'),
  ('Ґ', 'uk',  5,  '/audio/letters/укр/Г''===.mp3'),
  ('Д', 'uk',  6,  '/audio/letters/укр/Д.mp3'),
  ('Е', 'uk',  7,  '/audio/letters/укр/Е.mp3'),
  ('Є', 'uk',  8,  '/audio/letters/укр/Є.mp3'),
  ('Ж', 'uk',  9,  '/audio/letters/укр/Ж.mp3'),
  ('З', 'uk', 10,  '/audio/letters/укр/З.mp3'),
  ('И', 'uk', 11,  '/audio/letters/укр/И.mp3'),
  ('І', 'uk', 12,  '/audio/letters/укр/І.mp3'),
  ('К', 'uk', 15,  '/audio/letters/укр/К.mp3'),
  ('Л', 'uk', 16,  '/audio/letters/укр/Л.mp3'),
  ('М', 'uk', 17,  '/audio/letters/укр/М.mp3'),
  ('Н', 'uk', 18,  '/audio/letters/укр/Н.mp3'),
  ('О', 'uk', 19,  '/audio/letters/укр/О.mp3'),
  ('П', 'uk', 20,  '/audio/letters/укр/П.mp3'),
  ('Р', 'uk', 21,  '/audio/letters/укр/Р.mp3'),
  ('С', 'uk', 22,  '/audio/letters/укр/С.mp3'),
  ('Т', 'uk', 23,  '/audio/letters/укр/Т.mp3'),
  ('У', 'uk', 24,  '/audio/letters/укр/У.mp3'),
  ('Ф', 'uk', 25,  '/audio/letters/укр/Ф.mp3'),
  ('Х', 'uk', 26,  '/audio/letters/укр/Х.mp3'),
  ('Ц', 'uk', 27,  '/audio/letters/укр/Ц.mp3'),
  ('Ч', 'uk', 28,  '/audio/letters/укр/Ч.mp3'),
  ('Ш', 'uk', 29,  '/audio/letters/укр/Ш.mp3'),
  ('Щ', 'uk', 30,  '/audio/letters/укр/Щ.mp3'),
  ('Ь', 'uk', 31,  '/audio/letters/укр/Ь.mp3'),
  ('Ю', 'uk', 32,  '/audio/letters/укр/Ю.mp3'),
  ('Я', 'uk', 33,  '/audio/letters/укр/Я.mp3')
ON CONFLICT (letter, locale) DO UPDATE
  SET audio_path = EXCLUDED.audio_path,
      sort_order  = EXCLUDED.sort_order;

-- ─────────────────────────────────────────────────────────────────────────────
-- Summary
-- ─────────────────────────────────────────────────────────────────────────────
-- Russian (locale='ru'): 31 letters inserted (Ё sort=7 and Й sort=11 skipped — no audio)
-- Ukrainian (locale='uk'): 31 letters inserted (Ї sort=13 and Й sort=14 skipped — no audio)
-- Ґ uses the on-disk filename "Г''===" — consider renaming that file to "Ґ.mp3" for clarity
-- ON CONFLICT clause makes this script safely re-runnable
-- ─────────────────────────────────────────────────────────────────────────────
