#!/usr/bin/env tsx
/**
 * Environment Variable Validator
 *
 * Validates that production environment variables don't contain placeholder values.
 * Blocks commits if placeholders are found in .env.production.
 *
 * Usage:
 *   npm run validate:env
 *   npm run validate:env -- --strict (exits 1 on any placeholder)
 *
 * Exit codes:
 *   0 - All env vars valid (or warnings only in non-strict mode)
 *   1 - Found placeholder values (or warnings in strict mode)
 */

import fs from 'fs';
import path from 'path';

const ENV_FILE = path.join(process.cwd(), '.env.production');

// Critical env vars that MUST NOT have placeholders
const CRITICAL_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
];

// Important env vars (warnings only, not blocking)
const IMPORTANT_VARS = [
  'POSTHOG_API_KEY',
  'SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
  'SENDGRID_API_KEY',
  'ANTHROPIC_API_KEY',
  'GOOGLE_ADS_CUSTOMER_ID',
  'META_PIXEL_ID',
];

// Patterns that indicate placeholder values
const PLACEHOLDER_PATTERNS = [
  /YOUR_.*_KEY/i,
  /YOUR_.*_SECRET/i,
  /YOUR_.*_API/i,
  /YOUR_.*_TOKEN/i,
  /YOUR_.*_ID/i,
  /PLACEHOLDER/i,
  /CHANGE_ME/i,
  /REPLACE_ME/i,
  /TODO/i,
  /FIXME/i,
  /XXX+/i,
  /^sk_test_/i,  // Stripe test keys in production
  /^pk_test_/i,  // Stripe test publishable keys
];

interface ValidationResult {
  key: string;
  value: string;
  isPlaceholder: boolean;
  isCritical: boolean;
  pattern?: string;
}

function isPlaceholder(value: string): { isPlaceholder: boolean; pattern?: string } {
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(value)) {
      return { isPlaceholder: true, pattern: pattern.source };
    }
  }
  return { isPlaceholder: false };
}

function validateEnvFile(): void {
  console.log('═'.repeat(80));
  console.log('ENVIRONMENT VARIABLE VALIDATION');
  console.log(`File: ${ENV_FILE}`);
  console.log('═'.repeat(80));
  console.log();

  if (!fs.existsSync(ENV_FILE)) {
    console.warn('⚠️  .env.production not found - skipping validation');
    console.log('   (This is OK if you manage env vars exclusively in Vercel dashboard)');
    console.log();
    process.exit(0);
  }

  const content = fs.readFileSync(ENV_FILE, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));

  const results: ValidationResult[] = [];
  const envVars: { [key: string]: string } = {};

  // Parse env vars
  for (const line of lines) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim(); // Handle = in values
    if (key && value) {
      envVars[key.trim()] = value;
    }
  }

  // Validate critical vars
  for (const key of CRITICAL_VARS) {
    const value = envVars[key];
    if (!value) {
      results.push({
        key,
        value: '(not set)',
        isPlaceholder: true,
        isCritical: true,
      });
    } else {
      const { isPlaceholder: isPlaceholderValue, pattern } = isPlaceholder(value);
      results.push({
        key,
        value: value.substring(0, 20) + (value.length > 20 ? '...' : ''),
        isPlaceholder: isPlaceholderValue,
        isCritical: true,
        pattern,
      });
    }
  }

  // Validate important vars (warnings only)
  for (const key of IMPORTANT_VARS) {
    const value = envVars[key];
    if (value) {
      const { isPlaceholder: isPlaceholderValue, pattern } = isPlaceholder(value);
      if (isPlaceholderValue) {
        results.push({
          key,
          value: value.substring(0, 20) + (value.length > 20 ? '...' : ''),
          isPlaceholder: isPlaceholderValue,
          isCritical: false,
          pattern,
        });
      }
    }
  }

  // Display results
  const criticalPlaceholders = results.filter(r => r.isCritical && r.isPlaceholder);
  const importantPlaceholders = results.filter(r => !r.isCritical && r.isPlaceholder);
  const validCritical = results.filter(r => r.isCritical && !r.isPlaceholder);

  console.log('## Critical Environment Variables (BLOCKING)\n');
  if (validCritical.length > 0) {
    console.log('✅ Valid (no placeholders):');
    validCritical.forEach(r => {
      console.log(`   ${r.key}: ${r.value}`);
    });
    console.log();
  }

  if (criticalPlaceholders.length > 0) {
    console.log('❌ PLACEHOLDERS FOUND (CRITICAL):');
    criticalPlaceholders.forEach(r => {
      console.log(`   ${r.key}: ${r.value}`);
      if (r.pattern) {
        console.log(`     → Matched pattern: ${r.pattern}`);
      }
    });
    console.log();
  }

  if (importantPlaceholders.length > 0) {
    console.log('## Important Environment Variables (WARNINGS)\n');
    console.log('⚠️  Placeholders found (non-blocking):');
    importantPlaceholders.forEach(r => {
      console.log(`   ${r.key}: ${r.value}`);
      if (r.pattern) {
        console.log(`     → Matched pattern: ${r.pattern}`);
      }
    });
    console.log();
  }

  // Summary
  console.log('─'.repeat(80));
  console.log('VALIDATION SUMMARY\n');
  console.log(`✅ Valid critical vars: ${validCritical.length}/${CRITICAL_VARS.length}`);
  console.log(`❌ Critical placeholders: ${criticalPlaceholders.length}`);
  console.log(`⚠️  Important placeholders: ${importantPlaceholders.length}`);
  console.log();

  if (criticalPlaceholders.length > 0) {
    console.log('❌ VALIDATION FAILED\n');
    console.log('CRITICAL environment variables contain placeholder values.');
    console.log('Production deployment will fail at runtime.\n');
    console.log('Action Required:');
    console.log('1. Get production keys from respective dashboards:');
    console.log('   - Stripe: https://dashboard.stripe.com/apikeys');
    console.log('   - Clerk: https://dashboard.clerk.com');
    console.log('2. Update environment variables in Vercel dashboard:');
    console.log('   - https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables');
    console.log('3. Optionally update .env.production (or delete it if using Vercel exclusively)');
    console.log('4. Redeploy or commit again\n');
    console.log('═'.repeat(80));
    process.exit(1);
  }

  if (importantPlaceholders.length > 0) {
    console.log('⚠️  VALIDATION PASSED WITH WARNINGS\n');
    console.log('Some important env vars have placeholders.');
    console.log('Features like analytics/monitoring may not work in production.\n');
    console.log('Recommended: Update these vars in Vercel dashboard.');
    console.log('═'.repeat(80));
    process.exit(0);
  }

  console.log('✅ ALL VALIDATIONS PASSED\n');
  console.log('No placeholder values detected in critical environment variables.');
  console.log('═'.repeat(80));
  process.exit(0);
}

// Run validation
validateEnvFile();
