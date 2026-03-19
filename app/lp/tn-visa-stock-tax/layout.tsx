import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TN Visa Stock Tax Calculator | US-Canada RSU Tax | TaxBridge',
  description:
    'Free TN visa stock and RSU tax calculator for Canadian tech workers in the US. Calculate cross-border taxes on equity compensation. Automatic Foreign Tax Credit optimization under US-Canada tax treaty. Save $2K-$12K annually. 2-minute calculation.',
  keywords: [
    'tn visa stock tax',
    'tn visa rsu tax calculator',
    'tn visa equity tax',
    'tn visa stock options tax',
    'canada us stock tax',
    'tn visa tax calculator',
    'canadian working in us stock tax',
    'cross-border stock tax',
    'rsu tax tn visa',
    'foreign tax credit tn visa',
  ],
  alternates: {
    canonical: 'https://taxbridge.app/lp/tn-visa-stock-tax',
  },
  openGraph: {
    title: 'TN Visa Stock Tax Calculator - Free Cross-Border RSU Tax Tool',
    description:
      'Calculate US-Canada cross-border taxes on stock and RSU compensation for TN visa holders. Free Foreign Tax Credit optimizer. CPA-verified accuracy.',
    url: 'https://taxbridge.app/lp/tn-visa-stock-tax',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TN Visa Stock Tax Calculator - TaxBridge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TN Visa Stock Tax Calculator - TaxBridge',
    description:
      'Calculate cross-border taxes on stock/RSU compensation for TN visa holders. Free FTC optimizer.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TNVisaStockTaxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
