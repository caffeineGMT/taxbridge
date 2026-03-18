/**
 * Run referral program migration
 */

import { getDatabase } from '../lib/db/index';
import fs from 'fs';
import path from 'path';

const MIGRATION_FILE = path.join(__dirname, '../lib/db/migrations/006_user_referrals.sql');

async function runMigration() {
  console.log('🚀 Starting referral program migration...\n');

  const db = getDatabase();

  try {
    // Read migration SQL
    const migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf-8');

    // Execute migration
    db.exec(migrationSQL);

    console.log('✓ Referrals table created');
    console.log('✓ Referral leaderboard table created');
    console.log('✓ Referral_code column added to user_profiles');
    console.log('✓ Indexes created for performance\n');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

runMigration().catch(console.error);
