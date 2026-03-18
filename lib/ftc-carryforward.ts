/**
 * Foreign Tax Credit Carryforward Engine
 *
 * IRS allows unused FTC to be carried back 1 year or forward 10 years.
 * Canada allows non-business foreign tax credits to be carried forward 10 years.
 *
 * This module tracks and applies carryforward credits to minimize total tax burden.
 */

import { getDatabase } from './db';

export interface FTCCarryforwardRecord {
  id: number;
  user_id: number;
  year: number;
  unused_ftc_cad: number;
  source_year: number;
  expires_at: number;
  applied_to_year: number | null;
  created_at: string;
}

export interface FTCCarryforwardSummary {
  availableCarryforward: number;
  excessFTC: number;
  carryforwardRecords: FTCCarryforwardRecord[];
}

export interface ApplyCarryforwardResult {
  reducedTax: number;
  appliedAmount: number;
  appliedRecords: Array<{
    id: number;
    source_year: number;
    amount: number;
  }>;
}

/**
 * Calculate available FTC carryforward for a given year
 *
 * Queries all unused credits that:
 * - Are within the 10-year carryforward window
 * - Have not been applied to another year
 * - Belong to the specified user
 *
 * @param userId User ID to calculate carryforward for
 * @param year Target year to apply carryforward to
 * @returns Summary of available carryforward credits
 */
export async function calculateFTCCarryforward(
  userId: number,
  year: number
): Promise<FTCCarryforwardSummary> {
  const db = getDatabase();

  // Query unused credits within the carryforward window
  // IRS/CRA: Can carry forward up to 10 years from source year
  const stmt = db.prepare(`
    SELECT *
    FROM ftc_carryforward
    WHERE user_id = ?
      AND year <= ?
      AND expires_at >= ?
      AND applied_to_year IS NULL
    ORDER BY source_year ASC
  `);

  const records = stmt.all(userId, year, year) as FTCCarryforwardRecord[];

  // Sum total available carryforward
  const availableCarryforward = records.reduce(
    (sum, record) => sum + record.unused_ftc_cad,
    0
  );

  // Calculate excess FTC from prior years (not yet applied)
  const excessFTC = availableCarryforward;

  return {
    availableCarryforward: Math.round(availableCarryforward * 100) / 100,
    excessFTC: Math.round(excessFTC * 100) / 100,
    carryforwardRecords: records,
  };
}

/**
 * Apply available carryforward credits to reduce current year tax
 *
 * Uses FIFO approach: oldest credits are applied first (expires earliest).
 * Updates ftc_carryforward records to mark them as applied.
 *
 * @param userId User ID applying carryforward
 * @param currentYear Year to apply carryforward to
 * @param taxOwedCAD Canada tax owed before carryforward (in CAD)
 * @returns Reduced tax amount and details of applied credits
 */
export async function applyCarryforward(
  userId: number,
  currentYear: number,
  taxOwedCAD: number
): Promise<ApplyCarryforwardResult> {
  const db = getDatabase();

  // Get available carryforward
  const { carryforwardRecords } = await calculateFTCCarryforward(userId, currentYear);

  if (carryforwardRecords.length === 0 || taxOwedCAD <= 0) {
    return {
      reducedTax: taxOwedCAD,
      appliedAmount: 0,
      appliedRecords: [],
    };
  }

  let remainingTax = taxOwedCAD;
  let totalApplied = 0;
  const appliedRecords: Array<{ id: number; source_year: number; amount: number }> = [];

  // Apply credits in FIFO order (oldest first)
  for (const record of carryforwardRecords) {
    if (remainingTax <= 0) break;

    const amountToApply = Math.min(record.unused_ftc_cad, remainingTax);

    if (amountToApply > 0) {
      // Mark this record as applied (or partially applied)
      const updateStmt = db.prepare(`
        UPDATE ftc_carryforward
        SET applied_to_year = ?,
            unused_ftc_cad = unused_ftc_cad - ?
        WHERE id = ?
      `);

      updateStmt.run(currentYear, amountToApply, record.id);

      remainingTax -= amountToApply;
      totalApplied += amountToApply;

      appliedRecords.push({
        id: record.id,
        source_year: record.source_year,
        amount: amountToApply,
      });
    }
  }

  return {
    reducedTax: Math.max(0, Math.round(remainingTax * 100) / 100),
    appliedAmount: Math.round(totalApplied * 100) / 100,
    appliedRecords,
  };
}

/**
 * Create a new FTC carryforward record
 *
 * Called when there's excess US tax credit that couldn't be fully used in current year.
 *
 * @param userId User ID creating the carryforward
 * @param sourceYear Year the excess FTC originated from
 * @param unusedFTCAmount Amount of unused FTC (in CAD)
 */
export async function createFTCCarryforward(
  userId: number,
  sourceYear: number,
  unusedFTCAmount: number
): Promise<number> {
  const db = getDatabase();

  // FTC can be carried forward 10 years
  const expiresAt = sourceYear + 10;

  const stmt = db.prepare(`
    INSERT INTO ftc_carryforward (user_id, year, unused_ftc_cad, source_year, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(userId, sourceYear, unusedFTCAmount, sourceYear, expiresAt);
  return result.lastInsertRowid as number;
}

/**
 * Get all FTC carryforward records for a user across all years
 *
 * @param userId User ID to fetch records for
 * @returns All carryforward records for the user
 */
export async function getAllFTCCarryforwards(userId: number): Promise<FTCCarryforwardRecord[]> {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT *
    FROM ftc_carryforward
    WHERE user_id = ?
    ORDER BY source_year DESC, created_at DESC
  `);

  return stmt.all(userId) as FTCCarryforwardRecord[];
}

/**
 * Delete expired FTC carryforward records
 *
 * Cleanup function to remove credits that have expired.
 *
 * @param currentYear Current tax year
 * @returns Number of records deleted
 */
export async function cleanupExpiredCarryforwards(currentYear: number): Promise<number> {
  const db = getDatabase();

  const stmt = db.prepare(`
    DELETE FROM ftc_carryforward
    WHERE expires_at < ?
  `);

  const result = stmt.run(currentYear);
  return result.changes;
}
