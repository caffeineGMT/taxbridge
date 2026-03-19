/**
 * SEO Metadata Helpers
 * Generates optimized metadata for Next.js pages with OpenGraph and Twitter cards
 */

import { Metadata } from 'next';

interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

/**
 * Base URL for the application
 */
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://taxbridge.app';

/**
 * Default OpenGraph image
 */
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * Generate comprehensive metadata for a page
 */
export function generatePageMetadata({
  title,
  description,
  keywords = [],
  ogImage = DEFAULT_OG_IMAGE,
  canonicalUrl,
}: PageMetadata): Metadata {
  const fullTitle = `${title} | TaxBridge`;
  const url = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : BASE_URL;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'TaxBridge',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Predefined metadata for common pages
 * Optimized for Google rich snippets and high CTR
 * - Title: 50-60 characters (primary keyword at start)
 * - Description: 150-160 characters (includes CTA, benefits, specific numbers)
 */
export const presetMetadata = {
  calculator: generatePageMetadata({
    title: 'Free US-Canada RSU Tax Calculator | H-1B/TN Visa Workers',
    description:
      'Calculate your US-Canada cross-border tax on RSU income in 10 minutes. Free Foreign Tax Credit optimizer for H-1B/TN visa tech workers. Saves $2K-$12K annually. CPA-verified.',
    keywords: [
      'us canada tax calculator',
      'h1b rsu tax calculator',
      'tn visa tax calculator',
      'cross border tax calculator free',
      'foreign tax credit calculator',
      'rsu tax calculator',
      'canada us tax treaty calculator',
      'dual taxation calculator',
      'tech worker taxes',
      'stock compensation tax calculator',
      'equity tax calculator',
      'Form 1116 calculator',
    ],
    canonicalUrl: '/us-canada-tax-calculator',
  }),
  guide: generatePageMetadata({
    title: 'H-1B RSU Tax Guide: US-Canada Cross-Border Filing 2025',
    description:
      'Complete 2025 guide: File US-Canada taxes on RSU income. Learn Form 1040-NR, T1, Foreign Tax Credit optimization, Tax Treaty Article XV. For H-1B/TN visa holders. Save $2K-$12K.',
    keywords: [
      'h1b rsu tax guide 2025',
      'cross border tax filing guide',
      'article xv tax treaty',
      'foreign tax credit guide',
      'us canada tax forms',
      'rsu taxation canada',
      'dual country filing',
      'form 1040-NR guide',
      'canada t1 filing guide',
      'h1b tax filing',
      'tn visa tax filing',
    ],
    canonicalUrl: '/h1b-rsu-tax-guide',
  }),
  checklist: generatePageMetadata({
    title: 'Cross-Border Tax Forms Checklist | H-1B/TN Filing Guide',
    description:
      'Complete tax forms checklist for H-1B/TN visa holders filing US-Canada taxes. Includes Form 1040-NR, T1, Form 8833, FBAR, Form 8938. Step-by-step instructions. Never miss a deadline.',
    keywords: [
      'canada tax filing checklist',
      'h1b tax forms checklist',
      'tn visa tax forms',
      'us rsu canada forms',
      'tax deadline canada',
      'fbar filing requirements',
      'form 8938 instructions',
      'cra tax forms',
      't2209 foreign tax credit',
      'form 8833 treaty disclosure',
      'form 1040-NR instructions',
    ],
    canonicalUrl: '/canada-tax-filing-checklist',
  }),
  dashboard: generatePageMetadata({
    title: 'Tax Dashboard - Track RSU Income & Estimates | TaxBridge',
    description:
      'Your personalized cross-border tax dashboard. Track RSU vesting events, calculate real-time tax estimates, monitor Foreign Tax Credit savings. For H-1B/TN visa tech workers.',
    keywords: [
      'tax dashboard',
      'rsu tracking dashboard',
      'tax planning dashboard',
      'cross-border tax tracker',
      'rsu income tracker',
      'tax estimate calculator',
      'foreign tax credit tracker',
    ],
    canonicalUrl: '/dashboard',
  }),
  pricing: generatePageMetadata({
    title: 'Pricing - Free Calculator & Pro Plans | TaxBridge',
    description:
      'Free cross-border tax calculator for all. Pro plans start at $49/year: multi-year tracking, PDF exports, CPA-reviewed guidance. Save $3,000+ in CPA fees vs. hiring an accountant.',
    keywords: [
      'tax calculator pricing',
      'cross-border tax software cost',
      'tax preparation pricing',
      'cpa alternative',
      'tax filing software pricing',
      'affordable tax software',
    ],
    canonicalUrl: '/pricing',
  }),
  formsChecklist: generatePageMetadata({
    title: 'Tax Forms Checklist for Cross-Border Filing | TaxBridge',
    description:
      'Complete checklist: Form 1040-NR, T1, Form 8833, FBAR, Form 8938 for H-1B/TN visa holders. Deadlines, instructions, CRA links. Never miss a required form for dual-country filing.',
    keywords: [
      'tax forms checklist',
      'h1b tax forms',
      'tn visa tax forms',
      'cross-border tax forms',
      'form 1040-NR checklist',
      'canada t1 checklist',
      'fbar checklist',
      'form 8938 checklist',
    ],
    canonicalUrl: '/forms-checklist',
  }),
  multiYear: generatePageMetadata({
    title: 'Multi-Year Tax Planning for Cross-Border Workers | TaxBridge',
    description:
      'Track RSU income and tax estimates across multiple years. Visualize tax trends, plan for vesting schedules, optimize Foreign Tax Credits year-over-year. For H-1B/TN visa workers.',
    keywords: [
      'multi-year tax planning',
      'rsu vesting schedule tax',
      'cross-border tax planning',
      'long-term tax planning',
      'rsu tax projection',
    ],
    canonicalUrl: '/dashboard/multi-year',
  }),
};
