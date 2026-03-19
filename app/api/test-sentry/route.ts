/**
 * Sentry Test Route
 * Use this to verify error tracking is working correctly
 *
 * Test with: curl http://localhost:3000/api/test-sentry
 *
 * Expected: Error appears in Sentry dashboard within 60 seconds
 * Alert should fire if configured (email/Slack)
 */

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  try {
    // Log test message
    logger.info('Sentry test route called', {
      endpoint: '/api/test-sentry',
      timestamp: new Date().toISOString(),
    });

    // Check if Sentry DSN is configured
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn || dsn.includes('YOUR_SENTRY_KEY') || dsn.includes('o0000000')) {
      return NextResponse.json({
        success: false,
        error: 'Sentry is not configured',
        message: 'NEXT_PUBLIC_SENTRY_DSN contains placeholder value',
        guide: 'See docs/SENTRY_PRODUCTION_ACTIVATION_GUIDE.md',
      }, { status: 503 });
    }

    // Capture informational message
    const messageId = Sentry.captureMessage('Sentry test message - monitoring is active!', {
      level: 'info',
      tags: {
        test: true,
        route: '/api/test-sentry',
      },
    });

    // Add breadcrumb for debugging
    Sentry.addBreadcrumb({
      message: 'About to capture test error',
      level: 'info',
      data: {
        route: '/api/test-sentry',
        timestamp: Date.now(),
      },
    });

    // Capture test error (this will be sent to Sentry)
    const testError = new Error('This is a test error from TaxBridge - Sentry is working! ✅');
    const eventId = Sentry.captureException(testError, {
      level: 'error',
      tags: {
        test: true,
        route: '/api/test-sentry',
        environment: process.env.NODE_ENV || 'development',
      },
      extra: {
        testType: 'manual',
        triggeredAt: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
      },
    });

    // Flush events to Sentry immediately (don't wait for automatic flush)
    await Sentry.flush(2000);

    return NextResponse.json({
      success: true,
      message: 'Test error sent to Sentry',
      eventId,
      messageId,
      instructions: 'Check Sentry dashboard at https://sentry.io/organizations/taxbridge/issues/',
      expectedDelay: 'Error should appear within 30 seconds',
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { level = 'error', message } = body;

  // Allow testing different error levels
  if (level === 'warning') {
    Sentry.captureMessage(message || 'Test warning', {
      level: 'warning',
      tags: { test: true },
    });
    return NextResponse.json({
      success: true,
      message: 'Warning captured',
      level: 'warning',
    });
  }

  if (level === 'critical') {
    console.error(new Error(message || 'Critical test error'), {
      level: 'fatal',
      tags: {
        test: true,
        level: 'critical',
      },
    });
    return NextResponse.json({
      success: true,
      message: 'Critical error captured',
      level: 'critical',
    });
  }

  // Default: capture as error
  throw new Error(message || 'Test error via POST');
}
