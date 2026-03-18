/**
 * Database migration script to add subscription fields to user_profiles table
 * Run with: tsx scripts/migrate-subscription-schema.ts
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'taxbridge.db');

function migrateDatabase() {
  console.log('🔄 Starting database migration for subscription fields...\n');

  // Ensure database exists
  if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database not found. Please run npm run db:init first.');
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  try {
    // Check if migration has already been applied
    const tableInfo = db.prepare("PRAGMA table_info(user_profiles)").all() as Array<{ name: string }>;
    const hasSubscriptionTier = tableInfo.some((col) => col.name === 'subscription_tier');

    if (hasSubscriptionTier) {
      console.log('✓ Migration already applied. Subscription fields already exist.');
      db.close();
      return;
    }

    console.log('📝 Adding subscription fields to user_profiles table...');

    // Add new columns to user_profiles
    db.exec(`
      ALTER TABLE user_profiles ADD COLUMN clerk_user_id TEXT UNIQUE;
      ALTER TABLE user_profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'pro', 'enterprise'));
      ALTER TABLE user_profiles ADD COLUMN stripe_customer_id TEXT UNIQUE;
      ALTER TABLE user_profiles ADD COLUMN stripe_subscription_id TEXT;
      ALTER TABLE user_profiles ADD COLUMN subscription_status TEXT CHECK(subscription_status IN ('active', 'canceled', 'past_due', 'trialing', NULL));
      ALTER TABLE user_profiles ADD COLUMN subscription_current_period_end TEXT;
    `);

    // Update existing users to free tier
    db.exec(`
      UPDATE user_profiles
      SET subscription_tier = 'free'
      WHERE subscription_tier IS NULL;
    `);

    console.log('✓ Successfully added subscription fields');
    console.log('✓ All existing users set to free tier');
    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

migrateDatabase();
