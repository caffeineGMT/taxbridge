#!/usr/bin/env tsx
/**
 * LinkedIn Message Follow-up Automation
 *
 * Send warm intro messages after connection acceptance
 *
 * Usage:
 *   tsx scripts/linkedin-message-followup.ts --dry-run (test mode)
 *   tsx scripts/linkedin-message-followup.ts --limit 5 (send 5 messages)
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import {
  getProspectsForMessage,
  updateHRProspectStatus,
  logLinkedInAction
} from '../lib/db/queries/hr-prospects';

// LinkedIn credentials from .env
const LINKEDIN_EMAIL = process.env.LINKEDIN_EMAIL;
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD;

// Calendly booking link
const CALENDLY_URL = process.env.CALENDLY_URL || 'https://calendly.com/taxbridge/demo';

// Rate limits
const DELAY_BETWEEN_MESSAGES = 4000; // 4 seconds

// Command line args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit'));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 5;

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
 * Generate personalized follow-up message
 */
function generateFollowupMessage(prospect: {
  name: string;
  company: string;
  title: string;
}): string {
  const firstName = getFirstName(prospect.name);

  // Count of companies we're working with (update as we sign more)
  const companyCount = 3; // Meta, Google, Amazon (adjust as needed)

  const message = `Thanks for connecting, ${firstName}!

I built TaxBridge to help H-1B employees at ${prospect.company} save $3K-12K/year on cross-border RSU taxes (US+Canada filing). We're working with ${companyCount} tech companies to offer this as an employee benefit.

Would a 15-min demo be useful for your Benefits team? Here's a time picker: ${CALENDLY_URL}

Happy to share our ROI calculator showing how much your team could save vs traditional CPA fees.

Best,
Michael`;

  return message;
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

    await page.type('#username', LINKEDIN_EMAIL!, { delay: 100 });
    await page.type('#password', LINKEDIN_PASSWORD!, { delay: 100 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

    const url = page.url();
    if (url.includes('/checkpoint/') || url.includes('/verify')) {
      console.error('⚠️  LinkedIn security checkpoint detected!');
      return false;
    }

    if (url.includes('/feed/') || url.includes('/mynetwork/')) {
      console.log('✅ Successfully logged in to LinkedIn\n');
      return true;
    }

    return false;

  } catch (error) {
    console.error('❌ Login error:', error);
    return false;
  }
}

/**
 * Send message to a prospect
 */
async function sendMessage(
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
    console.log(`\n👤 Messaging: ${prospect.name} (${prospect.title} at ${prospect.company})`);

    if (dryRun) {
      console.log(`   [DRY RUN] Would navigate to: ${prospect.linkedin_url}`);
      const message = generateFollowupMessage(prospect);
      console.log(`   [DRY RUN] Would send message:\n${message}\n`);
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
      console.error('   ⚠️  Anti-bot detection triggered!');
      return { success: false, error: 'Anti-bot detection' };
    }

    // Look for "Message" button
    const messageButton = await page.$('button:has-text("Message")') ||
                          await page.$('button[aria-label*="Message"]') ||
                          await page.$('.pvs-profile-actions button:has-text("Message")');

    if (!messageButton) {
      console.log('   ⚠️  Message button not found (may not be connected yet)');
      return { success: false, error: 'Message button not found' };
    }

    // Click Message button
    await messageButton.click();
    await sleep(2000);

    // Find message input field
    const messageInput = await page.$('.msg-form__contenteditable') ||
                         await page.$('div[role="textbox"]') ||
                         await page.$('.msg-form__msg-content-container--scrollable');

    if (!messageInput) {
      console.log('   ⚠️  Message input not found');
      return { success: false, error: 'Message input not found' };
    }

    // Type message
    const message = generateFollowupMessage(prospect);
    await messageInput.click();
    await sleep(500);

    // Type with realistic delays
    for (const char of message) {
      await page.keyboard.type(char, { delay: Math.random() * 50 + 20 });
    }

    console.log(`   📝 Typed message (${message.length} characters)`);
    await sleep(1500);

    // Click Send button
    const sendButton = await page.$('button:has-text("Send")') ||
                       await page.$('button[type="submit"]') ||
                       await page.$('.msg-form__send-button');

    if (sendButton) {
      await sendButton.click();
      console.log('   ✅ Message sent!');
      await sleep(2000);
      return { success: true };
    } else {
      console.log('   ⚠️  Send button not found');
      return { success: false, error: 'Send button not found' };
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`   ❌ Error sending message: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

/**
 * Main automation flow
 */
async function runAutomation() {
  console.log('🚀 LinkedIn Message Follow-up Automation\n');

  // Validate environment
  if (!LINKEDIN_EMAIL || !LINKEDIN_PASSWORD) {
    console.error('❌ Missing LinkedIn credentials!');
    console.log('Please set LINKEDIN_EMAIL and LINKEDIN_PASSWORD in your .env file\n');
    process.exit(1);
  }

  if (isDryRun) {
    console.log(`🧪 DRY RUN MODE - No actual messages will be sent\n`);
  } else {
    console.log(`🎯 Target: Send ${limit} follow-up messages\n`);
  }

  // Get prospects ready for message
  const prospects = getProspectsForMessage(limit);

  if (prospects.length === 0) {
    console.log('⚠️  No connected prospects ready for follow-up message\n');
    console.log('Once connections are accepted, manually update their status to "connected" in the database.\n');
    console.log('Or check the admin dashboard: http://localhost:3000/admin/hr-outreach\n');
    process.exit(0);
  }

  console.log(`📋 Found ${prospects.length} prospects ready for follow-up\n`);

  // Launch browser
  console.log('🌐 Launching browser...');
  const browser: Browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page: Page = await browser.newPage();

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

    // Send messages
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < prospects.length; i++) {
      const prospect = prospects[i];

      console.log(`\n[${i + 1}/${prospects.length}] Processing ${prospect.name}...`);

      const result = await sendMessage(page, prospect, isDryRun);

      // Log action to database
      if (!isDryRun) {
        logLinkedInAction({
          action_type: 'message',
          prospect_id: prospect.id,
          success: result.success,
          error_message: result.error
        });

        // Update prospect status
        if (result.success) {
          updateHRProspectStatus(prospect.id, 'message_sent', {
            message_sent_date: new Date().toISOString()
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
        const delay = DELAY_BETWEEN_MESSAGES + Math.random() * 2000; // Random 4-6s
        console.log(`   ⏳ Waiting ${Math.round(delay / 1000)}s before next message...`);
        await sleep(delay);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary\n');
    console.log(`Total processed: ${prospects.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    console.log('\n🎯 Next steps:');
    console.log('1. Monitor Calendly for demo bookings');
    console.log('2. Check dashboard: http://localhost:3000/admin/hr-outreach');
    console.log('3. Follow up with prospects who book demos\n');

  } catch (error) {
    console.error('\n❌ Automation error:', error);
  } finally {
    await browser.close();
  }
}

// Run automation
runAutomation().catch(console.error);
