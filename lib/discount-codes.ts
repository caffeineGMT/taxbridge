/**
 * Discount Code Generation and Validation
 *
 * Generates unique 20% discount codes for feedback campaign participants.
 * Format: FEEDBACK20-{6 chars} (e.g., FEEDBACK20-A7K9M2)
 */

import crypto from 'crypto';
import { db as getDb } from '../db/init';

export interface DiscountCode {
  code: string;
  userId: number;
  email: string;
  discountPercent: number;
  validFrom: string; // ISO 8601
  validUntil: string; // ISO 8601
  used: boolean;
  usedAt: string | null;
  createdFor: 'calculator_feedback' | 'user_interview' | 'referral' | 'other';
  metadata?: Record<string, any>;
}

/**
 * Generate a unique discount code for a user
 */
export function generateDiscountCode(params: {
  userId: number;
  email: string;
  discountPercent: number;
  validDays: number;
  createdFor: 'calculator_feedback' | 'user_interview' | 'referral' | 'other';
  metadata?: Record<string, any>;
}): DiscountCode {
  const db = getDb;

  // Generate unique code suffix (6 alphanumeric chars)
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const prefix = params.discountPercent === 20 ? 'FEEDBACK20' : `DISCOUNT${params.discountPercent}`;
  const code = `${prefix}-${suffix}`;

  const now = new Date();
  const validFrom = now.toISOString();
  const validUntil = new Date(now.getTime() + params.validDays * 24 * 60 * 60 * 1000).toISOString();

  // Insert into database
  const stmt = db.prepare(`
    INSERT INTO discount_codes (
      code, user_id, email, discount_percent, valid_from, valid_until,
      used, created_for, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    RETURNING *
  `);

  const result = stmt.get(
    code,
    params.userId,
    params.email,
    params.discountPercent,
    validFrom,
    validUntil,
    params.createdFor,
    params.metadata ? JSON.stringify(params.metadata) : null,
    Math.floor(Date.now() / 1000)
  ) as any;

  return {
    code: result.code,
    userId: result.user_id,
    email: result.email,
    discountPercent: result.discount_percent,
    validFrom: result.valid_from,
    validUntil: result.valid_until,
    used: Boolean(result.used),
    usedAt: result.used_at,
    createdFor: result.created_for,
    metadata: result.metadata ? JSON.parse(result.metadata) : undefined,
  };
}

/**
 * Validate a discount code
 */
export function validateDiscountCode(code: string): {
  valid: boolean;
  discount?: DiscountCode;
  error?: string;
} {
  const db = getDb;

  const stmt = db.prepare(`
    SELECT * FROM discount_codes WHERE code = ?
  `);

  const result = stmt.get(code) as any;

  if (!result) {
    return { valid: false, error: 'Invalid discount code' };
  }

  // Check if already used
  if (result.used) {
    return { valid: false, error: 'Discount code has already been used' };
  }

  // Check expiration
  const now = new Date();
  const validUntil = new Date(result.valid_until);

  if (now > validUntil) {
    return { valid: false, error: 'Discount code has expired' };
  }

  return {
    valid: true,
    discount: {
      code: result.code,
      userId: result.user_id,
      email: result.email,
      discountPercent: result.discount_percent,
      validFrom: result.valid_from,
      validUntil: result.valid_until,
      used: Boolean(result.used),
      usedAt: result.used_at,
      createdFor: result.created_for,
      metadata: result.metadata ? JSON.parse(result.metadata) : undefined,
    },
  };
}

/**
 * Mark a discount code as used
 */
export function markDiscountCodeAsUsed(code: string, orderId?: string): boolean {
  const db = getDb;

  const stmt = db.prepare(`
    UPDATE discount_codes
    SET used = 1, used_at = ?, order_id = ?
    WHERE code = ? AND used = 0
  `);

  const result = stmt.run(new Date().toISOString(), orderId || null, code);

  return result.changes > 0;
}

/**
 * Get all discount codes for a user
 */
export function getUserDiscountCodes(userId: number): DiscountCode[] {
  const db = getDb;

  const stmt = db.prepare(`
    SELECT * FROM discount_codes
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);

  const results = stmt.all(userId) as any[];

  return results.map(r => ({
    code: r.code,
    userId: r.user_id,
    email: r.email,
    discountPercent: r.discount_percent,
    validFrom: r.valid_from,
    validUntil: r.valid_until,
    used: Boolean(r.used),
    usedAt: r.used_at,
    createdFor: r.created_for,
    metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
  }));
}

/**
 * Get statistics for feedback discount codes
 */
export function getFeedbackDiscountStats(): {
  totalGenerated: number;
  totalUsed: number;
  totalExpired: number;
  totalActive: number;
  conversionRate: number;
} {
  const db = getDb;

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_generated,
      SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as total_used,
      SUM(CASE WHEN datetime(valid_until) < datetime('now') THEN 1 ELSE 0 END) as total_expired,
      SUM(CASE WHEN used = 0 AND datetime(valid_until) >= datetime('now') THEN 1 ELSE 0 END) as total_active
    FROM discount_codes
    WHERE created_for = 'calculator_feedback'
  `).get() as any;

  const conversionRate = stats.total_generated > 0
    ? (stats.total_used / stats.total_generated) * 100
    : 0;

  return {
    totalGenerated: stats.total_generated || 0,
    totalUsed: stats.total_used || 0,
    totalExpired: stats.total_expired || 0,
    totalActive: stats.total_active || 0,
    conversionRate: Number(conversionRate.toFixed(2)),
  };
}
