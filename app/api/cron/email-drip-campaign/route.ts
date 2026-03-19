import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendgrid';
import {
  EMAIL_TEMPLATES,
  getDay1EmailData,
  getDay1EmailHTML,
  getDay3EmailData,
  getDay3EmailHTML,
  getDay5EmailData,
  getDay5EmailHTML,
  getDay7EmailData,
  getDay7EmailHTML,
} from '@/lib/email/drip-campaign-templates';
import {
  getUsersForDripEmail,
  recordEmailSent,
} from '@/lib/db/queries/drip-campaign';
import { logger } from '@/lib/logger';

// Configure route as dynamic (required for Vercel Cron)
export const dynamic = 'force-dynamic';

interface DripEmailConfig {
  eventType: 'drip_day1' | 'drip_day3' | 'drip_day5' | 'drip_day7';
  dayOffset: number;
  templateId: string;
  description: string;
  getEmailData: (params: { firstName: string; email: string; discountCode?: string }) => any;
  getEmailHTML: (data: any) => string;
}

/**
 * 7-DAY EMAIL DRIP CAMPAIGN CONFIGURATION
 *
 * Day 1: Welcome + Quick Start Guide
 * Day 3: Education - Complete RSU Tax Guide
 * Day 5: Social Proof - Real User Success Stories
 * Day 7: Urgency - Limited Time Offer (30% off)
 */
const DRIP_CONFIGS: DripEmailConfig[] = [
  {
    eventType: 'drip_day1',
    dayOffset: 1,
    templateId: EMAIL_TEMPLATES.DRIP_DAY1,
    description: 'Day 1 - Welcome + Quick Start',
    getEmailData: getDay1EmailData,
    getEmailHTML: getDay1EmailHTML,
  },
  {
    eventType: 'drip_day3',
    dayOffset: 3,
    templateId: EMAIL_TEMPLATES.DRIP_DAY3,
    description: 'Day 3 - RSU Tax Education Guide',
    getEmailData: getDay3EmailData,
    getEmailHTML: getDay3EmailHTML,
  },
  {
    eventType: 'drip_day5',
    dayOffset: 5,
    templateId: EMAIL_TEMPLATES.DRIP_DAY5,
    description: 'Day 5 - Social Proof & Success Stories',
    getEmailData: getDay5EmailData,
    getEmailHTML: getDay5EmailHTML,
  },
  {
    eventType: 'drip_day7',
    dayOffset: 7,
    templateId: EMAIL_TEMPLATES.DRIP_DAY7,
    description: 'Day 7 - Last Chance Offer',
    getEmailData: getDay7EmailData,
    getEmailHTML: getDay7EmailHTML,
  },
];

/**
 * Vercel Cron endpoint for 7-day email drip campaign
 *
 * Runs daily at 9:00 AM PST (5:00 PM UTC) to send scheduled emails
 * Configured in vercel.json
 *
 * SEQUENCE:
 * - Day 1: Welcome + quick start tips (sent 1 day after signup)
 * - Day 3: RSU tax education guide (sent 3 days after signup)
 * - Day 5: Social proof & testimonials (sent 5 days after signup)
 * - Day 7: Limited time offer - 30% discount (sent 7 days after signup)
 *
 * Manual trigger for testing:
 * curl https://taxbridge.app/api/cron/email-drip-campaign \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    logger.info('❌ Unauthorized cron request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  logger.info('🚀 Starting 7-day email drip campaign cron job...');

  const results = {
    timestamp: new Date().toISOString(),
    campaigns: [] as Array<{
      type: string;
      description: string;
      eligible: number;
      sent: number;
      failed: number;
      skipped: number;
      errors: string[];
    }>,
    totalSent: 0,
    totalFailed: 0,
    totalSkipped: 0,
  };

  // Process each drip email type
  for (const config of DRIP_CONFIGS) {
    logger.info(`\n📧 Processing ${config.description}...`);

    // Get eligible users
    const eligibleUsers = getUsersForDripEmail(config.eventType, config.dayOffset);
    logger.info(`   Found ${eligibleUsers.length} eligible users`);

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Send emails to each user
    for (const user of eligibleUsers) {
      if (!user.email) {
        logger.info(`   ⚠️  Skipping user ${user.id} (no email)`);
        skipped++;
        continue;
      }

      try {
        // Determine discount code based on email type
        const discountCode = config.eventType === 'drip_day7' ? 'WELCOME30' : undefined;

        // Generate dynamic email data
        const emailData = config.getEmailData({
          firstName: user.first_name || 'there',
          email: user.email,
          discountCode,
        });

        // Try SendGrid template first, fallback to HTML
        let success = false;

        // Attempt 1: SendGrid dynamic template (if configured)
        if (config.templateId && !config.templateId.startsWith('d-placeholder') && !config.templateId.startsWith('d-drip')) {
          try {
            success = await sendEmail({
              to: user.email,
              templateId: config.templateId,
              dynamicData: emailData,
            });
          } catch (templateError: any) {
            logger.info(`   ℹ️  Template ${config.templateId} not found, using HTML fallback`);
          }
        }

        // Attempt 2: HTML fallback (always works)
        if (!success) {
          const htmlContent = config.getEmailHTML(emailData);
          success = await sendEmail({
            to: user.email,
            subject: emailData.subject,
            html: htmlContent,
          });
        }

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
              method: config.templateId && !config.templateId.startsWith('d-placeholder') ? 'sendgrid_template' : 'html_fallback'
            },
            'A', // A/B variant (can be enhanced later)
            emailData.utm_campaign || config.eventType
          );
          sent++;
          logger.info(`   ✓ Sent to ${user.email}`);
        } else {
          failed++;
          errors.push(`Failed to send to ${user.email}`);
          logger.info(`   ✗ Failed to send to ${user.email}`);
        }
      } catch (error: any) {
        failed++;
        const errorMsg = `Error sending to ${user.email}: ${error.message}`;
        errors.push(errorMsg);
        logger.info(`   ✗ ${errorMsg}`);
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
      errors: errors.slice(0, 10), // Only keep first 10 errors to avoid bloat
    });

    results.totalSent += sent;
    results.totalFailed += failed;
    results.totalSkipped += skipped;

    logger.info(`   📊 ${config.description}: ${sent} sent, ${failed} failed, ${skipped} skipped`);
  }

  logger.info(`\n✅ Drip campaign completed: ${results.totalSent} sent, ${results.totalFailed} failed, ${results.totalSkipped} skipped`);

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
