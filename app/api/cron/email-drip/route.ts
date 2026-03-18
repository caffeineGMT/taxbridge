import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendgrid';
import { EMAIL_TEMPLATES } from '@/lib/email/templates';
import {
  getUsersForDripEmail,
  recordEmailSent,
} from '@/lib/db/queries/drip-campaign';
import { selectABVariant } from '@/lib/email/ab-testing';
import { getEnhancedEmailDataGenerator } from '@/lib/email/enhanced-templates';

// Configure route as dynamic (required for Vercel Cron)
export const dynamic = 'force-dynamic';

// Configure cron schedule - runs daily at 9:00 AM UTC
export const config = {
  api: {
    bodyParser: false,
  },
};

interface DripEmailConfig {
  eventType: 'drip_welcome' | 'drip_day3' | 'drip_day7' | 'drip_day14';
  dayOffset: number;
  templateId: string;
  description: string;
}

const DRIP_CONFIGS: DripEmailConfig[] = [
  {
    eventType: 'drip_welcome',
    dayOffset: 0,
    templateId: EMAIL_TEMPLATES.DRIP_WELCOME,
    description: 'Welcome Email',
  },
  {
    eventType: 'drip_day3',
    dayOffset: 3,
    templateId: EMAIL_TEMPLATES.DRIP_DAY3,
    description: 'Day 3 - FTC Education',
  },
  {
    eventType: 'drip_day7',
    dayOffset: 7,
    templateId: EMAIL_TEMPLATES.DRIP_DAY7,
    description: 'Day 7 - Feature Highlight',
  },
  {
    eventType: 'drip_day14',
    dayOffset: 14,
    templateId: EMAIL_TEMPLATES.DRIP_DAY14,
    description: 'Day 14 - Upgrade Offer',
  },
];

/**
 * Vercel Cron endpoint for email drip campaign
 * Runs daily at 9:00 AM UTC to send scheduled emails
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
    console.error('❌ Unauthorized cron request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  console.log('🚀 Starting email drip campaign cron job...');

  const results = {
    timestamp: new Date().toISOString(),
    campaigns: [] as Array<{
      type: string;
      description: string;
      eligible: number;
      sent: number;
      failed: number;
    }>,
    totalSent: 0,
    totalFailed: 0,
  };

  // Process each drip email type
  for (const config of DRIP_CONFIGS) {
    console.log(`\n📧 Processing ${config.description}...`);

    // Get eligible users
    const eligibleUsers = getUsersForDripEmail(config.eventType, config.dayOffset);
    console.log(`   Found ${eligibleUsers.length} eligible users`);

    let sent = 0;
    let failed = 0;

    // Send emails to each user
    for (const user of eligibleUsers) {
      if (!user.email) {
        console.warn(`   ⚠️  Skipping user ${user.id} (no email)`);
        failed++;
        continue;
      }

      try {
        // Select A/B test variant for this user
        const variant = selectABVariant(config.eventType);

        if (!variant) {
          console.warn(`   ⚠️  No A/B variant configured for ${config.eventType}`);
          failed++;
          continue;
        }

        // Get enhanced email data generator
        const getEnhancedData = getEnhancedEmailDataGenerator(config.eventType);

        // Generate dynamic email data with A/B testing and personalization
        const emailData = getEnhancedData({
          userId: user.id,
          firstName: user.first_name || 'there',
          email: user.email,
          variant: variant.variant,
          subjectLine: variant.subject_line,
          ctaText: variant.cta_text,
          discountCode: config.eventType === 'drip_day14' ? 'SAVE20' : undefined,
        });

        // Send email via SendGrid
        const success = await sendEmail({
          to: user.email,
          templateId: config.templateId,
          dynamicData: emailData,
        });

        if (success) {
          // Record in database with A/B variant tracking
          recordEmailSent(
            user.id,
            config.eventType,
            {
              template_id: config.templateId,
              sent_via: 'cron',
              subject_line: variant.subject_line,
              cta_text: variant.cta_text,
            },
            variant.variant,
            emailData.utm_campaign || config.eventType
          );
          sent++;
          console.log(`   ✓ Sent to ${user.email} (variant ${variant.variant})`);
        } else {
          failed++;
          console.error(`   ✗ Failed to send to ${user.email}`);
        }
      } catch (error) {
        failed++;
        console.error(`   ✗ Error sending to ${user.email}:`, error);
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
    });

    results.totalSent += sent;
    results.totalFailed += failed;

    console.log(`   📊 ${config.description}: ${sent} sent, ${failed} failed`);
  }

  console.log(`\n✅ Drip campaign completed: ${results.totalSent} sent, ${results.totalFailed} failed`);

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
