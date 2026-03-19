import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendgrid';
import {
  getUsersForReengagement,
  recordReengagementEmailSent,
  getReengagementMetrics,
} from '@/lib/db/queries/reengagement-campaign';
import {
  getReengagementDay3EmailData,
  getReengagementDay7EmailData,
  getReengagementDay14EmailData,
} from '@/lib/email/reengagement-campaign-templates';
import { handleApiError } from '@/lib/api-error-handler';

// Configure route as dynamic (required for Vercel Cron)
export const dynamic = 'force-dynamic';

interface ReengagementConfig {
  eventType: 'reengagement_day3' | 'reengagement_day7' | 'reengagement_day14';
  dayOffset: 3 | 7 | 14;
  description: string;
  discountCode?: string;
  getEmailData: (params: {
    firstName: string;
    email: string;
    calculationsSaved?: number;
    estimatedTaxSavings?: number;
    discountCode?: string;
  }) => { subject: string; html: string; text: string; data: any };
}

/**
 * RE-ENGAGEMENT CAMPAIGN CONFIGURATION
 *
 * Target: Calculator users who didn't convert to paid subscriptions
 * Trigger: User completed calculator but no purchase within 72 hours
 *
 * Day 3: Case Study (Social proof - "How Michael saved $12K")
 * Day 7: Discount Offer (20% off - limited time)
 * Day 14: Last Chance (Urgency + FOMO - expires tonight)
 */
const REENGAGEMENT_CONFIGS: ReengagementConfig[] = [
  {
    eventType: 'reengagement_day3',
    dayOffset: 3,
    description: 'Day 3 - Case Study (Social Proof)',
    getEmailData: getReengagementDay3EmailData,
  },
  {
    eventType: 'reengagement_day7',
    dayOffset: 7,
    description: 'Day 7 - Discount Offer (20% off)',
    discountCode: 'SAVE20',
    getEmailData: getReengagementDay7EmailData,
  },
  {
    eventType: 'reengagement_day14',
    dayOffset: 14,
    description: 'Day 14 - Last Chance (Expires Tonight)',
    discountCode: 'SAVE20',
    getEmailData: getReengagementDay14EmailData,
  },
];

/**
 * Vercel Cron endpoint for re-engagement email campaign
 *
 * Runs daily at 10:00 AM PST (6:00 PM UTC) to send win-back emails
 * Configured in vercel.json
 *
 * SEQUENCE:
 * - Day 3: Case study email (sent 3 days after first calculation)
 * - Day 7: Discount offer email (20% off, sent 7 days after first calculation)
 * - Day 14: Last chance email (sent 14 days after first calculation)
 *
 * Manual trigger for testing:
 * curl https://taxbridge.app/api/cron/reengagement-campaign \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // console.error('❌ Unauthorized cron request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  console.log('🚀 Starting re-engagement email campaign cron job...');

  const results = {
    timestamp: new Date().toISOString(),
    campaigns: [] as Array<{
      type: string;
      description: string;
      eligible: number;
      sent: number;
      failed: number;
      skipped: number;
    }>,
    totalSent: 0,
    totalFailed: 0,
    totalSkipped: 0,
    metrics: [] as any[],
  };

  // Process each re-engagement email type
  for (const config of REENGAGEMENT_CONFIGS) {
    console.log(`\n📧 Processing ${config.description}...`);

    // Get eligible users (calculator users who didn't convert)
    const eligibleUsers = getUsersForReengagement(config.dayOffset, config.eventType);
    console.log(`   Found ${eligibleUsers.length} eligible users`);

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    // Send emails to each user
    for (const user of eligibleUsers) {
      if (!user.email) {
        console.warn(`   ⚠️  Skipping user ${user.id} (no email)`);
        skipped++;
        continue;
      }

      // Skip if user is already paid (safety check)
      if (user.is_paid_user) {
        console.warn(`   ⚠️  Skipping user ${user.id} (already paid)`);
        skipped++;
        continue;
      }

      try {
        // Generate dynamic email data
        const emailData = config.getEmailData({
          firstName: user.first_name || 'there',
          email: user.email,
          calculationsSaved: user.total_calculations || 1,
          estimatedTaxSavings: 8500, // Could be calculated from actual tax data
          discountCode: config.discountCode,
        });

        // Send email via SendGrid
        const success = await sendEmail({
          to: user.email,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          from: {
            email: 'support@taxbridge.app',
            name: 'TaxBridge',
          },
        });

        if (success) {
          // Record in database
          recordReengagementEmailSent(
            user.id,
            config.eventType,
            {
              sent_via: 'cron',
              subject: emailData.subject,
              discount_code: config.discountCode,
              total_calculations: user.total_calculations,
            },
            'A', // A/B variant (can be enhanced later)
            config.eventType
          );

          sent++;
          console.log(`   ✓ Sent to ${user.email}`);
        } else {
          failed++;
          // console.error(`   ✗ Failed to send to ${user.email}`);
        }
      } catch (error) {
        failed++;
        // console.error(`   ✗ Error sending to ${user.email}:`, error);
      }

      // Rate limiting: wait 100ms between emails to avoid SendGrid throttling
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    results.campaigns.push({
      type: config.eventType,
      description: config.description,
      eligible: eligibleUsers.length,
      sent,
      failed,
      skipped,
    });

    results.totalSent += sent;
    results.totalFailed += failed;
    results.totalSkipped += skipped;

    console.log(`   📊 ${config.description}: ${sent} sent, ${failed} failed, ${skipped} skipped`);
  }

  // Get campaign performance metrics
  try {
    const metrics = getReengagementMetrics();
    results.metrics = metrics;
    console.log('\n📈 Campaign Performance Metrics:');
    metrics.forEach(metric => {
      console.log(`   ${metric.event_type}:`);
      console.log(`     - Sent: ${metric.total_sent}`);
      console.log(`     - Open Rate: ${metric.open_rate}%`);
      console.log(`     - Click Rate: ${metric.click_rate}%`);
      console.log(`     - Conversion Rate: ${metric.conversion_rate}%`);
      console.log(`     - Revenue: $${metric.total_revenue.toFixed(2)}`);
      console.log(`     - Revenue/Email: $${metric.revenue_per_email.toFixed(2)}`);
    });
  } catch (error) {
    // console.error('Failed to fetch metrics:', error);
  }

  console.log(
    `\n✅ Re-engagement campaign completed: ${results.totalSent} sent, ${results.totalFailed} failed, ${results.totalSkipped} skipped`
  );

  return NextResponse.json(results);
}

/**
 * POST endpoint for manual triggers and webhooks
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Allow manual trigger via POST
  return GET(request);
}
