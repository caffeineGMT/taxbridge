import { NextRequest, NextResponse } from 'next/server';
import { isDiscountCodeValid } from '@/lib/conferences/config';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Discount code is required' }, { status: 400 });
    }

    const result = isDiscountCodeValid(code);

    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        reason: result.reason,
      });
    }

    return NextResponse.json({
      valid: true,
      discount_percent: result.conference!.discountPercent,
      conference: result.conference!.shortName,
      code: result.conference!.discountCode,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/conferences/discount/validate', method: request.method });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'code query parameter is required' }, { status: 400 });
    }

    const result = isDiscountCodeValid(code);

    return NextResponse.json({
      valid: result.valid,
      discount_percent: result.conference?.discountPercent,
      conference: result.conference?.shortName,
      reason: result.reason,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/conferences/discount/validate', method: request.method });
  }
}
