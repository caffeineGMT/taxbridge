#!/usr/bin/env tsx
/**
 * PostHog Setup Script - Automated Configuration
 *
 * This script automates PostHog funnel tracking setup:
 * 1. Checks current configuration
 * 2. Prompts for API key if missing
 * 3. Updates .env.local automatically
 * 4. Verifies configuration
 * 5. Provides next steps for Vercel and dashboard setup
 *
 * Usage:
 *   npx tsx scripts/setup-posthog.ts
 *
 * Prerequisites:
 *   - PostHog account (https://posthog.com)
 *   - Project API key from PostHog dashboard
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${question}${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function checkCurrentConfig(): Promise<{ hasKey: boolean; isPlaceholder: boolean; currentKey?: string }> {
  const envPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    return { hasKey: false, isPlaceholder: true };
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const keyMatch = envContent.match(/NEXT_PUBLIC_POSTHOG_KEY=(.+)/);

  if (!keyMatch) {
    return { hasKey: false, isPlaceholder: true };
  }

  const currentKey = keyMatch[1].trim();
  const isPlaceholder =
    currentKey.includes('your_project') ||
    currentKey.includes('YOUR_PROJECT') ||
    currentKey.includes('phc_your') ||
    currentKey.includes('phc_YOUR') ||
    currentKey === 'phc_your_project_api_key_here';

  return {
    hasKey: true,
    isPlaceholder,
    currentKey: isPlaceholder ? undefined : currentKey,
  };
}

function validatePostHogKey(key: string): boolean {
  // PostHog keys are in format: phc_ followed by 43 alphanumeric characters
  const regex = /^phc_[a-zA-Z0-9]{43}$/;
  return regex.test(key);
}

async function updateEnvFile(apiKey: string): Promise<void> {
  const envPath = path.join(process.cwd(), '.env.local');

  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  // Update or add PostHog key
  if (envContent.includes('NEXT_PUBLIC_POSTHOG_KEY=')) {
    // Replace existing key
    envContent = envContent.replace(
      /NEXT_PUBLIC_POSTHOG_KEY=.*/,
      `NEXT_PUBLIC_POSTHOG_KEY=${apiKey}`
    );
  } else {
    // Add new section
    envContent += `\n# PostHog Analytics (Funnel Tracking)\nNEXT_PUBLIC_POSTHOG_KEY=${apiKey}\n`;
  }

  // Ensure host is set
  if (!envContent.includes('NEXT_PUBLIC_POSTHOG_HOST=')) {
    envContent += `NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com\n`;
  }

  fs.writeFileSync(envPath, envContent);
  log('✅ Updated .env.local with PostHog API key', colors.green);
}

async function testPostHogAPI(apiKey: string): Promise<boolean> {
  log('\n🔍 Testing PostHog API connection...', colors.cyan);

  try {
    const testEvent = {
      api_key: apiKey,
      event: 'posthog_setup_test',
      properties: {
        distinct_id: 'setup_script',
        test_type: 'configuration_verification',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    const response = await fetch('https://app.posthog.com/capture/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEvent),
    });

    if (response.ok) {
      log('✅ PostHog API connection successful', colors.green);
      log('   Test event sent: posthog_setup_test', colors.reset);
      return true;
    } else {
      const errorText = await response.text();
      log(`❌ PostHog API error: HTTP ${response.status}`, colors.red);
      log(`   ${errorText}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Network error: ${error}`, colors.red);
    return false;
  }
}

function printVercelInstructions(apiKey: string): void {
  log('\n📦 Vercel Deployment Configuration', colors.yellow + colors.bold);
  log('═══════════════════════════════════════════════════════════', colors.yellow);

  log('\n1️⃣  Go to Vercel Dashboard:', colors.cyan);
  log('   https://vercel.com/your-project/settings/environment-variables\n', colors.reset);

  log('2️⃣  Add environment variable:', colors.cyan);
  log('   Variable: NEXT_PUBLIC_POSTHOG_KEY', colors.reset);
  log(`   Value: ${apiKey}`, colors.reset);
  log('   Environments: ✅ Production, ✅ Preview, ✅ Development\n', colors.reset);

  log('3️⃣  Click "Save" and redeploy:', colors.cyan);
  log('   Go to: Deployments → Latest → "Redeploy"', colors.reset);
  log('   Wait ~2 minutes for deployment to complete\n', colors.reset);
}

function printFunnelSetupGuide(): void {
  log('\n🎯 PostHog Dashboard Configuration', colors.yellow + colors.bold);
  log('═══════════════════════════════════════════════════════════', colors.yellow);

  log('\n1️⃣  Create Conversion Funnel:', colors.cyan);
  log('   → Go to: https://app.posthog.com/insights', colors.reset);
  log('   → Click: "New Insight" → "Funnel"\n', colors.reset);

  log('2️⃣  Add Funnel Steps (in this order):', colors.cyan);
  const steps = [
    'calculator_page_viewed',
    'tax_calculation_viewed',
    'signup_completed',
    'checkout_started',
    'checkout_completed',
    'subscription_activated',
  ];

  steps.forEach((step, index) => {
    log(`   Step ${index + 1}: ${step}`, colors.reset);
  });

  log('\n3️⃣  Configure Settings:', colors.cyan);
  log('   → Conversion window: 30 days', colors.reset);
  log('   → Breakdown by: utm_source, deviceType', colors.reset);
  log('   → Filters: Exclude test users (email not contains "test")\n', colors.reset);

  log('4️⃣  Save Funnel:', colors.cyan);
  log('   → Name: "Calculator to Paid Conversion"', colors.reset);
  log('   → Add to Dashboard: "Growth Metrics"\n', colors.reset);

  log('📖 Detailed Guide:', colors.blue);
  log('   docs/POSTHOG_FUNNEL_CONFIGURATION.md (790 lines)', colors.reset);
  log('   docs/POSTHOG_FUNNEL_FIX_EXECUTIVE_SUMMARY.md (executive summary)\n', colors.reset);
}

function printVerificationSteps(): void {
  log('\n✅ Verification Checklist', colors.yellow + colors.bold);
  log('═══════════════════════════════════════════════════════════', colors.yellow);

  log('\n1️⃣  Test locally:', colors.cyan);
  log('   $ npm run dev', colors.reset);
  log('   Open: http://localhost:3000', colors.reset);
  log('   Open browser console → Type: window.posthog', colors.reset);
  log('   Should see: PostHog object (not undefined)\n', colors.reset);

  log('2️⃣  Run verification script:', colors.cyan);
  log('   $ npx tsx scripts/verify-posthog-funnel-tracking.ts', colors.reset);
  log('   Expected: All checks ✅ PASSED\n', colors.reset);

  log('3️⃣  Test event tracking:', colors.cyan);
  log('   → Fill out calculator on localhost:3000', colors.reset);
  log('   → Submit calculation', colors.reset);
  log('   → Go to PostHog → Activity → Events', colors.reset);
  log('   → Look for: tax_calculation_viewed (within 60 seconds)\n', colors.reset);

  log('4️⃣  After Vercel deployment:', colors.cyan);
  log('   → Visit: https://taxbridgecpa.com', colors.reset);
  log('   → Complete calculator flow', colors.reset);
  log('   → Verify events appear in PostHog dashboard\n', colors.reset);
}

async function main() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════╗', colors.cyan + colors.bold);
  log('║   PostHog Funnel Tracking - Automated Setup                       ║', colors.cyan + colors.bold);
  log('║   TaxBridge Revenue Analytics Configuration                       ║', colors.cyan + colors.bold);
  log('╚════════════════════════════════════════════════════════════════════╝', colors.cyan + colors.bold);
  log('', colors.reset);

  // Step 1: Check current configuration
  log('📋 Step 1: Checking current configuration...', colors.cyan);
  const config = await checkCurrentConfig();

  if (!config.isPlaceholder && config.currentKey) {
    log('✅ PostHog is already configured!', colors.green);
    log(`   Current key: ${config.currentKey.substring(0, 10)}...`, colors.reset);

    const reconfigure = await prompt('\nDo you want to reconfigure? (y/N): ');
    if (reconfigure.toLowerCase() !== 'y' && reconfigure.toLowerCase() !== 'yes') {
      log('\n✅ Setup complete. PostHog is ready to use.', colors.green);
      printVerificationSteps();
      return;
    }
  } else {
    log('⚠️  PostHog API key not configured or is placeholder', colors.yellow);
    log('   Current: phc_your_project_api_key_here', colors.reset);
  }

  // Step 2: Get PostHog API key
  log('\n📝 Step 2: Get your PostHog API key', colors.cyan);
  log('\n   1. Go to: https://app.posthog.com/project/settings', colors.reset);
  log('   2. Log in (or create account if needed)', colors.reset);
  log('   3. Copy your "Project API Key"', colors.reset);
  log('      Format: phc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (47 chars)\n', colors.reset);

  let apiKey = '';
  let validKey = false;

  while (!validKey) {
    apiKey = await prompt('Paste your PostHog API key: ');

    if (!apiKey) {
      log('❌ API key is required. Please try again.', colors.red);
      continue;
    }

    if (!validatePostHogKey(apiKey)) {
      log('❌ Invalid API key format.', colors.red);
      log('   Expected: phc_ followed by 43 alphanumeric characters', colors.yellow);
      log('   Example: phc_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbC', colors.yellow);

      const retry = await prompt('Try again? (Y/n): ');
      if (retry.toLowerCase() === 'n' || retry.toLowerCase() === 'no') {
        log('\n❌ Setup cancelled.', colors.red);
        process.exit(1);
      }
    } else {
      validKey = true;
    }
  }

  // Step 3: Test API key
  log('\n📡 Step 3: Testing API key...', colors.cyan);
  const apiWorks = await testPostHogAPI(apiKey);

  if (!apiWorks) {
    log('\n❌ API key test failed.', colors.red);
    log('   Please verify your key and try again.', colors.yellow);
    const continueAnyway = await prompt('Continue anyway? (y/N): ');

    if (continueAnyway.toLowerCase() !== 'y' && continueAnyway.toLowerCase() !== 'yes') {
      log('\n❌ Setup cancelled.', colors.red);
      process.exit(1);
    }
  }

  // Step 4: Update .env.local
  log('\n💾 Step 4: Updating .env.local...', colors.cyan);
  await updateEnvFile(apiKey);

  // Step 5: Print next steps
  log('\n🎉 SUCCESS! PostHog is configured locally.', colors.green + colors.bold);
  log('═══════════════════════════════════════════════════════════', colors.green);

  printVercelInstructions(apiKey);
  printFunnelSetupGuide();
  printVerificationSteps();

  log('\n📊 Impact:', colors.yellow + colors.bold);
  log('   ✅ Conversion rate tracking enabled', colors.green);
  log('   ✅ Drop-off point identification', colors.green);
  log('   ✅ Channel ROI measurement', colors.green);
  log('   ✅ A/B testing validation', colors.green);
  log('   ✅ Revenue optimization unblocked', colors.green);

  log('\n⏱️  Time to complete remaining steps: 10 minutes', colors.cyan);
  log('💰 Revenue impact: Enables data-driven growth optimization\n', colors.cyan);

  log('Next: Run verification script:', colors.bold);
  log('   npx tsx scripts/verify-posthog-funnel-tracking.ts\n', colors.reset);
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error}`, colors.red + colors.bold);
  process.exit(1);
});
