#!/usr/bin/env tsx
/**
 * Calculator Feedback Campaign Statistics
 *
 * Shows quick stats for the calculator feedback collection campaign.
 *
 * Usage: npm run feedback:stats
 */

import {
  getFeedbackCampaignStats,
  getTopFeedbackReasons,
  getRecentFeedbackResponses,
  getNonConvertingUsers,
} from '../lib/queries/non-converting-users';
import { getFeedbackDiscountStats } from '../lib/discount-codes';

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 CALCULATOR FEEDBACK CAMPAIGN STATISTICS');
  console.log('='.repeat(70) + '\n');

  // Campaign performance stats
  const campaignStats = getFeedbackCampaignStats();

  console.log('📈 CAMPAIGN PERFORMANCE\n');
  console.log(`Total Requests Sent:           ${campaignStats.totalRequestsSent}`);
  console.log(`Total Responses:               ${campaignStats.totalResponses}`);
  console.log(`Response Rate:                 ${campaignStats.responseRate.toFixed(1)}%`);
  console.log(`Total Reminders Sent:          ${campaignStats.totalRemindersSent}`);
  console.log(`Responses After Reminder:      ${campaignStats.responsesAfterReminder}`);
  console.log(`Total Discounts Used:          ${campaignStats.totalDiscountsUsed}`);
  console.log(`Discount Usage Rate:           ${campaignStats.discountUsageRate.toFixed(1)}%`);
  console.log(`Response to Conversion Rate:   ${campaignStats.responseToConversionRate.toFixed(1)}%`);

  // Discount code stats
  console.log('\n' + '='.repeat(70));
  console.log('💰 DISCOUNT CODE STATISTICS\n');

  const discountStats = getFeedbackDiscountStats();

  console.log(`Total Generated:               ${discountStats.totalGenerated}`);
  console.log(`Total Used:                    ${discountStats.totalUsed}`);
  console.log(`Total Expired:                 ${discountStats.totalExpired}`);
  console.log(`Total Active:                  ${discountStats.totalActive}`);
  console.log(`Conversion Rate:               ${discountStats.conversionRate.toFixed(1)}%`);

  // Top reasons for not converting
  console.log('\n' + '='.repeat(70));
  console.log('🔍 TOP REASONS FOR NOT CONVERTING\n');

  const topReasons = getTopFeedbackReasons(5);

  if (topReasons.length === 0) {
    console.log('   No feedback responses yet.\n');
  } else {
    topReasons.forEach((reason, index) => {
      console.log(`${index + 1}. ${reason.reasonCategory?.replace(/_/g, ' ').toUpperCase() || 'UNCATEGORIZED'}`);
      console.log(`   ${reason.responseCount} responses (${reason.percentage.toFixed(1)}%)`);
      if (reason.sampleResponses) {
        const sample = reason.sampleResponses.split(' | ')[0]?.slice(0, 100);
        console.log(`   Sample: "${sample}..."`);
      }
      console.log('');
    });
  }

  // Recent responses
  console.log('='.repeat(70));
  console.log('📝 RECENT FEEDBACK RESPONSES (Last 5)\n');

  const recentResponses = getRecentFeedbackResponses(5);

  if (recentResponses.length === 0) {
    console.log('   No responses yet.\n');
  } else {
    recentResponses.forEach((response, index) => {
      console.log(`${index + 1}. ${response.email}`);
      console.log(`   Submitted: ${new Date(response.submittedAt).toLocaleDateString()}`);
      console.log(`   Reason: "${response.stoppedReason.slice(0, 100)}${response.stoppedReason.length > 100 ? '...' : ''}"`);
      console.log(`   Price perception: ${response.pricePerception || 'N/A'}`);
      console.log(`   Would consider later: ${response.wouldConsiderLater ? 'Yes' : 'No'}`);
      console.log(`   Likelihood to purchase: ${response.likelihoodToPurchase || 'N/A'}/10`);
      console.log(`   Calculator rating: ${response.calculatorRating || 'N/A'}/5`);
      console.log(`   Discount used: ${response.discountUsed ? '✅ YES' : '❌ No'}`);
      console.log('');
    });
  }

  // Eligible users for next batch
  console.log('='.repeat(70));
  console.log('👥 ELIGIBLE USERS FOR NEXT BATCH\n');

  const eligibleUsers = getNonConvertingUsers({
    minCalculations: 1,
    minDaysSinceFirst: 3,
    maxDaysSinceFirst: 30,
    limit: 100,
  });

  console.log(`Total eligible users: ${eligibleUsers.length}`);

  if (eligibleUsers.length > 0) {
    console.log('\nTop 5 candidates:');
    eligibleUsers.slice(0, 5).forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ${user.totalCalculations} calculations, ${user.daysSinceFirstCalculation} days ago`);
    });
  } else {
    console.log('\nNo eligible users found. Campaign criteria:');
    console.log('  - Completed at least 1 tax calculation');
    console.log('  - Subscription tier = free (not paid)');
    console.log('  - First calculation 3-30 days ago');
    console.log('  - No feedback request sent yet');
  }

  console.log('\n' + '='.repeat(70));
  console.log('✨ Statistics complete!\n');

  // Revenue calculation
  if (campaignStats.totalDiscountsUsed > 0) {
    const avgPrice = 79; // $79/year
    const discount = 0.2; // 20% off
    const revenue = campaignStats.totalDiscountsUsed * avgPrice * (1 - discount);

    console.log('💵 REVENUE FROM CAMPAIGN\n');
    console.log(`   Conversions: ${campaignStats.totalDiscountsUsed}`);
    console.log(`   Revenue: $${revenue.toFixed(2)} (${campaignStats.totalDiscountsUsed} × $${avgPrice} × 80%)`);
    console.log('');
  }

  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
