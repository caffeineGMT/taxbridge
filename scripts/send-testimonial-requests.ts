#!/usr/bin/env tsx
/**
 * Send testimonial requests to first 10 paid customers
 * Offers 1-month free extension as incentive
 */

import {
  getPaidCustomersForTestimonialRequest,
  createTestimonialRequest,
  markTestimonialRequestSent,
} from '../lib/db/queries/testimonials';
import { sendTestimonialRequest } from '../lib/email/testimonial-request';
import 'dotenv/config';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app';

async function main() {
  console.log('🎯 Testimonial Request Campaign\n');
  console.log('═'.repeat(60));

  // Get first 10 paid customers who haven't been asked
  const customers = getPaidCustomersForTestimonialRequest(10);

  if (customers.length === 0) {
    console.log('✓ No customers to contact (all have been sent requests)');
    return;
  }

  console.log(`\n📧 Found ${customers.length} customers to contact:\n`);

  let successCount = 0;
  let failCount = 0;

  for (const customer of customers) {
    const { id, email, first_name, subscription_tier } = customer;

    console.log(`  → ${first_name || 'Customer'} (${email}) - ${subscription_tier}`);

    try {
      // Create testimonial request record
      const requestId = createTestimonialRequest(id, email);

      // Generate unique testimonial submission URL
      const testimonialUrl = `${APP_URL}/testimonial/submit?request_id=${requestId}`;

      // Send email
      const sent = await sendTestimonialRequest({
        firstName: first_name || 'Customer',
        email,
        subscriptionTier: subscription_tier,
        testimonialUrl,
      });

      if (sent) {
        markTestimonialRequestSent(requestId);
        successCount++;
        console.log(`    ✓ Email sent successfully`);
      } else {
        failCount++;
        console.log(`    ✗ Email failed to send`);
      }

      // Rate limiting: wait 500ms between emails
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error: any) {
      failCount++;
      console.error(`    ✗ Error: ${error.message}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 Campaign Results:');
  console.log(`  ✓ Successfully sent: ${successCount}`);
  console.log(`  ✗ Failed: ${failCount}`);
  console.log(`  📈 Success rate: ${Math.round((successCount / customers.length) * 100)}%`);

  console.log('\n💡 Next Steps:');
  console.log('  1. Monitor responses at /admin/testimonials');
  console.log('  2. Send reminders after 7 days: npm run testimonials:send-reminders');
  console.log('  3. Approve and feature best testimonials');
  console.log('  4. Add to homepage and pricing page');
  console.log('\n✨ Campaign complete!\n');
}

main().catch(console.error);
