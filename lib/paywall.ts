/**
 * Feature gating and paywall utilities
 * Controls access to premium features based on subscription tier
 */

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface UserProfile {
  id: number;
  email?: string;
  subscription_tier: SubscriptionTier;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: string;
}

/**
 * Feature limits by tier
 */
export const FEATURE_LIMITS = {
  free: {
    maxRSUEntries: 1,
    canExportPDF: false,
    canBulkUpload: false,
    canAccessAPI: false,
    hasPrioritySupport: false,
    canAccessCPADashboard: false,
  },
  pro: {
    maxRSUEntries: Infinity,
    canExportPDF: true,
    canBulkUpload: false,
    canAccessAPI: false,
    hasPrioritySupport: true,
    canAccessCPADashboard: false,
  },
  enterprise: {
    maxRSUEntries: Infinity,
    canExportPDF: true,
    canBulkUpload: true,
    canAccessAPI: true,
    hasPrioritySupport: true,
    canAccessCPADashboard: true,
  },
} as const;

/**
 * Check if user can add another RSU entry
 */
export function canAddRSU(user: UserProfile, currentCount: number): boolean {
  const limits = FEATURE_LIMITS[user.subscription_tier];
  return currentCount < limits.maxRSUEntries;
}

/**
 * Check if user can export PDFs
 */
export function canExportPDF(user: UserProfile): boolean {
  return FEATURE_LIMITS[user.subscription_tier].canExportPDF;
}

/**
 * Check if user can bulk upload RSUs
 */
export function canBulkUpload(user: UserProfile): boolean {
  return FEATURE_LIMITS[user.subscription_tier].canBulkUpload;
}

/**
 * Check if user can access API
 */
export function canAccessAPI(user: UserProfile): boolean {
  return FEATURE_LIMITS[user.subscription_tier].canAccessAPI;
}

/**
 * Check if user has priority support
 */
export function hasPrioritySupport(user: UserProfile): boolean {
  return FEATURE_LIMITS[user.subscription_tier].hasPrioritySupport;
}

/**
 * Check if user can access CPA dashboard
 */
export function canAccessCPADashboard(user: UserProfile): boolean {
  return FEATURE_LIMITS[user.subscription_tier].canAccessCPADashboard;
}

/**
 * Get remaining RSU entries available
 */
export function getRemainingRSUEntries(user: UserProfile, currentCount: number): number {
  const limit = FEATURE_LIMITS[user.subscription_tier].maxRSUEntries;
  if (limit === Infinity) return Infinity;
  return Math.max(0, limit - currentCount);
}

/**
 * Check if user should see upgrade prompt
 */
export function shouldShowUpgradePrompt(user: UserProfile, currentCount: number): boolean {
  return user.subscription_tier === 'free' && currentCount >= FEATURE_LIMITS.free.maxRSUEntries;
}
