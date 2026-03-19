/**
 * Database queries for partnership outreach tracking
 */

import { query, queryOne, insert } from '../unified';

// ============================================================================
// TYPES
// ============================================================================

export interface PartnerInput {
  partner_type: 'immigration_lawyer' | 'cpa' | 'other';
  name: string;
  firm_name: string;
  email: string;
  phone?: string;
  website?: string;
  specialization?: string;
  estimated_client_count?: number;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  revenue_share_percentage?: number;
  referral_code: string;
  notes?: string;
}

export interface PartnerRow extends PartnerInput {
  id: number;
  status: 'prospect' | 'contacted' | 'interested' | 'active' | 'inactive' | 'rejected';
  first_contacted_at: string | null;
  last_contacted_at: string | null;
  intro_call_scheduled_at: string | null;
  intro_call_completed_at: string | null;
  partnership_activated_at: string | null;
  total_referrals: number;
  successful_referrals: number;
  total_revenue_generated: number;
  total_commission_earned: number;
  metadata: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerOutreachInput {
  partner_id: number;
  email_subject: string;
  email_body: string;
  notes?: string;
}

export interface PartnerOutreachRow extends PartnerOutreachInput {
  id: number;
  sent_at: string;
  opened: boolean;
  opened_at: string | null;
  clicked: boolean;
  clicked_at: string | null;
  responded: boolean;
  responded_at: string | null;
  response_text: string | null;
  status: 'sent' | 'opened' | 'clicked' | 'responded' | 'bounced' | 'no_response';
  created_at: string;
}

export interface PartnerReferralInput {
  partner_id: number;
  referral_code: string;
  user_id?: number;
}

export interface PartnerReferralRow extends PartnerReferralInput {
  id: number;
  referred_at: string;
  converted: boolean;
  converted_at: string | null;
  subscription_tier: string | null;
  first_payment_amount: number;
  lifetime_value: number;
  commission_paid: number;
  utm_source: string;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PARTNER CRUD OPERATIONS
// ============================================================================

/**
 * Create a new partner
 */
export async function createPartner(partner: PartnerInput): Promise<number> {
  return insert(
    `INSERT INTO partners (
      partner_type, name, firm_name, email, phone, website,
      specialization, estimated_client_count, location_city, location_state, location_country,
      revenue_share_percentage, referral_code, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      partner.partner_type,
      partner.name,
      partner.firm_name,
      partner.email,
      partner.phone || null,
      partner.website || null,
      partner.specialization || null,
      partner.estimated_client_count || null,
      partner.location_city || null,
      partner.location_state || null,
      partner.location_country || 'USA',
      partner.revenue_share_percentage || 30.0,
      partner.referral_code,
      partner.notes || null,
    ]
  );
}

/**
 * Get all partners
 */
export async function getAllPartners(): Promise<PartnerRow[]> {
  return query<PartnerRow>(
    `SELECT * FROM partners ORDER BY created_at DESC`,
    []
  );
}

/**
 * Get partners by type
 */
export async function getPartnersByType(
  partnerType: 'immigration_lawyer' | 'cpa' | 'other'
): Promise<PartnerRow[]> {
  return query<PartnerRow>(
    `SELECT * FROM partners WHERE partner_type = $1 ORDER BY created_at DESC`,
    [partnerType]
  );
}

/**
 * Get partners by status
 */
export async function getPartnersByStatus(
  status: 'prospect' | 'contacted' | 'interested' | 'active' | 'inactive' | 'rejected'
): Promise<PartnerRow[]> {
  return query<PartnerRow>(
    `SELECT * FROM partners WHERE status = $1 ORDER BY created_at DESC`,
    [status]
  );
}

/**
 * Get a single partner by ID
 */
export async function getPartnerById(id: number): Promise<PartnerRow | null> {
  return queryOne<PartnerRow>(
    `SELECT * FROM partners WHERE id = $1`,
    [id]
  );
}

/**
 * Get a partner by referral code
 */
export async function getPartnerByReferralCode(
  referralCode: string
): Promise<PartnerRow | null> {
  return queryOne<PartnerRow>(
    `SELECT * FROM partners WHERE referral_code = $1`,
    [referralCode]
  );
}

/**
 * Update partner status
 */
export async function updatePartnerStatus(
  partnerId: number,
  status: 'prospect' | 'contacted' | 'interested' | 'active' | 'inactive' | 'rejected'
): Promise<void> {
  await query(
    `UPDATE partners SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [status, partnerId]
  );
}

/**
 * Update partner contact timestamp
 */
export async function updatePartnerContactTimestamp(
  partnerId: number,
  isFirstContact: boolean
): Promise<void> {
  if (isFirstContact) {
    await query(
      `UPDATE partners SET
        first_contacted_at = CURRENT_TIMESTAMP,
        last_contacted_at = CURRENT_TIMESTAMP,
        status = 'contacted',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1`,
      [partnerId]
    );
  } else {
    await query(
      `UPDATE partners SET
        last_contacted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1`,
      [partnerId]
    );
  }
}

/**
 * Schedule intro call
 */
export async function scheduleIntroCall(
  partnerId: number,
  scheduledAt: string
): Promise<void> {
  await query(
    `UPDATE partners SET
      intro_call_scheduled_at = $1,
      status = 'interested',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2`,
    [scheduledAt, partnerId]
  );
}

/**
 * Mark intro call as completed
 */
export async function completeIntroCall(partnerId: number): Promise<void> {
  await query(
    `UPDATE partners SET
      intro_call_completed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1`,
    [partnerId]
  );
}

/**
 * Activate partnership
 */
export async function activatePartnership(partnerId: number): Promise<void> {
  await query(
    `UPDATE partners SET
      partnership_activated_at = CURRENT_TIMESTAMP,
      status = 'active',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1`,
    [partnerId]
  );
}

// ============================================================================
// PARTNER OUTREACH OPERATIONS
// ============================================================================

/**
 * Record an outreach email
 */
export async function recordPartnerOutreach(
  outreach: PartnerOutreachInput
): Promise<number> {
  return insert(
    `INSERT INTO partner_outreach (
      partner_id, email_subject, email_body, notes
    ) VALUES ($1, $2, $3, $4)`,
    [outreach.partner_id, outreach.email_subject, outreach.email_body, outreach.notes || null]
  );
}

/**
 * Get outreach history for a partner
 */
export async function getPartnerOutreachHistory(
  partnerId: number
): Promise<PartnerOutreachRow[]> {
  return query<PartnerOutreachRow>(
    `SELECT * FROM partner_outreach WHERE partner_id = $1 ORDER BY sent_at DESC`,
    [partnerId]
  );
}

/**
 * Mark outreach email as opened
 */
export async function markOutreachOpened(outreachId: number): Promise<void> {
  await query(
    `UPDATE partner_outreach SET
      opened = 1,
      opened_at = CURRENT_TIMESTAMP,
      status = 'opened'
    WHERE id = $1`,
    [outreachId]
  );
}

/**
 * Mark outreach email as clicked
 */
export async function markOutreachClicked(outreachId: number): Promise<void> {
  await query(
    `UPDATE partner_outreach SET
      clicked = 1,
      clicked_at = CURRENT_TIMESTAMP,
      status = 'clicked'
    WHERE id = $1`,
    [outreachId]
  );
}

/**
 * Record partner response
 */
export async function recordPartnerResponse(
  outreachId: number,
  responseText: string
): Promise<void> {
  await query(
    `UPDATE partner_outreach SET
      responded = 1,
      responded_at = CURRENT_TIMESTAMP,
      response_text = $1,
      status = 'responded'
    WHERE id = $2`,
    [responseText, outreachId]
  );
}

// ============================================================================
// PARTNER REFERRAL OPERATIONS
// ============================================================================

/**
 * Record a partner referral
 */
export async function recordPartnerReferral(
  referral: PartnerReferralInput
): Promise<number> {
  return insert(
    `INSERT INTO partner_referrals (
      partner_id, referral_code, user_id
    ) VALUES ($1, $2, $3)`,
    [referral.partner_id, referral.referral_code, referral.user_id || null]
  );
}

/**
 * Get referrals for a partner
 */
export async function getPartnerReferrals(
  partnerId: number
): Promise<PartnerReferralRow[]> {
  return query<PartnerReferralRow>(
    `SELECT * FROM partner_referrals WHERE partner_id = $1 ORDER BY referred_at DESC`,
    [partnerId]
  );
}

/**
 * Convert referral to paid user
 */
export async function convertReferral(
  referralId: number,
  userId: number,
  subscriptionTier: 'pro' | 'enterprise',
  firstPaymentAmount: number
): Promise<void> {
  await query(
    `UPDATE partner_referrals SET
      converted = 1,
      converted_at = CURRENT_TIMESTAMP,
      user_id = $1,
      subscription_tier = $2,
      first_payment_amount = $3,
      lifetime_value = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4`,
    [userId, subscriptionTier, firstPaymentAmount, referralId]
  );

  // Update partner metrics
  const referral = await queryOne<PartnerReferralRow>(
    `SELECT partner_id FROM partner_referrals WHERE id = $1`,
    [referralId]
  );

  if (referral) {
    await query(
      `UPDATE partners SET
        successful_referrals = successful_referrals + 1,
        total_revenue_generated = total_revenue_generated + $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2`,
      [firstPaymentAmount, referral.partner_id]
    );
  }
}

/**
 * Get partnership performance metrics
 */
export async function getPartnerMetrics(partnerId: number): Promise<{
  total_referrals: number;
  successful_referrals: number;
  conversion_rate: number;
  total_revenue: number;
  total_commission: number;
  avg_referral_value: number;
}> {
  const metrics = await queryOne<{
    total_referrals: number;
    successful_referrals: number;
    total_revenue_generated: number;
    total_commission_earned: number;
  }>(
    `SELECT
      total_referrals,
      successful_referrals,
      total_revenue_generated,
      total_commission_earned
    FROM partners
    WHERE id = $1`,
    [partnerId]
  );

  if (!metrics) {
    return {
      total_referrals: 0,
      successful_referrals: 0,
      conversion_rate: 0,
      total_revenue: 0,
      total_commission: 0,
      avg_referral_value: 0,
    };
  }

  const conversionRate =
    metrics.total_referrals > 0
      ? (metrics.successful_referrals / metrics.total_referrals) * 100
      : 0;

  const avgReferralValue =
    metrics.successful_referrals > 0
      ? metrics.total_revenue_generated / metrics.successful_referrals
      : 0;

  return {
    total_referrals: metrics.total_referrals,
    successful_referrals: metrics.successful_referrals,
    conversion_rate: conversionRate,
    total_revenue: metrics.total_revenue_generated,
    total_commission: metrics.total_commission_earned,
    avg_referral_value: avgReferralValue,
  };
}

/**
 * Get top performing partners
 */
export async function getTopPerformingPartners(limit: number = 10): Promise<PartnerRow[]> {
  return query<PartnerRow>(
    `SELECT * FROM partners
    WHERE status = 'active'
    ORDER BY total_revenue_generated DESC
    LIMIT $1`,
    [limit]
  );
}
