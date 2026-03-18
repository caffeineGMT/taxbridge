/**
 * Stripe Affiliate Tracking
 * Handles affiliate referral tracking for Stripe checkout sessions
 */

import Stripe from 'stripe';
import {
  getAffiliatePartnerByReferralCode,
  createAffiliateReferral,
  updateUserReferredBy,
} from '../db/queries/affiliates';

/**
 * Track affiliate referral from Stripe checkout session
 * Called from webhook when checkout.session.completed fires
 */
export async function trackAffiliateReferral(
  session: Stripe.Checkout.Session,
  userId: number
): Promise<void> {
  // Extract referral code from session metadata
  const referralCode = session.metadata?.referred_by;

  if (!referralCode) {
    // No referral code, skip tracking
    return;
  }

  // Look up affiliate partner
  const affiliate = getAffiliatePartnerByReferralCode(referralCode);

  if (!affiliate) {
    console.warn(`[Affiliate] Referral code not found: ${referralCode}`);
    return;
  }

  if (affiliate.status !== 'approved') {
    console.warn(`[Affiliate] Referral code belongs to non-approved partner: ${referralCode} (status: ${affiliate.status})`);
    return;
  }

  // Calculate commission
  const amountTotal = session.amount_total || 0; // Amount in cents
  const amountUSD = amountTotal / 100; // Convert to dollars
  const commissionAmount = amountUSD * affiliate.commission_rate;

  try {
    // Create referral record
    createAffiliateReferral({
      affiliate_id: affiliate.id,
      user_id: userId,
      subscription_id: session.subscription as string || session.id,
      commission_amount: commissionAmount,
    });

    // Update user profile with referral code
    updateUserReferredBy(userId, referralCode);

    console.log(`[Affiliate] Tracked referral: ${affiliate.firm_name} → User #${userId} → $${commissionAmount.toFixed(2)} commission`);
  } catch (error) {
    console.error('[Affiliate] Error tracking referral:', error);
    // Don't throw - webhook should still succeed even if affiliate tracking fails
  }
}

/**
 * Get referral code from localStorage (client-side)
 * Used when creating Stripe checkout session
 */
export function getReferralCodeFromStorage(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem('referral_code');
  } catch {
    return null;
  }
}

/**
 * Save referral code to localStorage (client-side)
 * Called when user lands on site with ?ref= parameter
 */
export function saveReferralCodeToStorage(code: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('referral_code', code);
  } catch (error) {
    console.warn('Failed to save referral code:', error);
  }
}

/**
 * Clear referral code from localStorage (client-side)
 */
export function clearReferralCodeFromStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('referral_code');
  } catch {
    // Ignore
  }
}
