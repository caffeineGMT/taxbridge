#!/usr/bin/env node
/**
 * STRIPE PRODUCTION VERIFICATION SCRIPT
 *
 * Checks which environment variables are still placeholders
 * and provides a clear status report.
 *
 * Usage:
 *   npm run verify:env-placeholders
 *   OR
 *   npx tsx scripts/verify-env-placeholders.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// ============================================================
// CONFIGURATION
// ============================================================

interface EnvCheck {
  name: string;
  category: 'STRIPE' | 'CLERK' | 'ANALYTICS' | 'OPTIONAL';
  priority: 'P0-CRITICAL' | 'P1-HIGH' | 'P2-MEDIUM' | 'P3-LOW';
  isPlaceholder: (value: string | undefined) => boolean;
  requiredPattern?: RegExp;
  example?: string;
}

const ENV_CHECKS: EnvCheck[] = [
  // ================== STRIPE (P0-CRITICAL) ==================
  {
    name: 'STRIPE_SECRET_KEY',
    category: 'STRIPE',
    priority: 'P0-CRITICAL',
    isPlaceholder: (val) => !val || val.includes('YOUR_') || val.startsWith('sk_test_'),
    requiredPattern: /^sk_live_/,
    example: 'sk_live_51XXXXXXXXXXXXX',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    category: 'STRIPE',
    priority: 'P0-CRITICAL',
    isPlaceholder: (val) => !val || val.includes('YOUR_') || val.startsWith('pk_test_'),
    requiredPattern: /^pk_live_/,
    example: 'pk_live_51XXXXXXXXXXXXX',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    category: 'STRIPE',
    priority: 'P0-CRITICAL',
    isPlaceholder: (val) => !val || val.includes('YOUR_'),
    requiredPattern: /^whsec_/,
    example: 'whsec_XXXXXXXXXXXXX',
  },
  {
    name: 'STRIPE_BASIC_PRICE_ID',
    category: 'STRIPE',
    priority: 'P0-CRITICAL',
    isPlaceholder: (val) => !val || val.includes('YOUR_') || val === 'price_1BasicAnnual',
    requiredPattern: /^price_/,
    example: 'price_1XXXXXXXXXXXXX',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID',
    category: 'STRIPE',
    priority: 'P0-CRITICAL',
    isPlaceholder: (val) => !val || val.includes('YOUR_') || val === 'price_1BasicAnnual',
    requiredPattern: /^price_/,
    example: 'price_1XXXXXXXXXXXXX',
  },
  {
    name: 'STRIPE_PRO_PRICE_ID',
    category: 'STRIPE',
    priority: 'P0-CRITICAL',
    isPlaceholder: (val) => !val || val.includes('YOUR_') || val === 'price_1ProAnnual',
    requiredPattern: /^price_/,
    example: 'price_1XXXXXXXXXXXXX',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID',
    category: 'STRIPE',
    priority: 'P0-CRITICAL',
    isPlaceholder: (val) => !val || val.includes('YOUR_') || val === 'price_1ProAnnual',
    requiredPattern: /^price_/,
    example: 'price_1XXXXXXXXXXXXX',
  },
  {
    name: 'STRIPE_ENTERPRISE_PRICE_ID',
    category: 'STRIPE',
    priority: 'P0-CRITICAL',
    isPlaceholder: (val) => !val || val.includes('YOUR_') || val === 'price_1EntAnnual',
    requiredPattern: /^prod_/,
    example: 'prod_XXXXXXXXXXXXX',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID',
    category: 'STRIPE',
    priority: 'P0-CRITICAL',
    isPlaceholder: (val) => !val || val.includes('YOUR_') || val === 'price_1EntAnnual',
    requiredPattern: /^prod_/,
    example: 'prod_XXXXXXXXXXXXX',
  },

  // ================== CLERK (P1-HIGH) ==================
  {
    name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    category: 'CLERK',
    priority: 'P1-HIGH',
    isPlaceholder: (val) => !val || val.includes('YOUR_') || val.startsWith('pk_test_'),
    requiredPattern: /^pk_live_/,
    example: 'pk_live_XXXXXXXXXXXXX',
  },
  {
    name: 'CLERK_SECRET_KEY',
    category: 'CLERK',
    priority: 'P1-HIGH',
    isPlaceholder: (val) => !val || val.includes('YOUR_') || val.startsWith('sk_test_'),
    requiredPattern: /^sk_live_/,
    example: 'sk_live_XXXXXXXXXXXXX',
  },
  {
    name: 'CLERK_WEBHOOK_SECRET',
    category: 'CLERK',
    priority: 'P1-HIGH',
    isPlaceholder: (val) => !val || val.includes('YOUR_'),
    requiredPattern: /^whsec_/,
    example: 'whsec_XXXXXXXXXXXXX',
  },

  // ================== ANALYTICS (P2-MEDIUM) ==================
  {
    name: 'NEXT_PUBLIC_GOOGLE_ADS_ID',
    category: 'ANALYTICS',
    priority: 'P2-MEDIUM',
    isPlaceholder: (val) => !val || val.includes('XXXXXXXXXX') || val === 'AW-XXXXXXXXXX',
    requiredPattern: /^AW-\d{10,11}$/,
    example: 'AW-1234567890',
  },
  {
    name: 'NEXT_PUBLIC_POSTHOG_KEY',
    category: 'ANALYTICS',
    priority: 'P2-MEDIUM',
    isPlaceholder: (val) => !val || val.includes('YOUR_'),
    requiredPattern: /^phc_/,
    example: 'phc_XXXXXXXXXXXXX',
  },
  {
    name: 'NEXT_PUBLIC_SENTRY_DSN',
    category: 'ANALYTICS',
    priority: 'P2-MEDIUM',
    isPlaceholder: (val) => !val || val.includes('YOUR_') || val.includes('o0000000'),
    requiredPattern: /^https:\/\/.+@.+\.ingest\.sentry\.io\//,
    example: 'https://abc123@o123456.ingest.sentry.io/123456',
  },

  // ================== OPTIONAL (P3-LOW) ==================
  {
    name: 'SENDGRID_API_KEY',
    category: 'OPTIONAL',
    priority: 'P3-LOW',
    isPlaceholder: (val) => !val || val.includes('YOUR_'),
    requiredPattern: /^SG\./,
    example: 'SG.XXXXXXXXXXXXX',
  },
  {
    name: 'ANTHROPIC_API_KEY',
    category: 'OPTIONAL',
    priority: 'P3-LOW',
    isPlaceholder: (val) => !val || val.includes('YOUR_'),
    requiredPattern: /^sk-ant-api03-/,
    example: 'sk-ant-api03-XXXXXXXXXXXXX',
  },
];

// ============================================================
// MAIN VERIFICATION
// ============================================================

function loadEnvFile(filePath: string): Record<string, string> {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const env: Record<string, string> = {};

    content.split('\n').forEach(line => {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) return;

      const match = line.match(/^([A-Z_0-9]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        env[key] = value.trim();
      }
    });

    return env;
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error);
    return {};
  }
}

function verify() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 ENVIRONMENT VARIABLE VERIFICATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const envPath = join(process.cwd(), '.env.production');
  const env = loadEnvFile(envPath);

  const results: Record<string, { pass: number; fail: number; total: number }> = {
    STRIPE: { pass: 0, fail: 0, total: 0 },
    CLERK: { pass: 0, fail: 0, total: 0 },
    ANALYTICS: { pass: 0, fail: 0, total: 0 },
    OPTIONAL: { pass: 0, fail: 0, total: 0 },
  };

  const failures: Array<{ name: string; priority: string; issue: string; fix: string }> = [];

  // Check each environment variable
  ENV_CHECKS.forEach(check => {
    const value = env[check.name];
    const isPlaceholder = check.isPlaceholder(value);
    results[check.category].total++;

    if (isPlaceholder) {
      results[check.category].fail++;

      let issue = 'Placeholder value detected';
      if (!value) {
        issue = 'Missing';
      } else if (value.includes('YOUR_')) {
        issue = 'Contains "YOUR_" placeholder';
      } else if (value.startsWith('sk_test_') || value.startsWith('pk_test_')) {
        issue = 'Using TEST mode key';
      }

      failures.push({
        name: check.name,
        priority: check.priority,
        issue,
        fix: check.example || 'See documentation',
      });
    } else {
      results[check.category].pass++;
    }
  });

  // Print category summaries
  console.log('📊 CATEGORY SUMMARY:\n');

  Object.entries(results).forEach(([category, stats]) => {
    const percentage = stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0;
    const icon = percentage === 100 ? '✅' : percentage >= 50 ? '⚠️' : '❌';
    const status = percentage === 100 ? 'READY' : percentage >= 50 ? 'PARTIAL' : 'BLOCKED';

    console.log(`${icon} ${category.padEnd(12)} ${stats.pass}/${stats.total} (${percentage}%) - ${status}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Revenue status
  const stripeReady = results.STRIPE.fail === 0;
  if (stripeReady) {
    console.log('🎉 STRIPE PRODUCTION MODE: ✅ ACTIVE');
    console.log('💰 REVENUE STATUS: ✅ UNBLOCKED\n');
  } else {
    console.log('🔴 STRIPE PRODUCTION MODE: ❌ BLOCKED');
    console.log('💰 REVENUE STATUS: 🚫 ZERO CAPABILITY\n');
  }

  // Print failures by priority
  if (failures.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 ACTION ITEMS:\n');

    ['P0-CRITICAL', 'P1-HIGH', 'P2-MEDIUM', 'P3-LOW'].forEach(priority => {
      const priorityFailures = failures.filter(f => f.priority === priority);

      if (priorityFailures.length > 0) {
        console.log(`\n${priority} (${priorityFailures.length} issues):`);
        console.log('─'.repeat(50));

        priorityFailures.forEach((failure, idx) => {
          console.log(`${idx + 1}. ${failure.name}`);
          console.log(`   Issue: ${failure.issue}`);
          console.log(`   Example: ${failure.fix}`);
        });
      }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // Next steps
  if (!stripeReady) {
    console.log('📋 NEXT STEPS:\n');
    console.log('1. Review: docs/STRIPE_PRODUCTION_ACTIVATION_COMPLETE.md');
    console.log('2. Get keys: https://dashboard.stripe.com/apikeys (Production mode)');
    console.log('3. Run setup: npx tsx scripts/activate-stripe-production-annual.ts');
    console.log('4. Update Vercel: https://vercel.com/your-team/cross-border-tax/settings/environment-variables');
    console.log('5. Verify again: npm run verify:env-placeholders\n');
  } else {
    console.log('✅ All critical environment variables configured!\n');
    console.log('📋 FINAL STEPS:\n');
    console.log('1. Test payment: npm run test:live-payment');
    console.log('2. Monitor: https://dashboard.stripe.com/dashboard\n');
  }

  // Exit code
  const criticalFailed = failures.filter(f => f.priority === 'P0-CRITICAL').length > 0;
  process.exit(criticalFailed ? 1 : 0);
}

// Run verification
verify();
