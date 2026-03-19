import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10 min-h-[44px]',
            // Better font size for mobile - prevents zoom on iOS Safari
            'md:text-sm',
            className
          )}
          style={{
            // Cross-browser appearance reset (CSS class handled globally, this is defense-in-depth)
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            // Fix Firefox option text color in dark mode
            colorScheme: 'dark',
          }}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
