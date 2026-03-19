#!/usr/bin/env tsx
/**
 * PostHog Test Event Sender
 *
 * Sends test events to PostHog to verify production integration
 *
 * Usage:
 *   npm run test:posthog
 *   npx tsx scripts/test-posthog-events.ts
 */

import { PostHog } from 'posthog-node';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

async function sendTestEvents() {
  console.log('🧪 PostHog Test Event Sender\n');
  console.log('═══════════════════════════════════════════════════════\n');

  if (!POSTHOG_KEY || POSTHOG_KEY.includes('YOUR_PROJECT')) {
    console.error('❌ Error: NEXT_PUBLIC_POSTHOG_KEY is not configured');
    console.error('   Set this in .env.production or Vercel dashboard');
    process.exit(1);
  }

  console.log(`📡 Connecting to PostHog...`);
  console.log(`   Host: ${POSTHOG_HOST}`);
  console.log(`   Key: ${POSTHOG_KEY.substring(0, 15)}...\n`);

  const client = new PostHog(POSTHOG_KEY, {
    host: POSTHOG_HOST,
  });

  const testUserId = `test-user-${Date.now()}`;
  const sessionId = `session-${Date.now()}`;

  console.log('📤 Sending test events...\n');

  // Event 1: Landing Page View
  console.log('1️⃣ Sending: landing_page_viewed');
  client.capture({
    distinctId: testUserId,
    event: 'landing_page_viewed',
    properties: {
      page: '/',
      utm_source: 'test_script',
      utm_medium: 'automated_test',
      utm_campaign: 'posthog_verification',
      referrer: 'direct',
      session_id: sessionId,
      timestamp: new Date().toISOString(),
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 100));

  // Event 2: Calculator Page View
  console.log('2️⃣ Sending: calculator_page_viewed');
  client.capture({
    distinctId: testUserId,
    event: 'calculator_page_viewed',
    properties: {
      page: '/us-canada-tax-calculator',
      session_id: sessionId,
      timestamp: new Date().toISOString(),
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 100));

  // Event 3: Tax Calculation
  console.log('3️⃣ Sending: tax_calculation_viewed');
  client.capture({
    distinctId: testUserId,
    event: 'tax_calculation_viewed',
    properties: {
      usIncome: 100000,
      rsuIncome: 50000,
      canadaProvince: 'BC',
      usState: 'WA',
      usTotalTax: 28500,
      canadaTotalTax: 22800,
      ftcSavings: 18200,
      effectiveSavings: 18200,
      calculationNumber: 1,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 100));

  // Event 4: Pricing Page View
  console.log('4️⃣ Sending: pricing_page_viewed');
  client.capture({
    distinctId: testUserId,
    event: 'pricing_page_viewed',
    properties: {
      page: '/pricing',
      session_id: sessionId,
      timestamp: new Date().toISOString(),
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 100));

  // Event 5: Upgrade Button Click
  console.log('5️⃣ Sending: upgrade_button_clicked');
  client.capture({
    distinctId: testUserId,
    event: 'upgrade_button_clicked',
    properties: {
      plan: 'pro',
      price: 79,
      billingInterval: 'annual',
      source: 'pricing_page',
      session_id: sessionId,
      timestamp: new Date().toISOString(),
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 100));

  // Event 6: User Identification
  console.log('6️⃣ Sending: User identification');
  client.identify({
    distinctId: testUserId,
    properties: {
      email: 'test@taxbridge.app',
      name: 'Test User',
      tier: 'free',
      createdAt: new Date().toISOString(),
      environment: 'production_test',
    },
  });

  // Flush all events
  console.log('\n⏳ Flushing events to PostHog...');
  await client.shutdown();

  console.log('✅ All test events sent successfully!\n');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('📊 Verify Events in PostHog Dashboard:\n');
  console.log(`   1. Go to: ${POSTHOG_HOST}/events`);
  console.log(`   2. Look for distinctId: ${testUserId}`);
  console.log('   3. You should see 6 events:');
  console.log('      - landing_page_viewed');
  console.log('      - calculator_page_viewed');
  console.log('      - tax_calculation_viewed');
  console.log('      - pricing_page_viewed');
  console.log('      - upgrade_button_clicked');
  console.log('      - User identification\n');
  console.log('⏱️  Events should appear within 30-60 seconds\n');
  console.log('📸 Screenshot the live events view for verification!\n');
}

sendTestEvents().catch((error) => {
  console.error('\n❌ Error sending test events:', error);
  process.exit(1);
});
