import { presetMetadata } from '@/lib/seo/metadata';

export const metadata = presetMetadata.checklist;

export default function ChecklistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
