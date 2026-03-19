import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * Standard API error response interface
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
  requestId?: string;
}

/**
 * Error types for better categorization
 */
export enum ApiErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  STRIPE = 'stripe',
  INTERNAL = 'internal',
}

/**
 * Custom API Error class with type and HTTP status
 */
export class ApiError extends Error {
  constructor(
    public type: ApiErrorType,
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Handle API errors with proper logging, Sentry reporting, and standardized responses
 *
 * @param error - The error to handle
 * @param context - Additional context for logging
 * @returns NextResponse with appropriate status code and error message
 *
 * @example
 * ```ts
 * export async function POST(req: NextRequest) {
 *   try {
 *     // Your logic here
 *   } catch (error) {
 *     return handleApiError(error, { route: '/api/example', method: 'POST' });
 *   }
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  context?: {
    route?: string;
    method?: string;
    userId?: string;
    [key: string]: unknown;
  }
): NextResponse<ApiErrorResponse> {
  // Generate unique request ID for tracking
  const requestId = generateRequestId();

  // Determine error type and status code
  let statusCode = 500;
  let errorType = ApiErrorType.INTERNAL;
  let errorMessage = 'An unexpected error occurred';
  let errorDetails: unknown;

  if (error instanceof ApiError) {
    // Custom API error with explicit type and status
    statusCode = error.statusCode;
    errorType = error.type;
    errorMessage = error.message;
    errorDetails = error.details;
  } else if (error instanceof Error) {
    errorMessage = error.message;

    // Categorize based on error message patterns
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      statusCode = 404;
      errorType = ApiErrorType.NOT_FOUND;
    } else if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      statusCode = 401;
      errorType = ApiErrorType.AUTHENTICATION;
    } else if (error.message.includes('forbidden') || error.message.includes('permission')) {
      statusCode = 403;
      errorType = ApiErrorType.AUTHORIZATION;
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      statusCode = 400;
      errorType = ApiErrorType.VALIDATION;
    } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
      statusCode = 429;
      errorType = ApiErrorType.RATE_LIMIT;
    } else if (error.message.toLowerCase().includes('database') || error.message.includes('SQLITE')) {
      statusCode = 500;
      errorType = ApiErrorType.DATABASE;
    } else if (error.message.toLowerCase().includes('stripe')) {
      statusCode = 502;
      errorType = ApiErrorType.STRIPE;
    } else if (
      error.message.includes('timeout') ||
      error.message.includes('fetch failed') ||
      error.message.includes('ECONNREFUSED')
    ) {
      statusCode = 502;
      errorType = ApiErrorType.EXTERNAL_API;
    }
  }

  // Log error with structured logging
  const logContext = {
    requestId,
    errorType,
    statusCode,
    ...context,
    error: error instanceof Error ? error : new Error(String(error)),
  };

  if (statusCode >= 500) {
    logger.error('API Error (5xx)', logContext);
  } else {
    logger.warn('API Error (4xx)', logContext);
  }

  // Send to Sentry for 5xx errors or critical 4xx errors
  if (statusCode >= 500 || statusCode === 401 || statusCode === 403) {
    Sentry.captureException(error, {
      level: statusCode >= 500 ? 'error' : 'warning',
      tags: {
        errorType,
        requestId,
        route: context?.route,
        method: context?.method,
      },
      contexts: {
        request: {
          route: context?.route,
          method: context?.method,
          user_id: context?.userId,
        },
      },
      extra: {
        ...context,
        details: errorDetails,
      },
    });
  }

  // Build response
  const response: ApiErrorResponse = {
    error: getErrorTitle(errorType),
    message: process.env.NODE_ENV === 'development' ? errorMessage : getSafeErrorMessage(errorType),
    requestId,
  };

  // Include details in development mode
  if (process.env.NODE_ENV === 'development' && errorDetails) {
    response.details = errorDetails;
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Get user-friendly error title based on type
 */
function getErrorTitle(type: ApiErrorType): string {
  const titles: Record<ApiErrorType, string> = {
    [ApiErrorType.VALIDATION]: 'Validation Error',
    [ApiErrorType.AUTHENTICATION]: 'Authentication Required',
    [ApiErrorType.AUTHORIZATION]: 'Access Denied',
    [ApiErrorType.NOT_FOUND]: 'Not Found',
    [ApiErrorType.RATE_LIMIT]: 'Rate Limit Exceeded',
    [ApiErrorType.DATABASE]: 'Database Error',
    [ApiErrorType.EXTERNAL_API]: 'External Service Error',
    [ApiErrorType.STRIPE]: 'Payment Service Error',
    [ApiErrorType.INTERNAL]: 'Internal Server Error',
  };
  return titles[type];
}

/**
 * Get safe error message for production (hide sensitive details)
 */
function getSafeErrorMessage(type: ApiErrorType): string {
  const messages: Record<ApiErrorType, string> = {
    [ApiErrorType.VALIDATION]: 'The request contains invalid data. Please check your input.',
    [ApiErrorType.AUTHENTICATION]: 'Authentication is required to access this resource.',
    [ApiErrorType.AUTHORIZATION]: 'You do not have permission to access this resource.',
    [ApiErrorType.NOT_FOUND]: 'The requested resource was not found.',
    [ApiErrorType.RATE_LIMIT]: 'Too many requests. Please try again later.',
    [ApiErrorType.DATABASE]: 'A database error occurred. Please try again.',
    [ApiErrorType.EXTERNAL_API]: 'An external service is temporarily unavailable.',
    [ApiErrorType.STRIPE]: 'Payment processing is temporarily unavailable.',
    [ApiErrorType.INTERNAL]: 'An unexpected error occurred. Please try again.',
  };
  return messages[type];
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Helper to create validation errors
 */
export function validationError(message: string, details?: unknown): ApiError {
  return new ApiError(ApiErrorType.VALIDATION, 400, message, details);
}

/**
 * Helper to create authentication errors
 */
export function authenticationError(message: string = 'Authentication required'): ApiError {
  return new ApiError(ApiErrorType.AUTHENTICATION, 401, message);
}

/**
 * Helper to create authorization errors
 */
export function authorizationError(message: string = 'Access denied'): ApiError {
  return new ApiError(ApiErrorType.AUTHORIZATION, 403, message);
}

/**
 * Helper to create not found errors
 */
export function notFoundError(resource: string): ApiError {
  return new ApiError(ApiErrorType.NOT_FOUND, 404, `${resource} not found`);
}

/**
 * Helper to create database errors
 */
export function databaseError(message: string, details?: unknown): ApiError {
  return new ApiError(ApiErrorType.DATABASE, 500, message, details);
}

/**
 * Helper to create Stripe errors
 */
export function stripeError(message: string, details?: unknown): ApiError {
  return new ApiError(ApiErrorType.STRIPE, 502, message, details);
}
