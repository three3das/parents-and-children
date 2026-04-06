// routes/payments.js
// Роутер для платежей — подключить в app.js как:
//   app.use('/api/payments', require('./routes/payments'));

const express = require('express');
const router  = express.Router();

const nowpayments   = require('../services/nowpayments');
const subscriptions = require('../services/subscriptions');
const { requireAuth } = require('../middleware/auth');
const { Pool }      = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ────────────────────────────────────────────────────────────────────────────
// POST /api/payments/create-invoice
// Создать инвойс для оплаты подписки
// Body: { plan: 'monthly' | 'yearly' }
// ────────────────────────────────────────────────────────────────────────────
router.post('/create-invoice', requireAuth, async (req, res) => {
  try {
    const { plan = 'lifetime' } = req.body;
    const planConfig = subscriptions.PLANS[plan];

    if (!planConfig) {
      return res.status(400).json({ error: `Неизвестный план: ${plan}` });
    }

    // Проверить — вдруг подписка уже активна
    const existingSub = await subscriptions.getActiveSubscription(req.user.id);
    if (existingSub) {
      return res.status(409).json({
        error:     'Подписка уже активна',
        expiresAt: existingSub.expires_at,
      });
    }

    // Создать инвойс в NOWPayments
    const invoice = await nowpayments.createInvoice({
      userId:    req.user.id,
      amountUsd: planConfig.priceUsd,
      plan,
    });

    // Сохранить в БД
    await subscriptions.createPendingPayment({
      userId:     req.user.id,
      orderId:    invoice.orderId,
      plan,
      invoiceUrl: invoice.invoiceUrl,
      expiresAt:  invoice.expiresAt,
    });

    res.json({
      invoiceUrl: invoice.invoiceUrl,
      orderId:    invoice.orderId,
      amountUsd:  planConfig.priceUsd,
      expiresAt:  invoice.expiresAt,
    });
  } catch (err) {
    console.error('[CreateInvoice] Ошибка:', err.message);
    res.status(500).json({ error: 'Не удалось создать инвойс' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/payments/status
// Получить статус подписки текущего пользователя
// ────────────────────────────────────────────────────────────────────────────
router.get('/status', requireAuth, async (req, res) => {
  try {
    const sub = await subscriptions.getActiveSubscription(req.user.id);

    if (!sub) {
      return res.json({ active: false });
    }

    res.json({
      active:    true,
      plan:      sub.plan,
      expiresAt: sub.expires_at,
      startedAt: sub.started_at,
    });
  } catch (err) {
    console.error('[Status] Ошибка:', err.message);
    res.status(500).json({ error: 'Ошибка получения статуса' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/payments/webhook
// IPN-уведомление от NOWPayments (без авторизации — проверяем подпись)
//
// ВАЖНО: роут должен получать сырой body до парсинга JSON.
// В app.js перед app.use(express.json()) добавьте:
//
//   app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
// ────────────────────────────────────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  // Сразу отвечаем 200 — иначе NOWPayments будет повторять запрос
  res.sendStatus(200);

  const rawBody  = req.body;         // Buffer (express.raw)
  const signature = req.headers['x-nowpayments-sig'];

  // 1. Проверить подпись
  if (!nowpayments.verifyWebhookSignature(rawBody, signature)) {
    console.warn('[Webhook] Неверная подпись IPN — запрос отклонён');
    await logWebhook(null, 'invalid_signature', rawBody, 'Неверная подпись');
    return;
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString());
  } catch {
    console.warn('[Webhook] Не удалось распарсить payload');
    return;
  }

  const { payment_id, payment_status, order_id, actually_paid, exchange_rate } = payload;

  await logWebhook(order_id, payment_status, rawBody);

  console.log(`[Webhook] order=${order_id} status=${payment_status}`);

  try {
    if (nowpayments.isPaymentFinished(payment_status)) {
      // ✅ Платёж прошёл — активируем подписку
      await subscriptions.activateSubscription({
        orderId:      order_id,
        nowpaymentsId: String(payment_id),
        actuallyPaid: actually_paid,
        exchangeRate:  exchange_rate,
      });

    } else if (nowpayments.isPaymentFailed(payment_status)) {
      // ❌ Платёж провалился
      await subscriptions.failPayment({ orderId: order_id, status: payment_status });

    } else if (nowpayments.isPaymentPending(payment_status)) {
      // ⏳ В процессе — только обновляем статус платежа
      await pool.query(
        `UPDATE crypto_payments SET status = $1, updated_at = NOW() WHERE order_id = $2`,
        [payment_status, order_id]
      );
    }

    await pool.query(
      `UPDATE webhook_logs SET processed = TRUE WHERE order_id = $1 AND processed = FALSE`,
      [order_id]
    );
  } catch (err) {
    console.error('[Webhook] Ошибка обработки:', err.message);
    await pool.query(
      `UPDATE webhook_logs SET error = $1 WHERE order_id = $2 AND processed = FALSE`,
      [err.message, order_id]
    );
  }
});

// ─── Вспомогательная функция: лог webhook ────────────────────────────────────
async function logWebhook(orderId, eventType, rawBody, error = null) {
  try {
    let payload;
    try { payload = JSON.parse(rawBody.toString()); } catch { payload = {}; }

    await pool.query(
      `INSERT INTO webhook_logs (order_id, event_type, payload, error)
       VALUES ($1, $2, $3, $4)`,
      [orderId, eventType, JSON.stringify(payload), error]
    );
  } catch (e) {
    console.error('[Webhook] Не удалось записать лог:', e.message);
  }
}

module.exports = router;
