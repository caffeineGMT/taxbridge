/**
 * Stripe Error Handler
 * Converts Stripe errors to user-friendly messages with retry recommendations
 */

import Stripe from 'stripe';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

export interface PaymentError {
  code: string;
  message: string;
  userMessage: string;
  canRetry: boolean;
  suggestedAction?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Convert Stripe error to user-friendly error with retry guidance
 */
export function handleStripeError(error: unknown): PaymentError {
  // Handle Stripe-specific errors
  if (error instanceof Stripe.errors.StripeError) {
    const stripeError = error as Stripe.errors.StripeError;

    logger.warn('Stripe error occurred', {
      type: stripeError.type,
      code: stripeError.code,
      decline_code: stripeError.decline_code,
      message: stripeError.message,
    });

    // Card declined errors
    if ((stripeError as any).type === 'card_error') {
      return handleCardError(stripeError as any);
    }

    // Rate limit errors
    if ((stripeError as any).type === 'rate_limit_error') {
      return {
        code: 'rate_limit',
        message: 'Too many requests',
        userMessage: 'Our payment system is experiencing high traffic. Please try again in a moment.',
        canRetry: true,
        suggestedAction: 'Wait 30 seconds and try again',
        severity: 'warning',
      };
    }

    // API connection errors
    if ((stripeError as any).type === 'api_connection_error') {
      Sentry.captureException(error, {
        level: 'error',
        tags: { error_type: 'stripe_connection' },
      });

      return {
        code: 'connection_error',
        message: 'Connection to payment processor failed',
        userMessage: 'Unable to connect to our payment processor. Please check your internet connection and try again.',
        canRetry: true,
        suggestedAction: 'Check your internet connection',
        severity: 'error',
      };
    }

    // Invalid request errors
    if ((stripeError as any).type === 'invalid_request_error') {
      Sentry.captureException(error, {
        level: 'error',
        tags: { error_type: 'stripe_invalid_request' },
      });

      return {
        code: 'invalid_request',
        message: stripeError.message || 'Invalid request',
        userMessage: 'There was a problem processing your request. Please contact support if this continues.',
        canRetry: false,
        suggestedAction: 'Contact support at support@taxbridge.com',
        severity: 'error',
      };
    }

    // Authentication errors
    if ((stripeError as any).type === 'authentication_error') {
      Sentry.captureException(error, {
        level: 'fatal',
        tags: { error_type: 'stripe_auth_error' },
      });

      return {
        code: 'auth_error',
        message: 'Stripe authentication failed',
        userMessage: 'Payment system configuration error. Our team has been notified.',
        canRetry: false,
        suggestedAction: 'Please contact support',
        severity: 'critical',
      };
    }
  }

  // Generic error fallback
  logger.error('Unknown payment error', {
    error: error instanceof Error ? error : new Error(String(error)),
  });

  Sentry.captureException(error, {
    level: 'error',
    tags: { error_type: 'payment_unknown' },
  });

  return {
    code: 'unknown_error',
    message: error instanceof Error ? error.message : 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    canRetry: true,
    suggestedAction: 'Try again in a moment',
    severity: 'error',
  };
}

/**
 * Handle card-specific errors with detailed user guidance
 */
function handleCardError(error: Stripe.errors.StripeCardError): PaymentError {
  const declineCode = error.decline_code;

  // Log card error for analytics
  logger.info('Card declined', {
    decline_code: declineCode,
    code: error.code,
  });

  // Specific decline reasons with user-friendly messages
  switch (declineCode) {
    case 'insufficient_funds':
      return {
        code: 'insufficient_funds',
        message: 'Card has insufficient funds',
        userMessage: 'Your card was declined due to insufficient funds.',
        canRetry: true,
        suggestedAction: 'Please use a different card or add funds to your account',
        severity: 'warning',
      };

    case 'lost_card':
    case 'stolen_card':
      return {
        code: declineCode,
        message: 'Card reported as lost/stolen',
        userMessage: 'This card has been reported as lost or stolen. Please use a different card.',
        canRetry: true,
        suggestedAction: 'Use a different payment method',
        severity: 'warning',
      };

    case 'expired_card':
      return {
        code: 'expired_card',
        message: 'Card has expired',
        userMessage: 'Your card has expired.',
        canRetry: true,
        suggestedAction: 'Please update your card details or use a different card',
        severity: 'warning',
      };

    case 'incorrect_cvc':
      return {
        code: 'incorrect_cvc',
        message: 'Incorrect CVC',
        userMessage: 'The security code (CVC) you entered is incorrect.',
        canRetry: true,
        suggestedAction: 'Check the 3-4 digit code on the back of your card',
        severity: 'info',
      };

    case 'incorrect_zip':
      return {
        code: 'incorrect_zip',
        message: 'Incorrect postal code',
        userMessage: 'The postal/ZIP code you entered doesn\'t match your card.',
        canRetry: true,
        suggestedAction: 'Verify the billing address associated with your card',
        severity: 'info',
      };

    case 'card_velocity_exceeded':
      return {
        code: 'card_velocity_exceeded',
        message: 'Card usage limit exceeded',
        userMessage: 'Your card has exceeded its usage limit. This is a temporary security measure.',
        canRetry: true,
        suggestedAction: 'Wait a few hours or use a different card',
        severity: 'warning',
      };

    case 'do_not_honor':
    case 'generic_decline':
      return {
        code: declineCode || 'generic_decline',
        message: 'Card declined by issuer',
        userMessage: 'Your card was declined by your bank. Please contact your bank for more details.',
        canRetry: true,
        suggestedAction: 'Contact your bank or try a different payment method',
        severity: 'warning',
      };

    case 'fraudulent':
      return {
        code: 'fraudulent',
        message: 'Transaction flagged as fraudulent',
        userMessage: 'This transaction was flagged for security reasons.',
        canRetry: false,
        suggestedAction: 'Contact your bank to verify the charge',
        severity: 'error',
      };

    case 'processing_error':
      return {
        code: 'processing_error',
        message: 'Processing error',
        userMessage: 'There was a temporary problem processing your card.',
        canRetry: true,
        suggestedAction: 'Please try again',
        severity: 'warning',
      };

    default:
      // Generic card decline
      return {
        code: error.code || 'card_declined',
        message: error.message || 'Card declined',
        userMessage: 'Your card was declined. Please try a different payment method or contact your bank.',
        canRetry: true,
        suggestedAction: 'Use a different card or contact your bank',
        severity: 'warning',
      };
  }
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: PaymentError): boolean {
  return error.canRetry;
}

/**
 * Get user-facing error message with retry guidance
 */
export function getUserErrorMessage(error: PaymentError): {
  title: string;
  message: string;
  action?: string;
} {
  return {
    title: error.severity === 'critical' ? 'Payment System Error' : 'Payment Failed',
    message: error.userMessage,
    action: error.suggestedAction,
  };
}
