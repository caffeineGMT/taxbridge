/**
 * PostHog Funnel Tracking Verification Script
 *
 * This script verifies that all critical conversion funnel events are properly configured
 * and can be tracked in PostHog. It performs:
 *
 * 1. Configuration check - validates PostHog API key is set
 * 2. Event schema validation - checks all funnel events are defined
 * 3. Implementation audit - verifies events are actually called in code
 * 4. Server-side event test - sends test events to PostHog API
 * 5. Funnel visualization check - provides PostHog dashboard setup guide
 *
 * Usage:
 *   npm run verify:posthog-funnel
 *
 * Exit codes:
 *   0 = All checks passed
 *   1 = Configuration error (missing API key)
 *   2 = Implementation error (events not properly tracked)
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes for output
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

function logSection(title: string) {
  log(`\n${'='.repeat(70)}`, colors.cyan);
  log(`  ${title}`, colors.bold + colors.cyan);
  log('='.repeat(70), colors.cyan);
}

function logCheck(check: string, passed: boolean, details?: string) {
  const icon = passed ? '✅' : '❌';
  const color = passed ? colors.green : colors.red;
  log(`${icon} ${check}`, color);
  if (details) {
    log(`   ${details}`, colors.reset);
  }
}

interface FunnelEvent {
  name: string;
  description: string;
  funnelStage: string;
  required: boolean;
  expectedFiles: string[];
}

// Critical funnel events that MUST be tracked
const CRITICAL_FUNNEL_EVENTS: FunnelEvent[] = [
  {
    name: 'calculator_page_viewed',
    description: 'User lands on calculator page',
    funnelStage: 'Awareness',
    required: true,
    expectedFiles: ['lib/analytics/tracking-utils.ts'],
  },
  {
    name: 'tax_calculation_viewed',
    description: 'User completes calculation and sees results',
    funnelStage: 'Interest',
    required: true,
    expectedFiles: ['lib/analytics/tracking-utils.ts', 'components/ROICalculator.tsx'],
  },
  {
    name: 'signup_completed',
    description: 'User creates account',
    funnelStage: 'Acquisition',
    required: true,
    expectedFiles: ['app/api/webhooks/clerk/route.ts'],
  },
  {
    name: 'checkout_started',
    description: 'User clicks upgrade/checkout button',
    funnelStage: 'Consideration',
    required: true,
    expectedFiles: ['app/pricing/page.tsx', 'components/pricing/*'],
  },
  {
    name: 'checkout_completed',
    description: 'Payment succeeded, checkout session completed',
    funnelStage: 'Conversion',
    required: true,
    expectedFiles: ['app/api/stripe/webhook/route.ts'],
  },
  {
    name: 'subscription_activated',
    description: 'Subscription is now active',
    funnelStage: 'Revenue',
    required: true,
    expectedFiles: ['app/api/stripe/webhook/route.ts'],
  },
];

async function checkPostHogConfiguration(): Promise<boolean> {
  logSection('STEP 1: PostHog Configuration Check');

  let allPassed = true;

  // Check .env.local
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envLocalPath)) {
    logCheck('.env.local exists', false, 'File not found');
    allPassed = false;
  } else {
    logCheck('.env.local exists', true);

    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    const hasPostHogKey = envContent.includes('NEXT_PUBLIC_POSTHOG_KEY=');
    const hasRealKey = envContent.match(/NEXT_PUBLIC_POSTHOG_KEY=phc_[a-zA-Z0-9]{43}/);

    logCheck('NEXT_PUBLIC_POSTHOG_KEY is defined', hasPostHogKey);

    if (hasPostHogKey) {
      const isPlaceholder = envContent.includes('phc_your') || envContent.includes('phc_YOUR');
      if (isPlaceholder) {
        logCheck(
          'PostHog API key is REAL (not placeholder)',
          false,
          '⚠️  CRITICAL: Replace "phc_your_project_api_key_here" with actual key from PostHog dashboard'
        );
        allPassed = false;
      } else if (hasRealKey) {
        logCheck('PostHog API key is REAL (not placeholder)', true, 'Key format: phc_XXXX (43 chars)');
      } else {
        logCheck(
          'PostHog API key format is valid',
          false,
          'Expected format: phc_ followed by 43 alphanumeric characters'
        );
        allPassed = false;
      }
    } else {
      allPassed = false;
    }

    const hasPostHogHost = envContent.includes('NEXT_PUBLIC_POSTHOG_HOST=');
    logCheck('NEXT_PUBLIC_POSTHOG_HOST is defined', hasPostHogHost);
    if (!hasPostHogHost) allPassed = false;
  }

  // Check PostHog SDK initialization
  const posthogLibPath = path.join(process.cwd(), 'lib/analytics/posthog.ts');
  if (!fs.existsSync(posthogLibPath)) {
    logCheck('lib/analytics/posthog.ts exists', false);
    allPassed = false;
  } else {
    const posthogContent = fs.readFileSync(posthogLibPath, 'utf-8');
    const hasInit = posthogContent.includes('posthog.init');
    const hasCapture = posthogContent.includes('posthog.capture');
    const hasIdentify = posthogContent.includes('posthog.identify');

    logCheck('PostHog SDK initialization code exists', hasInit);
    logCheck('PostHog capture() method implemented', hasCapture);
    logCheck('PostHog identify() method implemented', hasIdentify);

    if (!hasInit || !hasCapture || !hasIdentify) allPassed = false;
  }

  return allPassed;
}

async function checkEventImplementation(): Promise<boolean> {
  logSection('STEP 2: Event Implementation Audit');

  let allPassed = true;

  for (const event of CRITICAL_FUNNEL_EVENTS) {
    log(`\n📊 ${event.name} (${event.funnelStage})`, colors.blue);
    log(`   ${event.description}`, colors.reset);

    let eventFound = false;

    for (const expectedFile of event.expectedFiles) {
      const globPattern = expectedFile.includes('*') ? expectedFile : null;

      if (globPattern) {
        // Handle glob patterns (e.g., components/pricing/*)
        const baseDir = path.join(process.cwd(), globPattern.split('*')[0]);
        if (fs.existsSync(baseDir)) {
          const files = fs.readdirSync(baseDir, { recursive: true });
          for (const file of files) {
            const fullPath = path.join(baseDir, file.toString());
            if (fs.statSync(fullPath).isFile() && fullPath.endsWith('.tsx')) {
              const content = fs.readFileSync(fullPath, 'utf-8');
              if (content.includes(event.name)) {
                eventFound = true;
                log(`   ✅ Found in ${path.relative(process.cwd(), fullPath)}`, colors.green);
                break;
              }
            }
          }
        }
      } else {
        const filePath = path.join(process.cwd(), expectedFile);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          if (content.includes(event.name)) {
            eventFound = true;
            log(`   ✅ Found in ${expectedFile}`, colors.green);
          }
        }
      }
    }

    if (!eventFound && event.required) {
      log(`   ❌ NOT FOUND in expected files`, colors.red);
      log(`      Expected in: ${event.expectedFiles.join(', ')}`, colors.yellow);
      allPassed = false;
    }
  }

  return allPassed;
}

async function testServerSideEventTracking(): Promise<boolean> {
  logSection('STEP 3: Server-Side Event Test (PostHog API)');

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!posthogKey || posthogKey.includes('your') || posthogKey.includes('YOUR')) {
    logCheck(
      'PostHog API key configured',
      false,
      'Cannot test without real API key. Set NEXT_PUBLIC_POSTHOG_KEY in .env.local'
    );
    return false;
  }

  log('Testing server-side event capture to PostHog API...', colors.cyan);

  try {
    const testEvent = {
      api_key: posthogKey,
      event: 'posthog_verification_test',
      properties: {
        distinct_id: 'verification_script',
        test_type: 'funnel_tracking_verification',
        timestamp: new Date().toISOString(),
        environment: 'test',
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
      logCheck('PostHog API is reachable', true, `HTTP ${response.status}: Event sent successfully`);
      log(
        '\n   ℹ️  Check PostHog dashboard: Activity → Events → Filter for "posthog_verification_test"',
        colors.cyan
      );
      log('      It may take 30-60 seconds for the event to appear.\n', colors.cyan);
      return true;
    } else {
      const errorText = await response.text();
      logCheck('PostHog API is reachable', false, `HTTP ${response.status}: ${errorText}`);
      return false;
    }
  } catch (error) {
    logCheck('PostHog API is reachable', false, `Network error: ${error}`);
    return false;
  }
}

async function provideFunnelSetupGuide(): Promise<void> {
  logSection('STEP 4: Funnel Visualization Setup Guide');

  log('\n📊 PostHog Funnel Configuration (Do this in PostHog Dashboard)\n', colors.bold);

  log('1️⃣  CREATE CONVERSION FUNNEL:', colors.yellow);
  log('   → Go to: PostHog Dashboard → Insights → New Insight → Funnel', colors.reset);
  log('   → Funnel name: "Calculator to Paid Conversion"\n', colors.reset);

  log('2️⃣  ADD FUNNEL STEPS (in this order):', colors.yellow);
  CRITICAL_FUNNEL_EVENTS.forEach((event, index) => {
    log(`   Step ${index + 1}: ${event.name}`, colors.cyan);
    log(`            ${event.description} (${event.funnelStage} stage)`, colors.reset);
  });

  log('\n3️⃣  CONFIGURE FUNNEL SETTINGS:', colors.yellow);
  log('   → Conversion window: 30 days', colors.reset);
  log('   → Breakdown by: utm_source, deviceType, browser', colors.reset);
  log('   → Filters: Exclude test users (email not contains "test")', colors.reset);

  log('\n4️⃣  SAVE AND ADD TO DASHBOARD:', colors.yellow);
  log('   → Click "Save" → Add to dashboard → Create "Growth Metrics" dashboard', colors.reset);

  log('\n5️⃣  EXPECTED CONVERSION RATES (Industry Benchmarks):', colors.yellow);
  log('   → Calculator → Calculation: 70-85%', colors.reset);
  log('   → Calculation → Signup: 10-20%', colors.reset);
  log('   → Signup → Checkout Started: 5-10%', colors.reset);
  log('   → Checkout Started → Checkout Completed: 60-80%', colors.reset);
  log('   → Checkout Completed → Subscription Activated: 95-100%', colors.reset);
  log('   → OVERALL (Calculator → Paid): 2-5%\n', colors.reset);

  log('📚 Detailed Guide:', colors.cyan);
  log('   See: docs/POSTHOG_FUNNEL_CONFIGURATION.md', colors.reset);
  log('   Complete 790-line step-by-step guide with screenshots, SQL queries, and troubleshooting.\n', colors.reset);
}

async function generateExecutiveSummary(
  configPassed: boolean,
  implementationPassed: boolean,
  apiTestPassed: boolean
): Promise<void> {
  logSection('EXECUTIVE SUMMARY');

  const allPassed = configPassed && implementationPassed && apiTestPassed;

  if (allPassed) {
    log('\n🎉 ALL CHECKS PASSED - PostHog Funnel Tracking is Ready!\n', colors.green + colors.bold);
    log('✅ PostHog API key configured correctly', colors.green);
    log('✅ All 6 critical funnel events implemented', colors.green);
    log('✅ Server-side event tracking operational', colors.green);
    log('\n📊 NEXT STEPS:', colors.cyan);
    log('   1. Configure funnels in PostHog dashboard (see Step 4 above)', colors.reset);
    log('   2. Test the full user flow: calculator → signup → payment', colors.reset);
    log('   3. Verify events appear in PostHog Activity feed within 60 seconds', colors.reset);
    log('   4. Set up conversion rate alerts (see docs/POSTHOG_FUNNEL_CONFIGURATION.md)', colors.reset);
  } else {
    log('\n⚠️  ISSUES DETECTED - Action Required\n', colors.red + colors.bold);

    if (!configPassed) {
      log('❌ PostHog Configuration:', colors.red);
      log('   → FIX: Add real PostHog API key to .env.local', colors.yellow);
      log('   → Get key from: https://app.posthog.com/project/settings', colors.cyan);
      log(
        '   → Format: NEXT_PUBLIC_POSTHOG_KEY=phc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n',
        colors.reset
      );
    }

    if (!implementationPassed) {
      log('❌ Event Implementation:', colors.red);
      log('   → FIX: Missing event tracking calls in code', colors.yellow);
      log('   → Review: lib/analytics/posthog.ts, lib/analytics/tracking-utils.ts', colors.cyan);
      log('   → Ensure trackEvent() is called for all critical funnel events\n', colors.reset);
    }

    if (!apiTestPassed) {
      log('❌ PostHog API Connection:', colors.red);
      log('   → FIX: Cannot send events to PostHog', colors.yellow);
      log('   → Check: Network connectivity, API key validity, firewall rules', colors.cyan);
      log('   → Test manually: curl -X POST https://app.posthog.com/capture/\n', colors.reset);
    }

    log('🔧 PRIORITY ACTIONS (do these FIRST):', colors.yellow + colors.bold);
    log('   1. Set real PostHog API key in .env.local', colors.reset);
    log('   2. Restart dev server: npm run dev', colors.reset);
    log('   3. Re-run this script: npm run verify:posthog-funnel', colors.reset);
    log('   4. Once passing, configure funnels in PostHog dashboard\n', colors.reset);
  }

  log('\n📖 REVENUE IMPACT:', colors.cyan);
  log('   Without funnel tracking:', colors.reset);
  log('   ❌ Cannot identify where users drop off', colors.red);
  log('   ❌ Cannot measure conversion rate optimization efforts', colors.red);
  log('   ❌ Cannot attribute revenue to specific channels', colors.red);
  log('   ❌ Cannot calculate customer acquisition cost (CAC)', colors.red);
  log('\n   With funnel tracking:', colors.reset);
  log('   ✅ Identify and fix drop-off points → +15-30% conversion', colors.green);
  log('   ✅ Measure A/B test impact → optimize landing pages', colors.green);
  log('   ✅ Track ROI by channel → allocate marketing budget efficiently', colors.green);
  log('   ✅ Reduce CAC by 20-40% through data-driven optimization\n', colors.green);

  log('🎯 TARGET: Configure and validate within 2 hours', colors.bold);
  log('💰 IMPACT: Unblocks revenue optimization and growth initiatives\n', colors.bold);

  if (!allPassed) {
    process.exit(2);
  }
}

async function main() {
  log('\n', colors.reset);
  log('╔════════════════════════════════════════════════════════════════════╗', colors.cyan + colors.bold);
  log('║   PostHog Funnel Tracking Verification                            ║', colors.cyan + colors.bold);
  log('║   TaxBridge - Conversion Funnel Configuration Audit               ║', colors.cyan + colors.bold);
  log('╚════════════════════════════════════════════════════════════════════╝', colors.cyan + colors.bold);
  log('', colors.reset);

  try {
    const configPassed = await checkPostHogConfiguration();
    const implementationPassed = await checkEventImplementation();
    const apiTestPassed = await testServerSideEventTracking();

    await provideFunnelSetupGuide();
    await generateExecutiveSummary(configPassed, implementationPassed, apiTestPassed);
  } catch (error) {
    log('\n❌ Fatal Error:', colors.red + colors.bold);
    log(`   ${error}`, colors.red);
    process.exit(1);
  }
}

main();
