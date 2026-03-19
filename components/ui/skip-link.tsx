'use client';

/**
 * SkipLink - Allows keyboard users to skip directly to main content.
 * Visible only on focus (appears when user presses Tab on page load).
 * WCAG 2.1 AA - 2.4.1 Bypass Blocks
 */
export function SkipLink({ href = '#main-content' }: { href?: string }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-slate-950 focus:rounded-md focus:font-semibold focus:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950"
    >
      Skip to main content
    </a>
  );
}

/**
 * VisuallyHidden - Content hidden visually but accessible to screen readers.
 * Use for providing context that's conveyed visually but not textually.
 */
export function VisuallyHidden({ children, as: Tag = 'span' }: { children: React.ReactNode; as?: 'span' | 'div' | 'h2' | 'h3' | 'p' }) {
  return <Tag className="sr-only">{children}</Tag>;
}

/**
 * LiveRegion - Announces dynamic content changes to screen readers.
 * WCAG 2.1 AA - 4.1.3 Status Messages
 */
export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true,
}: {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive';
  atomic?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}
