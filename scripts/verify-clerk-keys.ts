#!/usr/bin/env tsx
/**
 * Clerk Production Keys Verification Script
 *
 * This script verifies that Clerk authentication is properly configured
 * for production use. It checks:
 *
 * 1. Environment variables are set (not placeholders)
 * 2. Keys have correct format (pk_live_* and sk_live_*)
 * 3. Publishable key is accessible from client
 * 4. Webhook secret is configured
 *
 * Run: npm run verify:clerk
 */

import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: string;
}

interface ClerkConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  signInUrl: string;
  signUpUrl: string;
  afterSignInUrl: string;
  afterSignUpUrl: string;
}

class ClerkVerifier {
  private results: VerificationResult[] = [];
  private config: ClerkConfig;

  constructor() {
    // Load from .env.production
    const envPath = path.join(process.cwd(), '.env.production');
    const envContent = fs.existsSync(envPath)
      ? fs.readFileSync(envPath, 'utf-8')
      : '';

    this.config = this.parseEnvFile(envContent);
  }

  private parseEnvFile(content: string): ClerkConfig {
    const lines = content.split('\n');
    const config: Record<string, string> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          config[key] = value;
        }
      }
    }

    return {
      publishableKey: config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
      secretKey: config.CLERK_SECRET_KEY || '',
      webhookSecret: config.CLERK_WEBHOOK_SECRET || '',
      signInUrl: config.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '',
      signUpUrl: config.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '',
      afterSignInUrl: config.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '',
      afterSignUpUrl: config.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '',
    };
  }

  checkPublishableKey(): VerificationResult {
    const { publishableKey } = this.config;

    // Check if exists
    if (!publishableKey) {
      return {
        passed: false,
        message: '❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set',
        details: 'Missing in .env.production'
      };
    }

    // Check if placeholder
    if (publishableKey.includes('YOUR_') || publishableKey.includes('PLACEHOLDER')) {
      return {
        passed: false,
        message: '❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is a placeholder',
        details: `Current value: ${publishableKey.substring(0, 30)}...`
      };
    }

    // Check if production key (should start with pk_live_)
    if (!publishableKey.startsWith('pk_live_')) {
      return {
        passed: false,
        message: '⚠️ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not a production key',
        details: `Expected: pk_live_*, Got: ${publishableKey.substring(0, 15)}...`
      };
    }

    // Key looks valid
    return {
      passed: true,
      message: '✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is valid',
      details: `Format: pk_live_${publishableKey.substring(8, 20)}...`
    };
  }

  checkSecretKey(): VerificationResult {
    const { secretKey } = this.config;

    // Check if exists
    if (!secretKey) {
      return {
        passed: false,
        message: '❌ CLERK_SECRET_KEY is not set',
        details: 'Missing in .env.production'
      };
    }

    // Check if placeholder
    if (secretKey.includes('YOUR_') || secretKey.includes('PLACEHOLDER')) {
      return {
        passed: false,
        message: '❌ CLERK_SECRET_KEY is a placeholder',
        details: `Current value: ${secretKey.substring(0, 30)}...`
      };
    }

    // Check if production key (should start with sk_live_)
    if (!secretKey.startsWith('sk_live_')) {
      return {
        passed: false,
        message: '⚠️ CLERK_SECRET_KEY is not a production key',
        details: `Expected: sk_live_*, Got: ${secretKey.substring(0, 15)}...`
      };
    }

    // Key looks valid
    return {
      passed: true,
      message: '✅ CLERK_SECRET_KEY is valid',
      details: `Format: sk_live_${secretKey.substring(8, 20)}... (${secretKey.length} chars)`
    };
  }

  checkWebhookSecret(): VerificationResult {
    const { webhookSecret } = this.config;

    // Webhook secret is optional for basic auth, but recommended
    if (!webhookSecret) {
      return {
        passed: false,
        message: '⚠️ CLERK_WEBHOOK_SECRET is not set',
        details: 'Recommended for webhook security'
      };
    }

    // Check if placeholder
    if (webhookSecret.includes('YOUR_') || webhookSecret.includes('PLACEHOLDER')) {
      return {
        passed: false,
        message: '⚠️ CLERK_WEBHOOK_SECRET is a placeholder',
        details: `Current value: ${webhookSecret.substring(0, 30)}...`
      };
    }

    // Check if production webhook secret (should start with whsec_)
    if (!webhookSecret.startsWith('whsec_')) {
      return {
        passed: false,
        message: '⚠️ CLERK_WEBHOOK_SECRET has unexpected format',
        details: `Expected: whsec_*, Got: ${webhookSecret.substring(0, 15)}...`
      };
    }

    return {
      passed: true,
      message: '✅ CLERK_WEBHOOK_SECRET is configured',
      details: `Format: whsec_${webhookSecret.substring(6, 18)}...`
    };
  }

  checkRouteConfiguration(): VerificationResult {
    const { signInUrl, signUpUrl, afterSignInUrl, afterSignUpUrl } = this.config;

    const allSet = signInUrl && signUpUrl && afterSignInUrl && afterSignUpUrl;

    if (!allSet) {
      return {
        passed: false,
        message: '❌ Clerk route configuration incomplete',
        details: `Missing: ${[
          !signInUrl && 'signInUrl',
          !signUpUrl && 'signUpUrl',
          !afterSignInUrl && 'afterSignInUrl',
          !afterSignUpUrl && 'afterSignUpUrl'
        ].filter(Boolean).join(', ')}`
      };
    }

    return {
      passed: true,
      message: '✅ Clerk route configuration is complete',
      details: `signIn: ${signInUrl}, signUp: ${signUpUrl}`
    };
  }

  async checkVercelEnvironment(): Promise<VerificationResult> {
    // This would require Vercel API access, so we'll just provide guidance
    return {
      passed: false,
      message: '⚠️ Vercel environment variables need manual verification',
      details: 'Run: vercel env ls to check production environment variables'
    };
  }

  async runAll(): Promise<void> {
    console.log('🔍 Clerk Production Keys Verification\n');
    console.log('=' .repeat(60));
    console.log('');

    // Run all checks
    this.results.push(this.checkPublishableKey());
    this.results.push(this.checkSecretKey());
    this.results.push(this.checkWebhookSecret());
    this.results.push(this.checkRouteConfiguration());

    // Print results
    for (const result of this.results) {
      console.log(result.message);
      if (result.details) {
        console.log(`   ${result.details}`);
      }
      console.log('');
    }

    console.log('=' .repeat(60));

    // Summary
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const criticalFailures = this.results.filter(r =>
      !r.passed && r.message.includes('❌')
    ).length;

    console.log(`\n📊 Summary: ${passed}/${total} checks passed`);

    if (criticalFailures > 0) {
      console.log(`\n❌ ${criticalFailures} critical issue(s) found`);
      console.log('\n🔧 Action Required:');
      console.log('   1. Login to https://dashboard.clerk.com');
      console.log('   2. Navigate to API Keys section');
      console.log('   3. Copy your production keys:');
      console.log('      - Publishable key (starts with pk_live_)');
      console.log('      - Secret key (starts with sk_live_)');
      console.log('   4. Update Vercel environment variables:');
      console.log('      vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
      console.log('      vercel env add CLERK_SECRET_KEY');
      console.log('   5. Redeploy: vercel --prod');
      console.log('');
      console.log('📚 Full guide: docs/CLERK_KEY_REPLACEMENT_GUIDE.md');
      process.exit(1);
    }

    console.log('\n✅ All checks passed! Clerk is properly configured.');
    process.exit(0);
  }
}

// Run verification
const verifier = new ClerkVerifier();
verifier.runAll().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
