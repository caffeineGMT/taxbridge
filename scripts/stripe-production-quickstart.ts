/**
 * Stripe Production Quick Start
 * Interactive script to set up Stripe production mode
 *
 * Usage: npm run stripe:quickstart
 */

import Stripe from 'stripe';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 TaxBridge Stripe Production Quick Start');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('This script will help you:');
  console.log('1. Create Stripe products and prices in LIVE mode');
  console.log('2. Generate .env.production with your keys');
  console.log('3. Prepare for Vercel deployment\n');

  const confirmed = await question('Ready to proceed? (y/n): ');
  if (confirmed.toLowerCase() !== 'y') {
    console.log('Setup cancelled.');
    rl.close();
    return;
  }

  console.log('\n📋 Step 1: Stripe Live API Keys');
  console.log('Get your production keys from: https://dashboard.stripe.com/apikeys');
  console.log('⚠️  Make sure you toggle to "Production" mode!\n');

  const secretKey = await question('Enter your Stripe LIVE secret key (sk_live_...): ');
  const publishableKey = await question('Enter your Stripe LIVE publishable key (pk_live_...): ');

  // Validate keys
  if (!secretKey.startsWith('sk_live_')) {
    console.error('❌ Error: Secret key must start with sk_live_');
    console.error('You provided a test key. Please get your production keys.');
    rl.close();
    return;
  }

  if (!publishableKey.startsWith('pk_live_')) {
    console.error('❌ Error: Publishable key must start with pk_live_');
    console.error('You provided a test key. Please get your production keys.');
    rl.close();
    return;
  }

  console.log('\n✓ Keys validated (live mode)\n');

  // Initialize Stripe
  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  });

  console.log('📦 Step 2: Creating Products...\n');

  try {
    // Create Pro product
    console.log('Creating TaxBridge Pro product...');
    const proProduct = await stripe.products.create({
      name: 'TaxBridge Pro',
      description:
        'Unlimited RSU entries, FTC optimizer, multi-year dashboard, PDF exports, and priority support',
      metadata: {
        tier: 'pro',
        features: JSON.stringify([
          'Unlimited RSU entries',
          'Foreign Tax Credit optimizer',
          'Multi-year tax dashboard',
          'PDF export & reports',
          'CSV bulk import',
          'Priority support (12hr response)',
        ]),
      },
    });

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 29900, // $299.00
      currency: 'usd',
      recurring: { interval: 'year' },
      metadata: { tier: 'pro', billing_cycle: 'annual' },
    });

    console.log(`✓ Pro Annual: $299/year (${proPrice.id})\n`);

    // Create Enterprise product
    console.log('Creating TaxBridge Enterprise product...');
    const enterpriseProduct = await stripe.products.create({
      name: 'TaxBridge Enterprise',
      description:
        'All Pro features plus API access, client management, white-label reports, and dedicated support',
      metadata: {
        tier: 'enterprise',
        features: JSON.stringify([
          'All Pro features',
          'API access',
          'Client management dashboard',
          'White-label reports',
          'Custom integrations',
          'Dedicated account manager',
          '24/7 priority support',
        ]),
      },
    });

    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 200000, // $2,000.00
      currency: 'usd',
      recurring: { interval: 'year' },
      metadata: { tier: 'enterprise', billing_cycle: 'annual' },
    });

    console.log(`✓ Enterprise Annual: $2,000/year (${enterprisePrice.id})\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Products Created Successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Ask for webhook secret
    console.log('📡 Step 3: Webhook Setup');
    console.log('1. Go to: https://dashboard.stripe.com/webhooks');
    console.log('2. Click "Add endpoint"');
    console.log('3. Endpoint URL: https://your-domain.vercel.app/api/stripe/webhook');
    console.log('4. Select events:');
    console.log('   - checkout.session.completed');
    console.log('   - customer.subscription.created');
    console.log('   - customer.subscription.updated');
    console.log('   - customer.subscription.deleted');
    console.log('   - invoice.payment_succeeded');
    console.log('   - invoice.payment_failed');
    console.log('5. Copy the webhook signing secret (whsec_...)\n');

    const webhookSecret = await question('Enter your webhook signing secret (whsec_...): ');

    if (!webhookSecret.startsWith('whsec_')) {
      console.warn('⚠️  Warning: Webhook secret should start with whsec_');
    }

    // Generate .env.production content
    const envContent = `# ═══════════════════════════════════════════════════════
# TAXBRIDGE PRODUCTION ENVIRONMENT
# ═══════════════════════════════════════════════════════
# Generated by stripe-production-quickstart.ts
# Date: ${new Date().toISOString()}
# ═══════════════════════════════════════════════════════

# APP CONFIGURATION
NEXT_PUBLIC_APP_URL=https://taxbridge.app
DATABASE_PATH=./data/taxbridge.db

# ═══════════════════════════════════════════════════════
# STRIPE PRODUCTION (LIVE MODE)
# ═══════════════════════════════════════════════════════
STRIPE_SECRET_KEY=${secretKey}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${publishableKey}
STRIPE_WEBHOOK_SECRET=${webhookSecret}

# Stripe Price IDs
STRIPE_PRO_PRICE_ID=${proPrice.id}
STRIPE_ENTERPRISE_PRICE_ID=${enterprisePrice.id}
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${proPrice.id}
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=${enterprisePrice.id}

# ═══════════════════════════════════════════════════════
# OTHER SERVICES (Configure separately)
# ═══════════════════════════════════════════════════════

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET=whsec_YOUR_CLERK_WEBHOOK_SECRET

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_ANTHROPIC_API_KEY

# SendGrid Email
SENDGRID_API_KEY=SG.YOUR_SENDGRID_API_KEY
SENDGRID_FROM_EMAIL=noreply@taxbridge.app
SENDGRID_FROM_NAME=TaxBridge
SENDGRID_REPLY_TO=support@taxbridge.app

# Analytics & Monitoring
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_SENTRY_DSN
`;

    // Save .env.production
    const envPath = path.join(process.cwd(), '.env.production');
    fs.writeFileSync(envPath, envContent, 'utf-8');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ .env.production Generated!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Stripe Configuration Summary:');
    console.log(`   Pro Annual:        $299/year  (${proPrice.id})`);
    console.log(`   Enterprise Annual: $2,000/year (${enterprisePrice.id})`);
    console.log(`   Webhook Endpoint:  https://your-domain.vercel.app/api/stripe/webhook\n`);

    console.log('🚀 Next Steps:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('1. Review .env.production file');
    console.log('2. Add remaining service keys (Clerk, Anthropic, SendGrid)');
    console.log('3. Configure Vercel environment variables:');
    console.log('   → Go to Vercel Dashboard → Settings → Environment Variables');
    console.log('   → Add each variable from .env.production');
    console.log('   → Select "Production" environment');
    console.log('4. Deploy to production: git push origin main');
    console.log('5. Test live payment at: https://taxbridge.app/pricing');
    console.log('6. Monitor webhooks: https://dashboard.stripe.com/webhooks\n');

    console.log('📖 For detailed instructions, see: STRIPE_PRODUCTION_SETUP.md\n');

    rl.close();
  } catch (error: any) {
    console.error('\n❌ Error creating products:');
    console.error(error.message);

    if (error.code === 'api_key_expired') {
      console.error('\nYour API key may be invalid or expired.');
    } else if (error.code === 'invalid_request_error') {
      console.error('\nVerify your Stripe account is fully set up:');
      console.error('- Business details verified');
      console.error('- Bank account connected');
      console.error('- Tax information submitted');
    }

    rl.close();
    process.exit(1);
  }
}

main();
