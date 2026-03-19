#!/usr/bin/env node
/**
 * Launch User Feedback Campaign
 *
 * Script to launch targeted feedback collection:
 * - IF paid users exist → "What almost stopped you from buying?"
 * - IF zero paid users → "Why didn't you upgrade?"
 * - Collects 5+ responses with $10 Amazon gift cards
 *
 * Usage:
 *   npm run feedback:launch
 *   npm run feedback:launch --dry-run
 *   npm run feedback:launch --target=paid --responses=10
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface CampaignOptions {
  dryRun?: boolean;
  target?: 'auto' | 'paid' | 'free';
  responses?: number;
  name?: string;
}

async function launchCampaign(options: CampaignOptions = {}) {
  const {
    dryRun = false,
    target = 'auto',
    responses = 5,
    name = `User Feedback Campaign - ${new Date().toLocaleDateString()}`,
  } = options;

  console.log('\n🚀 LAUNCHING USER FEEDBACK CAMPAIGN\n');
  console.log('━'.repeat(60));

  // Step 1: Check current status
  console.log('📊 Checking user database...\n');

  try {
    const statusRes = await fetch(`${API_URL}/api/feedback/launch-campaign`, {
      method: 'GET',
    });

    if (!statusRes.ok) {
      throw new Error(`Status check failed: ${statusRes.statusText}`);
    }

    const status = await statusRes.json();

    console.log(`   Paid users available: ${status.paid_users_available}`);
    console.log(`   Free users available: ${status.free_users_available}`);
    console.log(`   Active campaigns: ${status.active_campaigns}`);
    console.log(`\n   Recommendation: ${status.recommendation}\n`);

    if (status.paid_users_available === 0 && status.free_users_available === 0) {
      console.log('❌ ERROR: No users found in database. Cannot launch campaign.\n');
      console.log('   💡 TIP: Users will be added when they sign up via Clerk.\n');
      process.exit(1);
    }

    // Step 2: Determine campaign type
    let campaignType = '';
    let targetUserType = target;

    if (target === 'auto') {
      if (status.paid_users_available > 0) {
        campaignType = 'PAID';
        targetUserType = 'paid';
        console.log(`✅ Auto-detected: ${status.paid_users_available} PAID users exist\n`);
        console.log(`   📧 Campaign: "What almost stopped you from buying?"\n`);
      } else {
        campaignType = 'FREE';
        targetUserType = 'free';
        console.log(`✅ Auto-detected: NO paid users, ${status.free_users_available} FREE users\n`);
        console.log(`   📧 Campaign: "Why didn't you upgrade?"\n`);
      }
    } else {
      campaignType = target.toUpperCase();
      console.log(`✅ Manual target: ${campaignType} users\n`);
    }

    console.log('━'.repeat(60));

    // Step 3: Launch campaign
    console.log(`\n${dryRun ? '🧪 DRY RUN MODE' : '🚀 LAUNCHING CAMPAIGN'}\n`);

    const launchRes = await fetch(`${API_URL}/api/feedback/launch-campaign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_name: name,
        campaign_description: campaignType === 'PAID'
          ? 'Understand purchase barriers - what almost stopped paid users from subscribing'
          : 'Understand upgrade barriers - why free users haven\'t upgraded',
        target_user_type: targetUserType,
        target_responses: responses,
        dry_run: dryRun,
      }),
    });

    if (!launchRes.ok) {
      const errorData = await launchRes.json();
      throw new Error(errorData.error || 'Campaign launch failed');
    }

    const result = await launchRes.json();

    console.log(`   Campaign ID: ${result.campaign_id}`);
    console.log(`   Campaign Type: ${result.campaign_type}`);
    console.log(`   Target User Type: ${result.target_user_type}`);
    console.log(`   Total Users Found: ${result.total_users_found}`);
    console.log(`   Emails Sent: ${result.emails_sent}`);
    console.log(`   Emails Failed: ${result.emails_failed}`);
    console.log(`   Target Responses: ${result.target_responses}`);

    if (dryRun) {
      console.log('\n   ⚠️  DRY RUN: No emails were actually sent.\n');
    } else {
      console.log('\n   ✅ Campaign launched successfully!\n');
    }

    console.log('\n━'.repeat(60));
    console.log('\n📋 NEXT STEPS:\n');

    result.next_steps.forEach((step: string, i: number) => {
      console.log(`   ${i + 1}. ${step}`);
    });

    console.log('\n━'.repeat(60));

    // Step 4: Show email preview
    console.log('\n📧 EMAIL PREVIEW (sent to users):\n');

    if (campaignType === 'PAID') {
      console.log(`   Subject: "Quick favor? What almost stopped you from subscribing? ($10 gift card)"\n`);
      console.log(`   Key Question: "What almost stopped you from subscribing?"\n`);
      console.log(`   Categories:\n`);
      console.log(`     - Price too high`);
      console.log(`     - Value unclear`);
      console.log(`     - Trust concerns`);
      console.log(`     - Missing feature`);
      console.log(`     - Comparison shopping`);
      console.log(`     - Timing not right\n`);
    } else {
      console.log(`   Subject: "Quick question: What's stopping you from upgrading? ($10 gift card)"\n`);
      console.log(`   Key Question: "What's the main reason you haven't upgraded?"\n`);
      console.log(`   Categories:\n`);
      console.log(`     - Price too high`);
      console.log(`     - Value unclear`);
      console.log(`     - Free tier is enough`);
      console.log(`     - Missing feature`);
      console.log(`     - Still trying it out`);
      console.log(`     - Timing not right\n`);
    }

    console.log(`   Incentive: $10 Amazon gift card (delivered within 24 hours)\n`);
    console.log(`   Survey URL: https://taxbridge.app/survey/user-feedback\n`);

    console.log('\n━'.repeat(60));
    console.log('\n✅ CAMPAIGN LAUNCHED!\n');

    if (!dryRun) {
      console.log(`   📊 Track responses: http://localhost:3000/admin/feedback-campaigns\n`);
      console.log(`   ⏳ Target: ${responses} responses\n`);
      console.log(`   📧 Campaign will auto-complete when target is reached\n`);
    }

    console.log('━'.repeat(60));
    console.log('\n');

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n');
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: CampaignOptions = {
  dryRun: args.includes('--dry-run'),
  target: args.find(arg => arg.startsWith('--target='))?.split('=')[1] as any || 'auto',
  responses: parseInt(args.find(arg => arg.startsWith('--responses='))?.split('=')[1] || '5'),
  name: args.find(arg => arg.startsWith('--name='))?.split('=')[1],
};

// Launch campaign
launchCampaign(options);
