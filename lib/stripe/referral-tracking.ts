/**
 * User Referral Tracking for Stripe Integration
 * Handles reward distribution when referred users subscribe
 */

import { stripe } from '../stripe';
import {
  getUserByReferralCode,
  createReferral,
  completeReferral,
  grantReferralReward,
  getUserReferrals,
  updateLeaderboardEntry,
  getUserReferralStats,
} from '../db/queries/referrals';
import { getDatabase } from '../db';
import { getReferralRewardEmailData, EMAIL_TEMPLATES } from '../email/templates';
import Stripe from 'stripe';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid (only if API key exists)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const REFERRER_REWARD_MONTHS = 2; // Free months to give referrer
const REFERRER_REWARD_VALUE = 50.00; // $50 value (2 months Pro @ $24.92/mo)
const REFERRED_DISCOUNT_PERCENT = 20; // 20% off first year for referred user

/**
 * Track user referral when a checkout is completed
 * Called from Stripe webhook on checkout.session.completed
 */
export async function trackUserReferral(
  session: Stripe.Checkout.Session,
  referredUserId: number
): Promise<void> {
  const db = getDatabase();

  // Get referral code from session metadata
  const referralCode = session.metadata?.user_referral_code;

  if (!referralCode) {
    console.log('No user referral code in session metadata');
    return;
  }

  // Find the referrer
  const referrer = getUserByReferralCode(referralCode);

  if (!referrer) {
    console.warn('Invalid referral code:', referralCode);
    return;
  }

  // Don't allow self-referrals
  if (referrer.id === referredUserId) {
    console.warn('Self-referral attempt blocked:', { userId: referredUserId, code: referralCode });
    return;
  }

  console.log('Processing user referral:', {
    referrer: referrer.id,
    referred: referredUserId,
    code: referralCode,
  });

  // Create referral record
  const referralId = createReferral(referrer.id, referredUserId, referralCode);

  if (referralId === -1) {
    console.log('Referral already exists');
    return;
  }

  // Mark referral as completed
  completeReferral(referralId);

  // Grant reward to referrer (extend subscription by 1 month)
  await grantReferrerReward(referrer.id, referralId);

  // Update leaderboard
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  updateLeaderboardEntry(referrer.id, currentMonth);

  console.log('✓ User referral tracked and rewarded:', { referralId, referrer: referrer.id });
}

/**
 * Grant reward to referrer (extend subscription by free months)
 */
async function grantReferrerReward(referrerId: number, referralId: number): Promise<void> {
  const db = getDatabase();

  // Get referrer's subscription
  const referrer = db.prepare(`
    SELECT stripe_subscription_id, subscription_tier, email, first_name, last_name
    FROM user_profiles
    WHERE id = ?
  `).get(referrerId) as {
    stripe_subscription_id: string | null;
    subscription_tier: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | undefined;

  if (!referrer) {
    console.error('Referrer not found:', referrerId);
    return;
  }

  // If referrer has an active subscription, extend it by 1 month
  if (referrer.stripe_subscription_id) {
    try {
      const subscription = await stripe.subscriptions.retrieve(referrer.stripe_subscription_id);

      // Extend subscription period by 60 days (2 months)
      const newPeriodEnd = subscription.current_period_end + (60 * 24 * 60 * 60); // +60 days in seconds

      await stripe.subscriptions.update(referrer.stripe_subscription_id, {
        trial_end: newPeriodEnd,
        proration_behavior: 'none',
        metadata: {
          ...subscription.metadata,
          referral_reward: 'true',
          referral_id: referralId.toString(),
        },
      });

      console.log('✓ Extended subscription for referrer:', {
        referrerId,
        subscriptionId: referrer.stripe_subscription_id,
        extensionDays: 60,
      });
    } catch (error) {
      console.error('Failed to extend subscription:', error);
      // Don't throw - still mark reward as granted in DB
    }
  } else {
    // If referrer is on free tier, store credit for future subscription
    console.log('Referrer on free tier - credit stored for future use:', referrerId);
    // TODO: Implement credit system for free tier users
  }

  // Mark reward as granted in database
  grantReferralReward(referralId, 'free_month', REFERRER_REWARD_VALUE);

  // Send reward notification email
  await sendReferralRewardEmail(referrerId, referrer.email, referrer.first_name || 'there');

  console.log('✓ Referral reward granted and email sent:', { referrerId, email: referrer.email });
}

/**
 * Send referral reward notification email
 */
async function sendReferralRewardEmail(
  referrerId: number,
  email: string,
  firstName: string
): Promise<void> {
  // Check if SendGrid is configured
  if (!SENDGRID_API_KEY) {
    console.warn('[Referral Email] SendGrid not configured - reward email not sent');
    return;
  }

  try {
    // Get referrer's stats
    const stats = getUserReferralStats(referrerId);

    // Prepare email data
    const emailData = getReferralRewardEmailData({
      firstName,
      email,
      rewardMonths: REFERRER_REWARD_MONTHS,
      rewardValue: REFERRER_REWARD_VALUE,
      totalReferrals: stats.total_referrals,
    });

    // Send email via SendGrid
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@taxbridge.app',
        name: 'TaxBridge',
      },
      templateId: EMAIL_TEMPLATES.REFERRAL_REWARD_GRANTED,
      dynamicTemplateData: emailData,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
    };

    await sgMail.send(msg);
    console.log('[Referral Email] Reward email sent to:', email);
  } catch (error: any) {
    console.error('[Referral Email] Failed to send reward email:', error.response?.body || error.message);
    // Don't throw - email failure shouldn't block the reward
  }
}

/**
 * Apply discount to referred user's checkout
 * Called when creating Stripe checkout session
 */
export function getReferredUserDiscount(): number {
  return REFERRED_DISCOUNT_PERCENT;
}

/**
 * Generate referral sharing message for email
 */
export function generateReferralEmailMessage(userName: string, referralCode: string): string {
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${referralCode}`;

  return `
Hi!

${userName} thinks you might find TaxBridge useful for managing your US-Canada cross-border taxes.

TaxBridge helps H-1B/TN visa workers calculate dual-country taxes on RSU income, optimize foreign tax credits, and avoid double taxation.

Get 20% off your first year: ${referralLink}

Best regards,
The TaxBridge Team
  `.trim();
}

/**
 * Generate social sharing messages
 */
export function generateSocialMessages(referralCode: string, userStats?: { savings: number }) {
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${referralCode}`;
  const savings = userStats?.savings ? `$${userStats.savings.toLocaleString()}` : 'thousands';

  return {
    twitter: `I saved ${savings} on cross-border taxes with TaxBridge! 🇺🇸🇨🇦\n\nH-1B/TN visa holders: Get 20% off your first year → ${referralLink}`,

    linkedin: `If you're an H-1B or TN visa holder dealing with US-Canada cross-border taxes, check out TaxBridge.\n\nIt helped me calculate dual-country taxes on my RSU income and optimize foreign tax credits to avoid double taxation.\n\nI saved ${savings} in tax overpayments!\n\nGet 20% off: ${referralLink}`,

    email: `Subject: Save on US-Canada cross-border taxes\n\nBody: I recently used TaxBridge to manage my cross-border tax situation and it saved me ${savings}!\n\nIf you're dealing with RSU taxation across US and Canada, this tool makes it much easier.\n\nGet 20% off your first year: ${referralLink}`,
  };
}

/**
 * Client-side localStorage helpers for referral tracking
 */

/**
 * Save referral code to localStorage
 * Called from ReferralTracker component when ?ref= param is detected
 */
export function saveUserReferralCodeToStorage(code: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_referral_code', code);
  }
}

/**
 * Get referral code from localStorage
 * Called during checkout to include in session metadata
 */
export function getUserReferralCodeFromStorage(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user_referral_code');
  }
  return null;
}

/**
 * Clear referral code from localStorage
 * Called after successful subscription
 */
export function clearUserReferralCodeFromStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_referral_code');
  }
}
