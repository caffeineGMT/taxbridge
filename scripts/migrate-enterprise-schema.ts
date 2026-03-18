#!/usr/bin/env tsx
/**
 * Run enterprise prospects migration
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const dbPath = path.join(__dirname, '../data/taxbridge.db');
const migrationPath = path.join(__dirname, '../lib/db/migrations/007_enterprise_prospects.sql');

async function runMigration() {
  console.log('🚀 Running enterprise prospects migration...\n');

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
      WHERE type='table' AND name IN ('enterprise_prospects', 'email_events', 'outreach_campaigns', 'campaign_prospects')
      ORDER BY name
    `).all() as { name: string }[];

    console.log('📊 Tables created:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });

    // Check if initial campaign was created
    const campaign = db.prepare('SELECT * FROM outreach_campaigns WHERE id = 1').get() as any;
    if (campaign) {
      console.log('\n📋 Initial campaign created:');
      console.log(`  Name: ${campaign.campaign_name}`);
      console.log(`  Target: ${campaign.total_prospects} prospects`);
      console.log(`  Goal: ${campaign.goal_closed_won_count} customers = $${campaign.goal_arr.toLocaleString()} ARR`);
    }

    // Show table counts
    console.log('\n📈 Current data:');
    const counts = {
      prospects: db.prepare('SELECT COUNT(*) as count FROM enterprise_prospects').get() as { count: number },
      events: db.prepare('SELECT COUNT(*) as count FROM email_events').get() as { count: number },
      campaigns: db.prepare('SELECT COUNT(*) as count FROM outreach_campaigns').get() as { count: number },
    };

    console.log(`  Prospects: ${counts.prospects.count}`);
    console.log(`  Email Events: ${counts.events.count}`);
    console.log(`  Campaigns: ${counts.campaigns.count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }

  console.log('\n✨ Done! Next steps:');
  console.log('1. Run scraper: npm run scrape:aila-firms');
  console.log('2. View dashboard: http://localhost:3000/admin/outreach');
  console.log('3. Setup email tools: See ENTERPRISE_OUTREACH_SETUP.md\n');
}

runMigration().catch(console.error);
