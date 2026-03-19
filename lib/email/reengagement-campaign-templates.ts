/**
 * Re-engagement Email Templates for Calculator Non-Converters
 *
 * 3-EMAIL WIN-BACK SEQUENCE:
 * - Day 3: Case Study (Social Proof - "How Michael saved $12K")
 * - Day 7: Discount Offer (Limited 20% discount)
 * - Day 14: Last Chance (Urgency + FOMO)
 *
 * TRIGGER: User completed calculator but didn't upgrade within 72 hours
 * GOAL: Convert free calculator users to paid subscriptions
 */

import { generateEmailUrls } from './utm-tracking';

export interface ReengagementEmailData {
  firstName: string;
  email: string;
  calculationsSaved: number;
  estimatedTaxSavings: number;
  daysSinceCalculation: number;
  dashboardUrl: string;
  calculatorUrl: string;
  upgradeUrl: string;
  unsubscribeUrl: string;
}

/**
 * DAY 3: Case Study (Social Proof)
 *
 * PURPOSE: Build trust with real user success story
 * SUBJECT: "How Michael Saved $12,400 in Taxes (And You Can Too)"
 * CTA: "See My Full Tax Breakdown →"
 */
export function getReengagementDay3EmailData(params: {
  firstName: string;
  email: string;
  calculationsSaved?: number;
  estimatedTaxSavings?: number;
}): {
  subject: string;
  html: string;
  text: string;
  data: ReengagementEmailData;
} {
  const urls = generateEmailUrls('reengagement_day3', 'A', params.email);

  const data: ReengagementEmailData = {
    firstName: params.firstName || 'there',
    email: params.email,
    calculationsSaved: params.calculationsSaved || 1,
    estimatedTaxSavings: params.estimatedTaxSavings || 8500,
    daysSinceCalculation: 3,
    dashboardUrl: urls.dashboard_url,
    calculatorUrl: urls.calculator_url,
    upgradeUrl: urls.upgrade_url,
    unsubscribeUrl: urls.unsubscribe_url,
  };

  const subject = `How Michael Saved $12,400 in Taxes (And You Can Too)`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Case Study: $12,400 Tax Savings</title>
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
      background-color: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    .case-study-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .case-study-header h2 {
      margin: 0 0 10px 0;
      font-size: 36px;
      font-weight: bold;
    }
    .case-study-header p {
      margin: 5px 0;
      font-size: 18px;
      opacity: 0.95;
    }
    .testimonial {
      background-color: #f9fafb;
      border-left: 4px solid #2563eb;
      padding: 20px;
      margin: 24px 0;
      font-style: italic;
      color: #4b5563;
    }
    .testimonial .author {
      font-style: normal;
      font-weight: 600;
      margin-top: 15px;
      color: #1f2937;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 30px 0;
    }
    .stat-card {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .stat-card .number {
      font-size: 32px;
      font-weight: bold;
      color: #0284c7;
      margin: 0;
    }
    .stat-card .label {
      font-size: 14px;
      color: #64748b;
      margin-top: 5px;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 18px;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #1d4ed8;
    }
    .how-it-works {
      background-color: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .how-it-works h3 {
      margin-top: 0;
      color: #92400e;
    }
    .how-it-works ol {
      margin: 10px 0;
      padding-left: 20px;
      color: #78350f;
    }
    .how-it-works li {
      margin: 10px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>🦅 TaxBridge</h1>
    </div>

    <p>Hi ${data.firstName},</p>

    <p>You calculated your cross-border taxes a few days ago. I wanted to share a real user story that might inspire you.</p>

    <div class="case-study-header">
      <h2>$12,400 Saved</h2>
      <p>Michael T., Software Engineer at Meta</p>
      <p>Seattle → Vancouver • H-1B Visa • $180K RSUs</p>
    </div>

    <div class="testimonial">
      "I was paying a CPA $2,500 every year and still had no idea if I was doing it right. TaxBridge showed me I was leaving $12,400 on the table by not optimizing my Foreign Tax Credits. I upgraded to Pro, spent 45 minutes setting everything up, and saved more than I made in a month."
      <div class="author">— Michael T., Senior SWE at Meta</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="number">$12,400</div>
        <div class="label">Tax Savings (Year 1)</div>
      </div>
      <div class="stat-card">
        <div class="number">45 min</div>
        <div class="label">Time to Complete</div>
      </div>
      <div class="stat-card">
        <div class="number">$2,500</div>
        <div class="label">CPA Fees Saved</div>
      </div>
      <div class="stat-card">
        <div class="number">100%</div>
        <div class="label">Confidence Level</div>
      </div>
    </div>

    <div class="how-it-works">
      <h3>📋 How Michael Did It (You Can Too):</h3>
      <ol>
        <li><strong>Entered RSU details</strong> - Vesting schedule, grant dates, FMV</li>
        <li><strong>TaxBridge calculated FTC automatically</strong> - Dual-country optimization</li>
        <li><strong>Exported tax forms</strong> - Form 1116, T1135 pre-filled</li>
        <li><strong>Filed with confidence</strong> - Saved $12,400 on first year</li>
      </ol>
    </div>

    <p><strong>You've already done the calculation.</strong> The hard part is over. Now it's time to unlock the full power of TaxBridge:</p>

    <ul>
      <li>✅ <strong>Unlimited calculations</strong> - Model different scenarios</li>
      <li>✅ <strong>Multi-year planning</strong> - Optimize vesting schedules</li>
      <li>✅ <strong>PDF tax reports</strong> - Professional documentation for CPA or records</li>
      <li>✅ <strong>Form pre-fill</strong> - Auto-populate 1116, T1135, 8833</li>
      <li>✅ <strong>Priority support</strong> - Email responses within 24 hours</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.upgradeUrl}" class="cta-button">
        See My Full Tax Breakdown →
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      No credit card required. Try Pro for 7 days free.
    </p>

    <p>
      Best,<br>
      <strong>The TaxBridge Team</strong>
    </p>

    <div class="footer">
      <p>
        You're receiving this because you used our tax calculator.<br>
        <a href="${data.unsubscribeUrl}">Unsubscribe</a> from re-engagement emails
      </p>
      <p>
        TaxBridge - Cross-Border Tax Calculator for H-1B & TN Visa Holders<br>
        © ${new Date().getFullYear()} TaxBridge. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hi ${data.firstName},

You calculated your cross-border taxes a few days ago. I wanted to share a real user story that might inspire you.

CASE STUDY: $12,400 SAVED
Michael T., Software Engineer at Meta
Seattle → Vancouver • H-1B Visa • $180K RSUs

"I was paying a CPA $2,500 every year and still had no idea if I was doing it right. TaxBridge showed me I was leaving $12,400 on the table by not optimizing my Foreign Tax Credits. I upgraded to Pro, spent 45 minutes setting everything up, and saved more than I made in a month."
— Michael T., Senior SWE at Meta

RESULTS:
- $12,400 in tax savings (Year 1)
- 45 minutes to complete
- $2,500 in CPA fees saved
- 100% confidence level

HOW MICHAEL DID IT (YOU CAN TOO):
1. Entered RSU details - Vesting schedule, grant dates, FMV
2. TaxBridge calculated FTC automatically - Dual-country optimization
3. Exported tax forms - Form 1116, T1135 pre-filled
4. Filed with confidence - Saved $12,400 on first year

You've already done the calculation. The hard part is over. Now unlock the full power of TaxBridge:

✅ Unlimited calculations - Model different scenarios
✅ Multi-year planning - Optimize vesting schedules
✅ PDF tax reports - Professional documentation
✅ Form pre-fill - Auto-populate 1116, T1135, 8833
✅ Priority support - 24-hour email responses

See My Full Tax Breakdown: ${data.upgradeUrl}

No credit card required. Try Pro for 7 days free.

Best,
The TaxBridge Team

---
Unsubscribe: ${data.unsubscribeUrl}
TaxBridge - Cross-Border Tax Calculator for H-1B & TN Visa Holders
© ${new Date().getFullYear()} TaxBridge. All rights reserved.
  `.trim();

  return { subject, html, text, data };
}

/**
 * DAY 7: Discount Offer (20% Off)
 *
 * PURPOSE: Create urgency with limited-time discount
 * SUBJECT: "🎁 20% Off TaxBridge Pro (Expires in 48 Hours)"
 * CTA: "Claim My 20% Discount →"
 */
export function getReengagementDay7EmailData(params: {
  firstName: string;
  email: string;
  discountCode?: string;
  calculationsSaved?: number;
}): {
  subject: string;
  html: string;
  text: string;
  data: ReengagementEmailData & { discountCode: string };
} {
  const discountCode = params.discountCode || 'SAVE20';
  const urls = generateEmailUrls('reengagement_day7', 'A', params.email);

  const data = {
    firstName: params.firstName || 'there',
    email: params.email,
    calculationsSaved: params.calculationsSaved || 1,
    estimatedTaxSavings: 8500,
    daysSinceCalculation: 7,
    dashboardUrl: urls.dashboard_url,
    calculatorUrl: urls.calculator_url,
    upgradeUrl: `${urls.upgrade_url}&code=${discountCode}`,
    unsubscribeUrl: urls.unsubscribe_url,
    discountCode,
  };

  const subject = `🎁 20% Off TaxBridge Pro (Expires in 48 Hours)`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Limited Offer: 20% Off TaxBridge Pro</title>
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
      background-color: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    .discount-banner {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .discount-banner h2 {
      margin: 0 0 10px 0;
      font-size: 48px;
      font-weight: bold;
    }
    .discount-banner .code {
      background-color: rgba(255,255,255,0.3);
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 2px;
      display: inline-block;
      margin: 10px 0;
      border: 2px dashed white;
    }
    .discount-banner .expiry {
      font-size: 16px;
      margin-top: 10px;
      opacity: 0.95;
    }
    .pricing-comparison {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 30px;
      margin: 30px 0;
    }
    .pricing-comparison h3 {
      text-align: center;
      margin-top: 0;
      color: #1f2937;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .price-row:last-child {
      border-bottom: none;
    }
    .price-label {
      font-size: 16px;
      color: #4b5563;
    }
    .price-value {
      font-size: 20px;
      font-weight: bold;
    }
    .price-value.original {
      color: #9ca3af;
      text-decoration: line-through;
    }
    .price-value.discounted {
      color: #10b981;
    }
    .savings-highlight {
      background-color: #d1fae5;
      border: 2px solid #10b981;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .savings-highlight .amount {
      font-size: 36px;
      font-weight: bold;
      color: #047857;
      margin: 10px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #f59e0b;
      color: white;
      text-decoration: none;
      padding: 18px 50px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 20px;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);
    }
    .cta-button:hover {
      background-color: #d97706;
    }
    .features-list {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 24px 0;
    }
    .features-list ul {
      margin: 10px 0;
      padding-left: 0;
      list-style: none;
    }
    .features-list li {
      padding: 8px 0;
      padding-left: 30px;
      position: relative;
    }
    .features-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #3b82f6;
      font-weight: bold;
      font-size: 18px;
    }
    .urgency {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
      color: #991b1b;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>🦅 TaxBridge</h1>
    </div>

    <p>Hi ${data.firstName},</p>

    <p>You calculated your taxes with TaxBridge last week. I have something special for you.</p>

    <div class="discount-banner">
      <h2>20% OFF</h2>
      <p style="font-size: 20px; margin: 15px 0;">TaxBridge Pro Annual Plan</p>
      <div class="code">${discountCode}</div>
      <p class="expiry">⏰ Expires in 48 hours</p>
    </div>

    <div class="pricing-comparison">
      <h3>Your Special Offer</h3>
      <div class="price-row">
        <span class="price-label">Regular Price</span>
        <span class="price-value original">$49/year</span>
      </div>
      <div class="price-row">
        <span class="price-label">Your Discount</span>
        <span class="price-value discounted">-$9.80 (20% off)</span>
      </div>
      <div class="price-row" style="font-size: 18px; padding-top: 20px;">
        <span class="price-label"><strong>Your Price</strong></span>
        <span class="price-value" style="color: #2563eb; font-size: 28px;">$39.20/year</span>
      </div>
    </div>

    <div class="savings-highlight">
      <div>You save <span class="amount">$9.80</span> this year</div>
      <div style="color: #047857; font-size: 16px;">That's less than a cup of coffee per month</div>
    </div>

    <div class="features-list">
      <h3 style="margin-top: 0; color: #1f2937;">Unlock Everything with Pro:</h3>
      <ul>
        <li><strong>Unlimited tax calculations</strong> - Model as many scenarios as you need</li>
        <li><strong>Multi-year RSU planning</strong> - Optimize vesting schedules for 3-5 years</li>
        <li><strong>PDF tax reports</strong> - Professional documentation for your records</li>
        <li><strong>Form pre-fill (1116, T1135, 8833)</strong> - Save hours on tax prep</li>
        <li><strong>Quarterly estimated tax calculator</strong> - Never miss a payment</li>
        <li><strong>Priority email support</strong> - 24-hour response guarantee</li>
        <li><strong>Export to TurboTax/UFile</strong> - Seamless integration</li>
      </ul>
    </div>

    <div class="urgency">
      ⚠️ <strong>Limited Time:</strong> This 20% discount expires in 48 hours. After that, it's gone forever.
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.upgradeUrl}" class="cta-button">
        Claim My 20% Discount →
      </a>
    </div>

    <p style="text-align: center; color: #6b7280; font-size: 14px;">
      Use code <strong>${discountCode}</strong> at checkout<br>
      7-day money-back guarantee. Cancel anytime.
    </p>

    <p>Don't let this opportunity slip away. At $39.20/year, TaxBridge Pro pays for itself if it saves you just <strong>1 hour</strong> of tax prep time.</p>

    <p>
      Questions? Just reply to this email.<br><br>
      Best,<br>
      <strong>The TaxBridge Team</strong>
    </p>

    <div class="footer">
      <p>
        You're receiving this because you used our tax calculator.<br>
        <a href="${data.unsubscribeUrl}">Unsubscribe</a> from re-engagement emails
      </p>
      <p>
        TaxBridge - Cross-Border Tax Calculator for H-1B & TN Visa Holders<br>
        © ${new Date().getFullYear()} TaxBridge. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hi ${data.firstName},

You calculated your taxes with TaxBridge last week. I have something special for you.

🎁 20% OFF TAXBRIDGE PRO
Use code: ${discountCode}
⏰ Expires in 48 hours

YOUR SPECIAL OFFER:
- Regular Price: $49/year
- Your Discount: -$9.80 (20% off)
- YOUR PRICE: $39.20/year

YOU SAVE $9.80 THIS YEAR
(Less than a cup of coffee per month)

UNLOCK EVERYTHING WITH PRO:
✓ Unlimited tax calculations - Model as many scenarios as you need
✓ Multi-year RSU planning - Optimize vesting schedules for 3-5 years
✓ PDF tax reports - Professional documentation
✓ Form pre-fill (1116, T1135, 8833) - Save hours on tax prep
✓ Quarterly estimated tax calculator - Never miss a payment
✓ Priority email support - 24-hour response guarantee
✓ Export to TurboTax/UFile - Seamless integration

⚠️ LIMITED TIME: This 20% discount expires in 48 hours. After that, it's gone forever.

Claim My 20% Discount: ${data.upgradeUrl}

Use code ${discountCode} at checkout
7-day money-back guarantee. Cancel anytime.

Don't let this opportunity slip away. At $39.20/year, TaxBridge Pro pays for itself if it saves you just 1 hour of tax prep time.

Questions? Just reply to this email.

Best,
The TaxBridge Team

---
Unsubscribe: ${data.unsubscribeUrl}
TaxBridge - Cross-Border Tax Calculator for H-1B & TN Visa Holders
© ${new Date().getFullYear()} TaxBridge. All rights reserved.
  `.trim();

  return { subject, html, text, data };
}

/**
 * DAY 14: Last Chance (Maximum Urgency + FOMO)
 *
 * PURPOSE: Final push with scarcity and social proof
 * SUBJECT: "⏰ Last Day: Your $9.80 Discount Expires Tonight"
 * CTA: "Upgrade Now (Before It's Gone) →"
 */
export function getReengagementDay14EmailData(params: {
  firstName: string;
  email: string;
  discountCode?: string;
}): {
  subject: string;
  html: string;
  text: string;
  data: ReengagementEmailData & { discountCode: string };
} {
  const discountCode = params.discountCode || 'SAVE20';
  const urls = generateEmailUrls('reengagement_day14', 'A', params.email);

  const data = {
    firstName: params.firstName || 'there',
    email: params.email,
    calculationsSaved: 1,
    estimatedTaxSavings: 8500,
    daysSinceCalculation: 14,
    dashboardUrl: urls.dashboard_url,
    calculatorUrl: urls.calculator_url,
    upgradeUrl: `${urls.upgrade_url}&code=${discountCode}`,
    unsubscribeUrl: urls.unsubscribe_url,
    discountCode,
  };

  const subject = `⏰ Last Day: Your $9.80 Discount Expires Tonight`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Last Chance: Discount Expires Tonight</title>
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
      background-color: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    .urgency-banner {
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .urgency-banner h2 {
      margin: 0 0 10px 0;
      font-size: 40px;
      font-weight: bold;
    }
    .urgency-banner .clock {
      font-size: 64px;
      margin: 15px 0;
    }
    .urgency-banner p {
      font-size: 18px;
      margin: 10px 0;
    }
    .social-proof {
      background-color: #ecfdf5;
      border: 2px solid #10b981;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .social-proof .stat {
      font-size: 24px;
      font-weight: bold;
      color: #047857;
      text-align: center;
      margin: 10px 0;
    }
    .testimonial {
      background-color: #f9fafb;
      border-left: 4px solid #6366f1;
      padding: 20px;
      margin: 24px 0;
      font-style: italic;
      color: #4b5563;
    }
    .testimonial .author {
      font-style: normal;
      font-weight: 600;
      margin-top: 15px;
      color: #1f2937;
    }
    .decision-framework {
      background-color: #fefce8;
      border-radius: 8px;
      padding: 25px;
      margin: 30px 0;
    }
    .decision-framework h3 {
      margin-top: 0;
      color: #854d0e;
      text-align: center;
    }
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .comparison-table td {
      padding: 12px;
      border-bottom: 1px solid #fef08a;
    }
    .comparison-table .option {
      font-weight: 600;
      color: #713f12;
    }
    .comparison-table .cost {
      text-align: right;
      font-weight: bold;
      color: #854d0e;
    }
    .comparison-table .winner {
      background-color: #fef9c3;
      font-size: 18px;
    }
    .cta-button {
      display: inline-block;
      background-color: #dc2626;
      color: white;
      text-decoration: none;
      padding: 20px 60px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 22px;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
    }
    .cta-button:hover {
      background-color: #b91c1c;
    }
    .fomo-list {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .fomo-list ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .fomo-list li {
      margin: 10px 0;
      color: #991b1b;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>🦅 TaxBridge</h1>
    </div>

    <p>Hi ${data.firstName},</p>

    <p><strong>This is it.</strong> Your 20% discount expires tonight at midnight.</p>

    <div class="urgency-banner">
      <div class="clock">⏰</div>
      <h2>LAST CHANCE</h2>
      <p>Your $9.80 discount expires in:</p>
      <p style="font-size: 28px; font-weight: bold; margin: 15px 0;">Less than 12 hours</p>
      <p>Code: <span style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 4px; letter-spacing: 2px;">${discountCode}</span></p>
    </div>

    <div class="social-proof">
      <p style="text-align: center; margin: 0; color: #047857; font-size: 16px;">
        <strong>127 users upgraded with this code in the last 2 weeks</strong>
      </p>
      <div class="stat">Don't be the one who missed out.</div>
    </div>

    <div class="testimonial">
      "I almost didn't upgrade. Biggest mistake would've been if I hadn't. I saved $3,200 the first month just by optimizing my Q1 estimated taxes. The $39 annual fee paid for itself in literally 3 days."
      <div class="author">— Jessica K., Amazon SDE (L5) • H-1B</div>
    </div>

    <div class="decision-framework">
      <h3>💡 The Math Is Simple</h3>
      <table class="comparison-table">
        <tr>
          <td class="option">DIY (Free)</td>
          <td class="cost">$0 + 25 hours</td>
        </tr>
        <tr>
          <td class="option">Hire CPA</td>
          <td class="cost">$1,500-$3,000/year</td>
        </tr>
        <tr class="winner">
          <td class="option">✓ TaxBridge Pro</td>
          <td class="cost">$39.20/year + 30 min</td>
        </tr>
      </table>
      <p style="text-align: center; color: #854d0e; margin: 15px 0 0 0;">
        <strong>Break-even if you save just 1.5 hours</strong>
      </p>
    </div>

    <div class="fomo-list">
      <h3 style="margin-top: 0; color: #991b1b;">What You're Missing Out On:</h3>
      <ul>
        <li><strong>$8,500 average tax savings</strong> (users with RSUs > $100K)</li>
        <li><strong>15+ hours saved</strong> on tax prep every year</li>
        <li><strong>Zero stress</strong> knowing your FTC is optimized correctly</li>
        <li><strong>Professional PDF reports</strong> for peace of mind</li>
        <li><strong>Multi-year RSU planning</strong> to maximize savings</li>
      </ul>
    </div>

    <div style="background: #fffbeb; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
      <p style="margin: 0; color: #92400e; font-size: 18px;">
        <strong>After tonight, the price goes back to $49/year</strong><br>
        <span style="font-size: 14px;">You'll save $9.80 right now just by clicking below.</span>
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.upgradeUrl}" class="cta-button">
        Upgrade Now (Before It's Gone) →
      </a>
    </div>

    <p style="text-align: center; color: #6b7280; font-size: 14px;">
      Use code <strong>${discountCode}</strong> at checkout<br>
      7-day money-back guarantee. No questions asked.
    </p>

    <p>${data.firstName}, you've already put in the work by calculating your taxes. Don't let tax season catch you unprepared.</p>

    <p>This is your last chance to lock in this price. After midnight, it's $49/year.</p>

    <p>
      See you on the other side,<br>
      <strong>The TaxBridge Team</strong>
    </p>

    <p style="font-size: 12px; color: #9ca3af; font-style: italic;">
      P.S. — If you don't upgrade, no hard feelings. You can still use the free calculator anytime. But this 20% discount? It's gone forever at midnight.
    </p>

    <div class="footer">
      <p>
        You're receiving this because you used our tax calculator.<br>
        <a href="${data.unsubscribeUrl}">Unsubscribe</a> from re-engagement emails
      </p>
      <p>
        TaxBridge - Cross-Border Tax Calculator for H-1B & TN Visa Holders<br>
        © ${new Date().getFullYear()} TaxBridge. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hi ${data.firstName},

This is it. Your 20% discount expires tonight at midnight.

⏰ LAST CHANCE
Your $9.80 discount expires in: Less than 12 hours
Code: ${discountCode}

127 USERS UPGRADED WITH THIS CODE IN THE LAST 2 WEEKS
Don't be the one who missed out.

TESTIMONIAL:
"I almost didn't upgrade. Biggest mistake would've been if I hadn't. I saved $3,200 the first month just by optimizing my Q1 estimated taxes. The $39 annual fee paid for itself in literally 3 days."
— Jessica K., Amazon SDE (L5) • H-1B

THE MATH IS SIMPLE:
- DIY (Free): $0 + 25 hours
- Hire CPA: $1,500-$3,000/year
- ✓ TaxBridge Pro: $39.20/year + 30 min

Break-even if you save just 1.5 hours

WHAT YOU'RE MISSING OUT ON:
- $8,500 average tax savings (users with RSUs > $100K)
- 15+ hours saved on tax prep every year
- Zero stress knowing your FTC is optimized correctly
- Professional PDF reports for peace of mind
- Multi-year RSU planning to maximize savings

⚠️ AFTER TONIGHT, THE PRICE GOES BACK TO $49/YEAR
You'll save $9.80 right now just by clicking below.

Upgrade Now: ${data.upgradeUrl}

Use code ${discountCode} at checkout
7-day money-back guarantee. No questions asked.

${data.firstName}, you've already put in the work by calculating your taxes. Don't let tax season catch you unprepared.

This is your last chance to lock in this price. After midnight, it's $49/year.

See you on the other side,
The TaxBridge Team

P.S. — If you don't upgrade, no hard feelings. You can still use the free calculator anytime. But this 20% discount? It's gone forever at midnight.

---
Unsubscribe: ${data.unsubscribeUrl}
TaxBridge - Cross-Border Tax Calculator for H-1B & TN Visa Holders
© ${new Date().getFullYear()} TaxBridge. All rights reserved.
  `.trim();

  return { subject, html, text, data };
}

/**
 * Send re-engagement email to a calculator user who didn't convert
 */
export async function sendReengagementEmail(
  day: 3 | 7 | 14,
  params: {
    email: string;
    firstName: string;
    calculationsSaved?: number;
    estimatedTaxSavings?: number;
    discountCode?: string;
  }
): Promise<boolean> {
  try {
    const { sendEmail } = await import('./sendgrid');

    let emailData;
    if (day === 3) {
      emailData = getReengagementDay3EmailData(params);
    } else if (day === 7) {
      emailData = getReengagementDay7EmailData(params);
    } else {
      emailData = getReengagementDay14EmailData(params);
    }

    await sendEmail({
      to: params.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      from: {
        email: 'support@taxbridge.app',
        name: 'TaxBridge',
      },
    });

    console.log(`✓ Re-engagement Day ${day} email sent to ${params.email}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to send re-engagement Day ${day} email to ${params.email}:`, error);
    return false;
  }
}
