// services/subscriptions.js
// Управление подписками в PostgreSQL

const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Единоразовый доступ — платишь один раз, пользуешься навсегда
const PLANS = {
  lifetime: {
    label:    'Единоразовый доступ навсегда',
    priceUsd: 1,
    daysValid: null,  // null = бессрочно, expires_at не устанавливается
  },
};

// ─── Получить доступ пользователя ─────────────────────────────────────────────
// Для бессрочного доступа — просто проверяем статус 'active', без expires_at
async function getActiveSubscription(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM subscriptions
     WHERE user_id = $1
       AND status = 'active'
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

// ─── Создать запись платежа (статус pending) ──────────────────────────────────
async function createPendingPayment({ userId, orderId, plan, invoiceUrl, expiresAt }) {
  const planConfig = PLANS[plan];
  if (!planConfig) throw new Error(`Неизвестный план: ${plan}`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Создаём подписку в статусе pending
    const subResult = await client.query(
      `INSERT INTO subscriptions (user_id, status, plan)
       VALUES ($1, 'pending', $2)
       RETURNING id`,
      [userId, plan]
    );
    const subscriptionId = subResult.rows[0].id;

    // Записываем платёж
    await client.query(
      `INSERT INTO crypto_payments
         (user_id, subscription_id, order_id, price_amount, price_currency,
          pay_currency, invoice_url, expires_at)
       VALUES ($1, $2, $3, $4, 'usd', 'usdttrc20', $5, $6)`,
      [userId, subscriptionId, orderId, planConfig.priceUsd, invoiceUrl, expiresAt]
    );

    await client.query('COMMIT');
    return { subscriptionId, orderId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─── Активировать бессрочный доступ после успешного платежа ──────────────────
async function activateSubscription({ orderId, nowpaymentsId, actuallyPaid, exchangeRate }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Найти платёж
    const { rows } = await client.query(
      'SELECT * FROM crypto_payments WHERE order_id = $1',
      [orderId]
    );
    const payment = rows[0];
    if (!payment) throw new Error(`Платёж не найден: ${orderId}`);

    // Обновить платёж
    await client.query(
      `UPDATE crypto_payments
       SET status = 'finished',
           nowpayments_id = $1,
           actually_paid = $2,
           exchange_rate = $3,
           updated_at = NOW()
       WHERE order_id = $4`,
      [nowpaymentsId, actuallyPaid, exchangeRate, orderId]
    );

    // Активировать бессрочный доступ (expires_at = NULL)
    await client.query(
      `UPDATE subscriptions
       SET status = 'active',
           started_at = NOW(),
           expires_at = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [payment.subscription_id]
    );

    await client.query('COMMIT');

    console.log(`[Subscription] Бессрочный доступ активирован для user ${payment.user_id}`);
    return { userId: payment.user_id, lifetime: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─── Пометить платёж как неуспешный ──────────────────────────────────────────
async function failPayment({ orderId, status }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Обновить статус платежа
    await client.query(
      `UPDATE crypto_payments SET status = $1, updated_at = NOW() WHERE order_id = $2`,
      [status, orderId]
    );

    // Вернуть подписку в inactive
    await client.query(
      `UPDATE subscriptions s
       SET status = 'inactive', updated_at = NOW()
       FROM crypto_payments p
       WHERE p.order_id = $1 AND p.subscription_id = s.id`,
      [orderId]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// expireOldSubscriptions больше не нужна — доступ бессрочный
// Оставлена как заглушка чтобы cron.js не ломался
async function expireOldSubscriptions() {
  // Единоразовый доступ не истекает — ничего не делаем
}

module.exports = {
  PLANS,
  getActiveSubscription,
  createPendingPayment,
  activateSubscription,
  failPayment,
  expireOldSubscriptions,
};
