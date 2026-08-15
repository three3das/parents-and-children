// server/routes/p2p-payments.ts
import { Router, Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { sendPaymentNotificationEmail, sendPaymentRejectedEmail } from "../email";
import {
  sendRegistrationNotification,
  sendPaymentClaimNotification,
} from "../telegram";

const router = Router();

// Вынесено в отдельную функцию, чтобы вызывать её как из /request,
// так и напрямую из регистрации (routes.ts) — без дублирования SQL.
//
// method — какой из способов оплаты выбрал участник (например,
// "privatbank_card", "usdt_trc20" и т.д., см. PAYMENT_METHODS в
// PaymentsPage.tsx). На этапе регистрации способ ещё не выбран —
// туда передаётся undefined, и в базу уйдёт NULL; способ появится,
// когда участник дойдёт до страницы оплаты и вызовет /request сам.
//
// Уведомления различаются по тому, что именно произошло:
//   - Новая запись создана БЕЗ метода (обычная регистрация)
//     → в Telegram уходит простое информационное сообщение (без кнопок).
//   - Новая запись создана СРАЗУ с методом, ИЛИ у существующей записи
//     метод только что появился/изменился (реальное нажатие "Оплачено")
//     → в Telegram уходит сообщение с кнопками Разрешить/Отменить.
//
// Возвращает { created: true } если запись создана, { created: false, reason }
// если уже есть активная подписка или уже есть неотработанный pending-платёж
// для этого пользователя (защита от дублей).
export async function createPendingPayment(
  userId: string,
  userEmail: string,
  amount: number = 1,
  method?: string
): Promise<{ created: boolean; reason?: string }> {
  // Уже есть активная подписка — платёж не нужен
  const existingSub = await db.execute(
    sql`SELECT * FROM subscriptions WHERE user_id = ${userId} AND status = 'active' LIMIT 1`
  );
  if (existingSub.rows.length > 0) {
    return { created: false, reason: "already_subscribed" };
  }

  // Уже есть необработанный pending-платёж для этого пользователя —
  // не плодим дубли при повторном вызове. Но если участник кликнул
  // «Оплачено» на ДРУГОМ секторе (передумал, выбрал другой способ
  // оплаты) — обновляем method на актуальный, а не оставляем тот,
  // что был записан при самом первом клике. Работает, пока платёж
  // ещё не подтверждён администратором (status = 'pending').
  const existingPending = await db.execute(
    sql`SELECT * FROM pending_payments WHERE user_id = ${userId} AND status = 'pending' LIMIT 1`
  );
  if (existingPending.rows.length > 0) {
    const pendingRow = existingPending.rows[0] as any;
    const methodChanged = method && method !== pendingRow.method;

    if (methodChanged) {
      await db.execute(
        sql`UPDATE pending_payments SET method = ${method} WHERE id = ${pendingRow.id}`
      );

      // Метод только что появился/поменялся на существующей заявке —
      // это и есть реальное нажатие "Оплачено". Шлём уведомление с
      // кнопками (email уже уходил на этапе регистрации, повторно не дублируем).
      sendPaymentClaimNotification(
        String(pendingRow.id),
        userEmail,
        Number(pendingRow.amount) || amount,
        method
      ).catch((err) =>
        console.error("[P2P] Failed to send Telegram claim notification:", err)
      );
    }

    return { created: false, reason: "already_pending" };
  }

  const insertResult = await db.execute(
    sql`INSERT INTO pending_payments (user_id, user_email, amount, currency, status, method)
        VALUES (${userId}, ${userEmail}, ${amount}, 'UAH', 'pending', ${method ?? null})
        RETURNING id`
  );

  const paymentId = insertResult.rows[0]?.id;

  // Email-уведомление администратору — не блокирует основной поток.
  sendPaymentNotificationEmail(userEmail, amount, String(paymentId)).catch((err) =>
    console.error("[P2P] Failed to send email notification:", err)
  );

  // Telegram-уведомление — тип зависит от того, был ли уже известен
  // способ оплаты в момент создания записи.
  if (method) {
    // Редкий случай: метод известен уже при первом создании записи
    // (например, если /request вызван напрямую, минуя обычный сценарий
    // "сначала регистрация, потом выбор способа оплаты").
    sendPaymentClaimNotification(String(paymentId), userEmail, amount, method).catch(
      (err) => console.error("[P2P] Failed to send Telegram claim notification:", err)
    );
  } else {
    // Обычный случай — это вызов из регистрации, способ ещё не выбран.
    sendRegistrationNotification(userEmail).catch((err) =>
      console.error("[P2P] Failed to send Telegram registration notification:", err)
    );
  }

  return { created: true };
}

// Активация подписки — вынесено в отдельную функцию, чтобы её могли
// вызывать и HTTP-роут POST /activate (из админ-панели на сайте), и
// Telegram-бот (по нажатию кнопки "Разрешить"), без дублирования кода.
export async function activatePayment(
  paymentId: string,
  activatedBy: string
): Promise<{ success: boolean; error?: string }> {
  // Проверяем лимит активаций
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  const statsResult = await db.execute(
    sql`SELECT count FROM monthly_activations
        WHERE year = ${year} AND month = ${month}`
  );

  const currentCount = Number(statsResult.rows[0]?.count) || 0;

  if (currentCount >= 20) {
    return { success: false, error: "Достигнут лимит активаций на этот месяц (20/20)" };
  }

  // Получаем платёж
  const paymentResult = await db.execute(
    sql`SELECT * FROM pending_payments WHERE id = ${paymentId}`
  );

  const payment = paymentResult.rows[0] as any;
  if (!payment) {
    return { success: false, error: "Платёж не найден" };
  }

  if (payment.status !== "pending") {
    return { success: false, error: "Платёж уже обработан" };
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
            activated_by = ${activatedBy}
        WHERE id = ${paymentId}`
  );

  // Увеличиваем счётчик активаций
  await db.execute(
    sql`INSERT INTO monthly_activations (year, month, count)
        VALUES (${year}, ${month}, 1)
        ON CONFLICT (year, month)
        DO UPDATE SET count = monthly_activations.count + 1`
  );

  return { success: true };
}

// Отклонение платежа — вынесено в отдельную функцию по той же причине,
// что и activatePayment. Плюс: отправляет пользователю email о том,
// что доступ не активирован.
export async function rejectPayment(
  paymentId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const paymentResult = await db.execute(
    sql`SELECT * FROM pending_payments WHERE id = ${paymentId}`
  );

  const payment = paymentResult.rows[0] as any;
  if (!payment) {
    return { success: false, error: "Платёж не найден" };
  }

  await db.execute(
    sql`UPDATE pending_payments
        SET status = 'rejected',
            notes = ${reason || "Отклонено администратором"}
        WHERE id = ${paymentId}`
  );

  // Письмо пользователю — не блокирует основной поток.
  sendPaymentRejectedEmail(payment.user_email).catch((err) =>
    console.error("[P2P] Failed to send rejection email:", err)
  );

  return { success: true };
}

// POST /api/p2p/request - Клиент запрашивает P2P оплату
router.post("/request", async (req: Request, res: Response) => {
  try {
    const { userId, userEmail, method } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({ error: "userId и userEmail обязательны" });
    }

    const result = await createPendingPayment(userId, userEmail, 1, method);

    if (!result.created) {
      const status = result.reason === "already_subscribed" ? 409 : 200;
      return res.status(status).json({
        success: result.reason !== "already_subscribed",
        error: result.reason === "already_subscribed" ? "Подписка уже активна" : undefined,
        message: result.reason === "already_pending" ? "Запрос на оплату уже существует" : undefined,
      });
    }

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

    const count = Number(result.rows[0]?.count) || 0;
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

// POST /api/p2p/activate - Активировать подписку (для админа, через сайт)
router.post("/activate", async (req: Request, res: Response) => {
  try {
    const { paymentId, adminEmail } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId обязателен" });
    }

    const result = await activatePayment(paymentId, adminEmail || "admin");

    if (!result.success) {
      const status = result.error === "Платёж не найден" ? 404 : 400;
      return res.status(status).json({ error: result.error });
    }

    res.json({ success: true, message: "Подписка активирована" });
  } catch (err: any) {
    console.error("[P2P Activate] Error:", err);
    res.status(500).json({ error: "Ошибка активации" });
  }
});

// POST /api/p2p/reject - Отклонить платеж (для админа, через сайт)
router.post("/reject", async (req: Request, res: Response) => {
  try {
    const { paymentId, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId обязателен" });
    }

    const result = await rejectPayment(paymentId, reason);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({ success: true, message: "Платеж отклонен" });
  } catch (err: any) {
    console.error("[P2P Reject] Error:", err);
    res.status(500).json({ error: "Ошибка отклонения" });
  }
});

export default router;