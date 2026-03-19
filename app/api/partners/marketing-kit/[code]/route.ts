/**
 * Marketing Kit API for Partners
 * Generates downloadable marketing materials PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAffiliatePartnerByReferralCode } from '@/lib/db/queries/affiliates';
import { generateMarketingCopy } from '@/lib/partners/marketing-content';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    const partner = getAffiliatePartnerByReferralCode(code);

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    if (partner.status !== 'approved') {
      return NextResponse.json(
        { error: 'Partner not approved' },
        { status: 403 }
      );
    }

    const marketingCopy = generateMarketingCopy();
    const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app'}/p/${code}`;

    // Return as HTML page with marketing materials
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Marketing Kit - ${partner.firm_name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 1000px; margin: 40px auto; padding: 20px; background: #0f172a; color: #e2e8f0; }
    h1 { color: #10b981; margin-bottom: 10px; text-align: center; }
    h2 { color: #3b82f6; margin-top: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
    .subtitle { color: #94a3b8; margin-bottom: 40px; text-align: center; }
    .section { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .value-prop { background: #0f172a; padding: 12px 16px; border-radius: 8px; margin: 8px 0; border-left: 3px solid #10b981; }
    .faq { background: #0f172a; padding: 16px; border-radius: 8px; margin: 12px 0; }
    .faq-question { color: #10b981; font-weight: 600; margin-bottom: 8px; }
    .faq-answer { color: #cbd5e1; line-height: 1.6; }
    .url-box { background: #0f172a; border: 2px solid #10b981; padding: 16px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: 600; color: #10b981; margin: 20px 0; }
    .logo-placeholder { background: linear-gradient(135deg, #3b82f6, #10b981); height: 200px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px; font-weight: bold; margin: 20px 0; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; color: #cbd5e1; }
    @media print { body { background: white; color: black; } .section { border-color: #ccc; page-break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>TaxBridge Marketing Kit</h1>
  <p class="subtitle">Partner: ${partner.firm_name}</p>

  <div class="section">
    <h2>Your Co-Branded Referral Link</h2>
    <div class="url-box">${referralUrl}</div>
    <p style="text-align: center; color: #94a3b8;">Share this link with clients to track referrals and earn commissions</p>
  </div>

  <div class="section">
    <h2>TaxBridge Logo</h2>
    <div class="logo-placeholder">T</div>
    <p style="color: #94a3b8; text-align: center;">Full logo assets available upon request - contact partners@taxbridge.app</p>
  </div>

  <div class="section">
    <h2>Product Description</h2>
    <h3 style="color: #10b981; margin-top: 20px;">Short (1-2 sentences)</h3>
    <p>${marketingCopy.shortDescription}</p>

    <h3 style="color: #10b981; margin-top: 24px;">Long (Full description)</h3>
    <p>${marketingCopy.longDescription}</p>
  </div>

  <div class="section">
    <h2>Key Value Propositions</h2>
    ${marketingCopy.valueProps.map(prop => `
      <div class="value-prop">✓ ${prop}</div>
    `).join('')}
  </div>

  <div class="section">
    <h2>Frequently Asked Questions</h2>
    ${marketingCopy.faqs.map(faq => `
      <div class="faq">
        <div class="faq-question">Q: ${faq.question}</div>
        <div class="faq-answer">A: ${faq.answer}</div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>Partner Commission Details</h2>
    <ul>
      <li><strong>Commission Rate:</strong> ${(partner.commission_rate * 100).toFixed(0)}% recurring</li>
      <li><strong>Pro Plan Commission:</strong> $${(299 * partner.commission_rate).toFixed(2)} per annual subscription</li>
      <li><strong>Enterprise Plan Commission:</strong> $${(2000 * partner.commission_rate).toFixed(2)} per annual subscription</li>
      <li><strong>Payment Schedule:</strong> Monthly payouts via Stripe Connect within 30 days of month end</li>
      <li><strong>Cookie Duration:</strong> 30 days from click</li>
    </ul>
  </div>

  <div class="section" style="text-align: center; background: linear-gradient(135deg, #10b981, #3b82f6); color: white;">
    <h2 style="color: white; border: none; margin-top: 0;">Ready to Get Started?</h2>
    <p style="color: white; font-size: 18px; margin: 20px 0;">Share your referral link and start earning commissions today!</p>
    <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 8px; display: inline-block; margin-top: 12px;">
      ${referralUrl}
    </div>
  </div>

  <div style="text-align: center; margin-top: 40px; padding: 20px; color: #64748b; font-size: 14px;">
    <p>Questions? Contact us at partners@taxbridge.app</p>
    <p>© 2024 TaxBridge. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/partners/marketing-kit/[code]', method: request.method });
  }
}
