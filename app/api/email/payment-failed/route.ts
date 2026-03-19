/**
 * Payment Failed Email Notification
 * Sent when a subscription payment fails
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, userId, invoiceUrl, amountDue, attemptCount } = body;

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, userId' },
        { status: 400 }
      );
    }

    const name = firstName || 'there';
    const amount = amountDue || '0.00';
    const attempts = attemptCount || 1;

    // Determine urgency based on attempt count
    const isUrgent = attempts >= 3;
    const subject = isUrgent
      ? '🚨 Urgent: Payment Failed - Action Required'
      : '⚠️ Payment Failed - Update Payment Method';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            .alert-box {
              background-color: ${isUrgent ? '#fef2f2' : '#fffbeb'};
              border-left: 4px solid ${isUrgent ? '#dc2626' : '#f59e0b'};
              padding: 16px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .alert-title {
              font-weight: bold;
              color: ${isUrgent ? '#dc2626' : '#f59e0b'};
              margin-bottom: 8px;
            }
            .cta-button {
              display: inline-block;
              background-color: #2563eb;
              color: #ffffff !important;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .cta-button:hover {
              background-color: #1d4ed8;
            }
            .details {
              background-color: #f9fafb;
              padding: 16px;
              border-radius: 4px;
              margin: 20px 0;
            }
            .details-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .details-row:last-child {
              border-bottom: none;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">TaxBridge</div>
            </div>

            <h2>Hi ${name},</h2>

            <div class="alert-box">
              <div class="alert-title">
                ${isUrgent ? '🚨 Urgent Action Required' : '⚠️ Payment Issue'}
              </div>
              <p>
                ${
                  isUrgent
                    ? `We've attempted to charge your card ${attempts} times, but all attempts have failed. Your TaxBridge Pro subscription will be canceled if payment is not received within 7 days.`
                    : 'We were unable to process your subscription payment. Your TaxBridge Pro account is still active, but we need you to update your payment method.'
                }
              </p>
            </div>

            <div class="details">
              <div class="details-row">
                <strong>Amount Due:</strong>
                <span>$${amount}</span>
              </div>
              <div class="details-row">
                <strong>Payment Attempts:</strong>
                <span>${attempts}</span>
              </div>
              <div class="details-row">
                <strong>Status:</strong>
                <span style="color: #dc2626; font-weight: 600;">Past Due</span>
              </div>
            </div>

            <h3>What to do next:</h3>
            <ol>
              <li><strong>Update your payment method</strong> - Your current card may be expired or have insufficient funds</li>
              <li><strong>Verify billing details</strong> - Ensure your billing address matches your card</li>
              <li><strong>Contact your bank</strong> - Some banks block international or subscription charges</li>
            </ol>

            <div style="text-align: center;">
              <a href="${invoiceUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`}" class="cta-button">
                ${invoiceUrl ? 'Pay Invoice Now' : 'Update Payment Method'}
              </a>
            </div>

            <p style="margin-top: 30px;">
              <strong>Need help?</strong><br>
              If you're having trouble updating your payment method, reply to this email or contact us at support@taxbridge.com. We're here to help!
            </p>

            ${
              isUrgent
                ? `
              <div class="alert-box" style="margin-top: 30px;">
                <p style="margin: 0;">
                  <strong>Important:</strong> To avoid service interruption, please update your payment method within the next 7 days. After that, your account will be downgraded to the Free tier.
                </p>
              </div>
            `
                : ''
            }

            <div class="footer">
              <p>
                TaxBridge - Cross-Border Tax Calculator<br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription" style="color: #2563eb;">Manage Subscription</a> |
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" style="color: #2563eb;">Get Support</a>
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
                You received this email because a payment for your TaxBridge Pro subscription failed.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Hi ${name},

${
  isUrgent
    ? `URGENT: We've attempted to charge your card ${attempts} times, but all attempts have failed. Your TaxBridge Pro subscription will be canceled if payment is not received within 7 days.`
    : 'We were unable to process your subscription payment. Your TaxBridge Pro account is still active, but we need you to update your payment method.'
}

Amount Due: $${amount}
Payment Attempts: ${attempts}
Status: Past Due

What to do next:
1. Update your payment method - Your current card may be expired or have insufficient funds
2. Verify billing details - Ensure your billing address matches your card
3. Contact your bank - Some banks block international or subscription charges

${invoiceUrl ? `Pay your invoice: ${invoiceUrl}` : `Update payment method: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`}

Need help? Reply to this email or contact us at support@taxbridge.com.

${isUrgent ? 'IMPORTANT: To avoid service interruption, please update your payment method within the next 7 days.' : ''}

---
TaxBridge - Cross-Border Tax Calculator
Manage Subscription: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription
    `.trim();

    const result = await resend.emails.send({
      from: 'TaxBridge <notifications@taxbridge.com>',
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
      tags: [
        { name: 'category', value: 'payment_failed' },
        { name: 'user_id', value: String(userId) },
        { name: 'urgency', value: isUrgent ? 'high' : 'medium' },
      ],
    });

    logger.info('Payment failed email sent', {
      userId: String(userId),
      email,
      attemptCount: attempts,
      isUrgent,
      emailId: result.data?.id || 'unknown',
    });

    return NextResponse.json({
      success: true,
      emailId: result.data?.id || 'unknown',
    });
  } catch (error) {
    logger.error('Failed to send payment failed email', {
      error: error instanceof Error ? error : new Error(String(error)),
    });

    Sentry.captureException(error, {
      level: 'error',
      tags: { route: '/api/email/payment-failed' },
    });

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
