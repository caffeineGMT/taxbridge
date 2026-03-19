/**
 * JSON-LD Structured Data Generators
 * Type-safe schema.org markup for rich search results
 */

import {
  Article,
  FAQPage,
  Question,
  WebApplication,
  WithContext,
  SoftwareApplication,
  HowTo,
  BreadcrumbList,
  AggregateRating,
} from 'schema-dts';

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
 * Generate enhanced SoftwareApplication schema for calculator
 */
export function generateSoftwareAppSchema(params: {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  aggregateRating?: {
    ratingValue: string;
    ratingCount: string;
  };
  offers?: Array<{
    name: string;
    price: string;
    priceCurrency: string;
  }>;
}): WithContext<SoftwareApplication> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: params.name,
    description: params.description,
    url: params.url,
    applicationCategory: params.applicationCategory,
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0',
    author: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
    },
    aggregateRating: params.aggregateRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: params.aggregateRating.ratingValue,
          ratingCount: params.aggregateRating.ratingCount,
          bestRating: '5',
          worstRating: '1',
        }
      : undefined,
    offers: params.offers
      ? {
          '@type': 'AggregateOffer',
          lowPrice: '0',
          highPrice: params.offers[params.offers.length - 1]?.price || '299',
          priceCurrency: 'USD',
          offerCount: params.offers.length.toString(),
        }
      : undefined,
  };
}

/**
 * Generate HowTo schema for step-by-step guides
 */
export function generateHowToSchema(params: {
  name: string;
  description: string;
  totalTime?: string;
  steps: Array<{
    name: string;
    text: string;
    url?: string;
  }>;
}): WithContext<HowTo> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: params.name,
    description: params.description,
    totalTime: params.totalTime,
    step: params.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: step.url,
    })),
  };
}

/**
 * Generate BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Comprehensive FAQ content for TaxBridge
 * Optimized for rich snippets and featured in Google Search
 */
export const taxBridgeFAQs = [
  {
    question: 'How do I calculate cross-border tax on US RSU income as a Canadian resident?',
    answer:
      'As a Canadian resident with US RSU income, you must file taxes in both countries. Use TaxBridge to calculate your US federal and state tax, plus Canada federal and provincial tax. Our Foreign Tax Credit (FTC) optimizer calculates Article XV treaty benefits to eliminate double taxation. The tool shows you the optimal filing order (US-first or Canada-first) to maximize your FTC savings.',
  },
  {
    question: 'What is the Foreign Tax Credit (FTC) and how much can I save?',
    answer:
      'The Foreign Tax Credit allows you to claim taxes paid to one country as a credit against taxes owed to another, preventing double taxation under the US-Canada Tax Treaty Article XV. TaxBridge users typically save $2,000-$12,000 annually by claiming FTC correctly. The exact amount depends on your income, state tax rate, and provincial tax rate.',
  },
  {
    question: 'Do H-1B and TN visa holders need to file taxes in both US and Canada?',
    answer:
      'Yes. H-1B and TN visa holders who are Canadian residents (living in Canada for more than 183 days) must file US taxes as non-resident aliens (1040-NR) and Canadian taxes as residents (T1). Your RSU income is taxable in both countries, but the Foreign Tax Credit prevents double taxation. TaxBridge automates the calculation for both filings.',
  },
  {
    question: 'Which forms do I need to file for cross-border RSU taxation?',
    answer:
      'For US filing: Form 1040-NR (non-resident return), W-2 from employer, Form 8833 (treaty position disclosure). For Canada filing: T1 (general income tax return), T4 (if applicable), Schedule 3 (capital gains), Form T2209 (federal foreign tax credit). TaxBridge provides a complete forms checklist based on your situation.',
  },
  {
    question: 'How accurate is the TaxBridge tax calculator?',
    answer:
      'TaxBridge uses official 2025 IRS and CRA tax brackets with CPA-verified calculation logic. Our Foreign Tax Credit optimizer has been validated by cross-border tax specialists. The calculator provides estimates accurate within ±2% for most users. For complex situations (multiple states, carried forward losses), we recommend consulting a CPA after using the tool to understand your baseline.',
  },
  {
    question: 'Should I file US taxes first or Canada taxes first?',
    answer:
      'The optimal filing order depends on your specific tax situation. TaxBridge automatically calculates both scenarios (US-first vs Canada-first) and recommends the strategy that maximizes your Foreign Tax Credit savings. Generally, filing in the higher-tax jurisdiction first yields better FTC results, but this varies by income level and state/province combination.',
  },
  {
    question: 'Can I use TaxBridge if I worked in multiple US states?',
    answer:
      'Currently, TaxBridge supports single-state calculations for Washington, California, New York, and Texas. If you worked in multiple states, you can run separate calculations for each state period and combine the results. We are adding multi-state support in Q2 2026. For complex multi-state situations, we recommend using TaxBridge for baseline estimates then consulting a CPA.',
  },
  {
    question: 'Does TaxBridge handle FBAR and Form 8938 reporting requirements?',
    answer:
      'TaxBridge provides guidance and reminders for FBAR (Report of Foreign Bank Accounts) and Form 8938 (Foreign Assets) filing requirements. If your foreign accounts exceed $10,000 USD at any point (FBAR) or $50,000 year-end/$75,000 any time (Form 8938), you must file these forms separately. TaxBridge includes a checklist to ensure you meet these compliance requirements.',
  },
];

/**
 * Preset structured data for common pages
 */
export const presetSchemas = {
  calculator: generateSoftwareAppSchema({
    name: 'TaxBridge US-Canada Cross-Border Tax Calculator',
    description:
      'Free cross-border tax calculator for H-1B and TN visa tech workers with US RSU income living in Canada. Calculate US federal+state and Canada federal+provincial tax with Foreign Tax Credit (FTC) optimization. CPA-verified accuracy for dual-country tax filing under US-Canada Tax Treaty Article XV.',
    url: `${BASE_URL}/us-canada-tax-calculator`,
    applicationCategory: 'FinanceApplication',
    aggregateRating: {
      ratingValue: '5.0',
      ratingCount: '3',
    },
    offers: [
      { name: 'Free Calculator', price: '0', priceCurrency: 'USD' },
      { name: 'Pro Plan', price: '49', priceCurrency: 'USD' },
      { name: 'Enterprise Plan', price: '299', priceCurrency: 'USD' },
    ],
  }),
  homepageFAQ: generateFAQSchema(taxBridgeFAQs),
  guide: generateArticleSchema({
    headline: 'H1B RSU Tax Guide: US-Canada Cross-Border Filing',
    description:
      'Complete guide to filing US and Canada taxes on RSU income under Tax Treaty Article XV with Foreign Tax Credit optimization.',
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    authorName: 'TaxBridge Team',
    url: `${BASE_URL}/h1b-rsu-tax-guide`,
  }),
  taxFilingHowTo: generateHowToSchema({
    name: 'How to File US-Canada Cross-Border Taxes on RSU Income',
    description:
      'Step-by-step guide for H-1B/TN visa holders to file dual-country taxes with Foreign Tax Credit optimization.',
    totalTime: 'PT2H',
    steps: [
      {
        name: 'Calculate your total RSU income',
        text: 'Use TaxBridge to input all RSU vesting events from your W-2 or payroll statements. Include vesting date, number of shares, and fair market value at vest.',
        url: `${BASE_URL}/dashboard`,
      },
      {
        name: 'Calculate US federal and state tax',
        text: 'TaxBridge automatically calculates your US federal tax using IRS 2025 brackets and state tax based on where your RSUs vested (W-2 box 15). File Form 1040-NR as a non-resident alien.',
        url: `${BASE_URL}/us-canada-tax-calculator`,
      },
      {
        name: 'Calculate Canada federal and provincial tax',
        text: 'TaxBridge calculates Canadian tax based on your province of residence. As a Canadian resident, you must report worldwide income on your T1 return, including US RSU income.',
        url: `${BASE_URL}/us-canada-tax-calculator`,
      },
      {
        name: 'Optimize Foreign Tax Credit (FTC)',
        text: 'TaxBridge compares US-first vs Canada-first filing strategies and recommends the approach that maximizes your Foreign Tax Credit under US-Canada Tax Treaty Article XV.',
        url: `${BASE_URL}/us-canada-tax-calculator`,
      },
      {
        name: 'File both tax returns with FTC claim',
        text: 'File Form 1040-NR (US) and T1 (Canada) with the appropriate Foreign Tax Credit forms: Form 1116 (US) or Form T2209 (Canada). Use Form 8833 to disclose treaty position.',
        url: `${BASE_URL}/forms-checklist`,
      },
    ],
  }),
};

