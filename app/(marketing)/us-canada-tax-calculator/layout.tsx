import { presetMetadata } from '@/lib/seo/metadata';

export const metadata = presetMetadata.calculator;

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
