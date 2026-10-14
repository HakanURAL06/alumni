/**
 * Database Migration Runner
 * Executes SQL migration files in migrations/ sequentially against PostgreSQL.
 * Tracks applied migrations in the schema_migrations table for idempotency.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Basic .env file loader for standalone script execution without external deps
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

async function runMigrations() {
  console.log('--------------------------------------------------');
  console.log('[MIGRATION] Alumni Tracking System Migration Tool');
  console.log(`[MIGRATION] Target: ${connectionString.replace(/:[^:@]*@/, ':****@')}`);
  console.log('--------------------------------------------------');

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('[MIGRATION] Successfully connected to PostgreSQL.');

    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Read already applied migrations
    const res = await client.query('SELECT name FROM schema_migrations;');
    const applied = new Set(res.rows.map(r => r.name));

    // 3. Find and sort migration files
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('[MIGRATION] No migrations directory found. Skipping.');
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('[MIGRATION] No .sql migration files found.');
      return;
    }

    let appliedCount = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`[MIGRATION] ⏩ Skipping already applied: ${file}`);
        continue;
      }

      console.log(`[MIGRATION] ⚙️  Applying: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      await client.query('BEGIN;');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1);', [file]);
        await client.query('COMMIT;');
        console.log(`[MIGRATION] ✅ Applied: ${file}`);
        appliedCount++;
      } catch (migrationErr) {
        await client.query('ROLLBACK;');
        console.error(`[MIGRATION] ❌ Failed to apply ${file}:`, migrationErr.message);
        throw migrationErr;
      }
    }

    console.log('--------------------------------------------------');
    console.log(`[MIGRATION] Done! Applied ${appliedCount} new migration(s).`);
    console.log('--------------------------------------------------');
  } catch (err) {
    console.error('[MIGRATION] Fatal error executing migrations:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
