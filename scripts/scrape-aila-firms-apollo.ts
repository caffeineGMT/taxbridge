#!/usr/bin/env tsx
/**
 * AILA Immigration Law Firm Scraper - Apollo.io Edition
 *
 * Uses Apollo.io API to find 200 immigration law firms
 * with verified email addresses and decision-maker contacts
 *
 * Requirements:
 * - Apollo.io API key (sign up at https://app.apollo.io/api)
 * - Hunter.io API key for email verification (optional but recommended)
 *
 * Cost:
 * - Apollo.io: $79/mo for 10,000 credits
 * - Hunter.io: $49/mo for 500 verifications (optional)
 * - NeverBounce: $0.008/email for verification (alternative)
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  searchImmigrationAttorneys,
  deduplicateFirms,
  selectBestContact,
  formatForCSV,
  verifyEmail,
  type ApolloConfig,
  type ApolloContact
} from '../lib/outreach/apollo-integration';

// Load environment variables
const APOLLO_API_KEY = process.env.APOLLO_API_KEY || '';
const HUNTER_API_KEY = process.env.HUNTER_API_KEY || '';

interface FirmData {
  firm_name: string;
  contact_name: string;
  contact_email: string;
  title: string;
  city: string;
  state: string;
  website: string;
  attorney_count: number;
  email_status?: string;
  email_score?: number;
  source: string;
}

/**
 * Fetch firms from Apollo.io across multiple pages
 */
async function fetchFromApollo(targetCount: number = 200): Promise<FirmData[]> {
  if (!APOLLO_API_KEY) {
    throw new Error('APOLLO_API_KEY not set in .env.local');
  }

  console.log('🔍 Searching Apollo.io for immigration law firms...\n');

  const config: ApolloConfig = {
    apiKey: APOLLO_API_KEY,
    baseUrl: 'https://api.apollo.io'
  };

  const allContacts: ApolloContact[] = [];
  let page = 1;
  const perPage = 100;

  // Fetch multiple pages until we have enough firms
  while (allContacts.length < targetCount * 2) { // 2x to account for deduplication
    console.log(`📄 Fetching page ${page}...`);

    try {
      const response = await searchImmigrationAttorneys(config, {
        page,
        per_page: perPage
      });

      allContacts.push(...response.contacts);

      console.log(`  Found ${response.contacts.length} contacts`);
      console.log(`  Total: ${allContacts.length} contacts`);

      if (response.pagination.page >= response.pagination.total_pages) {
        console.log('  Reached last page\n');
        break;
      }

      page++;

      // Rate limiting: Apollo allows 10 requests/second
      await new Promise(resolve => setTimeout(resolve, 150));

    } catch (error) {
      console.error(`❌ Error fetching page ${page}:`, error);
      break;
    }
  }

  console.log(`\n✅ Fetched ${allContacts.length} total contacts\n`);

  // Deduplicate by firm
  console.log('🔄 Deduplicating by firm...');
  const firmMap = deduplicateFirms(allContacts);
  console.log(`  Unique firms: ${firmMap.size}\n`);

  // Select best contact from each firm
  console.log('👤 Selecting best contact from each firm...');
  const firms: FirmData[] = [];

  for (const [firmName, contacts] of firmMap.entries()) {
    if (firms.length >= targetCount) break;

    const bestContact = selectBestContact(contacts);

    if (!bestContact.email) {
      console.log(`  ⚠️  Skipping ${firmName} - no email found`);
      continue;
    }

    firms.push(formatForCSV(bestContact));
  }

  console.log(`  Selected ${firms.length} firms with valid emails\n`);

  return firms;
}

/**
 * Verify emails with Hunter.io
 */
async function verifyEmails(firms: FirmData[]): Promise<FirmData[]> {
  if (!HUNTER_API_KEY) {
    console.log('⚠️  HUNTER_API_KEY not set - skipping email verification');
    console.log('   To verify emails, add HUNTER_API_KEY to .env.local\n');
    return firms;
  }

  console.log('📧 Verifying emails with Hunter.io...');
  console.log(`   This will use ${firms.length} verification credits\n`);

  const verified: FirmData[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < firms.length; i++) {
    const firm = firms[i];
    process.stdout.write(`  [${i + 1}/${firms.length}] Verifying ${firm.contact_email}... `);

    try {
      const result = await verifyEmail(firm.contact_email, HUNTER_API_KEY);

      firm.email_status = result.status;
      firm.email_score = result.score;

      if (result.status === 'valid' || result.status === 'accept_all') {
        verified.push(firm);
        validCount++;
        console.log(`✅ ${result.status} (score: ${result.score})`);
      } else {
        invalidCount++;
        console.log(`❌ ${result.status} (score: ${result.score})`);
      }

      // Rate limiting: Hunter.io allows 10 requests/second
      await new Promise(resolve => setTimeout(resolve, 150));

    } catch (error) {
      console.log(`⚠️  Error - kept anyway`);
      verified.push(firm);
    }
  }

  console.log(`\n✅ Verification complete:`);
  console.log(`   Valid: ${validCount}`);
  console.log(`   Invalid: ${invalidCount}`);
  console.log(`   Kept: ${verified.length}\n`);

  return verified;
}

/**
 * Export to CSV for Instantly.ai
 */
function exportToCSV(firms: FirmData[], outputPath: string): void {
  console.log('💾 Exporting to CSV for Instantly.ai...');

  const headers = 'firm_name,contact_name,contact_email,title,city,state,website,attorney_count,email_status,email_score,source';
  const rows = firms.map(firm =>
    `"${firm.firm_name}","${firm.contact_name}","${firm.contact_email}","${firm.title}","${firm.city}","${firm.state}","${firm.website}",${firm.attorney_count},"${firm.email_status || ''}",${firm.email_score || ''},"${firm.source}"`
  );

  const csv = [headers, ...rows].join('\n');

  fs.writeFileSync(outputPath, csv, 'utf-8');
  console.log(`✅ Exported ${firms.length} firms to ${outputPath}\n`);
}

/**
 * Import to database for tracking
 */
function importToDatabase(firms: FirmData[]): void {
  console.log('💾 Importing to database...');

  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, '../data/taxbridge.db');
  const db = new Database(dbPath);

  // Create table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS enterprise_prospects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firm_name TEXT NOT NULL,
      contact_name TEXT,
      contact_email TEXT NOT NULL,
      title TEXT,
      city TEXT,
      state TEXT,
      website TEXT,
      attorney_count INTEGER,
      email_status TEXT,
      email_score REAL,
      source TEXT,
      status TEXT DEFAULT 'target',
      last_contact_date TEXT,
      reply_date TEXT,
      demo_scheduled_date TEXT,
      trial_start_date TEXT,
      trial_end_date TEXT,
      closed_won_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_enterprise_prospects_email ON enterprise_prospects(contact_email);
    CREATE INDEX IF NOT EXISTS idx_enterprise_prospects_status ON enterprise_prospects(status);
  `);

  // Check for existing records
  const existing = db.prepare('SELECT contact_email FROM enterprise_prospects').all();
  const existingEmails = new Set(existing.map((r: any) => r.contact_email));

  // Insert only new firms
  const insert = db.prepare(`
    INSERT INTO enterprise_prospects (
      firm_name, contact_name, contact_email, title, city, state, website,
      attorney_count, email_status, email_score, source, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'target')
  `);

  let insertedCount = 0;
  let skippedCount = 0;

  const insertMany = db.transaction((firms: FirmData[]) => {
    for (const firm of firms) {
      if (existingEmails.has(firm.contact_email)) {
        skippedCount++;
        continue;
      }

      insert.run(
        firm.firm_name,
        firm.contact_name,
        firm.contact_email,
        firm.title,
        firm.city,
        firm.state,
        firm.website,
        firm.attorney_count,
        firm.email_status || null,
        firm.email_score || null,
        firm.source
      );
      insertedCount++;
    }
  });

  insertMany(firms);

  console.log(`✅ Database import complete:`);
  console.log(`   Inserted: ${insertedCount} new firms`);
  console.log(`   Skipped: ${skippedCount} duplicates\n`);

  db.close();
}

/**
 * Generate summary stats
 */
function printSummary(firms: FirmData[]): void {
  console.log('📊 Campaign Summary:\n');

  // By city
  const byCityMap = new Map<string, number>();
  firms.forEach(f => {
    const key = `${f.city}, ${f.state}`;
    byCityMap.set(key, (byCityMap.get(key) || 0) + 1);
  });

  console.log('Distribution by City:');
  const sortedCities = Array.from(byCityMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sortedCities.forEach(([city, count]) => {
    console.log(`  ${city}: ${count} firms`);
  });

  // By firm size
  const smallFirms = firms.filter(f => f.attorney_count <= 20).length;
  const mediumFirms = firms.filter(f => f.attorney_count > 20 && f.attorney_count <= 50).length;
  const largeFirms = firms.filter(f => f.attorney_count > 50).length;

  console.log('\nDistribution by Size:');
  console.log(`  Small (5-20 attorneys): ${smallFirms}`);
  console.log(`  Medium (21-50 attorneys): ${mediumFirms}`);
  console.log(`  Large (50+ attorneys): ${largeFirms}`);

  // Email verification stats
  if (firms.some(f => f.email_status)) {
    const valid = firms.filter(f => f.email_status === 'valid').length;
    const acceptAll = firms.filter(f => f.email_status === 'accept_all').length;
    const unknown = firms.filter(f => f.email_status === 'unknown').length;

    console.log('\nEmail Verification:');
    console.log(`  Valid: ${valid} (${Math.round(valid / firms.length * 100)}%)`);
    console.log(`  Accept-All: ${acceptAll} (${Math.round(acceptAll / firms.length * 100)}%)`);
    console.log(`  Unknown: ${unknown} (${Math.round(unknown / firms.length * 100)}%)`);
  }

  console.log('\n');
}

// Main execution
async function main() {
  console.log('🚀 AILA Immigration Law Firm Scraper (Apollo.io Edition)\n');
  console.log('Target: 200 immigration law firms in tech hubs');
  console.log('Source: Apollo.io API + Hunter.io verification\n');

  // Step 1: Fetch from Apollo.io
  const firms = await fetchFromApollo(200);

  if (firms.length === 0) {
    console.error('❌ No firms found. Check your Apollo.io API key.');
    process.exit(1);
  }

  // Step 2: Verify emails (optional)
  const verifiedFirms = await verifyEmails(firms);

  // Step 3: Export to CSV
  const outputDir = path.join(__dirname, '../data/outreach');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const csvPath = path.join(outputDir, 'immigration-firms-apollo.csv');
  exportToCSV(verifiedFirms, csvPath);

  // Step 4: Import to database
  importToDatabase(verifiedFirms);

  // Step 5: Print summary
  printSummary(verifiedFirms);

  console.log('✨ Done! Next steps:\n');
  console.log('1. Review CSV at: data/outreach/immigration-firms-apollo.csv');
  console.log('2. Upload to Instantly.ai with email sequence');
  console.log('3. Set up domain warmup (taxbridge-partners.com, taxbridge.co, taxbridge.io)');
  console.log('4. Start email campaign (50/day, increase to 100/day after 7 days)');
  console.log('5. Track responses at: http://localhost:3000/admin/outreach');
  console.log('');
  console.log('💡 To run with Apollo.io:');
  console.log('   1. Sign up at https://app.apollo.io/api');
  console.log('   2. Add to .env.local: APOLLO_API_KEY=your_key');
  console.log('   3. Run: npm run scrape:aila-firms');
  console.log('');
}

main().catch(console.error);
