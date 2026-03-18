/**
 * Enhanced Email Templates with A/B Testing, UTM Tracking, and Personalization
 */

import { getDatabase } from '@/lib/db';
import type { ABVariant, EmailEventType } from './ab-testing';
import { generateEmailUrls } from './utm-tracking';

export interface EnhancedEmailData {
  // A/B test variant data
  subject_line: string;
  cta_text: string;
  variant: ABVariant;

  // Personalization
  first_name: string;
  email: string;

  // Tax savings personalization (if available)
  estimated_tax_savings?: string;
  rsu_count?: number;
  last_calculation_date?: string;

  // UTM-tracked URLs
  dashboard_url: string;
  calculator_url: string;
  ftc_calculator_url: string;
  rsu_entry_url: string;
  upgrade_url: string;
  pricing_url: string;
  forms_url: string;
  exchange_rates_url: string;
  demo_url: string;
  knowledge_base_url: string;
  unsubscribe_url: string;

  // Additional data per email type
  [key: string]: any;
}

/**
 * Get user's tax calculation data for personalization
 */
function getUserTaxData(userId: number): {
  estimatedSavings: number;
  rsuCount: number;
  lastCalculationDate: string | null;
} {
  const db = getDatabase();

  try {
    // Get user's calculations (simplified - adjust based on your actual schema)
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as rsu_count,
        MAX(created_at) as last_calculation_date
      FROM user_profiles
      WHERE id = ?
    `);

    const result = stmt.get(userId) as any;

    // Estimated savings calculation (placeholder - replace with actual logic)
    // For now, using a conservative estimate based on RSU activity
    const estimatedSavings = result?.rsu_count > 0 ? 8500 : 6000;

    return {
      estimatedSavings,
      rsuCount: result?.rsu_count || 0,
      lastCalculationDate: result?.last_calculation_date || null,
    };
  } catch (error) {
    console.error('Error fetching user tax data:', error);
    return {
      estimatedSavings: 6000, // Default estimate
      rsuCount: 0,
      lastCalculationDate: null,
    };
  }
}

/**
 * Generate enhanced email data for Welcome Email (Day 1)
 */
export function getEnhancedWelcomeEmailData(params: {
  userId: number;
  firstName: string;
  email: string;
  variant: ABVariant;
  subjectLine: string;
  ctaText: string;
}): EnhancedEmailData {
  const taxData = getUserTaxData(params.userId);
  const urls = generateEmailUrls('drip_welcome', params.variant, params.email);

  return {
    subject_line: params.subjectLine,
    cta_text: params.ctaText,
    variant: params.variant,
    first_name: params.firstName || 'there',
    email: params.email,
    estimated_tax_savings: `$${taxData.estimatedSavings.toLocaleString()}`,
    ...urls,
    support_email: 'support@taxbridge.app',
  };
}

/**
 * Generate enhanced email data for Day 3 Education Email
 */
export function getEnhancedDay3EmailData(params: {
  userId: number;
  firstName: string;
  email: string;
  variant: ABVariant;
  subjectLine: string;
  ctaText: string;
}): EnhancedEmailData {
  const taxData = getUserTaxData(params.userId);
  const urls = generateEmailUrls('drip_day3', params.variant, params.email);

  // FTC-specific savings range
  const ftcSavingsMin = 5000;
  const ftcSavingsMax = 15000;

  return {
    subject_line: params.subjectLine,
    cta_text: params.ctaText,
    variant: params.variant,
    first_name: params.firstName || 'there',
    email: params.email,
    estimated_tax_savings: `$${taxData.estimatedSavings.toLocaleString()}`,
    ftc_savings_range: `$${ftcSavingsMin.toLocaleString()}-$${ftcSavingsMax.toLocaleString()}`,
    ...urls,
    treaty_article_url: urls.knowledge_base_url + '/treaty-article-xv',
    support_email: 'support@taxbridge.app',
  };
}

/**
 * Generate enhanced email data for Day 7 Features Email
 */
export function getEnhancedDay7EmailData(params: {
  userId: number;
  firstName: string;
  email: string;
  variant: ABVariant;
  subjectLine: string;
  ctaText: string;
}): EnhancedEmailData {
  const taxData = getUserTaxData(params.userId);
  const urls = generateEmailUrls('drip_day7', params.variant, params.email);

  return {
    subject_line: params.subjectLine,
    cta_text: params.ctaText,
    variant: params.variant,
    first_name: params.firstName || 'there',
    email: params.email,
    estimated_tax_savings: `$${taxData.estimatedSavings.toLocaleString()}`,
    rsu_count: taxData.rsuCount,
    dual_calculator_url: urls.calculator_url,
    form_checklist_url: urls.forms_url,
    ...urls,
    support_email: 'support@taxbridge.app',
  };
}

/**
 * Generate enhanced email data for Day 14 Conversion Email
 */
export function getEnhancedDay14EmailData(params: {
  userId: number;
  firstName: string;
  email: string;
  variant: ABVariant;
  subjectLine: string;
  ctaText: string;
  discountCode?: string;
}): EnhancedEmailData {
  const taxData = getUserTaxData(params.userId);
  const urls = generateEmailUrls('drip_day14', params.variant, params.email);

  const discountCode = params.discountCode || 'SAVE20';

  // Add discount code to upgrade URL
  const upgradeUrlWithCode = urls.upgrade_url + `&code=${discountCode}`;

  return {
    subject_line: params.subjectLine,
    cta_text: params.ctaText,
    variant: params.variant,
    first_name: params.firstName || 'there',
    email: params.email,
    estimated_tax_savings: `$${taxData.estimatedSavings.toLocaleString()}`,
    discount_code: discountCode,
    discount_amount: '20%',
    original_price: '$20',
    discounted_price: '$16',
    valid_until: getDiscountExpiryDate(),
    upgrade_url: upgradeUrlWithCode,
    premium_features: [
      'Unlimited RSU calculations',
      'Multi-year tax planning',
      'PDF tax reports generation',
      'Priority email support',
      'Tax form pre-fill assistance',
    ],
    ...urls,
    support_email: 'support@taxbridge.app',
  };
}

/**
 * Get discount expiry date (7 days from now)
 */
function getDiscountExpiryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Factory function to get the appropriate email data generator
 */
export function getEnhancedEmailDataGenerator(eventType: EmailEventType) {
  const generators: Record<
    EmailEventType,
    (params: {
      userId: number;
      firstName: string;
      email: string;
      variant: ABVariant;
      subjectLine: string;
      ctaText: string;
      discountCode?: string;
    }) => EnhancedEmailData
  > = {
    drip_welcome: getEnhancedWelcomeEmailData,
    drip_day3: getEnhancedDay3EmailData,
    drip_day7: getEnhancedDay7EmailData,
    drip_day14: getEnhancedDay14EmailData,
  };

  return generators[eventType];
}
