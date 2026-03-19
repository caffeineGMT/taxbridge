import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendgrid';
import { EMAIL_TEMPLATES } from '@/lib/email/templates';
import {
  getUsersForDripEmail,
  recordEmailSent,
} from '@/lib/db/queries/drip-campaign';
import {
  getDay1EmailData,
  getDay3EmailData,
  getDay5EmailData,
  getDay7EmailData,
} from '@/lib/email/templates';
import { handleApiError } from '@/lib/api-error-handler';

// Configure route as dynamic (required for Vercel Cron)
export const dynamic = 'force-dynamic';

interface DripEmailConfig {
  eventType: 'drip_day1' | 'drip_day3' | 'drip_day5' | 'drip_day7';
  dayOffset: number;
  templateId: string;
  description: string;
  getEmailData: (params: { firstName: string; email: string; discountCode?: string }) => any;
}

/**
 * 7-DAY NURTURE SEQUENCE CONFIGURATION
 *
 * Day 1: Welcome + Calculator Tips
 * Day 3: Case Study (Social Proof)
 * Day 5: Limited Offer (30% off, 48-hour window)
 * Day 7: Last Chance (Expires tonight)
 */
const DRIP_CONFIGS: DripEmailConfig[] = [
  {
    eventType: 'drip_day1',
    dayOffset: 1,
    templateId: EMAIL_TEMPLATES.DRIP_DAY1,
    description: 'Day 1 - Welcome + Calculator Tips',
    getEmailData: getDay1EmailData,
  },
  {
    eventType: 'drip_day3',
    dayOffset: 3,
    templateId: EMAIL_TEMPLATES.DRIP_DAY3,
    description: 'Day 3 - Case Study (Social Proof)',
    getEmailData: getDay3EmailData,
  },
  {
    eventType: 'drip_day5',
    dayOffset: 5,
    templateId: EMAIL_TEMPLATES.DRIP_DAY5,
    description: 'Day 5 - Limited Offer (30% off)',
    getEmailData: getDay5EmailData,
  },
  {
    eventType: 'drip_day7',
    dayOffset: 7,
    templateId: EMAIL_TEMPLATES.DRIP_DAY7,
    description: 'Day 7 - Last Chance',
    getEmailData: getDay7EmailData,
  },
];

/**
 * Vercel Cron endpoint for 7-day email drip campaign
 *
 * Runs daily at 9:00 AM PST (5:00 PM UTC) to send scheduled emails
 * Configured in vercel.json
 *
 * SEQUENCE:
 * - Day 1: Welcome + tips (sent 1 day after signup)
 * - Day 3: Case study (sent 3 days after signup)
 * - Day 5: Limited offer - 30% discount (sent 5 days after signup)
 * - Day 7: Last chance (sent 7 days after signup)
 *
 * Manual trigger for testing:
 * curl https://taxbridge.app/api/cron/email-drip \
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

  console.log('🚀 Starting 7-day email drip campaign cron job...');

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
  };

  // Process each drip email type
  for (const config of DRIP_CONFIGS) {
    console.log(`\n📧 Processing ${config.description}...`);

    // Get eligible users
    const eligibleUsers = getUsersForDripEmail(config.eventType, config.dayOffset);
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

      try {
        // Determine discount code based on email type
        const discountCode = ['drip_day5', 'drip_day7'].includes(config.eventType)
          ? 'WELCOME30'
          : undefined;

        // Generate dynamic email data
        const emailData = config.getEmailData({
          firstName: user.first_name || 'there',
          email: user.email,
          discountCode,
        });

        // Send email via SendGrid
        const success = await sendEmail({
          to: user.email,
          templateId: config.templateId,
          dynamicData: emailData,
        });

        if (success) {
          // Record in database
          recordEmailSent(
            user.id,
            config.eventType,
            {
              template_id: config.templateId,
              sent_via: 'cron',
              subject: emailData.subject || config.description,
              discount_code: discountCode,
            },
            'A', // A/B variant (can be enhanced later)
            emailData.utm_campaign || config.eventType
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

  console.log(`\n✅ Drip campaign completed: ${results.totalSent} sent, ${results.totalFailed} failed, ${results.totalSkipped} skipped`);

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
