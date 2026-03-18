#!/usr/bin/env tsx
/**
 * LinkedIn Outreach Automation with Puppeteer
 *
 * Features:
 * - Automated connection requests with personalized notes
 * - Rate limiting: 10 connections/hour, 50/day
 * - Anti-bot detection handling
 * - Dry-run mode for testing
 *
 * Usage:
 *   tsx scripts/linkedin-outreach-automation.ts --dry-run (test mode)
 *   tsx scripts/linkedin-outreach-automation.ts --limit 10 (send 10 connections)
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import {
  getProspectsForConnection,
  updateHRProspectStatus,
  getTodayConnectionCount,
  logLinkedInAction
} from '../lib/db/queries/hr-prospects';

// LinkedIn credentials from .env
const LINKEDIN_EMAIL = process.env.LINKEDIN_EMAIL;
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD;

// Rate limits
const MAX_CONNECTIONS_PER_DAY = 50;
const MAX_CONNECTIONS_PER_HOUR = 10;
const DELAY_BETWEEN_ACTIONS = 3000; // 3 seconds

// Command line args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit'));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract first name from full name
 */
function getFirstName(fullName: string): string {
  return fullName.split(' ')[0];
}

/**
 * Generate personalized connection note
 */
function generateConnectionNote(prospect: {
  name: string;
  company: string;
  title: string;
}): string {
  const firstName = getFirstName(prospect.name);
  const template = `Hi ${firstName}, I noticed ${prospect.company} sponsors 1000+ H-1Bs annually. Built a tool that saves employees $3K in CPA fees per year on cross-border RSU taxes. Would love to connect and share a quick demo.`;

  return template.substring(0, 300); // LinkedIn limit
}

/**
 * Login to LinkedIn
 */
async function loginToLinkedIn(page: Page): Promise<boolean> {
  try {
    console.log('🔐 Logging in to LinkedIn...');

    await page.goto('https://www.linkedin.com/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Fill in credentials
    await page.type('#username', LINKEDIN_EMAIL!, { delay: 100 });
    await page.type('#password', LINKEDIN_PASSWORD!, { delay: 100 });

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

    // Check if login was successful
    const url = page.url();
    if (url.includes('/checkpoint/') || url.includes('/verify')) {
      console.error('⚠️  LinkedIn security checkpoint detected!');
      console.log('Please manually verify your account and try again.');
      return false;
    }

    if (url.includes('/feed/') || url.includes('/mynetwork/')) {
      console.log('✅ Successfully logged in to LinkedIn\n');
      return true;
    }

    console.error('❌ Login failed - unexpected redirect');
    return false;

  } catch (error) {
    console.error('❌ Login error:', error);
    return false;
  }
}

/**
 * Send connection request to a prospect
 */
async function sendConnectionRequest(
  page: Page,
  prospect: {
    id: number;
    name: string;
    company: string;
    title: string;
    linkedin_url: string;
  },
  dryRun: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`\n👤 Processing: ${prospect.name} (${prospect.title} at ${prospect.company})`);

    if (dryRun) {
      console.log(`   [DRY RUN] Would navigate to: ${prospect.linkedin_url}`);
      const note = generateConnectionNote(prospect);
      console.log(`   [DRY RUN] Would send note: "${note}"`);
      return { success: true };
    }

    // Navigate to profile
    await page.goto(prospect.linkedin_url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await sleep(2000);

    // Check for anti-bot challenge
    if (page.url().includes('/checkpoint/')) {
      console.error('   ⚠️  Anti-bot detection triggered! Pausing automation.');
      return { success: false, error: 'Anti-bot detection' };
    }

    // Look for "Connect" button
    const connectButton = await page.$('button:has-text("Connect")') ||
                          await page.$('button[aria-label*="Connect"]') ||
                          await page.$('.pvs-profile-actions__action button');

    if (!connectButton) {
      console.log('   ⚠️  Connect button not found (may already be connected)');
      return { success: false, error: 'Connect button not found' };
    }

    // Click Connect button
    await connectButton.click();
    await sleep(1500);

    // Look for "Add a note" button
    const addNoteButton = await page.$('button:has-text("Add a note")') ||
                          await page.$('button[aria-label*="Add a note"]');

    if (addNoteButton) {
      await addNoteButton.click();
      await sleep(1000);

      // Type personalized note
      const noteTextarea = await page.$('textarea[name="message"]') ||
                           await page.$('#custom-message');

      if (noteTextarea) {
        const note = generateConnectionNote(prospect);
        await noteTextarea.type(note, { delay: 50 });
        console.log(`   📝 Added note: "${note.substring(0, 50)}..."`);
        await sleep(1000);
      }
    }

    // Click Send button
    const sendButton = await page.$('button:has-text("Send")') ||
                       await page.$('button[aria-label*="Send"]');

    if (sendButton) {
      await sendButton.click();
      console.log('   ✅ Connection request sent!');
      await sleep(2000);
      return { success: true };
    } else {
      console.log('   ⚠️  Send button not found');
      return { success: false, error: 'Send button not found' };
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`   ❌ Error sending connection: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

/**
 * Main automation flow
 */
async function runAutomation() {
  console.log('🚀 LinkedIn Outreach Automation\n');

  // Validate environment
  if (!LINKEDIN_EMAIL || !LINKEDIN_PASSWORD) {
    console.error('❌ Missing LinkedIn credentials!');
    console.log('Please set LINKEDIN_EMAIL and LINKEDIN_PASSWORD in your .env file\n');
    process.exit(1);
  }

  // Check today's connection count
  const todayCount = getTodayConnectionCount();
  const remainingToday = MAX_CONNECTIONS_PER_DAY - todayCount;

  console.log(`📊 Today's status: ${todayCount}/${MAX_CONNECTIONS_PER_DAY} connections sent`);
  console.log(`📈 Remaining today: ${remainingToday}\n`);

  if (remainingToday <= 0 && !isDryRun) {
    console.log('⚠️  Daily limit reached! Come back tomorrow.\n');
    process.exit(0);
  }

  // Determine how many to send
  const toSend = Math.min(limit, remainingToday);

  if (isDryRun) {
    console.log(`🧪 DRY RUN MODE - No actual connections will be sent\n`);
  } else {
    console.log(`🎯 Target: Send ${toSend} connection requests\n`);
  }

  // Get prospects
  const prospects = getProspectsForConnection(toSend);

  if (prospects.length === 0) {
    console.log('⚠️  No prospects available for outreach\n');
    console.log('Run: tsx scripts/build-hr-prospect-list.ts\n');
    process.exit(0);
  }

  console.log(`📋 Found ${prospects.length} prospects ready for outreach\n`);

  // Launch browser
  console.log('🌐 Launching browser...');
  const browser: Browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page: Page = await browser.newPage();

  // Set user agent to avoid detection
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  try {
    // Login
    const loginSuccess = await loginToLinkedIn(page);

    if (!loginSuccess) {
      console.error('❌ Login failed. Exiting.\n');
      await browser.close();
      process.exit(1);
    }

    // Send connection requests
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < prospects.length; i++) {
      const prospect = prospects[i];

      console.log(`\n[${i + 1}/${prospects.length}] Processing ${prospect.name}...`);

      const result = await sendConnectionRequest(page, prospect, isDryRun);

      // Log action to database
      if (!isDryRun) {
        logLinkedInAction({
          action_type: 'connection_request',
          prospect_id: prospect.id,
          success: result.success,
          error_message: result.error
        });

        // Update prospect status
        if (result.success) {
          updateHRProspectStatus(prospect.id, 'connection_sent', {
            connection_sent_date: new Date().toISOString()
          });
          successCount++;
        } else {
          errorCount++;
        }
      } else {
        successCount++;
      }

      // Rate limiting delay
      if (i < prospects.length - 1) {
        const delay = DELAY_BETWEEN_ACTIONS + Math.random() * 2000; // Random 3-5s
        console.log(`   ⏳ Waiting ${Math.round(delay / 1000)}s before next request...`);
        await sleep(delay);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary\n');
    console.log(`Total processed: ${prospects.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    if (!isDryRun) {
      console.log(`\n📈 Total today: ${todayCount + successCount}/${MAX_CONNECTIONS_PER_DAY}`);
      console.log(`📅 Remaining today: ${remainingToday - successCount}`);
    }

    console.log('\n🎯 Next steps:');
    console.log('1. Check LinkedIn for connection acceptances');
    console.log('2. Run follow-up messages: tsx scripts/linkedin-message-followup.ts');
    console.log('3. View dashboard: http://localhost:3000/admin/hr-outreach\n');

  } catch (error) {
    console.error('\n❌ Automation error:', error);
  } finally {
    await browser.close();
  }
}

// Run automation
runAutomation().catch(console.error);
