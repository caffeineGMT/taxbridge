#!/usr/bin/env ts-node

/**
 * Apply Database Schema Changes
 * Creates customer_interviews and related tables
 */

import { getDatabase } from '../lib/db/unified';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

async function applySchema() {
  console.log('📦 Applying schema changes...\n');

  const db = getDatabase() as Database.Database;
  const schemaPath = path.join(process.cwd(), 'lib/db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Execute the full schema (tables are CREATE IF NOT EXISTS, so safe to re-run)
  db.exec(schema);

  console.log('✅ Schema applied successfully!\n');

  // Verify tables exist
  const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name IN ('customer_interviews', 'interview_insights', 'referral_messaging')
    ORDER BY name
  `).all();

  console.log('Verified tables:');
  tables.forEach((table: any) => {
    console.log(`  ✓ ${table.name}`);
  });
  console.log('');
}

applySchema().catch(console.error);
