import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tax Software for Cross-Border Workers | US-Canada RSU | TaxBridge',
  description:
    'Modern tax software built for cross-border workers with RSU income. Automate dual-country tax calculations, track multi-year vesting schedules, optimize Foreign Tax Credits. Free calculator + Pro plans from $49/year. Used by 2,000+ tech workers at Meta, Amazon, Google.',
  keywords: [
    'tax software cross-border',
    'us canada tax software',
    'rsu tax software',
    'tech worker tax software',
    'equity compensation tax software',
    'foreign tax credit software',
    'dual country tax software',
    'international tax planning software',
    'expat tax software',
  ],
  alternates: {
    canonical: 'https://taxbridge.app/lp/software',
  },
  openGraph: {
    title: 'Tax Software for Cross-Border Workers - Automate US-Canada Taxes',
    description:
      'Modern software for cross-border tax calculations. Multi-year tracking, FTC optimization, compliance tools. Free + Pro plans.',
    url: 'https://taxbridge.app/lp/software',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tax Software for Cross-Border Workers - TaxBridge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tax Software for Cross-Border Workers - TaxBridge',
    description: 'Automate US-Canada tax calculations. Multi-year tracking, FTC optimization. From $49/year.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SoftwareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
