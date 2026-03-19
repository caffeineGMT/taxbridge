#!/usr/bin/env tsx

/**
 * Run Referral Credits Migration
 * Adds credit tracking system to replace free months reward
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const DB_PATH = resolve(__dirname, '../lib/db/taxbridge.db');
const MIGRATION_PATH = resolve(__dirname, '../lib/db/migrations/018_referral_credits.sql');

async function runMigration() {
  console.log('🚀 Running referral credits migration...\n');

  const db = new Database(DB_PATH);

  try {
    // Read migration SQL
    const migrationSQL = readFileSync(MIGRATION_PATH, 'utf-8');

    // Split into individual statements (SQLite doesn't support multi-statement exec)
    const statements = migrationSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    console.log(`📄 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    db.transaction(() => {
      for (const statement of statements) {
        try {
          db.exec(statement);
        } catch (error: any) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`⏭️  Skipped (already exists): ${statement.substring(0, 50)}...`);
          } else {
            throw error;
          }
        }
      }
    })();

    console.log('✅ Migration completed successfully!\n');

    // Verify tables exist
    const tables = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='table'
         AND name IN ('credit_transactions', 'viral_metrics')`
      )
      .all();

    console.log('📊 New tables created:');
    tables.forEach((table: any) => {
      console.log(`  ✓ ${table.name}`);
    });

    // Check if credit_balance column was added
    const columns = db.pragma('table_info(user_profiles)');
    const hasCreditBalance = columns.some((col: any) => col.name === 'credit_balance');

    if (hasCreditBalance) {
      console.log('  ✓ user_profiles.credit_balance');
    }

    console.log('\n✨ Referral credits system is ready!');
    console.log('💰 Reward structure: $10 credit per successful referral');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

runMigration().catch((error) => {
  console.error('Migration error:', error);
  process.exit(1);
});
