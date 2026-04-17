// server/services/subscriptions.ts
import { db } from "../db";
import { sql } from "drizzle-orm";

export const PLANS: Record<string, { label: string; priceUsd: number }> = {
  lifetime: {
    label: "Единоразовый доступ навсегда",
    priceUsd: 12,
  },
};

export async function getActiveSubscription(userId: string | number) {
  const result = await db.execute(
    sql`SELECT * FROM subscriptions
        WHERE user_id = ${String(userId)}
          AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1`
  );
  return result.rows[0] || null;
}

export async function createPendingPayment({
  userId,
  orderId,
  plan,
  invoiceUrl,
  expiresAt,
}: {
  userId: number;
  orderId: string;
  plan: string;
  invoiceUrl: string;
  expiresAt: string;
}) {
  const planConfig = PLANS[plan];
  if (!planConfig) throw new Error(`Неизвестный план: ${plan}`);

  const subResult = await db.execute(
    sql`INSERT INTO subscriptions (user_id, status, plan)
        VALUES (${userId}, 'pending', ${plan})
        RETURNING id`
  );
  const subscriptionId = subResult.rows[0].id;

  const expiresAtValue = expiresAt || null;

  await db.execute(
    sql`INSERT INTO crypto_payments
          (user_id, subscription_id, order_id, price_amount,
           price_currency, pay_currency, invoice_url, expires_at)
        VALUES (${userId}, ${subscriptionId}, ${orderId},
                ${planConfig.priceUsd}, 'usd', 'usdttrc20',
                ${invoiceUrl}, ${expiresAtValue})`
  );

  return { subscriptionId, orderId };
}

export async function activateSubscription({
  orderId,
  nowpaymentsId,
  actuallyPaid,
  exchangeRate,
}: {
  orderId: string;
  nowpaymentsId: string;
  actuallyPaid: number;
  exchangeRate: number;
}) {
  const paymentResult = await db.execute(
    sql`SELECT * FROM crypto_payments WHERE order_id = ${orderId}`
  );
  const payment = paymentResult.rows[0];
  if (!payment) throw new Error(`Платёж не найден: ${orderId}`);

  await db.execute(
    sql`UPDATE crypto_payments
        SET status = 'finished',
            nowpayments_id = ${nowpaymentsId},
            actually_paid = ${actuallyPaid},
            exchange_rate = ${exchangeRate},
            updated_at = NOW()
        WHERE order_id = ${orderId}`
  );

  await db.execute(
    sql`UPDATE subscriptions
        SET status = 'active',
            started_at = NOW(),
            expires_at = NULL,
            updated_at = NOW()
        WHERE id = ${payment.subscription_id}`
  );

  console.log(`[Subscription] Доступ активирован для user ${payment.user_id}`);
  return { userId: payment.user_id, lifetime: true };
}

export async function failPayment({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  await db.execute(
    sql`UPDATE crypto_payments
        SET status = ${status}, updated_at = NOW()
        WHERE order_id = ${orderId}`
  );
}

export async function expireOldSubscriptions() {
  // Единоразовый доступ не истекает
}