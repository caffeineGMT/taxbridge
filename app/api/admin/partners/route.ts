/**
 * Admin Partners API Route
 * GET /api/admin/partners - Get all affiliate partners (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getAffiliatePartnersByStatus } from '@/lib/db/queries/affiliates';
import { handleApiError } from '@/lib/api-error-handler';

/**
 * Check if user is admin
 */
async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  const userEmail = user.emailAddresses[0]?.emailAddress;

  return adminEmails.includes(userEmail || '');
}

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Get all partners
    const partners = getAffiliatePartnersByStatus();

    return NextResponse.json({
      partners,
      total: partners.length,
      pending: partners.filter(p => p.status === 'pending').length,
      approved: partners.filter(p => p.status === 'approved').length,
      rejected: partners.filter(p => p.status === 'rejected').length,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/admin/partners', method: req.method });
  }
}
