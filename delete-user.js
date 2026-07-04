// Скрипт для удаления пользователя
import { config } from 'dotenv';
import pg from 'pg';

config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function deleteUser() {
  try {
    const email = 'alurizko@gmail.com';

    // Удаляем пользователя (каскадно удалятся все связанные записи)
    const result = await pool.query(
      'DELETE FROM users WHERE email = $1 RETURNING id',
      [email]
    );

    if (result.rows.length > 0) {
      console.log(`✅ Пользователь ${email} удален (ID: ${result.rows[0].id})`);
    } else {
      console.log(`⚠️ Пользователь ${email} не найден`);
    }
  } catch (err) {
    console.error('❌ Ошибка:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

deleteUser();
