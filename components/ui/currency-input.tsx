"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  sanitizeCurrencyInput,
  parseCurrencyInput,
  sanitizeIntegerInput,
  parseIntegerInput,
  validateNumericValue,
  type SanitizeOptions,
} from "@/lib/input-validation";

export interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange"
  > {
  /** Current value (controlled component) */
  value: number;
  /** Change handler - receives the numeric value */
  onChange: (value: number) => void;
  /** Input type: currency (decimal) or integer (whole numbers) */
  inputType?: "currency" | "integer";
  /** Sanitization options */
  sanitizeOptions?: SanitizeOptions;
  /** Show validation error inline */
  showError?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** Currency prefix symbol (default: "$") */
  currencySymbol?: string;
  /** Show currency symbol in input */
  showSymbol?: boolean;
}

/**
 * CurrencyInput Component
 *
 * A robust numeric input with automatic sanitization for currency/numeric values.
 * Handles edge cases:
 * - Empty inputs
 * - Non-numeric values
 * - Copy-paste with dollar signs/commas
 * - Negative numbers (configurable)
 * - Values > $10M (configurable max)
 * - Scientific notation (blocked)
 * - Multiple decimal points
 *
 * @example
 * ```tsx
 * const [amount, setAmount] = useState(0);
 * <CurrencyInput
 *   value={amount}
 *   onChange={setAmount}
 *   placeholder="Enter amount"
 *   sanitizeOptions={{ maxValue: 1000000 }}
 * />
 * ```
 */
export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(
  (
    {
      value,
      onChange,
      inputType = "currency",
      sanitizeOptions = {},
      showError = false,
      errorMessage,
      currencySymbol = "$",
      showSymbol = false,
      className,
      placeholder,
      ...props
    },
    ref
  ) => {
    // Internal state for the display value (string)
    const [displayValue, setDisplayValue] = React.useState<string>(
      value.toString()
    );
    const [error, setError] = React.useState<string | undefined>();

    // Sync internal state when external value changes
    React.useEffect(() => {
      setDisplayValue(value.toString());
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;

      // Sanitize based on input type
      const sanitized =
        inputType === "integer"
          ? sanitizeIntegerInput(rawValue, sanitizeOptions)
          : sanitizeCurrencyInput(rawValue, sanitizeOptions);

      // Update display value (allows partial input like "123.")
      setDisplayValue(sanitized);

      // Parse to number for onChange callback
      const numericValue =
        inputType === "integer"
          ? parseIntegerInput(sanitized, 0)
          : parseCurrencyInput(sanitized, 0);

      // Validate if showError is enabled
      if (showError && sanitized !== "") {
        const validation = validateNumericValue(numericValue, sanitizeOptions);
        setError(validation.isValid ? undefined : validation.error);
      } else {
        setError(undefined);
      }

      // Always call onChange with numeric value
      onChange(numericValue);
    };

    const handleBlur = () => {
      // On blur, format the display value properly
      if (displayValue === "" || displayValue === "-") {
        setDisplayValue("0");
        onChange(0);
      }
    };

    return (
      <div className="relative w-full">
        {showSymbol && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {currencySymbol}
          </span>
        )}
        <Input
          ref={ref}
          type="text"
          inputMode={inputType === "integer" ? "numeric" : "decimal"}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder || (inputType === "integer" ? "0" : "0.00")}
          className={cn(
            showSymbol && "pl-7",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? "currency-input-error" : undefined}
          {...props}
        />
        {showError && (error || errorMessage) && (
          <p
            id="currency-input-error"
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
          >
            {errorMessage || error}
          </p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
