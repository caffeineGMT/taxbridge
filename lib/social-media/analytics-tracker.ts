// Social media analytics tracking for Instagram/TikTok campaigns
// Tracks bio link clicks, UTM parameters, and conversion funnel

export interface SocialMediaMetrics {
  platform: 'instagram' | 'tiktok';
  date: string;
  followers: number;
  followersGained: number;
  profileVisits: number;
  bioLinkClicks: number;
  impressions: number;
  reach: number;
  engagementRate: number;
  saves: number;
  shares: number;
  comments: number;
}

export interface VideoMetrics {
  scriptId: string;
  platform: 'instagram' | 'tiktok';
  postDate: string;
  postUrl: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  averageWatchTime: number; // seconds
  completionRate: number; // percentage
  bioLinkClicks: number;
  signups: number; // from UTM tracking
  engagementRate: number;
}

export interface ConversionFunnel {
  period: string;
  bioLinkClicks: number;
  landingPageViews: number;
  calculatorStarts: number;
  calculatorCompletes: number;
  signups: number;
  paidConversions: number;
  revenue: number;
}

export interface GrowthTargets {
  month: number;
  targetFollowers: number;
  targetBioClickRate: number; // percentage
  targetSignupConversion: number; // percentage
  actualFollowers?: number;
  actualBioClickRate?: number;
  actualSignupConversion?: number;
}

// Growth targets: 5,000 followers by month 6, 10% bio CTR, 2% signup conversion
export const GROWTH_TARGETS: GrowthTargets[] = [
  { month: 1, targetFollowers: 500, targetBioClickRate: 5, targetSignupConversion: 1 },
  { month: 2, targetFollowers: 1200, targetBioClickRate: 6, targetSignupConversion: 1.2 },
  { month: 3, targetFollowers: 2000, targetBioClickRate: 7, targetSignupConversion: 1.5 },
  { month: 4, targetFollowers: 3000, targetBioClickRate: 8, targetSignupConversion: 1.7 },
  { month: 5, targetFollowers: 4000, targetBioClickRate: 9, targetSignupConversion: 1.8 },
  { month: 6, targetFollowers: 5000, targetBioClickRate: 10, targetSignupConversion: 2 },
  { month: 7, targetFollowers: 6500, targetBioClickRate: 10, targetSignupConversion: 2.2 },
  { month: 8, targetFollowers: 8000, targetBioClickRate: 11, targetSignupConversion: 2.3 },
  { month: 9, targetFollowers: 10000, targetBioClickRate: 11, targetSignupConversion: 2.5 },
  { month: 10, targetFollowers: 13000, targetBioClickRate: 12, targetSignupConversion: 2.5 },
  { month: 11, targetFollowers: 16000, targetBioClickRate: 12, targetSignupConversion: 2.8 },
  { month: 12, targetFollowers: 20000, targetBioClickRate: 12, targetSignupConversion: 3 },
];

// UTM parameter configuration
export const UTM_CONFIG = {
  instagram: {
    source: 'instagram',
    medium: 'social',
    campaigns: {
      bio_link: 'ig_bio_link',
      story_swipeup: 'ig_story_swipeup',
      reel_cta: 'ig_reel_cta',
      collab: 'ig_influencer_collab',
      ad: 'ig_paid_ad',
    },
  },
  tiktok: {
    source: 'tiktok',
    medium: 'social',
    campaigns: {
      bio_link: 'tt_bio_link',
      video_cta: 'tt_video_cta',
      collab: 'tt_influencer_collab',
      ad: 'tt_paid_ad',
    },
  },
};

export function buildUTMLink(
  baseUrl: string,
  platform: 'instagram' | 'tiktok',
  campaign: string,
  content?: string
): string {
  const config = UTM_CONFIG[platform];
  const params = new URLSearchParams({
    utm_source: config.source,
    utm_medium: config.medium,
    utm_campaign: campaign,
  });

  if (content) {
    params.set('utm_content', content);
  }

  return `${baseUrl}?${params.toString()}`;
}

export function calculateEngagementRate(metrics: {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followers: number;
}): number {
  const totalEngagement = metrics.likes + metrics.comments + metrics.shares + metrics.saves;
  return metrics.followers > 0 ? (totalEngagement / metrics.followers) * 100 : 0;
}

export function calculateBioClickRate(profileVisits: number, bioClicks: number): number {
  return profileVisits > 0 ? (bioClicks / profileVisits) * 100 : 0;
}

export function calculateConversionRate(clicks: number, signups: number): number {
  return clicks > 0 ? (signups / clicks) * 100 : 0;
}

export function getGrowthStatus(month: number, actualFollowers: number): 'on-track' | 'behind' | 'ahead' {
  const target = GROWTH_TARGETS.find(t => t.month === month);
  if (!target) return 'on-track';

  const ratio = actualFollowers / target.targetFollowers;
  if (ratio >= 1.1) return 'ahead';
  if (ratio >= 0.8) return 'on-track';
  return 'behind';
}

// Bio link configuration
export const BIO_LINKS = {
  instagram: {
    displayText: 'Free RSU Tax Calculator - Save $12K',
    url: buildUTMLink('https://taxbridge.app/rsu', 'instagram', 'ig_bio_link'),
    shortUrl: 'taxbridge.app/ig',
  },
  tiktok: {
    displayText: 'Free Cross-Border Tax Calculator',
    url: buildUTMLink('https://taxbridge.app/rsu', 'tiktok', 'tt_bio_link'),
    shortUrl: 'taxbridge.app/tt',
  },
};

// Account profile configuration
export const SOCIAL_PROFILES = {
  instagram: {
    handle: '@taxbridge.app',
    displayName: 'TaxBridge | Cross-Border Tax Calculator',
    bio: [
      'Save $12K on US-Canada cross-border taxes',
      'RSU tax calculator for H-1B & TN workers',
      'Free tool - 10 min vs 3hr manual process',
      'Free RSU calculator below',
    ].join('\n'),
    category: 'Finance',
    profilePicture: 'TaxBridge logo with US-Canada flag blend',
  },
  tiktok: {
    handle: '@taxbridge.app',
    displayName: 'TaxBridge - Cross Border Tax',
    bio: [
      'US-Canada tax tips for tech workers',
      'H-1B | TN | RSU | Immigration tax',
      'Free calculator saves you $12K',
    ].join('\n'),
    category: 'Education',
    profilePicture: 'TaxBridge logo',
  },
};
