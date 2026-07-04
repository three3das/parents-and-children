// Скрипт для применения миграции
import { config } from 'dotenv';
import pg from 'pg';
import { readFileSync } from 'fs';

config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    const sql = readFileSync('migrations/003_pending_payments.sql', 'utf-8');
    await pool.query(sql);
    console.log('✅ Migration 003_pending_payments.sql applied successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
