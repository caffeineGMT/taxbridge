/**
 * Credit System Queries
 * Manages user credit balances and transaction history
 */

import { getDatabase } from '../index';

export interface CreditTransaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'referral_reward' | 'referral_bonus' | 'payment_applied' | 'adjustment' | 'expiration';
  description: string;
  referral_id: number | null;
  balance_after: number;
  created_at: number;
}

/**
 * Get user's current credit balance
 */
export function getUserCreditBalance(userId: number): number {
  const db = getDatabase();

  const result = db.prepare('SELECT credit_balance FROM user_profiles WHERE id = ?').get(userId) as { credit_balance: number } | undefined;

  return result?.credit_balance || 0;
}

/**
 * Add credits to user account
 */
export function addCredits(
  userId: number,
  amount: number,
  type: CreditTransaction['type'],
  description: string,
  referralId?: number
): number {
  const db = getDatabase();

  // Get current balance
  const currentBalance = getUserCreditBalance(userId);
  const newBalance = currentBalance + amount;

  // Update user balance
  db.prepare('UPDATE user_profiles SET credit_balance = ? WHERE id = ?').run(newBalance, userId);

  // Record transaction
  const stmt = db.prepare(`
    INSERT INTO credit_transactions (user_id, amount, type, description, referral_id, balance_after)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(userId, amount, type, description, referralId || null, newBalance);

  return result.lastInsertRowid as number;
}

/**
 * Deduct credits from user account (for payments)
 */
export function deductCredits(
  userId: number,
  amount: number,
  description: string
): boolean {
  const db = getDatabase();

  const currentBalance = getUserCreditBalance(userId);

  if (currentBalance < amount) {
    return false; // Insufficient credits
  }

  const newBalance = currentBalance - amount;

  // Update user balance
  db.prepare('UPDATE user_profiles SET credit_balance = ? WHERE id = ?').run(newBalance, userId);

  // Record transaction
  db.prepare(`
    INSERT INTO credit_transactions (user_id, amount, type, description, balance_after)
    VALUES (?, ?, 'payment_applied', ?, ?)
  `).run(userId, -amount, description, newBalance);

  return true;
}

/**
 * Get user's credit transaction history
 */
export function getCreditTransactions(userId: number, limit: number = 50): CreditTransaction[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM credit_transactions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);

  return stmt.all(userId, limit) as CreditTransaction[];
}

/**
 * Get credit summary stats
 */
export function getCreditSummary(userId: number): {
  current_balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  transactions_count: number;
} {
  const db = getDatabase();

  const currentBalance = getUserCreditBalance(userId);

  const stats = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as lifetime_earned,
      COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as lifetime_spent,
      COUNT(*) as transactions_count
    FROM credit_transactions
    WHERE user_id = ?
  `).get(userId) as {
    lifetime_earned: number;
    lifetime_spent: number;
    transactions_count: number;
  };

  return {
    current_balance: currentBalance,
    ...stats,
  };
}
