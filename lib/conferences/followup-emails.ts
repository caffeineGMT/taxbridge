import type { ConferenceLead } from './leads';
import type { ConferenceConfig } from './config';

export interface FollowupEmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function getExpiryDate(conference: ConferenceConfig): string {
  const date = new Date(conference.date);
  date.setDate(date.getDate() + conference.discountExpiryDays);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function generateFollowupEmail(lead: ConferenceLead, conference: ConferenceConfig): FollowupEmailData {
  const firstName = lead.first_name;
  const discountCode = conference.discountCode;
  const discountPercent = conference.discountPercent;
  const expiryDate = getExpiryDate(conference);
  const conferenceName = conference.shortName;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app';
  const demoUrl = `${appUrl}/demo?ref=${conference.refParam}&lead=${lead.id}`;
  const signupUrl = `${appUrl}/signup?ref=${conference.refParam}&code=${discountCode}`;

  const subject = `Great meeting you at ${conferenceName} - Your ${discountPercent}% discount inside`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo h1 { color: #10b981; font-size: 28px; margin: 0; }
    h2 { color: #0f172a; font-size: 22px; margin-top: 0; }
    p { color: #334155; font-size: 16px; }
    .discount-box { background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .discount-code { font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 8px 0; }
    .discount-details { font-size: 14px; opacity: 0.9; }
    .cta-button { display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 16px 0; }
    .cta-button:hover { background: #059669; }
    .benefits { background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .benefits li { color: #334155; margin-bottom: 8px; }
    .case-study { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .case-study p { color: #1e40af; font-size: 14px; margin: 4px 0; }
    .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 13px; }
    .footer a { color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <h1>TaxBridge</h1>
      </div>

      <h2>Hi ${firstName},</h2>

      <p>It was great connecting with you at <strong>${conferenceName}</strong>! I wanted to follow up on our conversation about simplifying cross-border RSU tax calculations for your ${lead.title ? lead.title.toLowerCase().includes('lawyer') || lead.title.toLowerCase().includes('attorney') ? 'clients' : 'team' : 'clients'}.</p>

      <p>As I mentioned at our booth, TaxBridge automates the complex US-Canada dual-country tax calculations that H-1B and TN visa holders face with their RSU income. What typically takes 3+ hours with a CPA takes just 10 minutes with our platform.</p>

      <div class="discount-box">
        <div class="discount-details">${conferenceName} Exclusive - ${discountPercent}% Off</div>
        <div class="discount-code">${discountCode}</div>
        <div class="discount-details">Valid until ${expiryDate}</div>
      </div>

      <div style="text-align: center;">
        <a href="${signupUrl}" class="cta-button">Claim Your Discount</a>
      </div>

      <div class="benefits">
        <p style="font-weight: 600; color: #059669; margin-top: 0;">What TaxBridge Does for Your Clients:</p>
        <ul>
          <li><strong>Saves $3K</strong> in CPA fees per client per year</li>
          <li><strong>Saves $12K</strong> in commonly overpaid taxes</li>
          <li><strong>10-minute</strong> automated dual-country calculation</li>
          <li><strong>Foreign Tax Credit</strong> optimization (IRS Form 1116 + CRA T2209)</li>
          <li><strong>Treaty benefits</strong> automatically applied</li>
        </ul>
      </div>

      <div class="case-study">
        <p><strong>Case Study: Meta Senior Engineer</strong></p>
        <p>A Meta L6 engineer moving from Seattle to Vancouver had $450K in RSU vesting. TaxBridge identified $12,400 in Foreign Tax Credit optimization that their previous CPA had missed, plus correctly applied the Canada-US Tax Treaty Article XV provisions.</p>
      </div>

      <p>I'd love to give you a personalized demo showing exactly how TaxBridge handles your specific client scenarios.</p>

      <div style="text-align: center;">
        <a href="${demoUrl}" class="cta-button" style="background: #3b82f6;">Schedule a Demo</a>
      </div>

      <p style="margin-top: 24px;">Looking forward to helping your practice,</p>
      <p style="margin-bottom: 0;">
        <strong>The TaxBridge Team</strong><br>
        <span style="color: #64748b; font-size: 14px;">Cross-Border RSU Tax Automation</span><br>
        <a href="${appUrl}" style="color: #10b981; font-size: 14px;">${appUrl.replace('https://', '')}</a>
      </p>
    </div>

    <div class="footer">
      <p>You're receiving this because you visited our booth at ${conferenceName}.<br>
      <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(lead.email)}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${firstName},

It was great connecting with you at ${conferenceName}! I wanted to follow up on our conversation about simplifying cross-border RSU tax calculations.

TaxBridge automates the complex US-Canada dual-country tax calculations that H-1B and TN visa holders face with their RSU income. What typically takes 3+ hours with a CPA takes just 10 minutes with our platform.

YOUR EXCLUSIVE DISCOUNT: ${discountCode} (${discountPercent}% off)
Valid until ${expiryDate}

Claim your discount: ${signupUrl}

WHAT TAXBRIDGE DOES:
- Saves $3K in CPA fees per client per year
- Saves $12K in commonly overpaid taxes
- 10-minute automated dual-country calculation
- Foreign Tax Credit optimization
- Treaty benefits automatically applied

CASE STUDY: A Meta L6 engineer moving from Seattle to Vancouver had $450K in RSU vesting. TaxBridge identified $12,400 in FTC optimization that their previous CPA had missed.

Schedule a demo: ${demoUrl}

Looking forward to helping your practice,
The TaxBridge Team
${appUrl}`;

  return { to: lead.email, subject, html, text };
}

export function generateBatchFollowupEmails(
  leads: ConferenceLead[],
  conference: ConferenceConfig
): FollowupEmailData[] {
  return leads.map(lead => generateFollowupEmail(lead, conference));
}
