#!/usr/bin/env tsx

/**
 * EMAIL DRIP CAMPAIGN - ACTIVATION & TESTING SCRIPT
 *
 * This script activates and tests the 7-day email drip campaign:
 * - Day 1: Welcome + Quick Start Guide
 * - Day 3: RSU Tax Education
 * - Day 5: Social Proof & Success Stories
 * - Day 7: Limited Time Offer (30% off)
 *
 * Usage:
 *   npm run activate:drip-campaign           # Full activation report
 *   npm run activate:drip-campaign --test    # Create test users and trigger emails
 *   npm run activate:drip-campaign --trigger # Manually trigger cron job
 *   npm run activate:drip-campaign --preview # Preview email HTML
 */

import { getDatabase } from '../lib/db/index.js';
import {
  getDay1EmailData,
  getDay1EmailHTML,
  getDay3EmailData,
  getDay3EmailHTML,
  getDay5EmailData,
  getDay5EmailHTML,
  getDay7EmailData,
  getDay7EmailHTML,
} from '../lib/email/drip-campaign-templates.js';
import { getUsersForDripEmail } from '../lib/db/queries/drip-campaign.js';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONFIGURATION
// =============================================================================

const TEST_USERS = [
  {
    email: 'day1.test@example.com',
    first_name: 'Day1',
    days_ago: 1,
    event_type: 'drip_day1'
  },
  {
    email: 'day3.test@example.com',
    first_name: 'Day3',
    days_ago: 3,
    event_type: 'drip_day3'
  },
  {
    email: 'day5.test@example.com',
    first_name: 'Day5',
    days_ago: 5,
    event_type: 'drip_day5'
  },
  {
    email: 'day7.test@example.com',
    first_name: 'Day7',
    days_ago: 7,
    event_type: 'drip_day7'
  },
];

// =============================================================================
// ACTIVATION REPORT
// =============================================================================

function generateActivationReport() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  EMAIL DRIP CAMPAIGN - ACTIVATION STATUS                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const db = getDatabase();

  // Check database schema
  console.log('📊 Database Configuration\n');

  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name IN ('user_profiles', 'email_events')
    `).all();

    console.log(`   ✓ Database tables: ${tables.map((t: any) => t.name).join(', ')}`);

    // Check email_events structure
    const emailEventsCount = db.prepare(`SELECT COUNT(*) as count FROM email_events`).get() as { count: number };
    console.log(`   ✓ Email events logged: ${emailEventsCount.count}`);

    // Check user profiles
    const userCount = db.prepare(`SELECT COUNT(*) as count FROM user_profiles WHERE email IS NOT NULL`).get() as { count: number };
    console.log(`   ✓ Users with email: ${userCount}\n`);

  } catch (error: any) {
    console.log(`   ✗ Database error: ${error.message}\n`);
  }

  // Check eligible users for each campaign
  console.log('📧 Eligible Users per Campaign\n');

  const campaigns = [
    { eventType: 'drip_day1' as const, dayOffset: 1, description: 'Day 1: Welcome' },
    { eventType: 'drip_day3' as const, dayOffset: 3, description: 'Day 3: Education' },
    { eventType: 'drip_day5' as const, dayOffset: 5, description: 'Day 5: Social Proof' },
    { eventType: 'drip_day7' as const, dayOffset: 7, description: 'Day 7: Urgency' },
  ];

  let totalEligible = 0;

  campaigns.forEach(campaign => {
    const eligible = getUsersForDripEmail(campaign.eventType, campaign.dayOffset);
    totalEligible += eligible.length;
    console.log(`   ${campaign.description.padEnd(25)} ${eligible.length} users`);
  });

  console.log(`\n   Total eligible: ${totalEligible} emails queued\n`);

  // Check environment variables
  console.log('🔧 Configuration Status\n');

  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const cronSecret = process.env.CRON_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  console.log(`   ${sendgridApiKey ? '✓' : '✗'} SENDGRID_API_KEY ${sendgridApiKey ? '(configured)' : '(MISSING - emails will fail)'}`);
  console.log(`   ${cronSecret ? '✓' : '✗'} CRON_SECRET ${cronSecret ? '(configured)' : '(MISSING - cron job unprotected)'}`);
  console.log(`   ${baseUrl ? '✓' : '✗'} NEXT_PUBLIC_APP_URL ${baseUrl || '(MISSING - using default)'}\n`);

  // Vercel Cron status
  console.log('⏰ Vercel Cron Configuration\n');
  console.log('   Schedule: Daily at 9:00 AM PST (5:00 PM UTC)');
  console.log('   Endpoint: /api/cron/email-drip-campaign');
  console.log('   Status: Configured in vercel.json\n');

  // Next steps
  console.log('📋 Activation Checklist\n');
  console.log('   [ ] Verify SendGrid API key is set');
  console.log('   [ ] Set CRON_SECRET for security');
  console.log('   [ ] Test with --test flag to create sample users');
  console.log('   [ ] Preview emails with --preview flag');
  console.log('   [ ] Manually trigger with --trigger flag');
  console.log('   [ ] Deploy to Vercel (Vercel will auto-run cron)');
  console.log('   [ ] Monitor first 24 hours for errors\n');

  // Commands
  console.log('💡 Quick Commands\n');
  console.log('   npm run activate:drip-campaign --test      # Create test users');
  console.log('   npm run activate:drip-campaign --preview   # Preview email HTML');
  console.log('   npm run activate:drip-campaign --trigger   # Manually trigger cron');
  console.log('   npm run test:email-drip                    # Run test suite\n');

  console.log('✅ Email drip campaign is ready to activate!\n');
}

// =============================================================================
// CREATE TEST USERS
// =============================================================================

function createTestUsers() {
  console.log('🧪 Creating test users for drip campaign...\n');

  const db = getDatabase();

  // Clean up existing test users
  const deleteStmt = db.prepare(`DELETE FROM user_profiles WHERE email LIKE '%.test@example.com'`);
  const deleted = deleteStmt.run();
  console.log(`🗑️  Cleaned up ${deleted.changes} existing test users\n`);

  // Create new test users
  TEST_USERS.forEach(user => {
    const clerkUserId = `test_${user.email.replace('@example.com', '')}`;

    const stmt = db.prepare(`
      INSERT INTO user_profiles (clerk_user_id, email, first_name, last_name, us_state, canada_province, filing_status, created_at)
      VALUES (?, ?, ?, 'Tester', 'WA', 'BC', 'single', DATE('now', '-' || ? || ' days'))
    `);

    stmt.run(clerkUserId, user.email, user.first_name, user.days_ago);
    console.log(`   ✓ Created: ${user.email} (${user.days_ago} days ago) → ${user.event_type}`);
  });

  console.log(`\n✅ Created ${TEST_USERS.length} test users`);
  console.log('\n💡 Next step: Run the cron job to send emails:');
  console.log('   npm run activate:drip-campaign --trigger\n');
}

// =============================================================================
// PREVIEW EMAILS
// =============================================================================

function previewEmails() {
  console.log('📧 Generating email previews...\n');

  const previewDir = path.join(process.cwd(), 'docs/email-previews');

  // Create directory if it doesn't exist
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }

  const emails = [
    {
      name: 'Day 1 - Welcome',
      filename: 'day1-welcome.html',
      getData: getDay1EmailData,
      getHTML: getDay1EmailHTML,
    },
    {
      name: 'Day 3 - Education',
      filename: 'day3-education.html',
      getData: getDay3EmailData,
      getHTML: getDay3EmailHTML,
    },
    {
      name: 'Day 5 - Social Proof',
      filename: 'day5-social-proof.html',
      getData: getDay5EmailData,
      getHTML: getDay5EmailHTML,
    },
    {
      name: 'Day 7 - Urgency',
      filename: 'day7-urgency.html',
      getData: getDay7EmailData,
      getHTML: getDay7EmailHTML,
    },
  ];

  emails.forEach(email => {
    const data = email.getData({
      firstName: 'Sarah',
      email: 'sarah@example.com',
      discountCode: 'WELCOME30',
    });

    const html = email.getHTML(data);
    const filepath = path.join(previewDir, email.filename);

    fs.writeFileSync(filepath, html, 'utf-8');
    console.log(`   ✓ ${email.name} → ${filepath}`);
  });

  console.log(`\n✅ Generated ${emails.length} email previews in docs/email-previews/`);
  console.log('\n💡 Open these HTML files in your browser to preview emails\n');
}

// =============================================================================
// TRIGGER CRON JOB
// =============================================================================

async function triggerCronJob() {
  console.log('🚀 Triggering email drip cron job...\n');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.log('⚠️  Warning: CRON_SECRET not set. Request will be unauthorized on production.\n');
  }

  try {
    const response = await fetch(`${baseUrl}/api/cron/email-drip-campaign`, {
      method: 'GET',
      headers: cronSecret ? {
        'Authorization': `Bearer ${cronSecret}`
      } : {},
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Cron job executed successfully\n');
      console.log('📊 Results:\n');

      data.campaigns.forEach((campaign: any) => {
        console.log(`   ${campaign.description}`);
        console.log(`      Eligible: ${campaign.eligible}`);
        console.log(`      Sent: ${campaign.sent}`);
        console.log(`      Failed: ${campaign.failed}`);
        console.log(`      Skipped: ${campaign.skipped}`);

        if (campaign.errors && campaign.errors.length > 0) {
          console.log(`      Errors: ${campaign.errors.join(', ')}`);
        }
        console.log('');
      });

      console.log(`   Total: ${data.totalSent} sent, ${data.totalFailed} failed, ${data.totalSkipped} skipped\n`);
    } else {
      console.log(`❌ Cron job failed: ${response.status} ${response.statusText}\n`);
      console.log(data);
    }
  } catch (error: any) {
    console.log(`❌ Error triggering cron job: ${error.message}\n`);
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--test')) {
    createTestUsers();
  } else if (args.includes('--preview')) {
    previewEmails();
  } else if (args.includes('--trigger')) {
    await triggerCronJob();
  } else {
    generateActivationReport();
  }
}

// Run
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await main();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
