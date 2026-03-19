/**
 * Retention Tracking Utilities
 * Automatic activity and feature usage tracking for retention analysis
 */

import {
  assignUserToCohort,
  logUserActivity,
  trackFeatureUsage,
} from '@/lib/db/queries/retention-analytics';

// ============================================================================
// COHORT ASSIGNMENT (called on signup)
// ============================================================================

/**
 * Initialize retention tracking for new user
 * Call this when user completes signup
 */
export async function initializeUserRetention(
  userId: number,
  signupDate: Date = new Date(),
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
  }
): Promise<void> {
  try {
    await assignUserToCohort(userId, signupDate, utmParams);
    await logUserActivity(userId, 'signup_completed');
  } catch (error) {
    console.error('[Retention] Failed to initialize user:', error);
    // Don't throw - this shouldn't block user signup
  }
}

// ============================================================================
// ACTIVITY TRACKING (middleware for retention calculation)
// ============================================================================

/**
 * Track user activity for retention calculation
 * Call this on page views, feature usage, etc.
 */
export async function trackActivity(
  userId: number,
  activityType: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await logUserActivity(userId, activityType, metadata);
  } catch (error) {
    console.error('[Retention] Failed to log activity:', error);
  }
}

// ============================================================================
// FEATURE USAGE TRACKING
// ============================================================================

export const TRACKABLE_FEATURES = {
  // Core calculator features
  TAX_CALCULATOR: 'tax_calculator',
  FTC_OPTIMIZER: 'ftc_optimizer',
  MULTI_YEAR_ANALYSIS: 'multi_year_analysis',

  // Data management
  RSU_ENTRY_CREATION: 'rsu_entry_creation',
  CSV_IMPORT: 'csv_import',
  PDF_EXPORT: 'pdf_export',

  // Dashboard features
  DASHBOARD_VIEW: 'dashboard_view',
  FORMS_CHECKLIST: 'forms_checklist',
  TAX_SUMMARY: 'tax_summary',

  // Premium features
  ADVANCED_DEDUCTIONS: 'advanced_deductions',
  ENTERPRISE_REPORTING: 'enterprise_reporting',
  API_ACCESS: 'api_access',

  // Collaboration
  SHARE_CALCULATION: 'share_calculation',
  EXPORT_TO_CPA: 'export_to_cpa',

  // Help & support
  HELP_CENTER: 'help_center',
  LIVE_CHAT: 'live_chat',
  VIDEO_TUTORIAL: 'video_tutorial',
} as const;

export type TrackableFeature = typeof TRACKABLE_FEATURES[keyof typeof TRACKABLE_FEATURES];

/**
 * Track feature usage with time spent (optional)
 */
export async function trackFeature(
  userId: number,
  feature: TrackableFeature,
  timeSeconds: number = 0
): Promise<void> {
  try {
    await trackFeatureUsage(userId, feature, timeSeconds);
  } catch (error) {
    console.error('[Retention] Failed to track feature:', error);
  }
}

// ============================================================================
// CONVENIENCE WRAPPERS
// ============================================================================

/**
 * Track calculator usage with time spent
 */
export async function trackCalculatorUse(
  userId: number,
  calculationType: 'basic' | 'ftc' | 'multi_year',
  timeSeconds: number = 0
): Promise<void> {
  const featureMap = {
    basic: TRACKABLE_FEATURES.TAX_CALCULATOR,
    ftc: TRACKABLE_FEATURES.FTC_OPTIMIZER,
    multi_year: TRACKABLE_FEATURES.MULTI_YEAR_ANALYSIS,
  };

  await Promise.all([
    trackFeature(userId, featureMap[calculationType], timeSeconds),
    trackActivity(userId, 'calculator_use', { type: calculationType }),
  ]);
}

/**
 * Track dashboard view
 */
export async function trackDashboardView(userId: number): Promise<void> {
  await Promise.all([
    trackFeature(userId, TRACKABLE_FEATURES.DASHBOARD_VIEW),
    trackActivity(userId, 'dashboard_view'),
  ]);
}

/**
 * Track RSU entry creation
 */
export async function trackRSUEntry(userId: number, isFirstEntry: boolean = false): Promise<void> {
  await Promise.all([
    trackFeature(userId, TRACKABLE_FEATURES.RSU_ENTRY_CREATION),
    trackActivity(userId, isFirstEntry ? 'first_rsu_entry_completed' : 'rsu_entry_created'),
  ]);
}

/**
 * Track CSV import
 */
export async function trackCSVImport(userId: number, rowCount: number): Promise<void> {
  await Promise.all([
    trackFeature(userId, TRACKABLE_FEATURES.CSV_IMPORT),
    trackActivity(userId, 'csv_import_completed', { rows: rowCount }),
  ]);
}

/**
 * Track PDF export
 */
export async function trackPDFExport(userId: number): Promise<void> {
  await Promise.all([
    trackFeature(userId, TRACKABLE_FEATURES.PDF_EXPORT),
    trackActivity(userId, 'pdf_exported'),
  ]);
}

/**
 * Track premium feature usage
 */
export async function trackPremiumFeature(
  userId: number,
  feature: 'advanced_deductions' | 'enterprise_reporting' | 'api_access'
): Promise<void> {
  const featureMap = {
    advanced_deductions: TRACKABLE_FEATURES.ADVANCED_DEDUCTIONS,
    enterprise_reporting: TRACKABLE_FEATURES.ENTERPRISE_REPORTING,
    api_access: TRACKABLE_FEATURES.API_ACCESS,
  };

  await trackFeature(userId, featureMap[feature]);
}

// ============================================================================
// UTILITY: Extract UTM parameters from URL or cookies
// ============================================================================

export function extractUTMParams(url?: string): {
  source?: string;
  medium?: string;
  campaign?: string;
} {
  if (!url) return {};

  try {
    const urlObj = new URL(url);
    return {
      source: urlObj.searchParams.get('utm_source') || undefined,
      medium: urlObj.searchParams.get('utm_medium') || undefined,
      campaign: urlObj.searchParams.get('utm_campaign') || undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Get UTM params from cookies (for attribution after signup)
 */
export function getUTMFromCookies(): {
  source?: string;
  medium?: string;
  campaign?: string;
} {
  if (typeof document === 'undefined') return {};

  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return {
    source: cookies.utm_source,
    medium: cookies.utm_medium,
    campaign: cookies.utm_campaign,
  };
}

/**
 * Store UTM params in cookies for later attribution
 */
export function storeUTMInCookies(params: {
  source?: string;
  medium?: string;
  campaign?: string;
}): void {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setDate(expires.getDate() + 30); // 30 day expiry

  if (params.source) {
    document.cookie = `utm_source=${params.source}; expires=${expires.toUTCString()}; path=/`;
  }
  if (params.medium) {
    document.cookie = `utm_medium=${params.medium}; expires=${expires.toUTCString()}; path=/`;
  }
  if (params.campaign) {
    document.cookie = `utm_campaign=${params.campaign}; expires=${expires.toUTCString()}; path=/`;
  }
}
