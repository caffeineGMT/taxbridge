/**
 * POST /api/v1/calculate
 * Calculate cross-border RSU taxes via REST API
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, logApiUsage } from '@/lib/api/auth/api-keys';
import { calculateTax, validateCalculationRequest } from '@/lib/api/v1/calculate';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-error-handler';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Rate limiting: authenticated API gets standard limits
  const rateLimitResult = await rateLimit(request, RateLimitPresets.STANDARD);
  if (rateLimitResult) return rateLimitResult;

  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header. Format: Bearer sk_live_...' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Validate API key
    const validation = validateApiKey(apiKey);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const requestValidation = validateCalculationRequest(body);

    if (!requestValidation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: requestValidation.errors },
        { status: 400 }
      );
    }

    // Calculate taxes
    const result = calculateTax(requestValidation.request!);

    // Log API usage
    if (validation.orgId) {
      logApiUsage(validation.orgId, '/api/v1/calculate');
    }

    // Return successful response
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return handleApiError(error, { route: '/api/v1/calculate', method: request.method });
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
