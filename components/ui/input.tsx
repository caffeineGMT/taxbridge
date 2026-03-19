import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onWheel, onKeyDown, ...props }, ref) => {
    // Automatically set inputMode based on type for better mobile keyboard support
    const getInputMode = (): React.HTMLAttributes<HTMLInputElement>['inputMode'] => {
      if (props.inputMode) return props.inputMode;

      switch (type) {
        case 'number':
          return 'decimal';
        case 'tel':
          return 'tel';
        case 'email':
          return 'email';
        case 'url':
          return 'url';
        case 'search':
          return 'search';
        default:
          return 'text';
      }
    };

    // Prevent scroll wheel from changing number input values (all browsers)
    const handleWheel = React.useCallback(
      (e: React.WheelEvent<HTMLInputElement>) => {
        if (type === 'number') {
          (e.target as HTMLInputElement).blur();
        }
        onWheel?.(e);
      },
      [type, onWheel]
    );

    // Prevent arrow keys from changing number input values when not intended
    // Firefox allows arrow keys to increment/decrement number inputs
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (type === 'number' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
          e.preventDefault();
        }
        onKeyDown?.(e);
      },
      [type, onKeyDown]
    );

    return (
      <input
        type={type}
        inputMode={getInputMode()}
        className={cn(
          'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]',
          // Better font size for mobile - prevents zoom on iOS Safari
          'md:text-sm',
          className
        )}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
