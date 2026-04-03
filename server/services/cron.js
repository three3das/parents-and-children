// services/cron.js
// Фоновые задачи — запускать при старте приложения
// Требует: npm install node-cron

const cron = require('node-cron');
const { expireOldSubscriptions } = require('./subscriptions');

function startCronJobs() {
  // Каждый час — помечаем истёкшие подписки
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Проверка истёкших подписок...');
    try {
      await expireOldSubscriptions();
    } catch (err) {
      console.error('[Cron] Ошибка:', err.message);
    }
  });

  console.log('[Cron] Фоновые задачи запущены');
}

module.exports = { startCronJobs };
