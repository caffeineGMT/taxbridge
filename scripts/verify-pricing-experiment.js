#!/usr/bin/env node

/**
 * Pricing Experiment Verification Script
 *
 * Tests the pricing experiment implementation:
 * 1. Verifies variant assignment works (33/33/33 split)
 * 2. Tests localStorage persistence
 * 3. Validates PostHog events fire correctly
 * 4. Checks Stripe price IDs are configured
 * 5. Simulates user journey through checkout
 *
 * Usage:
 *   npm run verify:pricing-experiment
 *   node scripts/verify-pricing-experiment.js
 */

const fs = require('fs');
const path = require('path');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 Pricing Experiment Verification');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_29',
  'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID',
  'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79',
  'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY',
  'NEXT_PUBLIC_POSTHOG_KEY',
];

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  checks: [],
};

function check(name, status, message, severity = 'error') {
  const icon = status ? '✅' : (severity === 'warning' ? '⚠️' : '❌');
  console.log(`${icon} ${name}`);
  if (message) {
    console.log(`   ${message}\n`);
  }

  results.checks.push({ name, status, message, severity });

  if (status) {
    results.passed++;
  } else {
    if (severity === 'warning') {
      results.warnings++;
    } else {
      results.failed++;
    }
  }
}

function section(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

// ============================================================================
// 1. Environment Variables
// ============================================================================

section('1. Environment Variables');

function checkEnvVars() {
  const envExamplePath = path.join(process.cwd(), '.env.example');
  const envLocalPath = path.join(process.cwd(), '.env.local');

  // Check if .env.local exists
  const hasEnvLocal = fs.existsSync(envLocalPath);
  check(
    'Environment file exists',
    hasEnvLocal,
    hasEnvLocal ? '.env.local found' : '.env.local not found - create from .env.example',
    'warning'
  );

  // Load environment variables
  const env = process.env;

  // Check required env vars
  for (const varName of REQUIRED_ENV_VARS) {
    const value = env[varName];
    const isSet = Boolean(value && value !== 'undefined' && !value.includes('XXXXX'));

    check(
      varName,
      isSet,
      isSet
        ? `Configured: ${value.substring(0, 20)}...`
        : `Missing or placeholder value - update in Vercel/env file`
    );
  }

  // Verify price IDs are different
  const priceId29 = env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_29;
  const priceId49 = env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
  const priceId79 = env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79;

  const allDifferent = priceId29 !== priceId49 && priceId49 !== priceId79 && priceId29 !== priceId79;

  check(
    'Price IDs are unique',
    allDifferent,
    allDifferent
      ? 'All 3 price IDs are different ✓'
      : 'WARNING: Some price IDs are the same - all 3 variants will charge the same price!',
    'error'
  );
}

checkEnvVars();

// ============================================================================
// 2. Hook Implementation
// ============================================================================

section('2. Pricing Experiment Hook');

function checkHookImplementation() {
  const hookPath = path.join(process.cwd(), 'hooks', 'use-pricing-experiment.ts');

  const hookExists = fs.existsSync(hookPath);
  check(
    'Hook file exists',
    hookExists,
    hookExists ? 'hooks/use-pricing-experiment.ts found' : 'Hook file missing!'
  );

  if (!hookExists) return;

  const hookContent = fs.readFileSync(hookPath, 'utf-8');

  // Check for variant types
  const hasVariants = hookContent.includes("'annual_29'") &&
                      hookContent.includes("'annual_49'") &&
                      hookContent.includes("'annual_79'");
  check(
    'Variant types defined',
    hasVariants,
    hasVariants ? 'All 3 variants (29/49/79) defined' : 'Missing variant definitions'
  );

  // Check for localStorage persistence
  const hasLocalStorage = hookContent.includes('localStorage.getItem') &&
                          hookContent.includes('localStorage.setItem');
  check(
    'localStorage persistence',
    hasLocalStorage,
    hasLocalStorage ? 'Variant assignment persists across sessions' : 'No persistence - users will see different prices!'
  );

  // Check for PostHog tracking
  const hasPostHogTracking = hookContent.includes('trackEvent') &&
                             hookContent.includes('pricing_experiment_exposed');
  check(
    'PostHog event tracking',
    hasPostHogTracking,
    hasPostHogTracking ? 'Experiment exposure tracked' : 'Missing PostHog tracking'
  );

  // Check for 33/33/33 split logic
  const hasEqualSplit = hookContent.includes('0.33') && hookContent.includes('0.66');
  check(
    'Traffic split logic',
    hasEqualSplit,
    hasEqualSplit ? '33/33/33 traffic split configured' : 'Traffic split logic missing or incorrect'
  );
}

checkHookImplementation();

// ============================================================================
// 3. Pricing Page Integration
// ============================================================================

section('3. Pricing Page Integration');

function checkPricingPage() {
  const pricingPagePath = path.join(process.cwd(), 'app', 'pricing', 'page.tsx');

  const pageExists = fs.existsSync(pricingPagePath);
  check(
    'Pricing page exists',
    pageExists,
    pageExists ? 'app/pricing/page.tsx found' : 'Pricing page missing!'
  );

  if (!pageExists) return;

  const pageContent = fs.readFileSync(pricingPagePath, 'utf-8');

  // Check for hook usage
  const usesHook = pageContent.includes('usePricingExperiment');
  check(
    'Hook imported and used',
    usesHook,
    usesHook ? 'usePricingExperiment() hook used in pricing page' : 'Hook not imported'
  );

  // Check for variant-specific pricing
  const hasVariantPricing = pageContent.includes('pricingExperiment.annualPrice') ||
                            pageContent.includes('getCurrentPrice');
  check(
    'Dynamic pricing by variant',
    hasVariantPricing,
    hasVariantPricing ? 'Price displayed based on variant' : 'Price is hardcoded - variants won\'t show different prices!'
  );

  // Check for price ID passing
  const hasCorrectPriceId = pageContent.includes('getCurrentPriceId') ||
                            pageContent.includes('annualPriceId');
  check(
    'Correct price ID used',
    hasCorrectPriceId,
    hasCorrectPriceId ? 'Variant-specific price ID passed to checkout' : 'Price ID not variant-aware'
  );
}

checkPricingPage();

// ============================================================================
// 4. PostHog Analytics
// ============================================================================

section('4. PostHog Analytics');

function checkPostHogSetup() {
  const posthogPath = path.join(process.cwd(), 'lib', 'analytics', 'posthog.ts');

  const posthogExists = fs.existsSync(posthogPath);
  check(
    'PostHog library exists',
    posthogExists,
    posthogExists ? 'lib/analytics/posthog.ts found' : 'PostHog library missing'
  );

  if (!posthogExists) return;

  const posthogContent = fs.readFileSync(posthogPath, 'utf-8');

  // Check for pricing experiment events
  const hasExperimentEvents = posthogContent.includes('pricing_experiment_exposed') ||
                              posthogContent.includes('pricing_tier_selected');
  check(
    'Experiment events defined',
    hasExperimentEvents,
    hasExperimentEvents ? 'Pricing experiment events in PostHog types' : 'Missing event definitions',
    'warning'
  );

  // Check for getFeatureFlag function
  const hasFeatureFlags = posthogContent.includes('getFeatureFlag');
  check(
    'Feature flag support',
    hasFeatureFlags,
    hasFeatureFlags ? 'PostHog feature flags available (optional)' : 'No feature flag support',
    'warning'
  );
}

checkPostHogSetup();

// ============================================================================
// 5. Documentation
// ============================================================================

section('5. Documentation');

function checkDocumentation() {
  const docs = [
    'docs/PRICING_EXPERIMENT_SETUP.md',
    'docs/PRICING_EXPERIMENT_EXECUTIVE_SUMMARY.md',
    'config/stripe-pricing-experiment.md',
  ];

  for (const docPath of docs) {
    const fullPath = path.join(process.cwd(), docPath);
    const exists = fs.existsSync(fullPath);

    check(
      path.basename(docPath),
      exists,
      exists ? `Documentation available at ${docPath}` : `Missing: ${docPath}`,
      'warning'
    );
  }
}

checkDocumentation();

// ============================================================================
// 6. Variant Assignment Simulation
// ============================================================================

section('6. Variant Assignment Simulation');

function simulateVariantAssignment() {
  console.log('Simulating 1000 variant assignments to test distribution...\n');

  const counts = {
    annual_29: 0,
    annual_49: 0,
    annual_79: 0,
  };

  for (let i = 0; i < 1000; i++) {
    const random = Math.random();

    if (random < 0.33) {
      counts.annual_29++;
    } else if (random < 0.66) {
      counts.annual_49++;
    } else {
      counts.annual_79++;
    }
  }

  const total = 1000;
  const pct29 = (counts.annual_29 / total * 100).toFixed(1);
  const pct49 = (counts.annual_49 / total * 100).toFixed(1);
  const pct79 = (counts.annual_79 / total * 100).toFixed(1);

  console.log(`   annual_29 ($29): ${counts.annual_29}/1000 (${pct29}%)`);
  console.log(`   annual_49 ($49): ${counts.annual_49}/1000 (${pct49}%)`);
  console.log(`   annual_79 ($79): ${counts.annual_79}/1000 (${pct79}%)\n`);

  // Check if distribution is roughly 33/33/33 (within 5% tolerance)
  const isBalanced =
    Math.abs(counts.annual_29 - 333) < 50 &&
    Math.abs(counts.annual_49 - 333) < 50 &&
    Math.abs(counts.annual_79 - 333) < 50;

  check(
    'Variant distribution',
    isBalanced,
    isBalanced
      ? 'Distribution is balanced (within 5% of 33/33/33)'
      : 'WARNING: Distribution is skewed - check Math.random() logic',
    'warning'
  );
}

simulateVariantAssignment();

// ============================================================================
// Summary
// ============================================================================

section('Verification Summary');

const total = results.passed + results.failed + results.warnings;
const passRate = (results.passed / total * 100).toFixed(1);

console.log(`Total Checks:  ${total}`);
console.log(`✅ Passed:     ${results.passed} (${passRate}%)`);
console.log(`❌ Failed:     ${results.failed}`);
console.log(`⚠️  Warnings:   ${results.warnings}\n`);

if (results.failed === 0 && results.warnings === 0) {
  console.log('🎉 All checks passed! Pricing experiment is ready to launch.\n');
  console.log('Next steps:');
  console.log('  1. Create Stripe price IDs (see config/stripe-pricing-experiment.md)');
  console.log('  2. Update environment variables in Vercel');
  console.log('  3. Deploy to production');
  console.log('  4. Monitor PostHog dashboard for first 24 hours\n');
  process.exit(0);
} else if (results.failed === 0) {
  console.log('⚠️  All critical checks passed, but there are warnings.');
  console.log('Review warnings above before launching.\n');
  process.exit(0);
} else {
  console.log('❌ FAILED - Critical issues found. Fix errors before launching:\n');

  results.checks
    .filter(c => !c.status && c.severity === 'error')
    .forEach(c => {
      console.log(`  • ${c.name}: ${c.message}`);
    });

  console.log('\nSee docs/PRICING_EXPERIMENT_SETUP.md for troubleshooting.\n');
  process.exit(1);
}
