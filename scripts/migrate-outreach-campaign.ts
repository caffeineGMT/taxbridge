#!/usr/bin/env tsx
/**
 * Database Migration: Outreach Campaign Tables
 *
 * Creates/updates tables for immigration law firm outreach:
 * - enterprise_prospects (with expanded tracking fields)
 * - email_events
 * - outreach_campaigns
 * - campaign_prospects
 * - partner_pipeline (links prospects to affiliate partners)
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'taxbridge.db');
const db = new Database(dbPath);

console.log('Running outreach campaign migration...\n');

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// 1. Enterprise Prospects table (create if not exists, add new columns)
db.exec(`
  CREATE TABLE IF NOT EXISTS enterprise_prospects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firm_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_name TEXT,
    contact_title TEXT,
    city TEXT,
    state TEXT,
    website TEXT,
    attorney_count INTEGER,
    specialties TEXT,
    source TEXT DEFAULT 'apollo_io',
    status TEXT DEFAULT 'target' CHECK(status IN (
      'target', 'contacted', 'opened', 'clicked', 'replied',
      'demo_scheduled', 'trial_started', 'closed_won', 'closed_lost'
    )),
    email_sequence_position INTEGER DEFAULT 0,
    last_contact_date TEXT,
    last_contact_type TEXT,
    email_opened INTEGER DEFAULT 0,
    email_clicked INTEGER DEFAULT 0,
    reply_date TEXT,
    reply_content TEXT,
    demo_scheduled_date TEXT,
    demo_completed_date TEXT,
    trial_start_date TEXT,
    trial_end_date TEXT,
    closed_won_date TEXT,
    closed_lost_date TEXT,
    closed_lost_reason TEXT,
    seats_count INTEGER,
    annual_contract_value REAL,
    email_verification_status TEXT,
    email_verification_score REAL,
    instantly_campaign_id TEXT,
    instantly_lead_status TEXT,
    affiliate_partner_id INTEGER,
    referral_code TEXT,
    first_referral_date TEXT,
    total_referrals INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contact_email)
  );
`);

// Add columns that might not exist yet
const columnsToAdd = [
  { name: 'email_verification_status', type: 'TEXT' },
  { name: 'email_verification_score', type: 'REAL' },
  { name: 'instantly_campaign_id', type: 'TEXT' },
  { name: 'instantly_lead_status', type: 'TEXT' },
  { name: 'affiliate_partner_id', type: 'INTEGER' },
  { name: 'referral_code', type: 'TEXT' },
  { name: 'first_referral_date', type: 'TEXT' },
  { name: 'total_referrals', type: 'INTEGER DEFAULT 0' },
  { name: 'contact_title', type: 'TEXT' },
  { name: 'specialties', type: 'TEXT' },
  { name: 'demo_completed_date', type: 'TEXT' },
  { name: 'email_sequence_position', type: 'INTEGER DEFAULT 0' },
  { name: 'last_contact_type', type: 'TEXT' },
  { name: 'reply_content', type: 'TEXT' },
];

for (const col of columnsToAdd) {
  try {
    db.exec(`ALTER TABLE enterprise_prospects ADD COLUMN ${col.name} ${col.type}`);
    console.log(`  Added column: enterprise_prospects.${col.name}`);
  } catch {
    // Column already exists
  }
}

// Create indexes
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_ep_email ON enterprise_prospects(contact_email);
  CREATE INDEX IF NOT EXISTS idx_ep_status ON enterprise_prospects(status);
  CREATE INDEX IF NOT EXISTS idx_ep_city ON enterprise_prospects(city);
  CREATE INDEX IF NOT EXISTS idx_ep_source ON enterprise_prospects(source);
  CREATE INDEX IF NOT EXISTS idx_ep_affiliate ON enterprise_prospects(affiliate_partner_id);
`);

console.log('  enterprise_prospects table ready');

// 2. Email Events table
db.exec(`
  CREATE TABLE IF NOT EXISTS email_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prospect_id INTEGER NOT NULL,
    event_type TEXT NOT NULL CHECK(event_type IN (
      'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'spam', 'unsubscribed'
    )),
    email_subject TEXT,
    email_template TEXT,
    link_clicked TEXT,
    metadata TEXT,
    event_timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prospect_id) REFERENCES enterprise_prospects(id)
  );

  CREATE INDEX IF NOT EXISTS idx_ee_prospect ON email_events(prospect_id);
  CREATE INDEX IF NOT EXISTS idx_ee_type ON email_events(event_type);
  CREATE INDEX IF NOT EXISTS idx_ee_timestamp ON email_events(event_timestamp);
`);

console.log('  email_events table ready');

// 3. Outreach Campaigns table
db.exec(`
  CREATE TABLE IF NOT EXISTS outreach_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_name TEXT NOT NULL,
    campaign_type TEXT DEFAULT 'cold_email',
    target_segment TEXT,
    instantly_campaign_id TEXT,
    start_date TEXT,
    end_date TEXT,
    total_prospects INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_replied INTEGER DEFAULT 0,
    total_demos INTEGER DEFAULT 0,
    total_trials INTEGER DEFAULT 0,
    total_closed_won INTEGER DEFAULT 0,
    goal_open_rate REAL DEFAULT 0.45,
    goal_reply_rate REAL DEFAULT 0.08,
    goal_demo_count INTEGER DEFAULT 6,
    goal_trial_count INTEGER DEFAULT 3,
    goal_closed_won_count INTEGER DEFAULT 10,
    goal_arr REAL DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'paused', 'completed')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add new columns
const campaignColumns = [
  { name: 'instantly_campaign_id', type: 'TEXT' },
  { name: 'goal_open_rate', type: 'REAL DEFAULT 0.45' },
];

for (const col of campaignColumns) {
  try {
    db.exec(`ALTER TABLE outreach_campaigns ADD COLUMN ${col.name} ${col.type}`);
    console.log(`  Added column: outreach_campaigns.${col.name}`);
  } catch {
    // Column already exists
  }
}

console.log('  outreach_campaigns table ready');

// 4. Campaign-Prospect junction table
db.exec(`
  CREATE TABLE IF NOT EXISTS campaign_prospects (
    campaign_id INTEGER NOT NULL,
    prospect_id INTEGER NOT NULL,
    added_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (campaign_id, prospect_id),
    FOREIGN KEY (campaign_id) REFERENCES outreach_campaigns(id),
    FOREIGN KEY (prospect_id) REFERENCES enterprise_prospects(id)
  );
`);

console.log('  campaign_prospects table ready');

// 5. Partner Pipeline table (tracks prospect -> partner conversion)
db.exec(`
  CREATE TABLE IF NOT EXISTS partner_pipeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prospect_id INTEGER,
    affiliate_partner_id INTEGER,
    contacted_date TEXT,
    demo_date TEXT,
    approved_date TEXT,
    first_referral_date TEXT,
    total_referrals INTEGER DEFAULT 0,
    total_referral_revenue REAL DEFAULT 0,
    commission_paid REAL DEFAULT 0,
    status TEXT DEFAULT 'prospect' CHECK(status IN (
      'prospect', 'demo_completed', 'approved', 'active', 'churned'
    )),
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prospect_id) REFERENCES enterprise_prospects(id),
    FOREIGN KEY (affiliate_partner_id) REFERENCES affiliate_partners(id)
  );

  CREATE INDEX IF NOT EXISTS idx_pp_status ON partner_pipeline(status);
  CREATE INDEX IF NOT EXISTS idx_pp_prospect ON partner_pipeline(prospect_id);
  CREATE INDEX IF NOT EXISTS idx_pp_affiliate ON partner_pipeline(affiliate_partner_id);
`);

console.log('  partner_pipeline table ready');

// 6. Seed the initial campaign
const existingCampaign = db.prepare(
  "SELECT id FROM outreach_campaigns WHERE campaign_name LIKE '%Immigration Law Firm%' LIMIT 1"
).get();

if (!existingCampaign) {
  db.prepare(`
    INSERT INTO outreach_campaigns (
      campaign_name, campaign_type, target_segment,
      goal_open_rate, goal_reply_rate, goal_demo_count,
      goal_trial_count, goal_closed_won_count,
      status, start_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Immigration Law Firm Partner Outreach - March 2026',
    'cold_email',
    'immigration_law_firms_sf_sea_nyc_bos',
    0.45,
    0.08,
    6,
    3,
    10,
    'active',
    new Date().toISOString()
  );
  console.log('\n  Seeded initial campaign: Immigration Law Firm Partner Outreach');
}

db.close();

console.log('\nMigration complete!\n');
console.log('Tables created/updated:');
console.log('  - enterprise_prospects (expanded with verification, Instantly, affiliate fields)');
console.log('  - email_events (webhook event tracking)');
console.log('  - outreach_campaigns (campaign management)');
console.log('  - campaign_prospects (campaign-prospect mapping)');
console.log('  - partner_pipeline (prospect to partner conversion tracking)');
console.log('');
