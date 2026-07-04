import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSubscription() {
  try {
    // Check user
    const userResult = await pool.query(
      "SELECT id, username, email FROM users WHERE email = 'alurizko@gmail.com'"
    );
    console.log('\n=== User ===');
    console.log(userResult.rows[0] || 'User not found');

    if (userResult.rows[0]) {
      const userId = userResult.rows[0].id;

      // Check subscription
      const subResult = await pool.query(
        "SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
      );
      console.log('\n=== Subscriptions ===');
      console.log(subResult.rows.length > 0 ? subResult.rows : 'No subscriptions');

      // Check payments
      const payResult = await pool.query(
        "SELECT * FROM crypto_payments WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
      );
      console.log('\n=== Payments ===');
      console.log(payResult.rows.length > 0 ? payResult.rows : 'No payments');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkSubscription();
