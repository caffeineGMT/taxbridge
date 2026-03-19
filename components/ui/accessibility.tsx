'use client';

import * as React from 'react';

/**
 * VisuallyHidden - Content hidden visually but accessible to screen readers.
 * Use for providing context that's conveyed visually but not textually.
 *
 * @example
 * <VisuallyHidden>Current page:</VisuallyHidden>
 * <span>Dashboard</span>
 */
export function VisuallyHidden({
  children,
  as: Tag = 'span',
}: {
  children: React.ReactNode;
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p';
}) {
  return <Tag className="sr-only">{children}</Tag>;
}

/**
 * LiveRegion - Announces dynamic content changes to screen readers.
 * WCAG 2.1 AA - 4.1.3 Status Messages
 *
 * @example
 * <LiveRegion politeness="assertive">
 *   Error: Please check your email address
 * </LiveRegion>
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

/**
 * FocusTrap - Traps keyboard focus within a component (useful for modals).
 *
 * @example
 * <FocusTrap active={isModalOpen}>
 *   <dialog>...</dialog>
 * </FocusTrap>
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>, active: boolean) {
  React.useEffect(() => {
    if (!active || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);

    // Focus first element when trap activates
    firstElement.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [ref, active]);
}

/**
 * ErrorMessage - Accessible error message component
 * Automatically announces errors to screen readers
 *
 * @example
 * <ErrorMessage id="email-error">
 *   Please enter a valid email address
 * </ErrorMessage>
 */
export function ErrorMessage({
  id,
  children,
  className = '',
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      id={id}
      role="alert"
      aria-live="assertive"
      className={`text-sm text-error ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * LoadingButton - Button with accessible loading state
 *
 * @example
 * <LoadingButton isLoading={submitting} loadingText="Saving...">
 *   Save Changes
 * </LoadingButton>
 */
export function LoadingButton({
  isLoading,
  loadingText,
  children,
  className = '',
  ...props
}: {
  isLoading: boolean;
  loadingText: string;
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={isLoading}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * IconButton - Button with icon that has proper accessibility
 *
 * @example
 * <IconButton label="Close modal" icon={<X />} onClick={onClose} />
 */
export function IconButton({
  label,
  icon,
  className = '',
  ...props
}: {
  label: string;
  icon: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={label}
      className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] ${className}`}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

/**
 * Announce - Utility to programmatically announce content to screen readers
 *
 * @example
 * const announce = useAnnounce();
 * announce('Form submitted successfully', 'polite');
 */
export function useAnnounce() {
  const [announcement, setAnnouncement] = React.useState<{
    message: string;
    politeness: 'polite' | 'assertive';
  } | null>(null);

  const announce = React.useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement({ message, politeness });
    // Clear after announcement is made
    setTimeout(() => setAnnouncement(null), 100);
  }, []);

  const AnnouncerComponent = announcement ? (
    <LiveRegion politeness={announcement.politeness}>
      {announcement.message}
    </LiveRegion>
  ) : null;

  return { announce, Announcer: AnnouncerComponent };
}
