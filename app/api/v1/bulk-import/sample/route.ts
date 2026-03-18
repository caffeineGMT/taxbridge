/**
 * GET /api/v1/bulk-import/sample
 * Download sample CSV template for bulk import
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSampleCSV } from '@/lib/api/v1/bulk-import';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const csvContent = generateSampleCSV();

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="taxbridge_bulk_import_sample.csv"',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Error generating sample CSV:', error);
    return NextResponse.json(
      { error: 'Failed to generate sample CSV' },
      { status: 500 }
    );
  }
}
