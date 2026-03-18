/**
 * JSON-LD Structured Data Generators
 * Type-safe schema.org markup for rich search results
 */

import { Article, FAQPage, Question, WebApplication, WithContext } from 'schema-dts';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://taxbridge.app';
const ORGANIZATION_NAME = 'TaxBridge';

/**
 * Generate Article structured data
 */
export function generateArticleSchema(params: {
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  imageUrl?: string;
  url: string;
}): WithContext<Article> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.headline,
    description: params.description,
    image: params.imageUrl || `${BASE_URL}/og-image.png`,
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    author: {
      '@type': 'Person',
      name: params.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': params.url,
    },
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(
      (faq): Question => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })
    ),
  };
}

/**
 * Generate WebApplication structured data
 */
export function generateWebAppSchema(params: {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}): WithContext<WebApplication> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: params.name,
    description: params.description,
    url: params.url,
    applicationCategory: params.applicationCategory,
    operatingSystem: params.operatingSystem || 'Any',
    offers: params.offers
      ? {
          '@type': 'Offer',
          price: params.offers.price,
          priceCurrency: params.offers.priceCurrency,
        }
      : undefined,
  };
}

/**
 * Preset structured data for common pages
 */
export const presetSchemas = {
  calculator: generateWebAppSchema({
    name: 'TaxBridge US-Canada Tax Calculator',
    description:
      'Free cross-border tax calculator for H-1B/TN visa tech workers with US RSU income living in Canada. Calculate US federal+state and Canada federal+provincial tax with Foreign Tax Credit optimization.',
    url: `${BASE_URL}/us-canada-tax-calculator`,
    applicationCategory: 'FinanceApplication',
    offers: {
      price: '0',
      priceCurrency: 'USD',
    },
  }),
  guide: generateArticleSchema({
    headline: 'H1B RSU Tax Guide: US-Canada Cross-Border Filing',
    description:
      'Complete guide to filing US and Canada taxes on RSU income under Tax Treaty Article XV with Foreign Tax Credit optimization.',
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    authorName: 'TaxBridge Team',
    url: `${BASE_URL}/h1b-rsu-tax-guide`,
  }),
};
