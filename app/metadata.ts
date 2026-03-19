import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers',
  description:
    'Free cross-border tax calculator built for H-1B and TN visa tech workers with US RSUs living in Canada. Calculate dual-country taxes, optimize Foreign Tax Credits, and get a complete filing checklist. Save $2,000-$12,000 annually on taxes.',
  alternates: {
    canonical: 'https://taxbridge.app',
  },
  openGraph: {
    title: 'TaxBridge - Cross-Border Tax Calculator for H-1B/TN Workers',
    description:
      'Calculate your US-Canada cross-border tax on RSU income. Built for H-1B and TN visa tech workers at Meta, Amazon, Google, Microsoft. Free Foreign Tax Credit optimizer saves $2K-$12K annually.',
    url: 'https://taxbridge.app',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TaxBridge - US-Canada Cross-Border Tax Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers',
    description:
      'Free tax calculator for H-1B/TN visa tech workers. Calculate dual-country taxes, optimize Foreign Tax Credits. Save $2K-$12K annually.',
    images: ['/og-image.png'],
  },
  keywords: [
    'cross-border tax calculator',
    'H-1B RSU tax calculator',
    'TN visa tax calculator',
    'US Canada tax calculator',
    'foreign tax credit calculator',
    'RSU taxation Canada',
    'dual country tax filing',
    'H1B tax guide',
    'TN visa tax guide',
    'Canada US tax treaty',
    'Form 1040-NR',
    'Canadian T1 filing',
    'cross-border tax software',
  ],
};
