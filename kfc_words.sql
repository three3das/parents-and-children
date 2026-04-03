-- ─── kfc.words — многоязычные названия категорий/тем ────────────────────────
-- Схема kfc (изолирована от KidRead)
-- Запустите в SQL Editor Supabase или HeidiSQL
-- ─────────────────────────────────────────────────────────────────────────────

-- Таблица words
CREATE TABLE IF NOT EXISTS kfc.words (
  id  UUID         PRIMARY KEY,
  ru  TEXT         NOT NULL,   -- русский
  en  TEXT         NOT NULL,   -- английский
  uk  TEXT         NOT NULL    -- украинский
);

-- Первая строка: Алфавит / ABC book / Алфавіт
INSERT INTO kfc.words (id, ru, en, uk) VALUES
  (
    'a1b2c3d4-e5f6-7001-abcd-ef0000000001',
    'Алфавит',
    'ABC book',
    'Алфавіт'
  )
ON CONFLICT (id) DO UPDATE
  SET ru = EXCLUDED.ru,
      en = EXCLUDED.en,
      uk = EXCLUDED.uk;

-- ─── Проверка ────────────────────────────────────────────────────────────────
-- SELECT * FROM kfc.words;
-- ─────────────────────────────────────────────────────────────────────────────
