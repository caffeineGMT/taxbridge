import { presetMetadata } from '@/lib/seo/metadata';

export const metadata = presetMetadata.guide;

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
