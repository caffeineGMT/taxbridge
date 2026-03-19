/**
 * Send Referral Invitation Email API Route
 * POST /api/email/send-referral-invitation
 *
 * Allows users to send referral invitations to friends via email
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserProfileByClerkId } from '@/lib/db';
import { getUserReferralCode } from '@/lib/db/queries/referrals';
import { getReferralInvitationEmailData, EMAIL_TEMPLATES } from '@/lib/email/templates';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid (only if API key exists)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const userProfile = await getUserProfileByClerkId(clerkUserId);
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { friendEmail, personalMessage } = body;

    // Validate friend email
    if (!friendEmail || !friendEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
    }

    // Get user's referral code
    const referralCode = await getUserReferralCode(userProfile.id);

    // Prevent self-referral via email
    if (friendEmail.toLowerCase() === userProfile.email?.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });
    }

    // Rate limiting: max 10 invitations per day per user
    // TODO: Implement proper rate limiting with Redis/database
    // For now, we'll just log the attempt

    console.log('[Referral Email] Sending invitation:', {
      from: userProfile.email,
      to: friendEmail,
      code: referralCode,
    });

    // Check if SendGrid is configured
    if (!SENDGRID_API_KEY) {
      console.warn('[Referral Email] SendGrid not configured - email not sent');
      return NextResponse.json({
        success: true,
        message: 'SendGrid not configured in this environment. Referral link generated.',
        referralLink: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${referralCode}`,
      });
    }

    // Prepare email data
    const referrerName = userProfile.first_name && userProfile.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : userProfile.first_name || userProfile.email || 'A friend';

    const emailData = getReferralInvitationEmailData({
      referrerName,
      referrerEmail: userProfile.email || '',
      friendEmail,
      referralCode,
      personalMessage: personalMessage || undefined,
      discountPercent: 20,
    });

    // Send email via SendGrid
    const msg = {
      to: friendEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@taxbridge.app',
        name: 'TaxBridge',
      },
      replyTo: userProfile.email || undefined,
      templateId: EMAIL_TEMPLATES.REFERRAL_INVITATION,
      dynamicTemplateData: emailData,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
    };

    try {
      await sgMail.send(msg);
      console.log('[Referral Email] Sent successfully:', { to: friendEmail });
    } catch (emailError: any) {
      console.error('[Referral Email] SendGrid error:', emailError.response?.body || emailError.message);
      return NextResponse.json({
        error: 'Failed to send email',
        details: emailError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Referral invitation sent successfully',
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${referralCode}`,
    });

  } catch (error: any) {
    console.error('[Referral Email] Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
    }, { status: 500 });
  }
}
