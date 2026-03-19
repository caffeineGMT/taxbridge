/**
 * Database queries for user interview campaign
 *
 * Find calculator users who are eligible for interview invitations
 */

import { db } from '../init';

export interface CalculatorUser {
  userId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  firstCalculationAt: number;
  lastCalculationAt: number;
  totalCalculations: number;
  daysSinceFirstCalculation: number;
  daysSinceLastCalculation: number;
  subscriptionTier: string;
}

/**
 * Get calculator users eligible for interview invitations
 *
 * Criteria:
 * - Completed at least 1 calculation
 * - Free tier (not paid)
 * - First calculation 3-90 days ago (engaged but not too old)
 * - No interview invitation sent yet
 * - Has valid email
 */
export function getEligibleCalculatorUsers(params: {
  minCalculations?: number;
  minDaysSinceFirst?: number;
  maxDaysSinceFirst?: number;
  limit?: number;
}): CalculatorUser[] {
  const {
    minCalculations = 1,
    minDaysSinceFirst = 3,
    maxDaysSinceFirst = 90,
    limit = 50,
  } = params;

  const nowUnix = Math.floor(Date.now() / 1000);
  const minAgeUnix = nowUnix - (maxDaysSinceFirst * 24 * 60 * 60);
  const maxAgeUnix = nowUnix - (minDaysSinceFirst * 24 * 60 * 60);

  const query = `
    WITH user_calculations AS (
      SELECT
        user_id,
        MIN(created_at) as first_calculation_at,
        MAX(created_at) as last_calculation_at,
        COUNT(*) as total_calculations
      FROM rsu_events
      GROUP BY user_id
      HAVING total_calculations >= ?
    )
    SELECT DISTINCT
      up.id as userId,
      up.email,
      up.first_name as firstName,
      up.last_name as lastName,
      uc.first_calculation_at as firstCalculationAt,
      uc.last_calculation_at as lastCalculationAt,
      uc.total_calculations as totalCalculations,
      CAST((? - uc.first_calculation_at) / 86400.0 AS INTEGER) as daysSinceFirstCalculation,
      CAST((? - uc.last_calculation_at) / 86400.0 AS INTEGER) as daysSinceLastCalculation,
      COALESCE(up.subscription_tier, 'free') as subscriptionTier
    FROM user_profiles up
    INNER JOIN user_calculations uc ON up.id = uc.user_id
    LEFT JOIN user_interview_invitations uii ON up.id = uii.user_id
    WHERE
      up.email IS NOT NULL
      AND up.email != ''
      AND COALESCE(up.subscription_tier, 'free') = 'free'
      AND uc.first_calculation_at <= ?
      AND uc.first_calculation_at >= ?
      AND uii.id IS NULL
    ORDER BY uc.total_calculations DESC, uc.last_calculation_at DESC
    LIMIT ?
  `;

  const users = db.prepare(query).all(
    minCalculations,
    nowUnix,
    nowUnix,
    maxAgeUnix,
    minAgeUnix,
    limit
  ) as CalculatorUser[];

  return users;
}

/**
 * Get users who need reminder emails
 *
 * Criteria:
 * - Invitation sent 5+ days ago
 * - No reminder sent yet OR last reminder was 7+ days ago
 * - Status is still 'invited' or 'reminded'
 * - Max 2 reminders total
 */
export function getUsersNeedingInterviewReminder(): Array<{
  invitationId: number;
  userId: number;
  email: string;
  firstName: string | null;
  firstCalculationAt: number;
  lastCalculationAt: number;
  totalCalculations: number;
  calendlyLink: string;
  trackingToken: string;
  invitationSentAt: number;
  reminderCount: number;
}> {
  const nowUnix = Math.floor(Date.now() / 1000);
  const fiveDaysAgo = nowUnix - (5 * 24 * 60 * 60);
  const sevenDaysAgo = nowUnix - (7 * 24 * 60 * 60);

  const query = `
    SELECT
      id as invitationId,
      user_id as userId,
      email,
      first_name as firstName,
      first_calculation_at as firstCalculationAt,
      last_calculation_at as lastCalculationAt,
      total_calculations as totalCalculations,
      calendly_link as calendlyLink,
      tracking_token as trackingToken,
      invitation_sent_at as invitationSentAt,
      reminder_count as reminderCount
    FROM user_interview_invitations
    WHERE
      status IN ('invited', 'reminded')
      AND reminder_count < 2
      AND (
        (invitation_sent_at <= ? AND reminder_sent_at IS NULL)
        OR
        (reminder_sent_at <= ?)
      )
    ORDER BY invitation_sent_at ASC
    LIMIT 20
  `;

  return db.prepare(query).all(fiveDaysAgo, sevenDaysAgo) as any[];
}

/**
 * Get interview campaign statistics
 */
export function getInterviewCampaignStats(): {
  totalInvited: number;
  totalBooked: number;
  totalCompleted: number;
  totalGiftCardsSent: number;
  totalSpent: number;
  conversionRate: number;
  completionRate: number;
  avgInterviewDuration: number | null;
} {
  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM user_interview_invitations) as totalInvited,
      (SELECT COUNT(*) FROM user_interview_bookings WHERE status != 'canceled') as totalBooked,
      (SELECT COUNT(*) FROM user_interview_completed) as totalCompleted,
      (SELECT COUNT(*) FROM user_interview_completed WHERE gift_card_sent_at IS NOT NULL) as totalGiftCardsSent,
      (SELECT COALESCE(SUM(gift_card_amount), 0) FROM user_interview_completed) as totalSpent,
      (SELECT AVG(interview_duration_minutes) FROM user_interview_completed WHERE interview_duration_minutes IS NOT NULL) as avgInterviewDuration
  `).get() as any;

  return {
    totalInvited: stats.totalInvited || 0,
    totalBooked: stats.totalBooked || 0,
    totalCompleted: stats.totalCompleted || 0,
    totalGiftCardsSent: stats.totalGiftCardsSent || 0,
    totalSpent: stats.totalSpent || 0,
    conversionRate: stats.totalInvited > 0 ? (stats.totalBooked / stats.totalInvited) * 100 : 0,
    completionRate: stats.totalBooked > 0 ? (stats.totalCompleted / stats.totalBooked) * 100 : 0,
    avgInterviewDuration: stats.avgInterviewDuration || null,
  };
}

/**
 * Get interview insights summary grouped by category
 */
export function getInterviewInsightsSummary(): Array<{
  category: string;
  count: number;
  criticalCount: number;
  actionableCount: number;
  avgConversionImpact: number | null;
}> {
  const query = `
    SELECT
      COALESCE(insight_category, 'uncategorized') as category,
      COUNT(*) as count,
      SUM(CASE WHEN insight_severity = 'critical' THEN 1 ELSE 0 END) as criticalCount,
      SUM(CASE WHEN is_actionable = 1 THEN 1 ELSE 0 END) as actionableCount,
      AVG(CASE WHEN estimated_conversion_impact_percent IS NOT NULL THEN estimated_conversion_impact_percent ELSE NULL END) as avgConversionImpact
    FROM user_interview_insights
    GROUP BY insight_category
    ORDER BY criticalCount DESC, count DESC
  `;

  return db.prepare(query).all() as any[];
}

/**
 * Get top pain points from interviews
 */
export function getTopPainPoints(limit: number = 10): Array<{
  painPoint: string;
  count: number;
  affectsConversion: boolean;
  avgImpact: number | null;
}> {
  const query = `
    SELECT
      pain_point_category as painPoint,
      COUNT(*) as count,
      MAX(CASE WHEN uii.affects_conversion = 1 THEN 1 ELSE 0 END) as affectsConversion,
      AVG(uii.estimated_conversion_impact_percent) as avgImpact
    FROM user_interview_completed uic
    LEFT JOIN user_interview_insights uii ON uii.source_interview_id = uic.id
    WHERE uic.pain_point_category IS NOT NULL
    GROUP BY uic.pain_point_category
    ORDER BY count DESC, avgImpact DESC
    LIMIT ?
  `;

  return db.prepare(query).all(limit) as any[];
}

/**
 * Record interview invitation sent
 */
export function recordInterviewInvitation(params: {
  userId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  firstCalculationAt: number;
  lastCalculationAt: number;
  totalCalculations: number;
  calendlyLink: string;
  trackingToken: string;
}): number {
  const nowUnix = Math.floor(Date.now() / 1000);

  const result = db.prepare(`
    INSERT INTO user_interview_invitations (
      user_id, email, first_name, last_name,
      first_calculation_at, last_calculation_at, total_calculations,
      invitation_sent_at, calendly_link, tracking_token,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    params.userId,
    params.email,
    params.firstName,
    params.lastName,
    params.firstCalculationAt,
    params.lastCalculationAt,
    params.totalCalculations,
    nowUnix,
    params.calendlyLink,
    params.trackingToken,
    nowUnix,
    nowUnix
  );

  return result.lastInsertRowid as number;
}

/**
 * Record interview reminder sent
 */
export function recordInterviewReminder(invitationId: number): void {
  const nowUnix = Math.floor(Date.now() / 1000);

  db.prepare(`
    UPDATE user_interview_invitations
    SET
      reminder_sent_at = ?,
      reminder_count = reminder_count + 1,
      status = 'reminded',
      updated_at = ?
    WHERE id = ?
  `).run(nowUnix, nowUnix, invitationId);
}

/**
 * Record interview booking
 */
export function recordInterviewBooking(params: {
  invitationId: number;
  userId: number;
  email: string;
  scheduledDate: string;
  scheduledTime: string;
  scheduledTimestamp: number;
  calendlyEventId?: string;
  zoomLink?: string;
  rescheduleLink?: string;
}): number {
  const nowUnix = Math.floor(Date.now() / 1000);

  // Update invitation status
  db.prepare(`
    UPDATE user_interview_invitations
    SET status = 'booked', updated_at = ?
    WHERE id = ?
  `).run(nowUnix, params.invitationId);

  // Insert booking
  const result = db.prepare(`
    INSERT INTO user_interview_bookings (
      invitation_id, user_id, email,
      scheduled_date, scheduled_time, scheduled_timestamp,
      calendly_event_id, zoom_link, reschedule_link,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    params.invitationId,
    params.userId,
    params.email,
    params.scheduledDate,
    params.scheduledTime,
    params.scheduledTimestamp,
    params.calendlyEventId || null,
    params.zoomLink || null,
    params.rescheduleLink || null,
    nowUnix,
    nowUnix
  );

  return result.lastInsertRowid as number;
}

/**
 * Record completed interview
 */
export function recordCompletedInterview(params: {
  bookingId: number;
  invitationId: number;
  userId: number;
  email: string;
  interviewDate: string;
  durationMinutes: number;
  question1Answer?: string;
  question2Answer?: string;
  question3Answer?: string;
  interviewerNotes?: string;
  keyInsights?: string[];
  painPointCategory?: string;
}): number {
  const nowUnix = Math.floor(Date.now() / 1000);

  // Update booking status
  db.prepare(`
    UPDATE user_interview_bookings
    SET status = 'completed', updated_at = ?
    WHERE id = ?
  `).run(nowUnix, params.bookingId);

  // Update invitation status
  db.prepare(`
    UPDATE user_interview_invitations
    SET status = 'completed', updated_at = ?
    WHERE id = ?
  `).run(nowUnix, params.invitationId);

  // Insert completed interview
  const result = db.prepare(`
    INSERT INTO user_interview_completed (
      booking_id, invitation_id, user_id, email,
      interview_date, interview_duration_minutes,
      question_1_answer, question_2_answer, question_3_answer,
      interviewer_notes, key_insights, pain_point_category,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    params.bookingId,
    params.invitationId,
    params.userId,
    params.email,
    params.interviewDate,
    params.durationMinutes,
    params.question1Answer || null,
    params.question2Answer || null,
    params.question3Answer || null,
    params.interviewerNotes || null,
    params.keyInsights ? JSON.stringify(params.keyInsights) : null,
    params.painPointCategory || null,
    nowUnix,
    nowUnix
  );

  return result.lastInsertRowid as number;
}

/**
 * Record gift card sent
 */
export function recordGiftCardSent(params: {
  interviewId: number;
  giftCardCode: string;
  amount: number;
}): void {
  const nowUnix = Math.floor(Date.now() / 1000);

  db.prepare(`
    UPDATE user_interview_completed
    SET
      gift_card_code = ?,
      gift_card_amount = ?,
      gift_card_sent_at = ?,
      thank_you_sent_at = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    params.giftCardCode,
    params.amount,
    nowUnix,
    nowUnix,
    nowUnix,
    params.interviewId
  );
}
