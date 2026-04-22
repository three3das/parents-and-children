// server/routes/p2p-payments.ts
import { Router, Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

const router = Router();

// POST /api/p2p/request - Клиент запрашивает P2P оплату
router.post("/request", async (req: Request, res: Response) => {
  try {
    const { userId, userEmail } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({ error: "userId и userEmail обязательны" });
    }

    // Проверяем есть ли уже активная подписка
    const existingSub = await db.execute(
      sql`SELECT * FROM subscriptions WHERE user_id = ${userId} AND status = 'active' LIMIT 1`
    );

    if (existingSub.rows.length > 0) {
      return res.status(409).json({ error: "Подписка уже активна" });
    }

    // Создаем запись ожидающего платежа
    await db.execute(
      sql`INSERT INTO pending_payments (user_id, user_email, amount, status)
          VALUES (${userId}, ${userEmail}, 100, 'pending')`
    );

    res.json({ success: true, message: "Запрос на оплату создан" });
  } catch (err: any) {
    console.error("[P2P Request] Error:", err);
    res.status(500).json({ error: "Ошибка создания запроса" });
  }
});

// GET /api/p2p/pending - Получить список ожидающих платежей (для админа)
router.get("/pending", async (req: Request, res: Response) => {
  try {
    const result = await db.execute(
      sql`SELECT * FROM pending_payments
          WHERE status = 'pending'
          ORDER BY created_at DESC`
    );

    res.json({ payments: result.rows });
  } catch (err: any) {
    console.error("[P2P Pending] Error:", err);
    res.status(500).json({ error: "Ошибка получения списка" });
  }
});

// GET /api/p2p/stats - Статистика активаций за текущий месяц
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const result = await db.execute(
      sql`SELECT count FROM monthly_activations
          WHERE year = ${year} AND month = ${month}`
    );

    const count = result.rows[0]?.count || 0;
    const limit = 20;

    res.json({
      count,
      limit,
      remaining: Math.max(0, limit - count),
      canActivate: count < limit
    });
  } catch (err: any) {
    console.error("[P2P Stats] Error:", err);
    res.status(500).json({ error: "Ошибка получения статистики" });
  }
});

// POST /api/p2p/activate - Активировать подписку (для админа)
router.post("/activate", async (req: Request, res: Response) => {
  try {
    const { paymentId, adminEmail } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId обязателен" });
    }

    // Проверяем лимит активаций
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const statsResult = await db.execute(
      sql`SELECT count FROM monthly_activations
          WHERE year = ${year} AND month = ${month}`
    );

    const currentCount = statsResult.rows[0]?.count || 0;

    if (currentCount >= 20) {
      return res.status(429).json({
        error: "Достигнут лимит активаций на этот месяц (20/20)"
      });
    }

    // Получаем платеж
    const paymentResult = await db.execute(
      sql`SELECT * FROM pending_payments WHERE id = ${paymentId}`
    );

    const payment = paymentResult.rows[0];
    if (!payment) {
      return res.status(404).json({ error: "Платеж не найден" });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: "Платеж уже обработан" });
    }

    // Активируем подписку
    await db.execute(
      sql`INSERT INTO subscriptions (user_id, status, plan, started_at)
          VALUES (${payment.user_id}, 'active', 'lifetime', NOW())`
    );

    // Обновляем статус платежа
    await db.execute(
      sql`UPDATE pending_payments
          SET status = 'activated',
              activated_at = NOW(),
              activated_by = ${adminEmail || 'admin'}
          WHERE id = ${paymentId}`
    );

    // Увеличиваем счетчик активаций
    await db.execute(
      sql`INSERT INTO monthly_activations (year, month, count)
          VALUES (${year}, ${month}, 1)
          ON CONFLICT (year, month)
          DO UPDATE SET count = monthly_activations.count + 1`
    );

    res.json({ success: true, message: "Подписка активирована" });
  } catch (err: any) {
    console.error("[P2P Activate] Error:", err);
    res.status(500).json({ error: "Ошибка активации" });
  }
});

// POST /api/p2p/reject - Отклонить платеж (для админа)
router.post("/reject", async (req: Request, res: Response) => {
  try {
    const { paymentId, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId обязателен" });
    }

    await db.execute(
      sql`UPDATE pending_payments
          SET status = 'rejected',
              notes = ${reason || 'Отклонено администратором'}
          WHERE id = ${paymentId}`
    );

    res.json({ success: true, message: "Платеж отклонен" });
  } catch (err: any) {
    console.error("[P2P Reject] Error:", err);
    res.status(500).json({ error: "Ошибка отклонения" });
  }
});

export default router;
