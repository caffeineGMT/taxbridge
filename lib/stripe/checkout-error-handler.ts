/**
 * Client-side error handler for Stripe checkout errors
 * Provides user-friendly error messages and retry guidance
 */

export interface CheckoutError {
  title: string;
  message: string;
  action?: string;
  canRetry: boolean;
  severity: 'info' | 'warning' | 'error';
}

/**
 * Handle checkout errors and provide user-friendly messages
 */
export function handleCheckoutError(error: unknown): CheckoutError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to our servers. Please check your internet connection.',
      action: 'Check your connection and try again',
      canRetry: true,
      severity: 'error',
    };
  }

  // HTTP errors
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // Card declined
    if (errorMessage.includes('card') && errorMessage.includes('declined')) {
      return {
        title: 'Card Declined',
        message: 'Your card was declined. Please try a different payment method or contact your bank.',
        action: 'Use a different card',
        canRetry: true,
        severity: 'warning',
      };
    }

    // Insufficient funds
    if (errorMessage.includes('insufficient') || errorMessage.includes('funds')) {
      return {
        title: 'Insufficient Funds',
        message: 'Your card has insufficient funds for this transaction.',
        action: 'Add funds or use a different card',
        canRetry: true,
        severity: 'warning',
      };
    }

    // Expired card
    if (errorMessage.includes('expired')) {
      return {
        title: 'Card Expired',
        message: 'Your card has expired. Please use a different payment method.',
        action: 'Update your card details',
        canRetry: true,
        severity: 'warning',
      };
    }

    // Invalid CVC/security code
    if (errorMessage.includes('cvc') || errorMessage.includes('security code')) {
      return {
        title: 'Invalid Security Code',
        message: 'The security code (CVC) you entered is incorrect.',
        action: 'Check the 3-4 digit code on your card',
        canRetry: true,
        severity: 'info',
      };
    }

    // Processing error
    if (errorMessage.includes('processing')) {
      return {
        title: 'Processing Error',
        message: 'There was a temporary problem processing your payment.',
        action: 'Please try again',
        canRetry: true,
        severity: 'warning',
      };
    }

    // Unauthorized
    if (errorMessage.includes('unauthorized') || errorMessage.includes('sign in')) {
      return {
        title: 'Sign In Required',
        message: 'Please sign in to upgrade your account.',
        action: 'Sign in and try again',
        canRetry: true,
        severity: 'info',
      };
    }

    // Rate limit
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
      return {
        title: 'Too Many Requests',
        message: 'You\'ve made too many payment attempts. Please wait a moment.',
        action: 'Wait 30 seconds and try again',
        canRetry: true,
        severity: 'warning',
      };
    }
  }

  // Generic error fallback
  return {
    title: 'Checkout Failed',
    message: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
    action: 'Try again or contact support',
    canRetry: true,
    severity: 'error',
  };
}

/**
 * Format error for display in toast notification
 */
export function formatErrorForToast(error: CheckoutError): {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
} {
  const description = error.action
    ? `${error.message}\n\nSuggested action: ${error.action}`
    : error.message;

  return {
    title: error.title,
    description,
    variant: error.severity === 'error' ? 'destructive' : 'default',
  };
}

/**
 * Determine if user should see retry button
 */
export function shouldShowRetry(error: CheckoutError): boolean {
  return error.canRetry && error.severity !== 'info';
}
