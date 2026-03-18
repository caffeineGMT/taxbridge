import pino from 'pino';

// Create base logger configuration
const loggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

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
      },
    },
  }),

  // Production format - structured JSON
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
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

// Export base logger for advanced use cases
export { baseLogger };
