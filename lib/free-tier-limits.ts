/**
 * Free Tier Limit Enforcement
 *
 * Dynamically enforces RSU entry limits based on user's A/B test variant.
 * Part of the Free Tier Optimization Experiment testing:
 * - Variant A: 5 entries max
 * - Variant B: 10 entries max (current baseline)
 * - Variant C: Unlimited entries with feature gating
 */

export type FreeTierVariant = 'limited_5' | 'limited_10' | 'unlimited_gated';

export interface FreeTierLimitConfig {
  variant: FreeTierVariant;
  maxRSUEntries: number | 'unlimited';
  gatedFeatures: {
    pdfExport: boolean;
    aiAdvisor: boolean;
    csvImport: boolean;
    multiYear: boolean;
    prioritySupport: boolean;
  };
}

const FREE_TIER_LIMITS: Record<FreeTierVariant, FreeTierLimitConfig> = {
  limited_5: {
    variant: 'limited_5',
    maxRSUEntries: 5,
    gatedFeatures: {
      pdfExport: false,
      aiAdvisor: false,
      csvImport: false,
      multiYear: false,
      prioritySupport: false,
    },
  },
  limited_10: {
    variant: 'limited_10',
    maxRSUEntries: 10,
    gatedFeatures: {
      pdfExport: false,
      aiAdvisor: false,
      csvImport: false,
      multiYear: false,
      prioritySupport: false,
    },
  },
  unlimited_gated: {
    variant: 'unlimited_gated',
    maxRSUEntries: 'unlimited',
    gatedFeatures: {
      pdfExport: false, // Premium feature - upgrade required
      aiAdvisor: false, // Premium feature - upgrade required
      csvImport: false, // Premium feature - upgrade required
      multiYear: false, // Premium feature - upgrade required
      prioritySupport: false, // Premium feature - upgrade required
    },
  },
};

/**
 * Get free tier limit configuration for a user
 * Checks request headers for variant assignment from client-side A/B test
 */
export function getFreeTierLimit(variantHeader?: string | null): FreeTierLimitConfig {
  // Default to limited_10 (current production baseline) if no variant specified
  const variant = (variantHeader as FreeTierVariant) || 'limited_10';

  // Validate variant exists
  if (!FREE_TIER_LIMITS[variant]) {
    console.warn(`Invalid free tier variant: ${variant}, falling back to limited_10`);
    return FREE_TIER_LIMITS.limited_10;
  }

  return FREE_TIER_LIMITS[variant];
}

/**
 * Check if user has exceeded their free tier limit
 */
export function hasExceededLimit(
  currentEntryCount: number,
  limitConfig: FreeTierLimitConfig
): boolean {
  if (limitConfig.maxRSUEntries === 'unlimited') {
    return false;
  }

  return currentEntryCount >= limitConfig.maxRSUEntries;
}

/**
 * Check if a specific feature is gated for the user's variant
 */
export function isFeatureGated(
  feature: keyof FreeTierLimitConfig['gatedFeatures'],
  limitConfig: FreeTierLimitConfig
): boolean {
  return !limitConfig.gatedFeatures[feature];
}

/**
 * Get upgrade prompt message based on variant
 */
export function getUpgradeMessage(limitConfig: FreeTierLimitConfig): string {
  switch (limitConfig.variant) {
    case 'limited_5':
      return `You've reached your limit of ${limitConfig.maxRSUEntries} RSU entries. Upgrade to Pro for unlimited entries, PDF exports, and AI-powered tax insights.`;
    case 'limited_10':
      return `You've reached your limit of ${limitConfig.maxRSUEntries} RSU entries. Upgrade to Pro for unlimited entries plus premium features.`;
    case 'unlimited_gated':
      return `Upgrade to Pro to unlock PDF exports, AI tax advisor, CSV imports, and multi-year forecasting.`;
    default:
      return 'Upgrade to Pro for unlimited RSU entries and premium features.';
  }
}
