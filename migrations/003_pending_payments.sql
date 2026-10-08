-- migrations/003_pending_payments.sql
--
-- Таблицы P2P-платежей. Структура 1:1 с shared/schema.ts
-- (pendingPayments, monthlyActivations) и с реальной базой.
-- Безопасно запускать повторно: везде IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS pending_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'UAH',
  status text NOT NULL DEFAULT 'pending',
  provider text,
  provider_payment_id text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_email text NOT NULL,
  activated_at timestamptz,
  activated_by text,
  notes text,
  method text
);

CREATE INDEX IF NOT EXISTS idx_pending_payments_status
  ON pending_payments(status);
CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id
  ON pending_payments(user_id);

CREATE TABLE IF NOT EXISTS monthly_activations (
  year integer NOT NULL,
  month integer NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (year, month)
);

-- Закрываем доступ через публичный ключ Supabase (сервер ходит под
-- ролью postgres через DATABASE_URL и RLS не затрагивается).
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_activations ENABLE ROW LEVEL SECURITY;