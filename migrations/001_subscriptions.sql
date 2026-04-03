-- Миграция: таблицы для крипто-подписок
-- Запустить: psql -d your_db -f 001_subscriptions.sql

-- Подписки пользователей
CREATE TABLE IF NOT EXISTS subscriptions (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          VARCHAR(20) NOT NULL DEFAULT 'inactive',
  -- 'inactive' | 'pending' | 'active' | 'expired' | 'cancelled'
  plan            VARCHAR(50) NOT NULL DEFAULT 'monthly',
  started_at      TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

-- Крипто-платежи
CREATE TABLE IF NOT EXISTS crypto_payments (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id     INTEGER REFERENCES subscriptions(id),
  nowpayments_id      VARCHAR(100) UNIQUE,   -- ID платежа в NOWPayments
  order_id            VARCHAR(150) UNIQUE NOT NULL,
  status              VARCHAR(30) NOT NULL DEFAULT 'waiting',
  -- 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'finished' | 'failed' | 'expired'
  price_amount        NUMERIC(10, 2) NOT NULL,  -- в USD
  price_currency      VARCHAR(10) NOT NULL DEFAULT 'usd',
  pay_amount          NUMERIC(20, 8),           -- в крипте
  pay_currency        VARCHAR(20) NOT NULL DEFAULT 'usdttrc20',
  pay_address         VARCHAR(200),             -- адрес для оплаты
  actually_paid       NUMERIC(20, 8),           -- фактически оплачено
  exchange_rate       NUMERIC(20, 8),           -- курс на момент платежа
  invoice_url         TEXT,
  expires_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crypto_payments_user_id ON crypto_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_order_id ON crypto_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_nowpayments_id ON crypto_payments(nowpayments_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_status ON crypto_payments(status);

-- Лог webhook-событий (для отладки и аудита)
CREATE TABLE IF NOT EXISTS webhook_logs (
  id          SERIAL PRIMARY KEY,
  source      VARCHAR(50) NOT NULL DEFAULT 'nowpayments',
  order_id    VARCHAR(150),
  event_type  VARCHAR(50),
  payload     JSONB NOT NULL,
  processed   BOOLEAN NOT NULL DEFAULT FALSE,
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Автообновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_crypto_payments_updated_at
  BEFORE UPDATE ON crypto_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
