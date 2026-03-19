/**
 * Test Product Hunt Campaign Email
 *
 * Sends a test email to yourself before executing the full campaign
 *
 * Usage: npm run test:ph-campaign
 */

import { sendPHVoterEmail } from '@/lib/email/product-hunt-campaign';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testPHCampaignEmail() {
  console.log('🧪 Testing Product Hunt Campaign Email...\n');

  // Verify SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found in environment variables');
    console.error('Please add your SendGrid API key to .env.local');
    process.exit(1);
  }

  // Test data
  const testEmail = {
    firstName: 'Michael',
    email: process.env.TEST_EMAIL || 'michael@taxbridge.app', // Change to your email
    phRank: 3, // Example: #3 on Product Hunt
    phUpvotes: 247,
    phUrl: 'https://www.producthunt.com/posts/taxbridge',
  };

  console.log('📧 Test Email Details:');
  console.log(`   To:        ${testEmail.email}`);
  console.log(`   Name:      ${testEmail.firstName}`);
  console.log(`   PH Rank:   #${testEmail.phRank}`);
  console.log(`   Upvotes:   ${testEmail.phUpvotes}`);
  console.log(`   PH URL:    ${testEmail.phUrl}\n`);

  try {
    const success = await sendPHVoterEmail(testEmail);

    if (success) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ SUCCESS! Test Email Sent');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log('📬 Check your inbox:');
      console.log(`   Email: ${testEmail.email}`);
      console.log(`   Subject: "Thanks for your Product Hunt vote! Here's 20% off 🎁"\n`);

      console.log('✓ Verify the email contains:');
      console.log('  • Correct Product Hunt rank and upvotes');
      console.log('  • HUNT20 promo code (20% discount)');
      console.log('  • 7-day expiration notice');
      console.log('  • Links to pricing page with UTM tracking');
      console.log('  • Unsubscribe link\n');

      console.log('🎯 Next Steps:');
      console.log('1. Check email rendering in inbox');
      console.log('2. Test HUNT20 promo code on pricing page');
      console.log('3. Verify UTM tracking in analytics');
      console.log('4. If everything looks good, execute full campaign');
      console.log('5. Go to: http://localhost:3000/admin/post-launch-campaign\n');

    } else {
      console.error('❌ Failed to send test email');
      console.error('Check SendGrid configuration and API key');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error sending test email:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  }
}

// Run the test
testPHCampaignEmail();
