import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross-Border Tax Guide 2025 | H1B & TN Visa RSU Taxation | TaxBridge',
  description:
    'Complete 2025 guide to US-Canada cross-border tax filing for H1B and TN visa holders. Learn Foreign Tax Credit optimization, tax treaty benefits, required forms, and filing deadlines. Free calculator included. Save $2K-$12K annually.',
  keywords: [
    'cross-border tax guide 2025',
    'h1b tax guide',
    'tn visa tax guide',
    'us canada tax treaty',
    'foreign tax credit guide',
    'rsu taxation guide',
    'dual country tax filing guide',
    'form 1040-NR guide',
    'canada t1 guide',
    'tax treaty article xv',
  ],
  alternates: {
    canonical: 'https://taxbridgecpa.com/lp/guide',
  },
  openGraph: {
    title: 'Cross-Border Tax Guide 2025 - Complete H1B/TN Visa Filing Guide',
    description:
      'Master US-Canada cross-border tax filing. Learn Foreign Tax Credit optimization, tax treaty benefits, and required forms. Free calculator included.',
    url: 'https://taxbridgecpa.com/lp/guide',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cross-Border Tax Guide 2025 - TaxBridge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cross-Border Tax Guide 2025 - H1B/TN Visa Filing',
    description:
      'Complete guide to US-Canada tax filing. Foreign Tax Credit optimization, treaty benefits, forms.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
