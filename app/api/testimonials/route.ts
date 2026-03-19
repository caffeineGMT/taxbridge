import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db/unified';
import { handleApiError } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  location: string;
  quote: string;
  rating: number;
  savings_amount: string | null;
  avatar_url: string | null;
  video_url: string | null;
  verified: boolean;
  featured: boolean;
  display_order: number;
  status: 'active' | 'hidden' | 'pending';
  created_at: string;
  updated_at: string;
}

// GET /api/testimonials - Fetch all testimonials (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '10');

    let sql = 'SELECT * FROM testimonials WHERE status = $1';
    const params: any[] = [status];

    if (featured === 'true') {
      sql += ' AND featured = 1';
    }

    sql += ' ORDER BY display_order ASC, created_at DESC';

    if (limit > 0) {
      sql += ` LIMIT ${limit}`;
    }

    const testimonials = await query<Testimonial>(sql, params);

    return NextResponse.json({ testimonials }, { status: 200 });
  } catch (error) {
    return handleApiError(error, { route: '/api/testimonials', method: request.method });
  }
}

// POST /api/testimonials - Create new testimonial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      role,
      company,
      location,
      quote,
      rating = 5,
      savings_amount,
      avatar_url,
      video_url,
      verified = false,
      featured = false,
      display_order = 0,
      status = 'pending'
    } = body;

    // Validation
    if (!name || !role || !company || !location || !quote) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role, company, location, quote' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const id = await insert(
      `INSERT INTO testimonials (
        name, role, company, location, quote, rating,
        savings_amount, avatar_url, video_url, verified,
        featured, display_order, status, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)`,
      [
        name,
        role,
        company,
        location,
        quote,
        rating,
        savings_amount,
        avatar_url,
        video_url,
        verified ? 1 : 0,
        featured ? 1 : 0,
        display_order,
        status
      ]
    );

    return NextResponse.json(
      { id, message: 'Testimonial created successfully' },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, { route: '/api/testimonials', method: request.method });
  }
}
