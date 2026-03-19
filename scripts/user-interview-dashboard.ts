#!/usr/bin/env tsx
/**
 * User Interview Campaign Dashboard
 *
 * Real-time tracking dashboard for interview campaign progress
 *
 * Usage:
 *   npm run interview:dashboard
 */

import {
  getInterviewCampaignStats,
  getInterviewInsightsSummary,
  getTopPainPoints,
} from '../lib/db/queries/user-interview-campaign';
import { db } from '../lib/db/init';

/**
 * Display campaign overview
 */
function displayCampaignOverview() {
  console.log('\n' + '='.repeat(80));
  console.log('🎙️  USER INTERVIEW CAMPAIGN DASHBOARD');
  console.log('='.repeat(80));

  const stats = getInterviewCampaignStats();

  console.log('\n📊 CAMPAIGN METRICS\n');
  console.log('┌─────────────────────────────────┬─────────────────────────────────┐');
  console.log('│ METRIC                          │ VALUE                           │');
  console.log('├─────────────────────────────────┼─────────────────────────────────┤');
  console.log(`│ Total Invitations Sent          │ ${String(stats.totalInvited).padEnd(31)} │`);
  console.log(`│ Interviews Booked               │ ${String(stats.totalBooked).padEnd(31)} │`);
  console.log(`│ Interviews Completed            │ ${String(stats.totalCompleted).padEnd(31)} │`);
  console.log(`│ Gift Cards Sent                 │ ${String(stats.totalGiftCardsSent).padEnd(31)} │`);
  console.log(`│ Total Spent                     │ $${String(stats.totalSpent).padEnd(30)}│`);
  console.log('└─────────────────────────────────┴─────────────────────────────────┘');

  console.log('\n📈 CONVERSION FUNNEL\n');
  console.log('┌─────────────────────────────────┬─────────────────────────────────┐');
  console.log('│ STAGE                           │ CONVERSION RATE                 │');
  console.log('├─────────────────────────────────┼─────────────────────────────────┤');
  console.log(`│ Invitation → Booking            │ ${stats.conversionRate.toFixed(1)}%${' '.repeat(28 - stats.conversionRate.toFixed(1).length)} │`);
  console.log(`│ Booking → Completed             │ ${stats.completionRate.toFixed(1)}%${' '.repeat(28 - stats.completionRate.toFixed(1).length)} │`);
  console.log('└─────────────────────────────────┴─────────────────────────────────┘');

  if (stats.avgInterviewDuration !== null) {
    console.log('\n⏱️  INTERVIEW DURATION\n');
    console.log(`   Average: ${stats.avgInterviewDuration.toFixed(1)} minutes`);
    console.log(`   Target: 12-18 minutes`);
    if (stats.avgInterviewDuration < 12) {
      console.log(`   ⚠️  Below target - may need deeper questions`);
    } else if (stats.avgInterviewDuration > 18) {
      console.log(`   ⚠️  Above target - may need to keep interviews more focused`);
    } else {
      console.log(`   ✅ On target!`);
    }
  }
}

/**
 * Display recent bookings
 */
function displayRecentBookings() {
  const bookings = db.prepare(`
    SELECT
      b.id,
      b.email,
      i.first_name as firstName,
      b.scheduled_date as scheduledDate,
      b.scheduled_time as scheduledTime,
      b.status,
      b.created_at as bookedAt
    FROM user_interview_bookings b
    INNER JOIN user_interview_invitations i ON b.invitation_id = i.id
    ORDER BY b.created_at DESC
    LIMIT 10
  `).all() as any[];

  if (bookings.length > 0) {
    console.log('\n📅 RECENT BOOKINGS (Last 10)\n');
    console.log('┌──────────────────────────────────────────┬────────────────┬──────────────┐');
    console.log('│ EMAIL                                    │ DATE           │ STATUS       │');
    console.log('├──────────────────────────────────────────┼────────────────┼──────────────┤');

    bookings.forEach(booking => {
      const emailDisplay = booking.email.length > 40 ? booking.email.slice(0, 37) + '...' : booking.email;
      const dateDisplay = booking.scheduledDate || 'N/A';
      const statusDisplay = booking.status;

      console.log(`│ ${emailDisplay.padEnd(40)} │ ${dateDisplay.padEnd(14)} │ ${statusDisplay.padEnd(12)} │`);
    });

    console.log('└──────────────────────────────────────────┴────────────────┴──────────────┘');
  } else {
    console.log('\n📅 RECENT BOOKINGS: None yet');
  }
}

/**
 * Display completed interviews
 */
function displayCompletedInterviews() {
  const completed = db.prepare(`
    SELECT
      c.id,
      c.email,
      i.first_name as firstName,
      c.interview_date as interviewDate,
      c.interview_duration_minutes as duration,
      c.pain_point_category as painPoint,
      c.gift_card_sent_at as giftCardSent
    FROM user_interview_completed c
    INNER JOIN user_interview_invitations i ON c.invitation_id = i.id
    ORDER BY c.created_at DESC
    LIMIT 10
  `).all() as any[];

  if (completed.length > 0) {
    console.log('\n✅ COMPLETED INTERVIEWS (Last 10)\n');
    console.log('┌──────────────────────────────┬─────────────┬──────────────────┬──────────┐');
    console.log('│ EMAIL                        │ DATE        │ PAIN POINT       │ GC SENT  │');
    console.log('├──────────────────────────────┼─────────────┼──────────────────┼──────────┤');

    completed.forEach(interview => {
      const emailDisplay = interview.email.length > 28 ? interview.email.slice(0, 25) + '...' : interview.email;
      const dateDisplay = interview.interviewDate || 'N/A';
      const painDisplay = (interview.painPoint || 'N/A').slice(0, 16);
      const gcDisplay = interview.giftCardSent ? '✓' : '✗';

      console.log(`│ ${emailDisplay.padEnd(28)} │ ${dateDisplay.padEnd(11)} │ ${painDisplay.padEnd(16)} │ ${gcDisplay.padEnd(8)} │`);
    });

    console.log('└──────────────────────────────┴─────────────┴──────────────────┴──────────┘');
  } else {
    console.log('\n✅ COMPLETED INTERVIEWS: None yet');
  }
}

/**
 * Display insights summary
 */
function displayInsightsSummary() {
  const insights = getInterviewInsightsSummary();

  if (insights.length > 0) {
    console.log('\n💡 INSIGHTS BY CATEGORY\n');
    console.log('┌───────────────────┬────────┬──────────┬─────────────┬───────────────┐');
    console.log('│ CATEGORY          │ COUNT  │ CRITICAL │ ACTIONABLE  │ AVG IMPACT    │');
    console.log('├───────────────────┼────────┼──────────┼─────────────┼───────────────┤');

    insights.forEach(insight => {
      const category = String(insight.category).padEnd(17).slice(0, 17);
      const count = String(insight.count).padEnd(6);
      const critical = String(insight.criticalCount).padEnd(8);
      const actionable = String(insight.actionableCount).padEnd(11);
      const impact = insight.avgConversionImpact !== null
        ? `+${insight.avgConversionImpact.toFixed(1)}%`.padEnd(13)
        : 'N/A'.padEnd(13);

      console.log(`│ ${category} │ ${count} │ ${critical} │ ${actionable} │ ${impact} │`);
    });

    console.log('└───────────────────┴────────┴──────────┴─────────────┴───────────────┘');
  }
}

/**
 * Display top pain points
 */
function displayTopPainPoints() {
  const painPoints = getTopPainPoints(10);

  if (painPoints.length > 0) {
    console.log('\n🔴 TOP PAIN POINTS\n');
    console.log('┌─────────────────────────┬─────────┬────────────────┬──────────────┐');
    console.log('│ PAIN POINT              │ COUNT   │ AFFECTS CONV.  │ AVG IMPACT   │');
    console.log('├─────────────────────────┼─────────┼────────────────┼──────────────┤');

    painPoints.forEach(point => {
      const painDisplay = (point.painPoint || 'uncategorized').padEnd(23).slice(0, 23);
      const count = String(point.count).padEnd(7);
      const affects = point.affectsConversion ? 'Yes' : 'No';
      const impact = point.avgImpact !== null
        ? `+${point.avgImpact.toFixed(1)}%`.padEnd(12)
        : 'N/A'.padEnd(12);

      console.log(`│ ${painDisplay} │ ${count} │ ${affects.padEnd(14)} │ ${impact} │`);
    });

    console.log('└─────────────────────────┴─────────┴────────────────┴──────────────┘');
  } else {
    console.log('\n🔴 TOP PAIN POINTS: No data yet (complete interviews to see pain points)');
  }
}

/**
 * Display action items
 */
function displayActionItems() {
  const actionItems = db.prepare(`
    SELECT
      insight_text,
      insight_category,
      insight_severity,
      action_priority,
      action_needed,
      estimated_conversion_impact_percent
    FROM user_interview_insights
    WHERE is_actionable = 1
      AND action_status IN ('identified', 'planned')
    ORDER BY
      CASE action_priority
        WHEN 'p0' THEN 1
        WHEN 'p1' THEN 2
        WHEN 'p2' THEN 3
        WHEN 'p3' THEN 4
      END,
      estimated_conversion_impact_percent DESC NULLS LAST
    LIMIT 10
  `).all() as any[];

  if (actionItems.length > 0) {
    console.log('\n🎯 TOP ACTION ITEMS (Next Steps)\n');

    actionItems.forEach((item, index) => {
      const priority = (item.action_priority || 'p3').toUpperCase();
      const impact = item.estimated_conversion_impact_percent
        ? ` (+${item.estimated_conversion_impact_percent.toFixed(1)}% conversion lift)`
        : '';

      console.log(`${index + 1}. [${priority}] ${item.insight_text}${impact}`);
      if (item.action_needed) {
        console.log(`   → Action: ${item.action_needed}`);
      }
      console.log('');
    });
  } else {
    console.log('\n🎯 TOP ACTION ITEMS: No actionable insights yet');
  }
}

/**
 * Display recommendations
 */
function displayRecommendations() {
  const stats = getInterviewCampaignStats();

  console.log('\n💬 RECOMMENDATIONS\n');

  // Need more interviews?
  if (stats.totalCompleted < 10) {
    console.log(`📊 You've completed ${stats.totalCompleted}/10 interviews.`);
    console.log(`   → Send ${Math.min(20, 10 - stats.totalCompleted + 5)} more invitations to reach 10 completed interviews.`);
    console.log('');
  }

  // Low conversion rate?
  if (stats.conversionRate < 10 && stats.totalInvited > 10) {
    console.log(`⚠️  Invitation-to-booking conversion rate is ${stats.conversionRate.toFixed(1)}% (target: 15-25%).`);
    console.log(`   → Consider: (1) Test different subject lines, (2) Increase gift card to $30, (3) Send reminders`);
    console.log('');
  }

  // Low completion rate?
  if (stats.completionRate < 70 && stats.totalBooked > 5) {
    console.log(`⚠️  Booking-to-completion rate is ${stats.completionRate.toFixed(1)}% (target: 80-90%).`);
    console.log(`   → Action: Send 24-hour reminders before scheduled interviews`);
    console.log('');
  }

  // Enough data to act?
  if (stats.totalCompleted >= 5) {
    const painPoints = getTopPainPoints(3);
    if (painPoints.length > 0 && painPoints[0].count >= 3) {
      console.log(`🎯 TOP PAIN POINT: "${painPoints[0].painPoint}" (mentioned ${painPoints[0].count} times)`);
      console.log(`   → This is blocking conversions. Address this immediately!`);
      console.log('');
    }
  }

  // Ready to act?
  if (stats.totalCompleted >= 10) {
    console.log(`✅ You've hit your 10-interview goal!`);
    console.log(`   → Next steps:`);
    console.log(`      1. Review top pain points and prioritize P0/P1 fixes`);
    console.log(`      2. Build MVPs of most-requested features`);
    console.log(`      3. Run A/B tests for pricing if 50%+ mentioned cost`);
    console.log(`      4. Consider scheduling follow-up interviews after fixes`);
    console.log('');
  }
}

/**
 * Main execution
 */
function main() {
  displayCampaignOverview();
  displayRecentBookings();
  displayCompletedInterviews();
  displayInsightsSummary();
  displayTopPainPoints();
  displayActionItems();
  displayRecommendations();

  console.log('\n' + '='.repeat(80));
  console.log('');
}

main();
