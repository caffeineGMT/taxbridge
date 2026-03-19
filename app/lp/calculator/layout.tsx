import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Cross-Border Tax Calculator | US-Canada RSU Tax | TaxBridge',
  description:
    'Free US-Canada cross-border tax calculator for tech workers with RSUs. Calculate federal, state, and provincial taxes in 10 minutes. Foreign Tax Credit optimizer included. CPA-verified accuracy. Save $2K-$12K annually.',
  keywords: [
    'cross-border tax calculator',
    'us canada tax calculator',
    'rsu tax calculator',
    'dual country tax calculator',
    'foreign tax credit calculator',
    'international tax calculator',
    'expat tax calculator',
    'stock compensation tax calculator',
    'equity tax calculator',
  ],
  alternates: {
    canonical: 'https://taxbridgecpa.com/lp/calculator',
  },
  openGraph: {
    title: 'Free Cross-Border Tax Calculator - US & Canada RSU Taxes',
    description:
      'Calculate your US-Canada cross-border tax on RSU income in 10 minutes. Free Foreign Tax Credit optimizer. CPA-verified accuracy.',
    url: 'https://taxbridgecpa.com/lp/calculator',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cross-Border Tax Calculator - TaxBridge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Cross-Border Tax Calculator - TaxBridge',
    description: 'Calculate US-Canada cross-border taxes on RSU income. Free tool with FTC optimizer.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
