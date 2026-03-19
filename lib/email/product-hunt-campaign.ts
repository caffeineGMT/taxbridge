/**
 * Product Hunt Launch Campaign Email Templates
 *
 * CAMPAIGN: Post-Launch Momentum (48h window)
 * OBJECTIVE: Convert Product Hunt voters into paying customers
 * OFFER: 20% discount with code HUNT20
 */

import { sendEmail, sendBulkEmails, type EmailParams } from './sendgrid';

export const PH_CAMPAIGN_TEMPLATES = {
  // Product Hunt Voter Thank You + 20% Discount
  PH_VOTER_THANKS: process.env.SENDGRID_TEMPLATE_PH_VOTER || 'd-ph-voter-thanks',
} as const;

/**
 * Product Hunt Voter Thank You Email
 *
 * TIMING: Send within 48h of PH launch
 * SUBJECT: "Thanks for your Product Hunt vote! Here's 20% off 🎁"
 * CTA: "Claim Your 20% Discount →"
 */
export function getPHVoterEmailData(params: {
  firstName: string;
  email: string;
  phRank?: number; // e.g., "We got #3!"
  phUpvotes?: number;
  phUrl?: string;
}) {
  const rank = params.phRank ? `#${params.phRank}` : 'top spot';
  const upvotes = params.phUpvotes || 'hundreds of';

  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: `Thanks for your Product Hunt vote! Here's 20% off 🎁`,
    preheader: 'Exclusive 20% discount for Product Hunt supporters',

    // Opening
    headline: `You helped us reach ${rank} on Product Hunt! 🚀`,
    intro: `Thanks to amazing supporters like you, TaxBridge got ${upvotes} upvotes and hit ${rank} on Product Hunt today. We're blown away by the support.`,

    // Main content
    body_sections: [
      {
        title: "Here's a Thank You Gift: 20% Off Annual Plans",
        content: "As a token of our appreciation, we're offering you an exclusive 20% discount on any annual plan. This offer is only available to Product Hunt supporters and expires in 7 days.",
      },
      {
        title: "What You'll Get:",
        features: [
          "Unlimited cross-border tax calculations (US-Canada)",
          "Foreign Tax Credit (FTC) optimization",
          "RSU vesting schedule tracking",
          "Multi-year tax projections",
          "Form 1116 & T1135 assistance",
          "Priority email support",
        ],
      },
    ],

    // Discount details
    promo_code: 'HUNT20',
    promo_discount: '20%',
    promo_expires: '7 days',

    // Social proof
    ph_rank: rank,
    ph_upvotes: upvotes,
    ph_url: params.phUrl || 'https://www.producthunt.com/posts/taxbridge',

    // CTAs
    claim_discount_url: `https://taxbridge.app/pricing?promo=HUNT20&utm_source=email&utm_medium=ph-campaign&utm_campaign=voter-thanks`,
    calculator_url: `https://taxbridge.app/calculator?utm_source=email&utm_medium=ph-campaign&utm_campaign=voter-thanks`,

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'support@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'ph-campaign',
    utm_campaign: 'voter-thanks',
  };
}

/**
 * Send email to a single Product Hunt voter
 */
export async function sendPHVoterEmail(params: {
  firstName: string;
  email: string;
  phRank?: number;
  phUpvotes?: number;
  phUrl?: string;
}): Promise<boolean> {
  const emailData = getPHVoterEmailData(params);

  return sendEmail({
    to: params.email,
    templateId: PH_CAMPAIGN_TEMPLATES.PH_VOTER_THANKS,
    dynamicData: emailData,
    from: {
      email: 'michael@taxbridge.app',
      name: 'Michael from TaxBridge',
    },
    replyTo: 'michael@taxbridge.app',
  });
}

/**
 * Send bulk emails to all Product Hunt voters
 */
export async function sendBulkPHVoterEmails(voters: Array<{
  firstName: string;
  email: string;
}>): Promise<{
  total: number;
  sent: number;
  failed: number;
}> {
  const phRank = parseInt(process.env.PH_LAUNCH_RANK || '0');
  const phUpvotes = parseInt(process.env.PH_LAUNCH_UPVOTES || '0');
  const phUrl = process.env.PH_LAUNCH_URL;

  const emails: EmailParams[] = voters.map(voter => ({
    to: voter.email,
    templateId: PH_CAMPAIGN_TEMPLATES.PH_VOTER_THANKS,
    dynamicData: getPHVoterEmailData({
      firstName: voter.firstName,
      email: voter.email,
      phRank,
      phUpvotes,
      phUrl,
    }),
    from: {
      email: 'michael@taxbridge.app',
      name: 'Michael from TaxBridge',
    },
    replyTo: 'michael@taxbridge.app',
  }));

  const sent = await sendBulkEmails(emails);

  return {
    total: voters.length,
    sent,
    failed: voters.length - sent,
  };
}

/**
 * Example Product Hunt voter list (for testing)
 *
 * In production, this would come from:
 * - Product Hunt API (if available)
 * - CSV export of voters
 * - Database of email sign-ups during PH launch
 */
export interface PHVoter {
  firstName: string;
  email: string;
  votedAt?: Date;
  source: 'ph_api' | 'signup_form' | 'csv_import';
}
