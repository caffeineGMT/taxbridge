import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/unified';

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

// PATCH /api/testimonials/[id] - Update testimonial
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    // Check if testimonial exists
    const existing = await queryOne<Testimonial>(
      'SELECT * FROM testimonials WHERE id = $1',
      [parseInt(id)]
    );

    if (!existing) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'name', 'role', 'company', 'location', 'quote', 'rating',
      'savings_amount', 'avatar_url', 'video_url', 'verified',
      'featured', 'display_order', 'status'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);

        // Convert boolean fields to 0/1 for SQLite
        if (field === 'verified' || field === 'featured') {
          values.push(body[field] ? 1 : 0);
        } else {
          values.push(body[field]);
        }

        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(parseInt(id));

    const sql = `UPDATE testimonials SET ${updates.join(', ')} WHERE id = $${paramIndex}`;

    await query(sql, values);

    return NextResponse.json({ message: 'Testimonial updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

// DELETE /api/testimonials/[id] - Delete testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if testimonial exists
    const existing = await queryOne<Testimonial>(
      'SELECT * FROM testimonials WHERE id = $1',
      [parseInt(id)]
    );

    if (!existing) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    await query('DELETE FROM testimonials WHERE id = $1', [parseInt(id)]);

    return NextResponse.json(
      { message: 'Testimonial deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
