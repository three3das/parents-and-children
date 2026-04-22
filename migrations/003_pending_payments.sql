-- Таблица для ожидающих P2P платежей
CREATE TABLE IF NOT EXISTS pending_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL DEFAULT 100,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  activated_by VARCHAR(255),
  notes TEXT
);

-- Индекс для быстрого поиска по статусу
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON pending_payments(status);

-- Индекс для поиска по пользователю
CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id ON pending_payments(user_id);

-- Таблица для отслеживания активаций по месяцам (лимит 20/месяц)
CREATE TABLE IF NOT EXISTS monthly_activations (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(year, month)
);

-- Вставить текущий месяц
INSERT INTO monthly_activations (year, month, count)
VALUES (EXTRACT(YEAR FROM NOW()), EXTRACT(MONTH FROM NOW()), 0)
ON CONFLICT (year, month) DO NOTHING;
