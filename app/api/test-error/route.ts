import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

/**
 * Test Error Endpoint
 *
 * Purpose: Trigger a test error to verify Sentry integration is working
 *
 * Usage:
 *   1. Deploy to production with valid NEXT_PUBLIC_SENTRY_DSN
 *   2. Visit: https://taxbridge.vercel.app/api/test-error
 *   3. Check Sentry dashboard for error within 30 seconds
 *
 * Expected Sentry Event:
 *   - Title: "Test Error: Sentry Integration Verification"
 *   - Environment: production/preview/development
 *   - Level: error
 *   - Tags: { route: /api/test-error, test: true, integration_check: true }
 */
export async function GET(req: NextRequest) {
  try {
    // Add breadcrumb for context
    Sentry.addBreadcrumb({
      category: 'test',
      message: 'Test error endpoint accessed',
      level: 'info',
      data: {
        url: req.url,
        method: 'GET',
        timestamp: new Date().toISOString(),
      },
    });

    // Set user context (simulated)
    Sentry.setUser({
      id: 'test-user-sentry-verification',
      email: 'test@sentry-verification.local',
    });

    // Set custom tags
    Sentry.setTag('test', 'true');
    Sentry.setTag('integration_check', 'true');
    Sentry.setTag('route', '/api/test-error');
    Sentry.setTag('environment', process.env.VERCEL_ENV || process.env.NODE_ENV || 'development');

    // Set custom context
    Sentry.setContext('verification', {
      purpose: 'Integration test for Sentry error monitoring',
      expected_behavior: 'This error should appear in Sentry Issues dashboard',
      timestamp: new Date().toISOString(),
      dsn_configured: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
      auth_token_configured: !!process.env.SENTRY_AUTH_TOKEN,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    });

    // Create and throw test error
    const testError = new Error('Test Error: Sentry Integration Verification');
    testError.name = 'SentryIntegrationTest';

    // Capture the exception with additional context
    Sentry.captureException(testError, {
      level: 'error',
      tags: {
        test: 'true',
        integration_check: 'true',
        route: '/api/test-error',
        verification_type: 'manual_test',
      },
      contexts: {
        test_info: {
          test_type: 'sentry_integration',
          triggered_by: 'manual_endpoint_call',
          expected_result: 'error_visible_in_sentry_dashboard',
        },
      },
      fingerprint: ['sentry-integration-test', new Date().toISOString().split('T')[0]],
    });

    // Also throw the error to trigger default Sentry error handling
    throw testError;

  } catch (error) {
    // Ensure error is captured
    if (error instanceof Error && error.name !== 'SentryIntegrationTest') {
      Sentry.captureException(error);
    }

    // Return error response
    return NextResponse.json(
      {
        error: 'Test error triggered for Sentry',
        message: error instanceof Error ? error.message : String(error),
        instructions: [
          '1. Check your Sentry dashboard at https://sentry.io/',
          '2. Navigate to Issues tab',
          '3. Look for: "Test Error: Sentry Integration Verification"',
          '4. Error should appear within 30 seconds',
          '5. Verify environment tag matches your deployment (production/preview/development)',
        ],
        sentry_config: {
          dsn_configured: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
          auth_token_configured: !!process.env.SENTRY_AUTH_TOKEN,
          org_configured: !!process.env.SENTRY_ORG,
          project_configured: !!process.env.SENTRY_PROJECT,
          environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
        },
        timestamp: new Date().toISOString(),
        next_steps: {
          if_error_appears: 'Sentry integration is WORKING ✅',
          if_no_error: [
            'Check NEXT_PUBLIC_SENTRY_DSN is set in Vercel',
            'Check SENTRY_AUTH_TOKEN is set in Vercel',
            'Verify DSN format: https://key@o123.ingest.sentry.io/456',
            'Check Sentry project settings allow events from this domain',
            'Wait 1-2 minutes (Sentry may have delay)',
          ],
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint - trigger error with custom payload
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Capture custom message if provided
    const errorMessage = body.message || 'Test Error: Sentry Integration Verification (POST)';

    const testError = new Error(errorMessage);
    testError.name = 'SentryIntegrationTest';

    Sentry.captureException(testError, {
      level: 'error',
      tags: {
        test: 'true',
        method: 'POST',
        custom_message: !!body.message,
      },
      extra: {
        request_body: body,
      },
    });

    throw testError;

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Test error triggered for Sentry (POST)',
        message: error instanceof Error ? error.message : String(error),
        sentry_config: {
          dsn_configured: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
          environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
        },
      },
      { status: 500 }
    );
  }
}
