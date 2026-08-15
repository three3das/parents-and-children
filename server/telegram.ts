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

import TelegramBot from "node-telegram-bot-api";
import { activatePayment, rejectPayment } from "./routes/p2p-payments";

let bot: TelegramBot | null = null;

function getConfig() {
  return {
    token: process.env.TELEGRAM_BOT_TOKEN,
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
  };
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
    const originalText =
      "text" in query.message ? query.message.text ?? "" : "";

    // callback_data формата: "approve:<paymentId>" или "reject:<paymentId>"
    const [action, paymentId] = query.data.split(":");

    try {
      if (action === "approve") {
        const result = await activatePayment(paymentId, "telegram-bot");

        if (result.success) {
          await bot.editMessageText(
            `${originalText}\n\n✅ РАЗРЕШЕНО администратором.`,
            { chat_id: chatId, message_id: messageId }
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
            `${originalText}\n\n❌ ОТМЕНЕНО администратором.`,
            { chat_id: chatId, message_id: messageId }
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

  const text = `👤 Новая регистрация на сайте\n\nEmail: ${userEmail}\n\nОжидаем оплату — уведомление придёт, когда пользователь нажмёт "Оплачено".`;

  try {
    await bot.sendMessage(adminChatId, text);
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
    `Email: ${userEmail}\n` +
    `Сумма: ${amount} грн\n` +
    `Способ оплаты: ${method || "не указан"}\n` +
    `ID заявки: ${paymentId}\n\n` +
    `Проверьте поступление денег и подтвердите/отклоните заявку.`;

  try {
    await bot.sendMessage(adminChatId, text, {
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