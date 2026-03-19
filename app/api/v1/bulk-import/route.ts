/**
 * POST /api/v1/bulk-import
 * Bulk CSV import for 100+ employee RSU calculations
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, logApiUsage } from '@/lib/api/auth/api-keys';
import { processBulkImport } from '@/lib/api/v1/bulk-import';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-error-handler';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Rate limiting: bulk imports are expensive, use strict limits
  const rateLimitResult = await rateLimit(request, RateLimitPresets.STRICT);
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

    const apiKey = authHeader.substring(7);

    // Validate API key
    const validation = validateApiKey(apiKey);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const defaultEmployer = (formData.get('default_employer') as string) || 'Meta';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded. Send CSV file as "file" in multipart/form-data' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only CSV files are accepted.' },
        { status: 400 }
      );
    }

    // Read file content
    const csvContent = await file.text();

    // Validate default_employer
    const validEmployers = ['Meta', 'Amazon', 'Google', 'Microsoft'];
    if (!validEmployers.includes(defaultEmployer)) {
      return NextResponse.json(
        { error: `default_employer must be one of: ${validEmployers.join(', ')}` },
        { status: 400 }
      );
    }

    // Process bulk import
    const result = await processBulkImport(
      csvContent,
      defaultEmployer as 'Meta' | 'Amazon' | 'Google' | 'Microsoft'
    );

    // Log API usage
    if (validation.orgId) {
      logApiUsage(validation.orgId, '/api/v1/bulk-import');
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return handleApiError(error, { route: '/api/v1/bulk-import', method: request.method });
  }
}

// OPTIONS handler for CORS
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
