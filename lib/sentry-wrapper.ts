import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { logger, logRequest, logResponse } from './logger';

/**
 * Performance monitoring levels for different API endpoints
 */
export enum MonitoringLevel {
  CRITICAL = 'critical',    // Always monitored (Stripe webhooks, bulk operations)
  HIGH = 'high',           // High sample rate (AI endpoints, heavy operations)
  NORMAL = 'normal',       // Standard monitoring
  LOW = 'low',            // Light monitoring
}

/**
 * Configuration for API route monitoring
 */
interface RouteMonitoringConfig {
  level: MonitoringLevel;
  timeout?: number;
  tags?: Record<string, string>;
}

/**
 * Wrap Next.js API route handler with Sentry error tracking and performance monitoring
 *
 * @param handler - The API route handler function
 * @param config - Monitoring configuration
 * @returns Wrapped handler with error tracking and performance monitoring
 *
 * @example
 * ```ts
 * export const POST = withSentry(
 *   async (req: NextRequest) => {
 *     // Your handler logic
 *     return NextResponse.json({ success: true });
 *   },
 *   { level: MonitoringLevel.CRITICAL }
 * );
 * ```
 */
export function withSentry<T = unknown>(
  handler: (req: NextRequest, context?: T) => Promise<NextResponse>,
  config: RouteMonitoringConfig
) {
  return async (req: NextRequest, context?: T): Promise<NextResponse> => {
    const startTime = Date.now();
    const route = req.nextUrl.pathname;
    const method = req.method;

    // Extract user ID from headers if available (set by middleware)
    const userId = req.headers.get('x-user-id') || undefined;

    // Log incoming request
    logRequest(method, route, userId);

    try {
      // Execute the handler with Sentry span
      const response = await Sentry.startSpan(
        {
          name: `${method} ${route}`,
          op: 'http.server',
          attributes: {
            route,
            method,
            level: config.level,
            ...config.tags,
          },
        },
        async () => {
          // Set user context if available
          if (userId) {
            Sentry.setUser({ id: userId });
          }

          // Set tags
          Sentry.setTag('route', route);
          Sentry.setTag('method', method);
          Sentry.setTag('level', config.level);
          Object.entries(config.tags || {}).forEach(([key, value]) => {
            Sentry.setTag(key, value);
          });

          return await handler(req, context);
        }
      );

      // Calculate duration
      const duration = Date.now() - startTime;

      // Log response
      logResponse(route, response.status, duration, userId);

      // Add performance headers
      response.headers.set('Server-Timing', `total;dur=${duration}`);

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      logger.error('API Route Error', {
        route,
        method,
        userId,
        duration,
        error: error instanceof Error ? error : new Error(String(error)),
      });

      // Capture exception to Sentry with context
      Sentry.captureException(error, {
        level: 'error',
        tags: {
          route,
          method,
          level: config.level,
          ...config.tags,
        },
        contexts: {
          request: {
            method,
            url: route,
            user_id: userId,
          },
          performance: {
            duration,
          },
        },
      });

      // Return error response
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: process.env.NODE_ENV === 'development'
            ? error instanceof Error ? error.message : String(error)
            : 'An unexpected error occurred',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Monitor slow database queries
 */
export function monitorDatabaseQuery<T>(
  queryName: string,
  query: () => T
): T {
  return Sentry.startSpan(
    {
      op: 'db.query',
      name: queryName,
    },
    () => {
      return query();
    }
  );
}

/**
 * Monitor external API calls
 */
export async function monitorExternalAPI<T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> {
  return await Sentry.startSpan(
    {
      op: 'http.client',
      name: apiName,
    },
    async () => {
      return await apiCall();
    }
  );
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    level: 'info',
    data,
  });
}
