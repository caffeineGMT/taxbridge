import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TaxBridge - Free Cross-Border RSU Tax Calculator | Link in Bio',
  description: 'Save $12K on US-Canada cross-border taxes. Free RSU tax calculator for H-1B & TN visa tech workers. 10 minutes vs 3-hour manual process.',
  openGraph: {
    title: 'TaxBridge - Free Cross-Border RSU Tax Calculator',
    description: 'Save $12K on US-Canada cross-border taxes. Free RSU tax calculator for H-1B & TN visa workers.',
    type: 'website',
    url: 'https://taxbridgecpa.com/lp/social',
    images: [
      {
        url: '/og-social.png',
        width: 1200,
        height: 630,
        alt: 'TaxBridge - Cross-Border Tax Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaxBridge - Free Cross-Border RSU Tax Calculator',
    description: 'Save $12K on US-Canada cross-border taxes.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
