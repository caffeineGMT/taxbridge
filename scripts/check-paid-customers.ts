#!/usr/bin/env tsx
/**
 * Check Stripe for Paid Customers
 *
 * This script queries the Stripe API to find all paying customers
 * and outputs their details for user interview outreach.
 *
 * Usage:
 *   npx tsx scripts/check-paid-customers.ts
 *
 * Requirements:
 *   - STRIPE_SECRET_KEY must be set (use production key)
 *   - Stripe must be in live mode for real customer data
 */

import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

interface PaidCustomer {
  customerId: string;
  email: string;
  name: string;
  subscriptionId: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  metadata: Record<string, string>;
}

async function checkPaidCustomers(): Promise<void> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment');
    console.error('Please set STRIPE_SECRET_KEY to your production key');
    process.exit(1);
  }

  // Check if we're in test mode
  const isTestMode = stripeKey.startsWith('sk_test_');
  if (isTestMode) {
    console.warn('⚠️  WARNING: Using TEST mode Stripe key');
    console.warn('⚠️  No real paid customers will be found');
    console.warn('⚠️  Set STRIPE_SECRET_KEY to your sk_live_... key for production data\n');
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2024-12-18.acacia',
  });

  console.log('🔍 Searching for paid customers in Stripe...\n');

  try {
    // Get all customers with active or past subscriptions
    const customers = await stripe.customers.list({
      limit: 100, // Adjust if you expect more than 100 customers
    });

    const paidCustomers: PaidCustomer[] = [];

    for (const customer of customers.data) {
      // Get subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 10,
      });

      // Filter for active or recently canceled subscriptions
      const relevantSubs = subscriptions.data.filter(sub =>
        sub.status === 'active' ||
        sub.status === 'past_due' ||
        sub.status === 'canceled'
      );

      for (const sub of relevantSubs) {
        const priceData = sub.items.data[0]?.price;

        paidCustomers.push({
          customerId: customer.id,
          email: customer.email || 'No email',
          name: customer.name || 'No name',
          subscriptionId: sub.id,
          plan: priceData?.nickname || priceData?.id || 'Unknown plan',
          amount: (priceData?.unit_amount || 0) / 100,
          currency: (priceData?.currency || 'usd').toUpperCase(),
          status: sub.status,
          createdAt: new Date(sub.created * 1000).toISOString(),
          metadata: customer.metadata || {},
        });
      }
    }

    // Display results
    if (paidCustomers.length === 0) {
      console.log('📊 RESULT: No paid customers found');
      console.log('');
      console.log('This means:');
      console.log('  • User interview campaign cannot be executed yet');
      console.log('  • Wait for first paid customer before launching outreach');
      console.log('  • Email templates are ready in /lib/email-templates/user-interview.ts');
      console.log('');

      if (isTestMode) {
        console.log('⚠️  You are using TEST mode - check production Stripe for real customers');
      } else {
        console.log('✅ Production Stripe checked - genuinely 0 paid customers');
      }
    } else {
      console.log(`✅ Found ${paidCustomers.length} paid customer(s):\n`);

      paidCustomers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.name} <${customer.email}>`);
        console.log(`   Plan: ${customer.plan} - $${customer.amount} ${customer.currency}`);
        console.log(`   Status: ${customer.status}`);
        console.log(`   Subscribed: ${new Date(customer.createdAt).toLocaleDateString()}`);
        console.log('');
      });

      // Save to file for email campaign
      const outputDir = path.join(process.cwd(), 'data', 'user-interviews');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputFile = path.join(outputDir, `paid-customers-${new Date().toISOString().split('T')[0]}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(paidCustomers, null, 2));

      console.log(`💾 Customer list saved to: ${outputFile}`);
      console.log('');
      console.log('NEXT STEPS:');
      console.log('1. Run: npx tsx scripts/send-user-interview-emails.ts');
      console.log('2. Monitor responses in data/user-interviews/responses/');
      console.log('3. Goal: Collect 5+ responses with $25 gift card incentive');
    }

  } catch (error) {
    console.error('❌ Error querying Stripe:', error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run the check
checkPaidCustomers().catch(console.error);
