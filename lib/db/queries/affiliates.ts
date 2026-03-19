/**
 * Affiliate Program Database Queries
 */

import { getDatabase } from '../index';
import { nanoid } from 'nanoid';

export interface AffiliatePartner {
  id: number;
  partner_name: string;
  firm_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  partner_type: string;
  referral_code: string;
  commission_rate: number;
  status: 'pending' | 'approved' | 'rejected';
  total_referrals: number;
  total_revenue: number;
  stripe_connect_id: string | null;
  payment_method: string | null;
  payment_details: string | null;
  co_branded_slug: string | null;
  custom_logo_url: string | null;
  custom_message: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
}

export interface AffiliateReferral {
  id: number;
  affiliate_id: number;
  user_id: number;
  subscription_id: string;
  commission_amount: number;
  commission_status: 'pending' | 'paid';
  created_at: string;
  paid_at: string | null;
}

export interface CreateAffiliatePartnerInput {
  partner_name: string;
  firm_name: string;
  email: string;
  commission_rate?: number;
}

export interface CreateReferralInput {
  affiliate_id: number;
  user_id: number;
  subscription_id: string;
  commission_amount: number;
}

/**
 * Generate a unique referral code
 */
export function generateReferralCode(): string {
  return nanoid(10).toUpperCase();
}

/**
 * Create a new affiliate partner application
 */
export function createAffiliatePartner(input: CreateAffiliatePartnerInput): number {
  const db = getDatabase();

  const referralCode = generateReferralCode();

  const stmt = db.prepare(`
    INSERT INTO affiliate_partners (
      partner_name, firm_name, email, referral_code, commission_rate
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.partner_name,
    input.firm_name,
    input.email,
    referralCode,
    input.commission_rate || 0.20
  );

  return result.lastInsertRowid as number;
}

/**
 * Get affiliate partner by ID
 */
export function getAffiliatePartner(id: number): AffiliatePartner | undefined {
  const db = getDatabase();

  const stmt = db.prepare('SELECT * FROM affiliate_partners WHERE id = ?');
  return stmt.get(id) as AffiliatePartner | undefined;
}

/**
 * Get affiliate partner by email
 */
export function getAffiliatePartnerByEmail(email: string): AffiliatePartner | undefined {
  const db = getDatabase();

  const stmt = db.prepare('SELECT * FROM affiliate_partners WHERE email = ?');
  return stmt.get(email) as AffiliatePartner | undefined;
}

/**
 * Get affiliate partner by referral code
 */
export function getAffiliatePartnerByReferralCode(code: string): AffiliatePartner | undefined {
  const db = getDatabase();

  const stmt = db.prepare('SELECT * FROM affiliate_partners WHERE referral_code = ?');
  return stmt.get(code) as AffiliatePartner | undefined;
}

/**
 * Get all affiliate partners by status
 */
export function getAffiliatePartnersByStatus(status?: 'pending' | 'approved' | 'rejected'): AffiliatePartner[] {
  const db = getDatabase();

  if (status) {
    const stmt = db.prepare('SELECT * FROM affiliate_partners WHERE status = ? ORDER BY created_at DESC');
    return stmt.all(status) as AffiliatePartner[];
  } else {
    const stmt = db.prepare('SELECT * FROM affiliate_partners ORDER BY created_at DESC');
    return stmt.all() as AffiliatePartner[];
  }
}

/**
 * Approve an affiliate partner
 */
export function approveAffiliatePartner(id: number): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE affiliate_partners
    SET status = 'approved',
        approved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(id);
}

/**
 * Reject an affiliate partner
 */
export function rejectAffiliatePartner(id: number, reason?: string): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE affiliate_partners
    SET status = 'rejected',
        rejected_at = CURRENT_TIMESTAMP,
        rejection_reason = ?
    WHERE id = ?
  `);

  stmt.run(reason || null, id);
}

/**
 * Create a new affiliate referral
 */
export function createAffiliateReferral(input: CreateReferralInput): number {
  const db = getDatabase();

  const transaction = db.transaction(() => {
    // Insert referral
    const stmt = db.prepare(`
      INSERT INTO affiliate_referrals (
        affiliate_id, user_id, subscription_id, commission_amount
      ) VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.affiliate_id,
      input.user_id,
      input.subscription_id,
      input.commission_amount
    );

    // Update affiliate partner stats
    const updateStmt = db.prepare(`
      UPDATE affiliate_partners
      SET total_referrals = total_referrals + 1,
          total_revenue = total_revenue + ?
      WHERE id = ?
    `);

    updateStmt.run(input.commission_amount, input.affiliate_id);

    return result.lastInsertRowid as number;
  });

  return transaction();
}

/**
 * Get all referrals for an affiliate partner
 */
export function getAffiliateReferrals(affiliateId: number): AffiliateReferral[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM affiliate_referrals
    WHERE affiliate_id = ?
    ORDER BY created_at DESC
  `);

  return stmt.all(affiliateId) as AffiliateReferral[];
}

/**
 * Get referrals with user info (masked)
 */
export function getAffiliateReferralsWithUser(affiliateId: number): Array<AffiliateReferral & { user_masked: string }> {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      ar.*,
      'User #' || ar.user_id as user_masked
    FROM affiliate_referrals ar
    WHERE ar.affiliate_id = ?
    ORDER BY ar.created_at DESC
  `);

  return stmt.all(affiliateId) as Array<AffiliateReferral & { user_masked: string }>;
}

/**
 * Mark a referral commission as paid
 */
export function markReferralPaid(referralId: number): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE affiliate_referrals
    SET commission_status = 'paid',
        paid_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(referralId);
}

/**
 * Get total pending commissions for an affiliate
 */
export function getPendingCommissions(affiliateId: number): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT COALESCE(SUM(commission_amount), 0) as total
    FROM affiliate_referrals
    WHERE affiliate_id = ? AND commission_status = 'pending'
  `);

  const result = stmt.get(affiliateId) as { total: number };
  return result.total;
}

/**
 * Get total paid commissions for an affiliate
 */
export function getPaidCommissions(affiliateId: number): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT COALESCE(SUM(commission_amount), 0) as total
    FROM affiliate_referrals
    WHERE affiliate_id = ? AND commission_status = 'paid'
  `);

  const result = stmt.get(affiliateId) as { total: number };
  return result.total;
}

/**
 * Update user's referred_by field
 */
export function updateUserReferredBy(userId: number, referralCode: string): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE user_profiles
    SET referred_by = ?
    WHERE id = ?
  `);

  stmt.run(referralCode, userId);
}
