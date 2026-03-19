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
 */
export const presetMetadata = {
  calculator: generatePageMetadata({
    title: 'Free US-Canada Tax Calculator for H1B RSU Income',
    description:
      'Calculate your cross-border tax on RSU income. Instant US federal+state and Canada federal+provincial tax estimates. Foreign Tax Credit optimizer included. Free tool for H-1B/TN visa tech workers.',
    keywords: [
      'us canada tax calculator',
      'h1b rsu tax',
      'cross border tax',
      'foreign tax credit',
      'rsu tax calculator',
      'canada us tax treaty',
      'dual taxation',
      'tech worker taxes',
    ],
    canonicalUrl: '/us-canada-tax-calculator',
  }),
  guide: generatePageMetadata({
    title: 'H1B RSU Tax Guide: US-Canada Cross-Border Filing (2026)',
    description:
      'Complete guide to filing US and Canada taxes on RSU income. Learn Article XV, Foreign Tax Credit, required forms (W-2, 1040, T1, T4, FBAR, 8938), and common mistakes. Updated for 2026.',
    keywords: [
      'h1b rsu tax guide',
      'cross border tax filing',
      'article xv tax treaty',
      'foreign tax credit guide',
      'us canada tax forms',
      'rsu taxation canada',
      'dual country filing',
    ],
    canonicalUrl: '/h1b-rsu-tax-guide',
  }),
  checklist: generatePageMetadata({
    title: 'Canada Tax Filing Checklist for US Tech Workers (2026)',
    description:
      'Complete tax filing checklist for Canadians with US RSU income. Track deadlines, required forms (T1, T4, T2209, FBAR, 8938), CRA links, and filing steps. Never miss a deadline.',
    keywords: [
      'canada tax filing checklist',
      'us rsu canada',
      'tax deadline canada',
      'fbar filing',
      'form 8938',
      'cra tax forms',
      't2209 foreign tax credit',
    ],
    canonicalUrl: '/canada-tax-filing-checklist',
  }),
};
