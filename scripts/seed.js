/**
 * Database Seeder Script
 * Seeds initial baseline and dummy records into PostgreSQL using
 * UserFactory and AnnouncementFactory.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { UserFactory, AnnouncementFactory } = require('../factories');

// Load environment variables from .env if present
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

async function seedDatabase(userCount = 5, announcementCount = 5) {
  console.log('==================================================');
  console.log('[SEED] Alumni Tracking System - Database Seeder');
  console.log(`[SEED] Target: ${connectionString.replace(/:[^:@]*@/, ':****@')}`);
  console.log('==================================================');

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('[SEED] Successfully connected to PostgreSQL.');

    // 1. Seed Users via UserFactory
    console.log(`[SEED] 🌱 Generating and inserting ${userCount} users via UserFactory...`);
    UserFactory.resetCounter(1);
    const seededUsers = [];
    for (let i = 0; i < userCount; i++) {
      const user = await UserFactory.createInDb(client);
      seededUsers.push(user);
    }
    console.log(`[SEED]    👤 Seeded ${seededUsers.length} users successfully.`);

    // 2. Seed Announcements via AnnouncementFactory
    console.log(`[SEED] 🌱 Generating and inserting ${announcementCount} announcements via AnnouncementFactory...`);
    AnnouncementFactory.resetCounter(1);
    const seededAnnouncements = [];
    for (let i = 0; i < announcementCount; i++) {
      const announcement = await AnnouncementFactory.createInDb(client);
      seededAnnouncements.push(announcement);
    }
    console.log(`[SEED]    📢 Seeded ${seededAnnouncements.length} announcements successfully.`);

    // 3. Sync In-Memory Models if loaded in Node context
    try {
      const User = require('../models/User');
      const Announcement = require('../models/Announcement');
      User.users = seededUsers.map(u => ({
        id: u.id,
        name: u.name,
        department: u.department,
        graduationYear: u.graduation_year,
        email: u.email
      }));
      Announcement.announcements = seededAnnouncements.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        category: a.category,
        author: a.author,
        date: a.publication_date ? a.publication_date.toISOString().split('T')[0] : a.date
      }));
      console.log('[SEED] 🧠 In-memory singleton stores synchronized with seeded data.');
    } catch {
      // In-memory model sync skipped if running standalone
    }

    console.log('==================================================');
    console.log('[SEED] ✅ Database Seeding Completed Successfully!');
    console.log('==================================================');
    return { users: seededUsers, announcements: seededAnnouncements };
  } catch (err) {
    console.error('[SEED] ❌ Fatal error during database seeding:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
