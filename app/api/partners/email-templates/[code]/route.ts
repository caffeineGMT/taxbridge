/**
 * Email Templates API for Partners
 * Returns pre-written email templates for client outreach
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAffiliatePartnerByReferralCode } from '@/lib/db/queries/affiliates';
import { generateEmailTemplates } from '@/lib/partners/marketing-content';

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

    const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app'}/p/${code}`;
    const templates = generateEmailTemplates(partner.firm_name, partner.partner_name, referralUrl);

    // Return as HTML page
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Templates - ${partner.firm_name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; background: #0f172a; color: #e2e8f0; }
    h1 { color: #10b981; margin-bottom: 10px; }
    .subtitle { color: #94a3b8; margin-bottom: 40px; }
    .template { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .template h2 { color: #10b981; margin-top: 0; font-size: 18px; }
    .template .audience { color: #94a3b8; font-size: 14px; margin-bottom: 16px; }
    .template .subject { background: #0f172a; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; }
    .template .body { background: #0f172a; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-family: monospace; font-size: 13px; line-height: 1.6; }
    .copy-btn { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 12px; }
    .copy-btn:hover { background: #059669; }
    .header { text-align: center; margin-bottom: 40px; }
    @media print { body { background: white; color: black; } .template { border-color: #ccc; } .copy-btn { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Email Templates for ${partner.firm_name}</h1>
    <p class="subtitle">Pre-written client outreach templates - customize as needed</p>
  </div>

  ${templates.map((template, idx) => `
    <div class="template">
      <h2>Template ${idx + 1}: ${template.subject}</h2>
      <div class="audience">Target Audience: ${template.targetAudience}</div>
      <div class="subject">Subject: ${template.subject}</div>
      <div class="body" id="template-${idx}">${template.body}</div>
      <button class="copy-btn" onclick="copyTemplate(${idx})">Copy to Clipboard</button>
    </div>
  `).join('')}

  <script>
    function copyTemplate(idx) {
      const text = document.getElementById('template-' + idx).innerText;
      navigator.clipboard.writeText(text);
      event.target.innerText = 'Copied!';
      setTimeout(() => { event.target.innerText = 'Copy to Clipboard'; }, 2000);
    }
  </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating email templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
