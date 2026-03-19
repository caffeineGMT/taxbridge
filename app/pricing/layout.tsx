import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Cross-Border Tax Plans for H-1B/TN Workers',
  description: 'Simple, transparent pricing for TaxBridge. Free tier available. Pro plan with unlimited RSU entries, FTC optimizer, PDF export, and AI tax advisor. Enterprise plans for CPAs.',
  alternates: {
    canonical: 'https://taxbridge.app/pricing',
  },
  openGraph: {
    title: 'TaxBridge Pricing - Plans for Every Cross-Border Tax Need',
    description: 'From free to enterprise. Calculate dual-country taxes on RSU income with Foreign Tax Credit optimization. 7-day free trial, no credit card required.',
    url: 'https://taxbridge.app/pricing',
    type: 'website',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
