#!/usr/bin/env tsx
/**
 * Run HR prospects migration
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const dbPath = path.join(__dirname, '../data/taxbridge.db');
const migrationPath = path.join(__dirname, '../lib/db/migrations/008_hr_prospects.sql');

async function runMigration() {
  console.log('🚀 Running HR prospects migration...\n');

  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`✅ Created directory: ${dataDir}`);
  }

  // Read migration SQL
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Open database connection
  const db = new Database(dbPath);

  try {
    // Run migration
    db.exec(migrationSQL);

    console.log('✅ Migration completed successfully!\n');

    // Verify tables were created
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name IN ('hr_prospects', 'linkedin_automation_log')
      ORDER BY name
    `).all() as { name: string }[];

    console.log('📊 Tables created:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });

    // Show table counts
    console.log('\n📈 Current data:');
    const counts = {
      prospects: db.prepare('SELECT COUNT(*) as count FROM hr_prospects').get() as { count: number },
      log: db.prepare('SELECT COUNT(*) as count FROM linkedin_automation_log').get() as { count: number },
    };

    console.log(`  HR Prospects: ${counts.prospects.count}`);
    console.log(`  LinkedIn Automation Log: ${counts.log.count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }

  console.log('\n✨ Done! Next steps:');
  console.log('1. Build prospect list: npm run hr:build-list');
  console.log('2. Test automation: tsx scripts/linkedin-outreach-automation.ts --dry-run');
  console.log('3. View dashboard: http://localhost:3000/admin/hr-outreach\n');
}

runMigration().catch(console.error);
