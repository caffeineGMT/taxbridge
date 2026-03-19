#!/usr/bin/env tsx
/**
 * Referral Tracking Migration Script
 * Runs migration 019: referral click and share tracking tables
 */

import { getDatabase } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function migrate() {
  try {
    console.log('🚀 Running referral tracking migration...');

    const db = getDatabase();

    // Read migration file
    const migrationPath = path.join(
      __dirname,
      '../lib/db/migrations/019_referral_tracking.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolons and run each statement
    const statements = migrationSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      db.exec(statement);
    }

    console.log('✅ Referral tracking migration completed successfully!');
    console.log('');
    console.log('Created tables:');
    console.log('  - referral_clicks (track link clicks)');
    console.log('  - referral_shares (track share events)');
    console.log('  - referral_analytics (daily/weekly/monthly aggregations)');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Test the referral flow: visit /?ref=TESTCODE');
    console.log('  2. Check API routes: /api/referrals/track-click, /api/referrals/track-share');
    console.log('  3. View stats: /api/referrals/stats');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
