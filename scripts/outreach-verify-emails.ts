#!/usr/bin/env tsx
/**
 * Verify Emails with NeverBounce
 *
 * Reads scraped firm data and verifies emails before campaign launch.
 * Cost: $0.008/email = $1.60 for 200 emails
 *
 * Usage:
 *   NEVERBOUNCE_API_KEY=xxx npm run outreach:verify-emails
 *   npm run outreach:verify-emails -- --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';
import {
  verifySingleEmail,
  getAccountInfo,
  type NeverBounceConfig,
} from '../lib/outreach/neverbounce-integration';

const API_KEY = process.env.NEVERBOUNCE_API_KEY || '';
const isDryRun = process.argv.includes('--dry-run');

const config: NeverBounceConfig = {
  apiKey: API_KEY,
  baseUrl: 'https://api.neverbounce.com/v4',
};

interface FirmData {
  firm_name: string;
  contact_name: string;
  contact_email: string;
  title: string;
  city: string;
  state: string;
  email_status?: string;
  email_score?: number;
}

async function main() {
  console.log('NeverBounce Email Verification\n');

  if (!API_KEY && !isDryRun) {
    console.error('NEVERBOUNCE_API_KEY not set.');
    console.log('\nTo get started:');
    console.log('1. Sign up at https://neverbounce.com');
    console.log('2. Get your API key from https://app.neverbounce.com/settings/api');
    console.log('3. Run: NEVERBOUNCE_API_KEY=your_key npm run outreach:verify-emails');
    console.log('\nOr run with --dry-run to see what would be verified.');
    process.exit(1);
  }

  // Load emails from database
  const dbPath = path.join(process.cwd(), 'data/taxbridge.db');
  if (!fs.existsSync(dbPath)) {
    console.error('Database not found. Run npm run db:migrate:outreach first.');
    process.exit(1);
  }

  const db = new Database(dbPath);

  // Get unverified prospects
  const prospects = db.prepare(`
    SELECT id, firm_name, contact_email, contact_name, city, state
    FROM enterprise_prospects
    WHERE email_verification_status IS NULL
      AND contact_email IS NOT NULL
      AND contact_email != ''
    ORDER BY created_at ASC
  `).all() as any[];

  if (prospects.length === 0) {
    console.log('No unverified emails found.');

    // Show current verification stats
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN email_verification_status = 'valid' THEN 1 ELSE 0 END) as valid,
        SUM(CASE WHEN email_verification_status = 'invalid' THEN 1 ELSE 0 END) as invalid,
        SUM(CASE WHEN email_verification_status = 'catchall' THEN 1 ELSE 0 END) as catchall,
        SUM(CASE WHEN email_verification_status = 'unknown' THEN 1 ELSE 0 END) as unknown,
        SUM(CASE WHEN email_verification_status IS NULL THEN 1 ELSE 0 END) as unverified
      FROM enterprise_prospects
    `).get() as any;

    console.log('\nCurrent verification status:');
    console.log(`  Total: ${stats.total}`);
    console.log(`  Valid: ${stats.valid}`);
    console.log(`  Invalid: ${stats.invalid}`);
    console.log(`  Catchall: ${stats.catchall}`);
    console.log(`  Unknown: ${stats.unknown}`);
    console.log(`  Unverified: ${stats.unverified}`);

    db.close();
    return;
  }

  console.log(`Found ${prospects.length} unverified emails`);

  if (isDryRun) {
    console.log('\n[DRY RUN] Would verify these emails:\n');
    prospects.slice(0, 10).forEach(p => {
      console.log(`  ${p.contact_email} (${p.firm_name})`);
    });
    if (prospects.length > 10) {
      console.log(`  ... and ${prospects.length - 10} more`);
    }
    console.log(`\nEstimated cost: $${(prospects.length * 0.008).toFixed(2)}`);
    db.close();
    return;
  }

  // Check account credits
  try {
    const accountInfo = await getAccountInfo(config);
    console.log(`\nNeverBounce credits remaining: ${accountInfo.credits_remaining}`);

    if (accountInfo.credits_remaining < prospects.length) {
      console.error(`Not enough credits. Need ${prospects.length}, have ${accountInfo.credits_remaining}.`);
      db.close();
      process.exit(1);
    }
  } catch (error) {
    console.log('Could not check account credits. Proceeding anyway...\n');
  }

  console.log(`\nVerifying ${prospects.length} emails (est. cost: $${(prospects.length * 0.008).toFixed(2)})...\n`);

  const updateStmt = db.prepare(`
    UPDATE enterprise_prospects
    SET email_verification_status = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  let valid = 0;
  let invalid = 0;
  let catchall = 0;
  let unknown = 0;
  let errors = 0;

  for (let i = 0; i < prospects.length; i++) {
    const p = prospects[i];
    process.stdout.write(`  [${i + 1}/${prospects.length}] ${p.contact_email} ... `);

    try {
      const result = await verifySingleEmail(p.contact_email, config);

      updateStmt.run(result.result, p.id);

      switch (result.result) {
        case 'valid': valid++; console.log('VALID'); break;
        case 'invalid': invalid++; console.log('INVALID'); break;
        case 'catchall': catchall++; console.log('CATCHALL'); break;
        case 'disposable': invalid++; console.log('DISPOSABLE'); break;
        default: unknown++; console.log('UNKNOWN'); break;
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error: any) {
      errors++;
      updateStmt.run('unknown', p.id);
      console.log(`ERROR: ${error.message}`);
    }
  }

  db.close();

  console.log('\nVerification complete:');
  console.log(`  Valid: ${valid} (${Math.round(valid / prospects.length * 100)}%)`);
  console.log(`  Invalid: ${invalid} (${Math.round(invalid / prospects.length * 100)}%)`);
  console.log(`  Catchall: ${catchall} (${Math.round(catchall / prospects.length * 100)}%)`);
  console.log(`  Unknown: ${unknown}`);
  console.log(`  Errors: ${errors}`);
  console.log(`\nDeliverable (valid + catchall): ${valid + catchall} emails`);
  console.log(`Cost: $${((prospects.length - errors) * 0.008).toFixed(2)}`);
  console.log('\nNext: Run npm run prepare:instantly-upload to prepare Instantly.ai CSV');
}

main().catch(console.error);
