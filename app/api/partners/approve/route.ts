/**
 * Partner Approval API Route
 * POST /api/partners/approve - Approve or reject affiliate application
 */

import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import {
  approveAffiliatePartner,
  rejectAffiliatePartner,
  getAffiliatePartner,
} from '@/lib/db/queries/affiliates';
import { handleApiError } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

/**
 * Check if user is admin
 * For MVP, we'll check if email matches admin email from env
 */
async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  const userEmail = user.emailAddresses[0]?.emailAddress;

  return adminEmails.includes(userEmail || '');
}

export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { partner_id, action, rejection_reason } = body;

    // Validate required fields
    if (!partner_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: partner_id, action' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get partner
    const partner = getAffiliatePartner(partner_id);
    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    if (partner.status !== 'pending') {
      return NextResponse.json(
        { error: `Partner application has already been ${partner.status}` },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      approveAffiliatePartner(partner_id);

      // TODO: Send approval email to partner with referral link
      logger.info(`[Affiliate] Approved: ${partner.firm_name} (${partner.email})`);
      logger.info(`[Affiliate] Referral link: ${process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app'}?ref=${partner.referral_code}`);

      return NextResponse.json({
        success: true,
        message: 'Partner approved successfully',
        referral_code: partner.referral_code,
        referral_link: `${process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app'}?ref=${partner.referral_code}`,
      });
    } else {
      rejectAffiliatePartner(partner_id, rejection_reason);

      // TODO: Send rejection email to partner
      logger.info(`[Affiliate] Rejected: ${partner.firm_name} (${partner.email})`);

      return NextResponse.json({
        success: true,
        message: 'Partner application rejected',
      });
    }
  } catch (error) {
    return handleApiError(error, { route: '/api/partners/approve', method: req.method });
  }
}
