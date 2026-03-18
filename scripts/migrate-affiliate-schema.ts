/**
 * Run Affiliate Program Migration
 * Adds affiliate_partners and affiliate_referrals tables
 */

import { getDatabase } from '../lib/db/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATION_FILE = path.join(__dirname, '../lib/db/migrations/005_affiliate_program.sql');

async function runMigration() {
  console.log('🔄 Running affiliate program migration...\n');

  const db = getDatabase();

  try {
    // Read migration file
    const migration = fs.readFileSync(MIGRATION_FILE, 'utf-8');

    // Execute migration
    db.exec(migration);

    console.log('✅ Migration completed successfully!\n');

    // Verify tables were created
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND (name='affiliate_partners' OR name='affiliate_referrals')
      ORDER BY name
    `).all();

    console.log('📋 Created tables:');
    tables.forEach((table: any) => {
      console.log(`   - ${table.name}`);
    });

    // Check if referred_by column was added
    const userColumns = db.prepare(`PRAGMA table_info(user_profiles)`).all();
    const hasReferredBy = userColumns.some((col: any) => col.name === 'referred_by');

    if (hasReferredBy) {
      console.log('   ✓ Added referred_by column to user_profiles');
    }

    console.log('\n✨ Affiliate program schema is ready!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
