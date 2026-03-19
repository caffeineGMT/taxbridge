import type { Metadata } from 'next';
import { presetMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = presetMetadata.pricing;

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
