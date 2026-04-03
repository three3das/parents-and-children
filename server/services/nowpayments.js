// services/nowpayments.js
// Сервис для работы с NOWPayments API

const crypto = require('crypto');

const BASE_URL = 'https://api.nowpayments.io/v1';
const API_KEY  = process.env.NOWPAYMENTS_API_KEY;
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

// ─── Утилита: fetch с таймаутом ───────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data?.message || data?.error || `HTTP ${res.status}`;
      throw new Error(`NOWPayments API error: ${msg}`);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Создать инвойс (страница оплаты на стороне NOWPayments) ─────────────────
async function createInvoice({ userId, amountUsd, plan = 'monthly' }) {
  const orderId = `sub_${userId}_${plan}_${Date.now()}`;

  const invoice = await apiFetch('/invoice', {
    method: 'POST',
    body: JSON.stringify({
      price_amount:       amountUsd,
      price_currency:     'usd',
      pay_currency:       'usdttrc20',         // USDT TRC20
      order_id:           orderId,
      order_description:  `KnowledgeChildren — подписка (${plan})`,
      ipn_callback_url:   `${process.env.APP_URL}/api/payments/webhook`,
      success_url:        `${process.env.APP_URL}/dashboard?payment=success`,
      cancel_url:         `${process.env.APP_URL}/pricing?payment=cancelled`,
      is_fixed_rate:      false,               // не фиксировать курс
      is_fee_paid_by_user: false,
    }),
  });

  return {
    orderId,
    invoiceId:  invoice.id,
    invoiceUrl: invoice.invoice_url,
    expiresAt:  invoice.expiration_estimate_date,
  };
}

// ─── Получить статус платежа по ID NOWPayments ────────────────────────────────
async function getPaymentStatus(nowpaymentsId) {
  return apiFetch(`/payment/${nowpaymentsId}`);
}

// ─── Проверить подпись IPN webhook ───────────────────────────────────────────
// NOWPayments подписывает payload через HMAC-SHA512 с вашим IPN Secret
function verifyWebhookSignature(rawBody, signatureHeader) {
  if (!IPN_SECRET) {
    console.warn('[NOWPayments] NOWPAYMENTS_IPN_SECRET не задан — проверка пропущена');
    return true;
  }

  const hmac = crypto
    .createHmac('sha512', IPN_SECRET)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(signatureHeader || '')
  );
}

// ─── Финальные статусы платежа ────────────────────────────────────────────────
const FINISHED_STATUSES  = new Set(['finished', 'confirmed']);
const FAILED_STATUSES    = new Set(['failed', 'expired', 'refunded']);
const PENDING_STATUSES   = new Set(['waiting', 'confirming', 'sending', 'partially_paid']);

function isPaymentFinished(status) { return FINISHED_STATUSES.has(status); }
function isPaymentFailed(status)   { return FAILED_STATUSES.has(status); }
function isPaymentPending(status)  { return PENDING_STATUSES.has(status); }

module.exports = {
  createInvoice,
  getPaymentStatus,
  verifyWebhookSignature,
  isPaymentFinished,
  isPaymentFailed,
  isPaymentPending,
};
