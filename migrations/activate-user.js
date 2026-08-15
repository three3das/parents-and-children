// Скрипт для ручной активации подписки
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function activateUser(email) {
  try {
    // Найти пользователя
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log(`❌ Пользователь ${email} не найден`);
      return;
    }

    const userId = userResult.rows[0].id;

    // Создать подписку
    const subResult = await pool.query(
      `INSERT INTO subscriptions (user_id, status, plan, started_at)
       VALUES ($1, 'active', 'lifetime', NOW())
       RETURNING id`,
      [userId]
    );

    console.log(`✅ Подписка активирована для ${email} (subscription_id: ${subResult.rows[0].id})`);
  } catch (err) {
    console.error('Ошибка:', err.message);
  } finally {
    await pool.end();
  }
}

// Использование: node activate-user.js user@example.com
const email = process.argv[2];
if (!email) {
  console.log('Использование: node activate-user.js user@example.com');
  process.exit(1);
}

activateUser(email);
