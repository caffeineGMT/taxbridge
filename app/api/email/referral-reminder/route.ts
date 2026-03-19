/**
 * Referral Reminder Email API
 * Sends email after user exports first PDF, encouraging them to share with colleagues
 */

import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { handleApiError } from '@/lib/api-error-handler';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, referralCode, referralLink } = await req.json();

    if (!email || !referralCode || !referralLink) {
      return NextResponse.json(
        { error: 'Missing required fields: email, referralCode, referralLink' },
        { status: 400 }
      );
    }

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@taxbridge.app',
      subject: '🎁 Share TaxBridge and earn free months!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Share TaxBridge</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #0f172a; font-size: 28px; font-weight: bold; margin: 0;">
                🎉 Congrats on your first export!
              </h1>
            </div>

            <!-- Main Content -->
            <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <p style="color: #475569; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                Hi ${firstName || 'there'},
              </p>

              <p style="color: #475569; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                Great news! You've just exported your first tax calculation from TaxBridge. 🎊
              </p>

              <p style="color: #475569; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
                We know many of your colleagues are likely dealing with the same cross-border tax challenges. Share TaxBridge and earn rewards:
              </p>

              <!-- Benefits Box -->
              <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
                <h3 style="color: #065f46; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">
                  Referral Benefits
                </h3>
                <ul style="color: #064e3b; font-size: 15px; line-height: 22px; margin: 0; padding-left: 20px;">
                  <li>You earn <strong>1 month free Pro</strong> ($24.92 value) for each friend who subscribes</li>
                  <li>Your friends get <strong>20% off their first year</strong> ($60 savings)</li>
                  <li>Top 3 referrers each month win prizes up to $100</li>
                </ul>
              </div>

              <!-- Referral Link -->
              <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">
                  Your Unique Referral Link
                </p>
                <a href="${referralLink}" style="color: #10b981; font-size: 15px; word-break: break-all; text-decoration: none;">
                  ${referralLink}
                </a>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/referrals"
                   style="display: inline-block; background: #10b981; color: white; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                  View Referral Dashboard →
                </a>
              </div>

              <!-- Quick Share Ideas -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px;">
                <p style="color: #78350f; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                  💡 Quick sharing ideas:
                </p>
                <ul style="color: #78350f; font-size: 14px; line-height: 20px; margin: 0; padding-left: 20px;">
                  <li>Post in your company's Slack #tax or #visa-holders channel</li>
                  <li>Share on LinkedIn with your tech network</li>
                  <li>Email colleagues who mentioned tax season stress</li>
                  <li>Recommend to your immigration lawyer or CPA</li>
                </ul>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 13px; line-height: 20px; margin: 0 0 8px 0;">
                TaxBridge - US-Canada Cross-Border Tax Calculator
              </p>
              <p style="color: #cbd5e1; font-size: 12px; margin: 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #cbd5e1; text-decoration: underline;">
                  Unsubscribe from referral emails
                </a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hi ${firstName || 'there'},

Great news! You've just exported your first tax calculation from TaxBridge.

We know many of your colleagues are likely dealing with the same cross-border tax challenges. Share TaxBridge and earn rewards:

REFERRAL BENEFITS:
• You earn 1 month free Pro ($24.92 value) for each friend who subscribes
• Your friends get 20% off their first year ($60 savings)
• Top 3 referrers each month win prizes up to $100

YOUR UNIQUE REFERRAL LINK:
${referralLink}

View your referral dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/referrals

QUICK SHARING IDEAS:
• Post in your company's Slack #tax or #visa-holders channel
• Share on LinkedIn with your tech network
• Email colleagues who mentioned tax season stress
• Recommend to your immigration lawyer or CPA

Best regards,
The TaxBridge Team

---
Unsubscribe from referral emails: ${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe
      `.trim(),
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/email/referral-reminder', method: req.method });
  }
}
