// server/services/cron.ts
import { expireOldSubscriptions } from "./subscriptions";

export function startCronJobs() {
  console.log("[Cron] Фонові завдання запущені (lifetime план — закінчення не потрібне)");
}