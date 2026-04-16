// server/routes/payments.ts
import { Router, Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import {
  createInvoice,
  verifyWebhookSignature,
  isPaymentFinished,
  isPaymentFailed,
  isPaymentPending,
} from "../services/nowpayments";
import {
  PLANS,
  getActiveSubscription,
  createPendingPayment,
  activateSubscription,
  failPayment,
} from "../services/subscriptions";

const router = Router();

// POST /api/payments/create-invoice
router.post("/create-invoice", async (req: Request, res: Response) => {
  console.log("[CreateInvoice] Запрос получен, body:", req.body);
  try {
    const { plan = "lifetime", userId } = req.body;
    console.log("[CreateInvoice] plan:", plan, "userId:", userId);
    if (!userId) {
      return res.status(401).json({ error: "Необходима авторизация" });
    }
    const planConfig = PLANS[plan];
    if (!planConfig) {
      return res.status(400).json({ error: `Неизвестный план: ${plan}` });
    }
    const existingSub = await getActiveSubscription(userId);
    if (existingSub) {
      return res.status(409).json({ error: "Доступ уже активирован" });
    }
    const invoice = await createInvoice({
      userId,
      amountUsd: planConfig.priceUsd,
      plan,
    });
    await createPendingPayment({
      userId,
      orderId: invoice.orderId,
      plan,
      invoiceUrl: invoice.invoiceUrl,
      expiresAt: invoice.expiresAt,
    });
    res.json({
      invoiceUrl: invoice.invoiceUrl,
      orderId: invoice.orderId,
      amountUsd: planConfig.priceUsd,
    });
  } catch (err: any) {
    console.error("[CreateInvoice] Ошибка:", err.message);
    console.error("[CreateInvoice] Stack:", err.stack);
    res.status(500).json({ error: "Не удалось создать инвойс" });
  }
});

// GET /api/payments/status
router.get("/status", async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Необходима авторизация" });
    }
    const sub = await getActiveSubscription(Number(userId));
    if (!sub) return res.json({ active: false });
    res.json({ active: true, plan: sub.plan, startedAt: sub.started_at });
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка получения статуса" });
  }
});

// POST /api/payments/webhook
router.post("/webhook", async (req: Request, res: Response) => {
  res.sendStatus(200);
  const rawBody = req.body as Buffer;
  const signature = req.headers["x-nowpayments-sig"] as string;
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("[Webhook] Неверная подпись");
    return;
  }
  let payload: any;
  try {
    payload = JSON.parse(rawBody.toString());
  } catch {
    return;
  }
  const { payment_id, payment_status, order_id, actually_paid, exchange_rate } = payload;
  console.log(`[Webhook] order=${order_id} status=${payment_status}`);
  try {
    if (isPaymentFinished(payment_status)) {
      await activateSubscription({
        orderId: order_id,
        nowpaymentsId: String(payment_id),
        actuallyPaid: actually_paid,
        exchangeRate: exchange_rate,
      });
    } else if (isPaymentFailed(payment_status)) {
      await failPayment({ orderId: order_id, status: payment_status });
    } else if (isPaymentPending(payment_status)) {
      await db.execute(
        sql`UPDATE crypto_payments SET status = ${payment_status}, updated_at = NOW() WHERE order_id = ${order_id}`
      );
    }
  } catch (err: any) {
    console.error("[Webhook] Ошибка:", err.message);
  }
});

export default router;
