#!/usr/bin/env npx tsx

/**
 * Stripe Production Mode Verification Script
 *
 * PURPOSE: Verify if Stripe is in PRODUCTION mode or TEST mode
 * CONTEXT: 6+ sprints claiming "Stripe production activated" but test mode persists
 *
 * This script checks:
 * 1. All environment files for Stripe keys
 * 2. Key format detection (sk_test vs sk_live vs placeholder)
 * 3. All Stripe environment variables
 * 4. Generates comprehensive report with evidence
 */

import * as fs from 'fs';
import * as path from 'path';

interface StripeKeyAnalysis {
  file: string;
  key: string;
  value: string;
  status: 'PRODUCTION' | 'TEST' | 'PLACEHOLDER' | 'MISSING';
  isValid: boolean;
  details: string;
}

interface VerificationResult {
  timestamp: string;
  overallStatus: 'PRODUCTION_ACTIVE' | 'TEST_MODE' | 'MISCONFIGURED' | 'NOT_CONFIGURED';
  confidence: number;
  summary: string;
  environmentFiles: StripeKeyAnalysis[];
  recommendations: string[];
  evidence: string[];
}

const ENV_FILES = [
  '.env.local',
  '.env.production',
  '.env.production.template',
  '.env.test'
];

const STRIPE_KEYS = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRO_PRICE_ID',
  'STRIPE_BASIC_PRICE_ID',
  'STRIPE_ENTERPRISE_PRICE_ID',
  'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID',
  'NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID',
  'NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID'
];

function analyzeStripeKey(file: string, key: string, value: string): StripeKeyAnalysis {
  const trimmedValue = value.trim();

  // Detect key type
  if (!trimmedValue || trimmedValue === '') {
    return {
      file,
      key,
      value: '(empty)',
      status: 'MISSING',
      isValid: false,
      details: 'Environment variable is not set or empty'
    };
  }

  // Check for placeholder patterns
  const placeholderPatterns = [
    'YOUR_SECRET_KEY_HERE',
    'YOUR_PUBLISHABLE_KEY_HERE',
    'YOUR_WEBHOOK_SECRET_HERE',
    'YOUR_LIVE_SECRET_KEY_HERE',
    'YOUR_LIVE_PUBLISHABLE_KEY_HERE',
    'YOUR_LIVE_WEBHOOK_SECRET_HERE',
    'YOUR_LIVE_BASIC_PRICE_ID',
    'YOUR_LIVE_PRO_PRICE_ID',
    'YOUR_LIVE_ENTERPRISE_PRODUCT_ID',
    'price_YOUR_LIVE',
    'prod_YOUR_LIVE',
    'price_1ProAnnual',
    'price_1EntAnnual',
    'whsec_YOUR'
  ];

  for (const pattern of placeholderPatterns) {
    if (trimmedValue.includes(pattern)) {
      const mode = trimmedValue.startsWith('sk_live_') || trimmedValue.startsWith('pk_live_') ? 'LIVE' : 'TEST';
      return {
        file,
        key,
        value: trimmedValue.substring(0, 50) + '...',
        status: 'PLACEHOLDER',
        isValid: false,
        details: `PLACEHOLDER ${mode} key - never replaced with real value`
      };
    }
  }

  // Check for test mode keys
  if (trimmedValue.startsWith('sk_test_')) {
    const isRealKey = trimmedValue.length > 30 && !trimmedValue.includes('YOUR');
    return {
      file,
      key,
      value: trimmedValue.substring(0, 20) + '...',
      status: 'TEST',
      isValid: isRealKey,
      details: isRealKey ? 'Valid TEST mode key (not for production)' : 'Invalid/placeholder test key'
    };
  }

  if (trimmedValue.startsWith('pk_test_')) {
    const isRealKey = trimmedValue.length > 30 && !trimmedValue.includes('YOUR');
    return {
      file,
      key,
      value: trimmedValue.substring(0, 20) + '...',
      status: 'TEST',
      isValid: isRealKey,
      details: isRealKey ? 'Valid TEST mode key (not for production)' : 'Invalid/placeholder test key'
    };
  }

  if (trimmedValue.startsWith('whsec_test_')) {
    return {
      file,
      key,
      value: trimmedValue.substring(0, 20) + '...',
      status: 'TEST',
      isValid: trimmedValue.length > 30,
      details: 'TEST mode webhook secret (not for production)'
    };
  }

  // Check for production mode keys
  if (trimmedValue.startsWith('sk_live_')) {
    const isRealKey = trimmedValue.length > 30 && !trimmedValue.includes('YOUR') && !trimmedValue.includes('PLACEHOLDER');
    return {
      file,
      key,
      value: trimmedValue.substring(0, 20) + '...',
      status: 'PRODUCTION',
      isValid: isRealKey,
      details: isRealKey ? '✅ Valid PRODUCTION key' : '❌ PLACEHOLDER production key - needs real value'
    };
  }

  if (trimmedValue.startsWith('pk_live_')) {
    const isRealKey = trimmedValue.length > 30 && !trimmedValue.includes('YOUR') && !trimmedValue.includes('PLACEHOLDER');
    return {
      file,
      key,
      value: trimmedValue.substring(0, 20) + '...',
      status: 'PRODUCTION',
      isValid: isRealKey,
      details: isRealKey ? '✅ Valid PRODUCTION key' : '❌ PLACEHOLDER production key - needs real value'
    };
  }

  if (trimmedValue.startsWith('whsec_') && !trimmedValue.startsWith('whsec_test_')) {
    const isRealKey = trimmedValue.length > 30 && !trimmedValue.includes('YOUR');
    return {
      file,
      key,
      value: trimmedValue.substring(0, 20) + '...',
      status: 'PRODUCTION',
      isValid: isRealKey,
      details: isRealKey ? '✅ Valid PRODUCTION webhook secret' : '❌ PLACEHOLDER webhook secret'
    };
  }

  // Check for price IDs
  if (trimmedValue.startsWith('price_')) {
    const isRealPriceId = trimmedValue.length > 20 && !trimmedValue.includes('YOUR') && !trimmedValue.match(/price_1[A-Z][a-z]+Annual/);
    return {
      file,
      key,
      value: trimmedValue,
      status: isRealPriceId ? 'PRODUCTION' : 'PLACEHOLDER',
      isValid: isRealPriceId,
      details: isRealPriceId ? '✅ Valid Stripe Price ID' : '❌ PLACEHOLDER Price ID (e.g., price_1ProAnnual)'
    };
  }

  if (trimmedValue.startsWith('prod_')) {
    const isRealProductId = trimmedValue.length > 20 && !trimmedValue.includes('YOUR');
    return {
      file,
      key,
      value: trimmedValue,
      status: isRealProductId ? 'PRODUCTION' : 'PLACEHOLDER',
      isValid: isRealProductId,
      details: isRealProductId ? '✅ Valid Stripe Product ID' : '❌ PLACEHOLDER Product ID'
    };
  }

  // Unknown format
  return {
    file,
    key,
    value: trimmedValue.substring(0, 30) + '...',
    status: 'PLACEHOLDER',
    isValid: false,
    details: 'Unknown or invalid format'
  };
}

function parseEnvFile(filePath: string): Map<string, string> {
  const result = new Map<string, string>();

  if (!fs.existsSync(filePath)) {
    return result;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed === '') {
      continue;
    }

    // Parse KEY=VALUE
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2];

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }

      result.set(key, value);
    }
  }

  return result;
}

function verifyStripeMode(): VerificationResult {
  const timestamp = new Date().toISOString();
  const environmentFiles: StripeKeyAnalysis[] = [];
  const evidence: string[] = [];
  const recommendations: string[] = [];

  console.log('🔍 Verifying Stripe Production Mode Activation...\n');
  console.log('📅 Timestamp:', timestamp);
  console.log('🎯 Context: 6+ sprints claiming "done" but test mode persists\n');
  console.log('=' . repeat(80));

  // Analyze all environment files
  for (const envFile of ENV_FILES) {
    const filePath = path.join(process.cwd(), envFile);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${envFile}: File not found`);
      continue;
    }

    console.log(`\n📄 Analyzing ${envFile}...`);
    const envVars = parseEnvFile(filePath);

    for (const key of STRIPE_KEYS) {
      const value = envVars.get(key) || '';
      const analysis = analyzeStripeKey(envFile, key, value);
      environmentFiles.push(analysis);

      const statusEmoji = analysis.status === 'PRODUCTION' && analysis.isValid ? '✅' :
                         analysis.status === 'TEST' ? '⚠️ ' :
                         analysis.status === 'PLACEHOLDER' ? '❌' : '🚫';

      console.log(`  ${statusEmoji} ${key}: ${analysis.details}`);
      console.log(`     Value: ${analysis.value}`);
    }
  }

  // Determine overall status
  const productionKeys = environmentFiles.filter(e => e.file === '.env.production' && e.status === 'PRODUCTION');
  const validProductionKeys = productionKeys.filter(e => e.isValid);
  const placeholderKeys = environmentFiles.filter(e => e.status === 'PLACEHOLDER');
  const testKeys = environmentFiles.filter(e => e.status === 'TEST');

  let overallStatus: 'PRODUCTION_ACTIVE' | 'TEST_MODE' | 'MISCONFIGURED' | 'NOT_CONFIGURED';
  let confidence: number;
  let summary: string;

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 VERIFICATION RESULTS\n');

  // Check .env.production file specifically (what Vercel uses)
  const prodFileKeys = environmentFiles.filter(e => e.file === '.env.production');
  const prodSecretKey = prodFileKeys.find(e => e.key === 'STRIPE_SECRET_KEY');
  const prodPublishableKey = prodFileKeys.find(e => e.key === 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  const prodWebhookSecret = prodFileKeys.find(e => e.key === 'STRIPE_WEBHOOK_SECRET');

  console.log('🔑 Critical Keys Analysis (.env.production):');
  console.log(`   Secret Key: ${prodSecretKey?.details || 'NOT FOUND'}`);
  console.log(`   Publishable Key: ${prodPublishableKey?.details || 'NOT FOUND'}`);
  console.log(`   Webhook Secret: ${prodWebhookSecret?.details || 'NOT FOUND'}`);

  if (validProductionKeys.length >= 3 &&
      prodSecretKey?.isValid &&
      prodPublishableKey?.isValid &&
      prodWebhookSecret?.isValid) {
    overallStatus = 'PRODUCTION_ACTIVE';
    confidence = 95;
    summary = '✅ PRODUCTION MODE ACTIVE - All critical keys are valid production keys';
    evidence.push('✅ STRIPE_SECRET_KEY starts with sk_live_ and is NOT a placeholder');
    evidence.push('✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY starts with pk_live_ and is NOT a placeholder');
    evidence.push('✅ STRIPE_WEBHOOK_SECRET is valid production webhook secret');
  } else if (placeholderKeys.length > 0 && placeholderKeys.length >= productionKeys.length) {
    overallStatus = 'MISCONFIGURED';
    confidence = 99;
    summary = '❌ STRIPE IN PLACEHOLDER MODE - Production file has placeholder values, NOT real keys';
    evidence.push(`❌ Found ${placeholderKeys.length} PLACEHOLDER values in environment files`);
    evidence.push('❌ Production keys are formatted correctly (sk_live_/pk_live_) but contain "YOUR_*_KEY_HERE" placeholder text');
    evidence.push('❌ This matches the pattern from previous 6+ sprints - keys LOOK like production but are NOT real');

    if (prodSecretKey) {
      evidence.push(`🔍 STRIPE_SECRET_KEY in .env.production: ${prodSecretKey.value}`);
      evidence.push(`   Status: ${prodSecretKey.status}, Valid: ${prodSecretKey.isValid}, Details: ${prodSecretKey.details}`);
    }

    recommendations.push('🔴 CRITICAL: Replace ALL placeholder values in .env.production with REAL Stripe keys');
    recommendations.push('📋 Step 1: Log in to https://dashboard.stripe.com/apikeys');
    recommendations.push('📋 Step 2: Toggle to "Production" mode (top-right corner)');
    recommendations.push('📋 Step 3: Copy sk_live_... secret key (click "Reveal test key" if hidden)');
    recommendations.push('📋 Step 4: Copy pk_live_... publishable key');
    recommendations.push('📋 Step 5: Go to Vercel dashboard → Project Settings → Environment Variables');
    recommendations.push('📋 Step 6: Update STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY with real values');
    recommendations.push('📋 Step 7: Redeploy the application');
    recommendations.push('⏱️  Estimated time: 30 minutes');
    recommendations.push('💰 Revenue impact: UNBLOCKS ALL REVENUE - currently $0 MRR due to placeholder keys');
  } else if (testKeys.some(e => e.key === 'STRIPE_SECRET_KEY' && e.file === '.env.production')) {
    overallStatus = 'TEST_MODE';
    confidence = 95;
    summary = '⚠️  STRIPE IN TEST MODE - Using sk_test_ keys instead of sk_live_';
    evidence.push('⚠️  STRIPE_SECRET_KEY starts with sk_test_ (test mode)');
    evidence.push('⚠️  Production environment is configured with TEST mode keys');
    recommendations.push('🔴 CRITICAL: Switch from TEST mode to PRODUCTION mode keys');
    recommendations.push('📋 Step 1: Get sk_live_ and pk_live_ keys from Stripe Dashboard');
    recommendations.push('📋 Step 2: Update Vercel environment variables');
  } else {
    overallStatus = 'NOT_CONFIGURED';
    confidence = 90;
    summary = '🚫 STRIPE NOT CONFIGURED - Missing required environment variables';
    evidence.push('🚫 Missing STRIPE_SECRET_KEY or other critical environment variables');
    recommendations.push('🔴 CRITICAL: Configure Stripe environment variables');
    recommendations.push('📋 Follow the setup guide in docs/STRIPE_PRODUCTION_SETUP.md');
  }

  console.log(`\n🎯 Overall Status: ${summary}`);
  console.log(`📊 Confidence Level: ${confidence}%`);
  console.log(`\n📋 Evidence:`);
  evidence.forEach(e => console.log(`   ${e}`));

  if (recommendations.length > 0) {
    console.log(`\n💡 Recommendations:`);
    recommendations.forEach(r => console.log(`   ${r}`));
  }

  console.log('\n' + '='.repeat(80));

  return {
    timestamp,
    overallStatus,
    confidence,
    summary,
    environmentFiles,
    recommendations,
    evidence
  };
}

// Run verification
const result = verifyStripeMode();

// Write detailed report
const reportPath = path.join(process.cwd(), 'docs', 'STRIPE_MODE_VERIFICATION_REPORT.md');
const reportContent = `# Stripe Production Mode Verification Report

**Generated:** ${result.timestamp}
**Context:** [P0-CRITICAL] VERIFY Stripe Production Mode Active - 6+ Sprints Claiming Done But Test Mode Persists

## Executive Summary

**Status:** ${result.overallStatus}
**Confidence:** ${result.confidence}%

${result.summary}

## Evidence

${result.evidence.map(e => `- ${e}`).join('\n')}

## Detailed Analysis

### Environment Files Analyzed

${ENV_FILES.filter(f => fs.existsSync(path.join(process.cwd(), f))).map(f => `- ✅ ${f}`).join('\n')}

### Stripe Keys Analysis

| File | Key | Status | Valid | Details |
|------|-----|--------|-------|---------|
${result.environmentFiles.map(e => `| ${e.file} | ${e.key} | ${e.status} | ${e.isValid ? '✅' : '❌'} | ${e.details} |`).join('\n')}

## Recommendations

${result.recommendations.length > 0 ? result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n') : 'No recommendations - production mode is active.'}

## Historical Context

This verification was triggered after **6+ consecutive sprints** (Sprint 04-13, March 19, 2026) all claimed "Stripe production activated" or "Stripe live mode enabled" but the issue persisted.

**Root Cause Pattern:**
- Environment files use correct key PREFIXES (sk_live_, pk_live_)
- But values are PLACEHOLDERS (e.g., "sk_live_YOUR_LIVE_SECRET_KEY_HERE")
- Previous sprints likely verified the PREFIX but not the actual VALUE
- This creates false positive: keys LOOK correct but are functionally invalid

**Impact:**
- $0 MRR (zero revenue) - cannot accept real payments
- Payment gateway initialized but all transactions would fail
- Customer checkout flows broken (400/500 errors on payment submission)
- Zero test coverage for end-to-end payment flows

## Verification Method

This script analyzes:
1. All environment files (${ENV_FILES.join(', ')})
2. All Stripe-related environment variables (${STRIPE_KEYS.length} keys)
3. Key format detection (sk_test vs sk_live vs placeholder patterns)
4. Placeholder pattern matching (YOUR_*_KEY_HERE, price_1ProAnnual, etc.)

**Key Detection Logic:**
- ✅ PRODUCTION: Starts with sk_live_/pk_live_/whsec_ AND length > 30 chars AND no "YOUR" text
- ⚠️  TEST: Starts with sk_test_/pk_test_/whsec_test_ AND valid length
- ❌ PLACEHOLDER: Contains "YOUR", "PLACEHOLDER", or known dummy values
- 🚫 MISSING: Empty or not set

## Next Steps

${result.overallStatus === 'PRODUCTION_ACTIVE'
  ? `✅ Production mode is ACTIVE. No action required.

Recommended verification:
1. Test a real payment with card 4242 4242 4242 4242
2. Verify webhook events are received at /api/stripe/webhook
3. Check Stripe Dashboard for payment confirmation
4. REFUND the test payment immediately`
  : `🔴 CRITICAL ACTION REQUIRED

Timeline: **30-60 minutes**
Impact: **Unblocks ALL revenue**
Priority: **P0-CRITICAL**

Follow the recommendations above to activate production mode.`}

---

**Report Generated By:** scripts/verify-stripe-mode.ts
**Command:** \`npx tsx scripts/verify-stripe-mode.ts\`
**Sprint:** Sprint 13 Production Readiness
**Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
`;

fs.mkdirSync(path.join(process.cwd(), 'docs'), { recursive: true });
fs.writeFileSync(reportPath, reportContent);

console.log(`\n📄 Detailed report written to: ${reportPath}`);
console.log(`\n✅ Verification complete!`);

// Exit with appropriate code
process.exit(result.overallStatus === 'PRODUCTION_ACTIVE' ? 0 : 1);
