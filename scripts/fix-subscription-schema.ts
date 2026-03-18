/**
 * Fix subscription schema - Add missing fields to user_profiles
 * These fields are required for Stripe webhook processing
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'taxbridge.db');

function fixSubscriptionSchema() {
  console.log('🔄 Fixing subscription schema in user_profiles...\n');

  if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database not found at:', DB_PATH);
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  try {
    // Get current table info
    const tableInfo = db.prepare("PRAGMA table_info(user_profiles)").all() as Array<{ name: string }>;
    const existingColumns = tableInfo.map(col => col.name);

    console.log('Current columns:', existingColumns.join(', '));
    console.log('');

    const columnsToAdd = [
      {
        name: 'stripe_subscription_id',
        definition: 'ALTER TABLE user_profiles ADD COLUMN stripe_subscription_id TEXT;',
      },
      {
        name: 'subscription_status',
        definition: "ALTER TABLE user_profiles ADD COLUMN subscription_status TEXT CHECK(subscription_status IN ('active', 'canceled', 'past_due', 'trialing', NULL));",
      },
      {
        name: 'subscription_current_period_end',
        definition: 'ALTER TABLE user_profiles ADD COLUMN subscription_current_period_end TEXT;',
      },
    ];

    let addedCount = 0;

    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`📝 Adding column: ${column.name}`);
        db.exec(column.definition);
        addedCount++;
      } else {
        console.log(`✓ Column already exists: ${column.name}`);
      }
    }

    console.log('');

    if (addedCount > 0) {
      console.log(`✅ Added ${addedCount} column(s) successfully!`);
    } else {
      console.log('✓ All required columns already exist.');
    }

    // Verify the changes
    const updatedTableInfo = db.prepare("PRAGMA table_info(user_profiles)").all() as Array<{ name: string }>;
    const updatedColumns = updatedTableInfo.map(col => col.name);

    const missingColumns = columnsToAdd.filter(col => !updatedColumns.includes(col.name));

    if (missingColumns.length === 0) {
      console.log('✓ Schema validation passed - all required columns present');
    } else {
      console.error('❌ Schema validation failed - missing columns:', missingColumns.map(c => c.name));
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

fixSubscriptionSchema();
