import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendgrid';
import {
  getUsersForDripEmail,
  recordEmailSent,
} from '@/lib/db/queries/drip-campaign';
import {
  getEmailDataByVariant,
  assignRandomVariant,
  getTemplateId,
  type EmailVariant,
} from '@/lib/email/enhanced-nurture-templates';

// Configure route as dynamic (required for Vercel Cron)
export const dynamic = 'force-dynamic';

interface DripEmailConfig {
  eventType: 'drip_day1' | 'drip_day3' | 'drip_day5' | 'drip_day7';
  dayOffset: number;
  dayNumber: 1 | 3 | 5 | 7;
  description: string;
}

/**
 * OPTIMIZED 7-DAY NURTURE SEQUENCE WITH A/B TESTING
 *
 * Day 1: Welcome + Calculator Tips
 *   - Variant A (Control): Standard welcome
 *   - Variant B (Test): Personalized tax savings estimate
 *
 * Day 3: Case Study (Social Proof)
 *   - Variant A (Control): Single testimonial
 *   - Variant B (Test): Multiple testimonials + aggregate stats
 *
 * Day 5: Limited Offer (30% off, 48-hour window)
 *   - No A/B test (using original template)
 *
 * Day 7: Last Chance
 *   - Variant A (Control): Discount urgency only
 *   - Variant B (Test): Discount + tax deadline urgency
 */
const DRIP_CONFIGS: DripEmailConfig[] = [
  {
    eventType: 'drip_day1',
    dayOffset: 1,
    dayNumber: 1,
    description: 'Day 1 - Welcome + Calculator Tips (A/B Test: Personalized Savings)',
  },
  {
    eventType: 'drip_day3',
    dayOffset: 3,
    dayNumber: 3,
    description: 'Day 3 - Case Study (A/B Test: Enhanced Social Proof)',
  },
  {
    eventType: 'drip_day5',
    dayOffset: 5,
    dayNumber: 5,
    description: 'Day 5 - Limited Offer (No A/B test)',
  },
  {
    eventType: 'drip_day7',
    dayOffset: 7,
    dayNumber: 7,
    description: 'Day 7 - Last Chance (A/B Test: Tax Deadline Urgency)',
  },
];

/**
 * Vercel Cron endpoint for OPTIMIZED 7-day email drip campaign with A/B testing
 *
 * Runs daily at 9:00 AM PST (5:00 PM UTC) to send scheduled emails
 * Configured in vercel.json
 *
 * OPTIMIZATIONS:
 * 1. Personalized tax savings estimates (Day 1 Variant B)
 * 2. Enhanced social proof with multiple testimonials (Day 3 Variant B)
 * 3. Tax deadline urgency messaging (Day 7 Variant B)
 *
 * Each user is randomly assigned to Variant A (control) or B (test) for each email
 *
 * Manual trigger for testing:
 * curl https://taxbridge.app/api/cron/email-drip-optimized \
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

  console.log('🚀 Starting OPTIMIZED 7-day email drip campaign with A/B testing...');

  const results = {
    timestamp: new Date().toISOString(),
    campaigns: [] as Array<{
      type: string;
      description: string;
      eligible: number;
      sent: number;
      failed: number;
      skipped: number;
      variantA: number;
      variantB: number;
    }>,
    totalSent: 0,
    totalFailed: 0,
    totalSkipped: 0,
    totalVariantA: 0,
    totalVariantB: 0,
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
    let variantACount = 0;
    let variantBCount = 0;

    // Send emails to each user
    for (const user of eligibleUsers) {
      if (!user.email) {
        console.warn(`   ⚠️  Skipping user ${user.id} (no email)`);
        skipped++;
        continue;
      }

      try {
        // Randomly assign A/B variant (50/50 split)
        const variant: EmailVariant = assignRandomVariant();

        // Day 5 doesn't have A/B test yet - use original template
        if (config.dayNumber === 5) {
          // TODO: Import original Day 5 template when needed
          // For now, skip Day 5 (will use original cron job)
          skipped++;
          continue;
        }

        // Get email data generator for this day + variant
        const getEmailData = getEmailDataByVariant(config.dayNumber as 1 | 3 | 7, variant);

        // Determine discount code based on email type
        const discountCode = ['drip_day5', 'drip_day7'].includes(config.eventType)
          ? 'WELCOME30'
          : undefined;

        // Generate dynamic email data
        const emailData = getEmailData({
          firstName: user.first_name || 'there',
          email: user.email,
          discountCode,
          // For Day 1 Variant B: could add estimated income/RSUs from user profile
          // estimatedIncome: user.estimated_income,
          // estimatedRSUs: user.estimated_rsus,
        });

        // Get template ID for this day + variant
        const templateId = getTemplateId(config.dayNumber as 1 | 3 | 7, variant);

        // Send email via SendGrid
        const success = await sendEmail({
          to: user.email,
          templateId: templateId,
          dynamicData: emailData,
        });

        if (success) {
          // Record in database with A/B variant tracking
          recordEmailSent(
            user.id,
            config.eventType,
            {
              template_id: templateId,
              sent_via: 'cron-optimized',
              subject: emailData.subject || config.description,
              discount_code: discountCode,
              optimization_type: config.dayNumber === 1
                ? 'personalized_savings'
                : config.dayNumber === 3
                ? 'enhanced_social_proof'
                : config.dayNumber === 7
                ? 'tax_deadline_urgency'
                : 'control',
            },
            variant, // A/B variant
            emailData.utm_campaign || config.eventType
          );

          sent++;
          if (variant === 'A') {
            variantACount++;
          } else {
            variantBCount++;
          }

          console.log(`   ✓ Sent to ${user.email} (Variant ${variant})`);
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
      skipped,
      variantA: variantACount,
      variantB: variantBCount,
    });

    results.totalSent += sent;
    results.totalFailed += failed;
    results.totalSkipped += skipped;
    results.totalVariantA += variantACount;
    results.totalVariantB += variantBCount;

    console.log(`   📊 ${config.description}:`);
    console.log(`      Total: ${sent} sent, ${failed} failed, ${skipped} skipped`);
    console.log(`      A/B: ${variantACount} Variant A, ${variantBCount} Variant B`);
  }

  console.log(`\n✅ Optimized drip campaign completed:`);
  console.log(`   ${results.totalSent} sent, ${results.totalFailed} failed, ${results.totalSkipped} skipped`);
  console.log(`   A/B Split: ${results.totalVariantA} Variant A, ${results.totalVariantB} Variant B`);

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
