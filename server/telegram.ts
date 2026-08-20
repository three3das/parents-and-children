// server/telegram.ts
//
// Интеграция с Telegram-ботом для уведомлений администратора.
//
// Два типа уведомлений:
//   1) Регистрация нового пользователя — простое текстовое сообщение,
//      без кнопок (informational only).
//   2) Пользователь нажал "Оплачено" с конкретным способом оплаты —
//      сообщение с двумя inline-кнопками: "✅ Разрешить" / "❌ Отменить".
//
// Работает через long polling (не требует публичного HTTPS-адреса —
// удобно для локальной разработки и небольших проектов).
//
// Ключевые значения (email, сумма, способ оплаты, ID заявки) выделены
// жирным через HTML-разметку Telegram (parse_mode: "HTML"). Просто
// цвет текста Telegram не поддерживает ни для одного бота — это
// ограничение самой платформы, а не нашего кода.

import TelegramBot from "node-telegram-bot-api";
import { activatePayment, rejectPayment } from "./routes/p2p-payments";

let bot: TelegramBot | null = null;

function getConfig() {
  return {
    token: process.env.TELEGRAM_BOT_TOKEN,
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
  };
}

// Экранируем спецсимволы HTML в значениях, которые подставляем в
// текст сообщения (email и т.п.) — чтобы случайные "<", ">" или "&"
// в данных не сломали разметку и не потерялись при отображении.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Вызывается один раз при старте сервера (см. server/index.ts).
export function startTelegramBot() {
  const { token } = getConfig();

  if (!token) {
    console.log("[Telegram] TELEGRAM_BOT_TOKEN not configured. Bot disabled.");
    return;
  }

  bot = new TelegramBot(token, { polling: true });

  bot.on("polling_error", (err) => {
    console.error("[Telegram] Polling error:", err);
  });

  // Обработка нажатий на inline-кнопки "Разрешить" / "Отменить".
  bot.on("callback_query", async (query) => {
    if (!bot || !query.data || !query.message) return;

    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    // ⚠️ query.message типизирован как Message | InaccessibleMessage —
    // у InaccessibleMessage (старое/удалённое сообщение) поля "text" нет
    // вообще. Достаём текст безопасно один раз, через проверку "in",
    // и дальше используем эту переменную вместо query.message.text.
    //
    // ⚠️ Важно: message.text от Telegram приходит уже БЕЗ HTML-тегов
    // (форматирование хранится отдельно, в message.entities), поэтому
    // после редактирования жирное форматирование полей сохранить не
    // получится — жирным остаётся только строка с итогом, которую
    // дописываем сами.
    const originalText =
      "text" in query.message ? query.message.text ?? "" : "";

    // callback_data формата: "approve:<paymentId>" или "reject:<paymentId>"
    const [action, paymentId] = query.data.split(":");

    try {
      if (action === "approve") {
        const result = await activatePayment(paymentId, "telegram-bot");

        if (result.success) {
          await bot.editMessageText(
            `${originalText}\n\n<b>✅ РАЗРЕШЕНО администратором.</b>`,
            { chat_id: chatId, message_id: messageId, parse_mode: "HTML" }
          );
        } else {
          await bot.answerCallbackQuery(query.id, {
            text: result.error || "Не удалось активировать (см. лог сервера)",
            show_alert: true,
          });
        }
      } else if (action === "reject") {
        const result = await rejectPayment(paymentId, "Отклонено через Telegram-бота");

        if (result.success) {
          await bot.editMessageText(
            `${originalText}\n\n<b>❌ ОТМЕНЕНО администратором.</b>`,
            { chat_id: chatId, message_id: messageId, parse_mode: "HTML" }
          );
        } else {
          await bot.answerCallbackQuery(query.id, {
            text: result.error || "Не удалось отклонить (см. лог сервера)",
            show_alert: true,
          });
        }
      }

      await bot.answerCallbackQuery(query.id);
    } catch (err: any) {
      console.error("[Telegram] Error handling callback_query:", err);
      await bot.answerCallbackQuery(query.id, {
        text: "Произошла ошибка, смотрите лог сервера",
        show_alert: true,
      });
    }
  });

  console.log("[Telegram] Bot started (long polling).");
}

// 1) Уведомление о регистрации — без кнопок.
export async function sendRegistrationNotification(
  userEmail: string
): Promise<void> {
  const { adminChatId } = getConfig();
  if (!bot || !adminChatId) return;

  const text =
    `👤 Новая регистрация на сайте\n\n` +
    `Email: <b>${escapeHtml(userEmail)}</b>\n\n` +
    `Ожидаем оплату — уведомление придёт, когда пользователь нажмёт "Оплачено".`;

  try {
    await bot.sendMessage(adminChatId, text, { parse_mode: "HTML" });
  } catch (err) {
    console.error("[Telegram] Failed to send registration notification:", err);
  }
}

// 2) Уведомление о нажатии "Оплачено" — с кнопками Разрешить/Отменить.
export async function sendPaymentClaimNotification(
  paymentId: string,
  userEmail: string,
  amount: number,
  method: string | null
): Promise<void> {
  const { adminChatId } = getConfig();
  if (!bot || !adminChatId) return;

  const text =
    `💰 Пользователь нажал "Оплачено"\n\n` +
    `Email: <b>${escapeHtml(userEmail)}</b>\n` +
    `Сумма: <b>${amount} грн</b>\n` +
    `Способ оплаты: <b>${escapeHtml(method || "не указан")}</b>\n` +
    `ID заявки: <b>${escapeHtml(paymentId)}</b>\n\n` +
    `Проверьте поступление денег и подтвердите/отклоните заявку.`;

  try {
    await bot.sendMessage(adminChatId, text, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Разрешить", callback_data: `approve:${paymentId}` },
            { text: "❌ Отменить", callback_data: `reject:${paymentId}` },
          ],
        ],
      },
    });
  } catch (err) {
    console.error("[Telegram] Failed to send payment claim notification:", err);
  }
}