import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRate } from '@/lib/currency';
import { handleApiError } from '@/lib/api-error-handler';

/**
 * GET /api/exchange-rate?date=YYYY-MM-DD
 * Returns the USD/CAD exchange rate for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required (format: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Validate date format (basic check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const rate = await getExchangeRate(date);

    return NextResponse.json({
      date,
      rate,
      source: 'Bank of Canada',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/exchange-rate', method: request.method });
  }
}
