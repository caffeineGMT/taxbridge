/**
 * GET /api/v1/forms
 * Get required tax forms based on user situation
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, logApiUsage } from '@/lib/api/auth/api-keys';
import { getRequiredForms, validateFormsRequest } from '@/lib/api/v1/forms';
import { handleApiError } from '@/lib/api-error-handler';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header. Format: Bearer sk_live_...' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);

    // Validate API key
    const validation = validateApiKey(apiKey);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const requestData = {
      country: searchParams.get('country') || undefined,
      province: searchParams.get('province') || undefined,
      state: searchParams.get('state') || undefined,
      has_rsu: searchParams.get('has_rsu') === 'true',
      has_foreign_accounts: searchParams.get('has_foreign_accounts') === 'true',
    };

    // Validate request
    const requestValidation = validateFormsRequest(requestData);

    if (!requestValidation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: requestValidation.errors },
        { status: 400 }
      );
    }

    // Get required forms
    const result = getRequiredForms(requestValidation.request!);

    // Log API usage
    if (validation.orgId) {
      logApiUsage(validation.orgId, '/api/v1/forms');
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return handleApiError(error, { route: '/api/v1/forms', method: request.method });
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
