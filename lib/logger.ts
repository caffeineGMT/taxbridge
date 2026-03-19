import pino from 'pino';

/**
 * SECURITY: Fields to redact from logs to prevent PII/credential exposure
 * GDPR/CCPA compliance - never log sensitive user data
 */
const REDACTED_FIELDS = [
  'password',
  'token',
  'apiKey',
  'api_key',
  'secret',
  'stripe_secret_key',
  'stripe_publishable_key',
  'clerk_secret_key',
  'sendgrid_api_key',
  'private_key',
  'credit_card',
  'card_number',
  'cvv',
  'ssn',
  'social_security_number',
  'tax_id',
  'ein',
  'sin', // Canadian Social Insurance Number
  'authorization',
  'cookie',
  'session',
];

// Create base logger configuration
const loggerConfig = {
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // SECURITY: Redact sensitive fields to prevent PII exposure
  redact: {
    paths: REDACTED_FIELDS,
    remove: true,
  },

  // Vercel captures stdout automatically - no need for file transport
  browser: {
    asObject: true,
  },

  // Format for development
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),

  // Production format - structured JSON with timestamp
  ...(process.env.NODE_ENV === 'production' && {
    timestamp: pino.stdTimeFunctions.isoTime,
  }),

  // Production format - structured JSON
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },

  // Add environment context
  base: {
    env: process.env.NODE_ENV,
  },
};

// Create base logger instance
const baseLogger = pino(loggerConfig);

// Type-safe log context interface
interface LogContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  duration?: number;
  statusCode?: number;
  error?: Error | string;
  [key: string]: unknown;
}

// Enhanced logger with context methods
export const logger = {
  /**
   * Log info level message
   */
  info: (message: string, context?: LogContext) => {
    baseLogger.info(context || {}, message);
  },

  /**
   * Log warning level message
   */
  warn: (message: string, context?: LogContext) => {
    baseLogger.warn(context || {}, message);
  },

  /**
   * Log error level message
   */
  error: (message: string, context?: LogContext) => {
    const ctx = context || {};

    // Extract error stack if Error object provided
    if (ctx.error instanceof Error) {
      baseLogger.error({
        ...ctx,
        error: {
          message: ctx.error.message,
          stack: ctx.error.stack,
          name: ctx.error.name,
        },
      }, message);
    } else {
      baseLogger.error(ctx, message);
    }
  },

  /**
   * Log debug level message (development only)
   */
  debug: (message: string, context?: LogContext) => {
    baseLogger.debug(context || {}, message);
  },

  /**
   * Create child logger with default context
   */
  child: (defaultContext: LogContext) => {
    return baseLogger.child(defaultContext);
  },
};

// Request logging helper
export function logRequest(
  method: string,
  endpoint: string,
  userId?: string,
  additionalContext?: Record<string, unknown>
) {
  logger.info('API Request', {
    method,
    endpoint,
    userId,
    requestId: generateRequestId(),
    ...additionalContext,
  });
}

// Response logging helper with performance tracking
export function logResponse(
  endpoint: string,
  statusCode: number,
  duration: number,
  userId?: string,
  additionalContext?: Record<string, unknown>
) {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

  logger[level]('API Response', {
    endpoint,
    statusCode,
    duration,
    userId,
    ...additionalContext,
  });
}

// Error logging helper
export function logError(
  message: string,
  error: Error | unknown,
  context?: LogContext
) {
  logger.error(message, {
    ...context,
    error: error instanceof Error ? error : new Error(String(error)),
  });
}

// Generate unique request ID for tracing
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize data before logging to prevent PII exposure
 * Use when logging user data, request bodies, etc.
 */
export function sanitizeForLogging<T extends Record<string, any>>(
  data: T,
  additionalRedactFields: string[] = []
): Partial<T> {
  const fieldsToRedact = [...REDACTED_FIELDS, ...additionalRedactFields];
  const sanitized = { ...data };

  // Remove sensitive fields
  for (const field of fieldsToRedact) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }

  // Redact email addresses in production (keep domain for debugging)
  if (process.env.NODE_ENV === 'production' && 'email' in sanitized && typeof sanitized.email === 'string') {
    const email = sanitized.email as string;
    const [, domain] = email.split('@');
    sanitized.email = `***@${domain}` as any;
  }

  return sanitized;
}

// Export base logger for advanced use cases
export { baseLogger };

// Default export
export default logger;
