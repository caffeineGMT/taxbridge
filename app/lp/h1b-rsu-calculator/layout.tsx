import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'H1B RSU Tax Calculator - Free Cross-Border Tax Calculation | TaxBridge',
  description:
    'Free H1B RSU tax calculator for tech workers at Meta, Amazon, Google. Calculate US-Canada cross-border taxes in 2 minutes. Avoid double taxation with automated Foreign Tax Credit optimization. Save $2K-$12K annually.',
  keywords: [
    'h1b rsu tax calculator',
    'h1b stock tax calculator',
    'rsu tax calculator free',
    'h1b equity tax',
    'meta rsu tax',
    'amazon rsu tax calculator',
    'google rsu tax calculator',
    'h1b tax calculator 2025',
    'foreign tax credit calculator',
    'cross-border rsu tax',
  ],
  alternates: {
    canonical: 'https://taxbridge.app/lp/h1b-rsu-calculator',
  },
  openGraph: {
    title: 'H1B RSU Tax Calculator - Calculate Your Exact Tax in 2 Minutes',
    description:
      'Avoid double taxation on your Meta, Amazon, or Google RSUs. Free calculator with automatic Foreign Tax Credit. 2,000+ H1B workers helped, $1M+ in tax savings identified.',
    url: 'https://taxbridge.app/lp/h1b-rsu-calculator',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'H1B RSU Tax Calculator - TaxBridge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'H1B RSU Tax Calculator - Free Cross-Border Tax Tool',
    description:
      'Calculate US-Canada cross-border taxes on RSU income. Free tool for H1B workers. Saves $2K-$12K annually.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function H1BCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
