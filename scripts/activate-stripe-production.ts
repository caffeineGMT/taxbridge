/**
 * Stripe Production Activation Script
 *
 * CRITICAL: This script activates LIVE payment processing
 *
 * Prerequisites:
 * 1. Stripe account verified with business details
 * 2. Bank account connected
 * 3. Tax information submitted
 * 4. Domain verified: taxbridge.app
 *
 * Usage: npm run stripe:activate-production
 */

import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

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

interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  proPriceId: string;
  enterprisePriceId: string;
}

async function validateStripeAccount(stripe: Stripe): Promise<boolean> {
  console.log('\n🔍 Validating Stripe account...');

  try {
    const account = await stripe.accounts.retrieve();

    console.log(`   Account ID: ${account.id}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Email: ${account.email}`);
    console.log(`   Charges enabled: ${account.charges_enabled ? '✅' : '❌'}`);
    console.log(`   Payouts enabled: ${account.payouts_enabled ? '✅' : '❌'}`);

    if (!account.charges_enabled) {
      console.error('\n❌ ERROR: Charges not enabled on this account');
      console.error('   Complete account setup: https://dashboard.stripe.com/settings/account');
      return false;
    }

    if (!account.payouts_enabled) {
      console.warn('\n⚠️  WARNING: Payouts not enabled');
      console.warn('   You can accept payments but cannot receive payouts yet');
      console.warn('   Complete bank account setup: https://dashboard.stripe.com/settings/payouts');
    }

    return true;
  } catch (error: any) {
    console.error(`\n❌ Account validation failed: ${error.message}`);
    return false;
  }
}

async function createProducts(stripe: Stripe): Promise<{ proPriceId: string; enterprisePriceId: string }> {
  console.log('\n📦 Creating products in LIVE mode...');

  try {
    // Check if products already exist
    const existingProducts = await stripe.products.list({ limit: 100 });
    const existingPro = existingProducts.data.find(p => p.name === 'TaxBridge Pro');
    const existingEnterprise = existingProducts.data.find(p => p.name === 'TaxBridge Enterprise');

    let proPriceId: string;
    let enterprisePriceId: string;

    // Pro Product
    if (existingPro) {
      console.log(`   ✓ TaxBridge Pro already exists (${existingPro.id})`);
      const prices = await stripe.prices.list({ product: existingPro.id });
      const annualPrice = prices.data.find(p => p.recurring?.interval === 'year');

      if (annualPrice) {
        proPriceId = annualPrice.id;
        console.log(`   ✓ Using existing Pro annual price: ${proPriceId}`);
      } else {
        const newPrice = await stripe.prices.create({
          product: existingPro.id,
          unit_amount: 29900, // $299.00
          currency: 'usd',
          recurring: { interval: 'year' },
          metadata: { tier: 'pro', billing_cycle: 'annual' },
        });
        proPriceId = newPrice.id;
        console.log(`   ✓ Created Pro annual price: ${proPriceId}`);
      }
    } else {
      console.log('   Creating TaxBridge Pro product...');
      const proProduct = await stripe.products.create({
        name: 'TaxBridge Pro',
        description: 'Unlimited RSU entries, FTC optimizer, multi-year dashboard, PDF exports, and priority support',
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

      proPriceId = proPrice.id;
      console.log(`   ✓ Created Pro product: $299/year (${proPriceId})`);
    }

    // Enterprise Product
    if (existingEnterprise) {
      console.log(`   ✓ TaxBridge Enterprise already exists (${existingEnterprise.id})`);
      const prices = await stripe.prices.list({ product: existingEnterprise.id });
      const annualPrice = prices.data.find(p => p.recurring?.interval === 'year');

      if (annualPrice) {
        enterprisePriceId = annualPrice.id;
        console.log(`   ✓ Using existing Enterprise annual price: ${enterprisePriceId}`);
      } else {
        const newPrice = await stripe.prices.create({
          product: existingEnterprise.id,
          unit_amount: 200000, // $2,000.00
          currency: 'usd',
          recurring: { interval: 'year' },
          metadata: { tier: 'enterprise', billing_cycle: 'annual' },
        });
        enterprisePriceId = newPrice.id;
        console.log(`   ✓ Created Enterprise annual price: ${enterprisePriceId}`);
      }
    } else {
      console.log('   Creating TaxBridge Enterprise product...');
      const enterpriseProduct = await stripe.products.create({
        name: 'TaxBridge Enterprise',
        description: 'All Pro features plus API access, client management, white-label reports, and dedicated support',
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

      enterprisePriceId = enterprisePrice.id;
      console.log(`   ✓ Created Enterprise product: $2,000/year (${enterprisePriceId})`);
    }

    return { proPriceId, enterprisePriceId };
  } catch (error: any) {
    console.error(`\n❌ Product creation failed: ${error.message}`);
    throw error;
  }
}

async function setupWebhook(stripe: Stripe, config: StripeConfig): Promise<void> {
  console.log('\n📡 Setting up webhook endpoint...');

  const webhookUrl = 'https://taxbridge.app/api/stripe/webhook';
  const requiredEvents = [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
  ];

  try {
    const webhooks = await stripe.webhookEndpoints.list();
    const existingWebhook = webhooks.data.find(w => w.url === webhookUrl);

    if (existingWebhook) {
      console.log(`   ✓ Webhook already exists: ${webhookUrl}`);
      console.log(`   ✓ Webhook ID: ${existingWebhook.id}`);
      console.log(`   ✓ Status: ${existingWebhook.status}`);

      // Verify events
      const hasAllEvents = requiredEvents.every(event =>
        existingWebhook.enabled_events.includes(event as any)
      );

      if (!hasAllEvents) {
        console.warn('   ⚠️  Some required events are missing. Update the webhook manually.');
      }
    } else {
      console.log('\n⚠️  Webhook endpoint not found. Please create it manually:');
      console.log(`   1. Go to: https://dashboard.stripe.com/webhooks`);
      console.log(`   2. Click "Add endpoint"`);
      console.log(`   3. Endpoint URL: ${webhookUrl}`);
      console.log('   4. Select these events:');
      requiredEvents.forEach(event => console.log(`      - ${event}`));
      console.log('   5. Copy the webhook signing secret (whsec_...)');
      console.log('   6. Update STRIPE_WEBHOOK_SECRET in Vercel environment variables');
    }
  } catch (error: any) {
    console.error(`\n❌ Webhook check failed: ${error.message}`);
  }
}

async function updateEnvProduction(config: StripeConfig): Promise<void> {
  console.log('\n📝 Updating .env.production...');

  const envPath = path.join(process.cwd(), '.env.production');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  // Update Stripe configuration
  envContent = envContent.replace(/STRIPE_SECRET_KEY=.*/,              `STRIPE_SECRET_KEY=${config.secretKey}`);
  envContent = envContent.replace(/NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*/, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${config.publishableKey}`);
  envContent = envContent.replace(/STRIPE_WEBHOOK_SECRET=.*/,         `STRIPE_WEBHOOK_SECRET=${config.webhookSecret}`);
  envContent = envContent.replace(/STRIPE_PRO_PRICE_ID=.*/,           `STRIPE_PRO_PRICE_ID=${config.proPriceId}`);
  envContent = envContent.replace(/STRIPE_ENTERPRISE_PRICE_ID=.*/,    `STRIPE_ENTERPRISE_PRICE_ID=${config.enterprisePriceId}`);
  envContent = envContent.replace(/NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=.*/, `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${config.proPriceId}`);
  envContent = envContent.replace(/NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=.*/, `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=${config.enterprisePriceId}`);

  fs.writeFileSync(envPath, envContent, 'utf-8');
  console.log('   ✓ .env.production updated');
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚨 STRIPE PRODUCTION ACTIVATION - REVENUE ACTIVATION 🚨');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('⚠️  WARNING: This script will activate LIVE payment processing');
  console.log('⚠️  You will be able to accept REAL payments with REAL credit cards');
  console.log('⚠️  Make sure your Stripe account is fully verified\n');

  const confirmed = await question('Do you want to continue? (yes/no): ');
  if (confirmed.toLowerCase() !== 'yes') {
    console.log('\n❌ Activation cancelled');
    rl.close();
    return;
  }

  console.log('\n📋 Step 1: Get Stripe LIVE API Keys');
  console.log('   Go to: https://dashboard.stripe.com/apikeys');
  console.log('   Toggle to "Production" mode (top right)\n');

  const secretKey = await question('Enter Stripe LIVE secret key (sk_live_...): ');
  const publishableKey = await question('Enter Stripe LIVE publishable key (pk_live_...): ');

  // Validate keys
  if (!secretKey.startsWith('sk_live_')) {
    console.error('\n❌ ERROR: Secret key must start with sk_live_');
    console.error('   You provided a test key. Activation cancelled.');
    rl.close();
    return;
  }

  if (!publishableKey.startsWith('pk_live_')) {
    console.error('\n❌ ERROR: Publishable key must start with pk_live_');
    console.error('   You provided a test key. Activation cancelled.');
    rl.close();
    return;
  }

  console.log('\n✅ Keys validated (LIVE mode)');

  // Initialize Stripe
  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  });

  // Validate account
  const accountValid = await validateStripeAccount(stripe);
  if (!accountValid) {
    console.error('\n❌ Account validation failed. Fix issues and try again.');
    rl.close();
    return;
  }

  // Create products
  const { proPriceId, enterprisePriceId } = await createProducts(stripe);

  // Get webhook secret
  console.log('\n📡 Step 2: Webhook Configuration');
  console.log('   If you already created a webhook, enter the secret.');
  console.log('   Otherwise, create one after this script completes.\n');

  const webhookSecret = await question('Enter webhook signing secret (whsec_...) or press Enter to skip: ');

  const config: StripeConfig = {
    secretKey,
    publishableKey,
    webhookSecret: webhookSecret || 'whsec_YOUR_WEBHOOK_SECRET',
    proPriceId,
    enterprisePriceId,
  };

  // Setup webhook (informational)
  await setupWebhook(stripe, config);

  // Update .env.production
  await updateEnvProduction(config);

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ STRIPE PRODUCTION ACTIVATION COMPLETE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📊 Configuration Summary:');
  console.log(`   Pro Annual:        $299/year  (${proPriceId})`);
  console.log(`   Enterprise Annual: $2,000/year (${enterprisePriceId})`);
  console.log(`   Webhook URL:       https://taxbridge.app/api/stripe/webhook\n`);

  console.log('🚀 Next Steps:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('1. Verify .env.production contains correct values');
  console.log('2. Add environment variables to Vercel:');
  console.log('   → Go to: https://vercel.com/dashboard');
  console.log('   → Settings → Environment Variables');
  console.log('   → Add each variable from .env.production');
  console.log('   → Select "Production" environment');
  console.log('3. Create webhook endpoint if not done:');
  console.log('   → https://dashboard.stripe.com/webhooks');
  console.log('   → Add endpoint: https://taxbridge.app/api/stripe/webhook');
  console.log('   → Update STRIPE_WEBHOOK_SECRET in Vercel');
  console.log('4. Deploy to production:');
  console.log('   → git add .env.production');
  console.log('   → git commit -m "Activate Stripe production mode"');
  console.log('   → git push origin main');
  console.log('5. Test payment flow:');
  console.log('   → npm run test:live-payment');
  console.log('6. Monitor:');
  console.log('   → Stripe Dashboard: https://dashboard.stripe.com');
  console.log('   → Webhook logs: https://dashboard.stripe.com/webhooks\n');

  console.log('⚠️  IMPORTANT: Do NOT commit .env.production with real keys to GitHub');
  console.log('   Add .env.production to .gitignore if not already there\n');

  console.log('📖 For detailed testing instructions, see:');
  console.log('   - docs/LIVE_PAYMENT_TEST_GUIDE.md');
  console.log('   - docs/REFUND_TEST_GUIDE.md\n');

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Activation failed:', error.message);
  rl.close();
  process.exit(1);
});
