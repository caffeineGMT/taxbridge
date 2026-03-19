import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross-Border Tax Software for Tech Workers | US-Canada RSU | TaxBridge',
  description:
    'Professional cross-border tax software for H1B/TN visa tech workers. Automate dual-country tax calculations, Foreign Tax Credit optimization, and compliance tracking. Free basic calculator. Pro plans from $49/year. Save $3,000+ vs hiring a CPA.',
  keywords: [
    'cross-border tax software',
    'us canada tax software',
    'international tax software',
    'dual country tax filing software',
    'rsu tax software',
    'foreign tax credit software',
    'expat tax software',
    'tech worker tax software',
    'h1b tax software',
    'tn visa tax software',
  ],
  alternates: {
    canonical: 'https://taxbridge.app/lp/cross-border-tax',
  },
  openGraph: {
    title: 'Cross-Border Tax Software - Automate US-Canada Tax Filing',
    description:
      'Professional software for cross-border tax calculations. Foreign Tax Credit optimization, compliance tracking. Free calculator + Pro plans.',
    url: 'https://taxbridge.app/lp/cross-border-tax',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cross-Border Tax Software - TaxBridge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cross-Border Tax Software - TaxBridge',
    description: 'Automate US-Canada tax filing. FTC optimization, compliance tracking. From $49/year.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CrossBorderTaxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
