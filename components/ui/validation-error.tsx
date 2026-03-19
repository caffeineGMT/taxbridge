import { AlertCircle } from 'lucide-react';

interface ValidationErrorProps {
  message?: string;
  show?: boolean;
  className?: string;
}

/**
 * Inline validation error message component
 * Shows error message with icon when validation fails
 */
export function ValidationError({ message, show = false, className = '' }: ValidationErrorProps) {
  if (!show || !message) {
    return null;
  }

  return (
    <div
      className={`flex items-start gap-2 mt-1 text-sm text-red-600 dark:text-red-400 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

interface ValidationFieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  showError?: boolean;
  required?: boolean;
  tooltip?: string;
  children: React.ReactNode;
}

/**
 * Wrapper component for form fields with validation
 * Handles label, error display, and accessibility
 */
export function ValidationFieldWrapper({
  label,
  htmlFor,
  error,
  showError = false,
  required = false,
  tooltip,
  children,
}: ValidationFieldWrapperProps) {
  const hasError = showError && error;

  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-text mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        {tooltip && (
          <span className="ml-2 text-xs font-normal text-textMuted">
            {tooltip}
          </span>
        )}
      </label>
      {children}
      <ValidationError message={error} show={hasError} />
    </div>
  );
}
