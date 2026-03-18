/**
 * GET /api/openapi.yaml
 * Serve OpenAPI specification file
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const openapiPath = join(process.cwd(), 'docs', 'api', 'openapi.yaml');
    const openapiContent = readFileSync(openapiPath, 'utf-8');

    return new NextResponse(openapiContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/yaml',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error serving OpenAPI spec:', error);
    return NextResponse.json(
      { error: 'OpenAPI specification not found' },
      { status: 404 }
    );
  }
}
