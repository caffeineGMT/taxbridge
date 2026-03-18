#!/usr/bin/env tsx
/**
 * Testimonial Collection Script
 *
 * Sends personalized emails to paid customers requesting testimonials.
 * Offers 1 month free extension as incentive.
 *
 * Usage:
 *   npm run collect:testimonials
 *   npm run collect:testimonials -- --dry-run
 */

import { getDatabase } from '../lib/db';
import { sendEmail } from '../lib/email/sendgrid';

interface PaidCustomer {
  id: number;
  email: string;
  first_name: string | null;
  subscription_tier: 'pro' | 'enterprise';
  subscription_created_at: string;
  days_subscribed: number;
}

/**
 * Get email template data for testimonial request
 */
function getTestimonialRequestEmailData(customer: PaidCustomer) {
  const firstName = customer.first_name || 'there';
  const tierName = customer.subscription_tier === 'pro' ? 'Pro' : 'Enterprise';

  return {
    first_name: firstName,
    tier_name: tierName,
    days_subscribed: customer.days_subscribed,
    testimonial_form_url: `${process.env.NEXT_PUBLIC_BASE_URL}/testimonials/submit?user=${customer.id}`,
    unsubscribe_url: `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(customer.email)}`,
  };
}

/**
 * Email template (plain text version for SendGrid Dynamic Template)
 */
const EMAIL_TEMPLATE = `
Subject: Quick favor - how's TaxBridge working for you?

Hi {{first_name}},

Thanks for being one of our first {{tier_name}} customers! I'm following up to see how TaxBridge is working for you.

Quick questions:
1. How much did you save on your cross-border taxes using TaxBridge?
2. What was your biggest "aha" moment or favorite feature?
3. Would you recommend TaxBridge to other H-1B/TN visa holders? Why?

If you're happy with the product, would you mind sharing a short testimonial (2-3 sentences)? I'd love to feature it on our homepage.

**In return, I'll extend your {{tier_name}} subscription by 1 month for free.**

You can reply directly to this email or fill out this quick form:
{{testimonial_form_url}}

Thanks!
Michael
Founder, TaxBridge

---
You're receiving this because you're a TaxBridge {{tier_name}} subscriber.
Unsubscribe: {{unsubscribe_url}}
`;

/**
 * Get paid customers eligible for testimonial requests
 *
 * Criteria:
 * - Active Pro or Enterprise subscription
 * - Subscribed for at least 7 days (enough time to experience value)
 * - Not already provided a testimonial
 * - Not contacted for testimonial in last 30 days
 */
function getEligibleCustomers(): PaidCustomer[] {
  const db = getDatabase();

  const query = `
    SELECT
      up.id,
      up.email,
      up.first_name,
      up.subscription_tier,
      up.subscription_created_at,
      CAST((julianday('now') - julianday(up.subscription_created_at)) AS INTEGER) AS days_subscribed
    FROM user_profiles up
    WHERE
      up.subscription_tier IN ('pro', 'enterprise')
      AND up.subscription_status = 'active'
      AND julianday('now') - julianday(up.subscription_created_at) >= 7
      AND up.email IS NOT NULL
      AND up.id NOT IN (
        SELECT user_id FROM testimonials WHERE approved = 1
      )
      AND up.id NOT IN (
        SELECT user_id FROM email_events
        WHERE event_type = 'testimonial_request'
        AND julianday('now') - julianday(sent_at) < 30
      )
    ORDER BY days_subscribed DESC
    LIMIT 10;
  `;

  return db.prepare(query).all() as PaidCustomer[];
}

/**
 * Record testimonial request in email_events table
 */
function recordTestimonialRequest(userId: number) {
  const db = getDatabase();

  db.prepare(`
    INSERT INTO email_events (user_id, event_type, sent_at, metadata)
    VALUES (?, 'testimonial_request', CURRENT_TIMESTAMP, '{"campaign": "testimonial_collection"}')
  `).run(userId);
}

/**
 * Main execution
 */
async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('📧 Testimonial Collection Script\n');

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No emails will be sent\n');
  }

  // Get eligible customers
  const customers = getEligibleCustomers();

  console.log(`Found ${customers.length} eligible customers:\n`);

  if (customers.length === 0) {
    console.log('✅ No customers eligible at this time.');
    console.log('\nCriteria:');
    console.log('- Active Pro/Enterprise subscription');
    console.log('- Subscribed for 7+ days');
    console.log('- No existing testimonial');
    console.log('- Not contacted in last 30 days\n');
    return;
  }

  // Display customers
  customers.forEach((customer, idx) => {
    console.log(`${idx + 1}. ${customer.email}`);
    console.log(`   Name: ${customer.first_name || 'N/A'}`);
    console.log(`   Tier: ${customer.subscription_tier}`);
    console.log(`   Days subscribed: ${customer.days_subscribed}`);
    console.log('');
  });

  if (isDryRun) {
    console.log('✅ Dry run complete. Use without --dry-run to send emails.\n');
    return;
  }

  // Confirm before sending
  console.log('⚠️  About to send testimonial request emails to these customers.');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Send emails
  let sent = 0;
  let failed = 0;

  for (const customer of customers) {
    try {
      const emailData = getTestimonialRequestEmailData(customer);

      const success = await sendEmail({
        to: customer.email,
        subject: 'Quick favor - how\'s TaxBridge working for you?',
        templateId: process.env.SENDGRID_TEMPLATE_TESTIMONIAL_REQUEST || 'd-testimonial-request',
        dynamicData: emailData,
      });

      if (success) {
        recordTestimonialRequest(customer.id);
        sent++;
        console.log(`✓ Sent to ${customer.email}`);
      } else {
        failed++;
        console.error(`✗ Failed to send to ${customer.email}`);
      }

      // Rate limiting: 100ms between emails
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      failed++;
      console.error(`✗ Error sending to ${customer.email}:`, error);
    }
  }

  console.log(`\n✅ Testimonial collection complete`);
  console.log(`   Sent: ${sent}`);
  console.log(`   Failed: ${failed}\n`);
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { main as collectTestimonials };
