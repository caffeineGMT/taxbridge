#!/usr/bin/env tsx
/**
 * Migration script: Add notifications table and preferences
 * Run with: npm run db:migrate:notifications
 */

import { getDatabase } from '../lib/db';
import fs from 'fs';
import path from 'path';

const MIGRATION_FILE = path.join(__dirname, '../lib/db/migrations/001_add_notifications.sql');

function migrateNotifications() {
  console.log('🔄 Starting notifications migration...\n');

  const db = getDatabase();

  try {
    // Read migration SQL
    const migration = fs.readFileSync(MIGRATION_FILE, 'utf-8');

    // Execute migration
    db.exec(migration);

    console.log('✅ Notifications table created');
    console.log('✅ Notification preferences columns added to user_profiles');
    console.log('✅ Indexes created');
    console.log('\n✓ Migration completed successfully!\n');
  } catch (error: any) {
    if (error.message.includes('duplicate column name')) {
      console.log('⚠️  Migration already applied (columns exist)');
    } else {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }
}

migrateNotifications();
