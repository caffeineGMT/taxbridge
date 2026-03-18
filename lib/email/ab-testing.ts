/**
 * A/B Testing Service for Email Drip Campaign
 *
 * Manages variant selection, tracking, and analytics for email A/B tests
 */

import { getDatabase } from '@/lib/db';

export type EmailEventType = 'drip_welcome' | 'drip_day3' | 'drip_day7' | 'drip_day14';
export type ABVariant = 'A' | 'B';

export interface ABTestVariant {
  id: number;
  event_type: EmailEventType;
  variant: ABVariant;
  subject_line: string;
  cta_text: string;
  weight: number;
  is_active: boolean;
  metadata?: string;
}

export interface ABTestResult {
  event_type: EmailEventType;
  variant: ABVariant;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_converted: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  total_revenue: number;
}

/**
 * Get active A/B test variants for a specific email type
 */
export function getABVariants(eventType: EmailEventType): ABTestVariant[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT *
    FROM email_ab_variants
    WHERE event_type = ? AND is_active = 1
    ORDER BY variant
  `);

  return stmt.all(eventType) as ABTestVariant[];
}

/**
 * Randomly select an A/B test variant based on configured weights
 */
export function selectABVariant(eventType: EmailEventType): ABTestVariant | null {
  const variants = getABVariants(eventType);

  if (variants.length === 0) {
    return null;
  }

  // Calculate total weight
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);

  // Generate random number between 0 and totalWeight
  const random = Math.random() * totalWeight;

  // Select variant based on weighted random selection
  let cumulativeWeight = 0;
  for (const variant of variants) {
    cumulativeWeight += variant.weight;
    if (random <= cumulativeWeight) {
      return variant;
    }
  }

  // Fallback to first variant
  return variants[0];
}

/**
 * Get A/B test analytics for all variants or a specific event type
 */
export function getABTestAnalytics(eventType?: EmailEventType): ABTestResult[] {
  const db = getDatabase();

  let query = `SELECT * FROM v_email_conversion_analytics`;

  if (eventType) {
    query += ` WHERE event_type = ?`;
  }

  query += ` ORDER BY event_type, ab_variant`;

  const stmt = db.prepare(query);
  const results = eventType ? stmt.all(eventType) : stmt.all();

  return results as ABTestResult[];
}

/**
 * Update A/B test variant configuration
 */
export function updateABVariant(
  eventType: EmailEventType,
  variant: ABVariant,
  updates: {
    subject_line?: string;
    cta_text?: string;
    weight?: number;
    is_active?: boolean;
  }
): boolean {
  const db = getDatabase();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.subject_line !== undefined) {
    fields.push('subject_line = ?');
    values.push(updates.subject_line);
  }

  if (updates.cta_text !== undefined) {
    fields.push('cta_text = ?');
    values.push(updates.cta_text);
  }

  if (updates.weight !== undefined) {
    fields.push('weight = ?');
    values.push(updates.weight);
  }

  if (updates.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(updates.is_active ? 1 : 0);
  }

  if (fields.length === 0) {
    return false;
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');

  const stmt = db.prepare(`
    UPDATE email_ab_variants
    SET ${fields.join(', ')}
    WHERE event_type = ? AND variant = ?
  `);

  values.push(eventType, variant);
  const result = stmt.run(...values);

  return result.changes > 0;
}

/**
 * Calculate statistical significance between two variants
 * Returns p-value (< 0.05 is statistically significant)
 */
export function calculateSignificance(
  variantA: ABTestResult,
  variantB: ABTestResult
): number {
  // Use z-test for proportions (conversion rates)
  const p1 = variantA.conversion_rate / 100;
  const p2 = variantB.conversion_rate / 100;
  const n1 = variantA.total_sent;
  const n2 = variantB.total_sent;

  // Pooled proportion
  const p = (p1 * n1 + p2 * n2) / (n1 + n2);

  // Standard error
  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));

  // Z-score
  const z = (p1 - p2) / se;

  // Two-tailed p-value (approximate using standard normal distribution)
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));

  return pValue;
}

/**
 * Cumulative distribution function for standard normal distribution
 */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  return x > 0 ? 1 - p : p;
}

/**
 * Get winning variant (highest conversion rate with statistical significance)
 */
export function getWinningVariant(eventType: EmailEventType): {
  winner: ABTestResult | null;
  confidence: number;
  isSignificant: boolean;
} {
  const results = getABTestAnalytics(eventType);

  if (results.length < 2) {
    return {
      winner: results[0] || null,
      confidence: 0,
      isSignificant: false,
    };
  }

  const variantA = results.find(r => r.variant === 'A');
  const variantB = results.find(r => r.variant === 'B');

  if (!variantA || !variantB) {
    return {
      winner: results[0],
      confidence: 0,
      isSignificant: false,
    };
  }

  const pValue = calculateSignificance(variantA, variantB);
  const isSignificant = pValue < 0.05;
  const confidence = (1 - pValue) * 100;

  const winner = variantA.conversion_rate > variantB.conversion_rate ? variantA : variantB;

  return {
    winner,
    confidence,
    isSignificant,
  };
}
