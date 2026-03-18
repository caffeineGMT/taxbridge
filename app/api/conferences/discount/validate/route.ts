import { NextRequest, NextResponse } from 'next/server';
import { isDiscountCodeValid } from '@/lib/conferences/config';

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
    console.error('Error validating discount code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    console.error('Error validating discount code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
