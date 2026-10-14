/**
 * Database Connection Module (PostgreSQL Connection Pool)
 * Manages database pooling, query execution, and environment configuration.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Basic .env file loader for standalone script / dev execution
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...values] = trimmed.split('=');
    const value = values.join('=').trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key.trim()]) {
      process.env[key.trim()] = value;
    }
  }
}

const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${process.env.POSTGRES_USER || 'alumni_user'}:${process.env.POSTGRES_PASSWORD || 'alumni_password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.POSTGRES_DB || 'alumni_db'}`;

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle: true
});

pool.on('error', (err) => {
  console.error('[DATABASE POOL ERROR]: Unexpected idle client error:', err.message);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params)
};
