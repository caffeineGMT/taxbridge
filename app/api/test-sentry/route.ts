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

export async function GET(request: NextRequest) {
  // Log test message
  logger.info('Sentry test route called', {
    endpoint: '/api/test-sentry',
    timestamp: new Date().toISOString(),
  });

  // Capture informational message
  Sentry.captureMessage('Sentry test message - monitoring is active!', {
    level: 'info',
    tags: {
      test: true,
      route: '/api/test-sentry',
    },
  });

  // Add breadcrumb for debugging
  Sentry.addBreadcrumb({
    message: 'About to throw test error',
    level: 'info',
    data: {
      route: '/api/test-sentry',
      timestamp: Date.now(),
    },
  });

  // Trigger test error (this will be captured by Sentry)
  throw new Error('Sentry test error - error tracking is working! ✅');
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
