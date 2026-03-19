/**
 * Re-engagement Email Templates
 * Inactive user nudges and win-back campaigns
 */

import { generateEmailUrls } from './utm-tracking';
import { logger } from '@/lib/logger';

export interface ReengagementEmailData {
  firstName: string;
  email: string;
  daysSinceLastActive: number;
  totalCalculations: number;
  hasCompletedProfile: boolean;
  dashboardUrl: string;
  calculatorUrl: string;
  supportUrl: string;
  unsubscribeUrl: string;
}

/**
 * Generate "Did you finish your taxes?" nudge email for inactive users
 */
export function getInactiveUserNudgeEmail(params: {
  firstName: string;
  email: string;
  daysSinceLastActive: number;
  totalCalculations: number;
  hasCompletedProfile: boolean;
}): { subject: string; html: string; text: string; data: ReengagementEmailData } {
  const urls = generateEmailUrls('reengagement_inactive', 'control', params.email);

  const data: ReengagementEmailData = {
    firstName: params.firstName || 'there',
    email: params.email,
    daysSinceLastActive: params.daysSinceLastActive,
    totalCalculations: params.totalCalculations,
    hasCompletedProfile: params.hasCompletedProfile,
    dashboardUrl: urls.dashboard_url,
    calculatorUrl: urls.calculator_url,
    supportUrl: 'https://taxbridge.app/support',
    unsubscribeUrl: urls.unsubscribe_url,
  };

  // Personalize subject line based on user history
  let subject = '';
  if (params.totalCalculations === 0) {
    subject = `${params.firstName}, ready to calculate your tax savings?`;
  } else if (params.totalCalculations < 3) {
    subject = `${params.firstName}, finish your tax filing with TaxBridge`;
  } else {
    subject = `${params.firstName}, did you complete your tax return?`;
  }

  const html = generateInactiveUserNudgeHTML(data);
  const text = generateInactiveUserNudgeText(data);

  return { subject, html, text, data };
}

/**
 * HTML template for inactive user nudge
 */
function generateInactiveUserNudgeHTML(data: ReengagementEmailData): string {
  const { firstName, totalCalculations, hasCompletedProfile, dashboardUrl, calculatorUrl, unsubscribeUrl } = data;

  // Personalize message based on user journey stage
  let headlineMessage = '';
  let bodyMessage = '';
  let ctaText = '';
  let ctaUrl = '';

  if (totalCalculations === 0) {
    headlineMessage = 'Ready to calculate your cross-border tax savings?';
    bodyMessage = `You signed up for TaxBridge but haven't calculated your taxes yet. H-1B and TN visa holders with RSUs can save <strong>$5,000-$15,000</strong> using Foreign Tax Credits.`;
    ctaText = 'Calculate My Tax Savings';
    ctaUrl = calculatorUrl;
  } else if (!hasCompletedProfile) {
    headlineMessage = 'Complete your profile to unlock all features';
    bodyMessage = `You've started ${totalCalculations} calculation${totalCalculations > 1 ? 's' : ''}, but your profile is incomplete. Finish setting up to get personalized tax insights and filing recommendations.`;
    ctaText = 'Complete My Profile';
    ctaUrl = dashboardUrl;
  } else {
    headlineMessage = 'Did you finish filing your taxes?';
    bodyMessage = `We noticed you haven't been back in a while. Tax season is here, and we want to make sure you claim all your cross-border deductions and credits.`;
    ctaText = 'View My Dashboard';
    ctaUrl = dashboardUrl;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headlineMessage}</title>
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
    .headline {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 20px;
      line-height: 1.3;
    }
    .body-text {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 24px;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #1d4ed8;
    }
    .benefits {
      background-color: #f9fafb;
      border-left: 4px solid #2563eb;
      padding: 20px;
      margin: 24px 0;
    }
    .benefits h3 {
      margin-top: 0;
      color: #1f2937;
      font-size: 18px;
    }
    .benefits ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .benefits li {
      margin: 8px 0;
      color: #4b5563;
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

    <p>Hi ${firstName},</p>

    <div class="headline">
      ${headlineMessage}
    </div>

    <div class="body-text">
      ${bodyMessage}
    </div>

    <div class="benefits">
      <h3>What you get with TaxBridge:</h3>
      <ul>
        <li><strong>Dual tax calculator</strong> - See exactly what you owe in both US and Canada</li>
        <li><strong>Foreign Tax Credit optimizer</strong> - Maximize your FTC savings (avg. $8,500/year)</li>
        <li><strong>Form checklist</strong> - Never miss a required form (1040, T1, 8833, etc.)</li>
        <li><strong>Multi-year planning</strong> - Plan RSU vesting schedules for tax optimization</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
    </div>

    <div class="body-text" style="margin-top: 30px;">
      Tax deadline is approaching fast. Don't leave money on the table — let TaxBridge help you file correctly and save thousands.
    </div>

    <div class="body-text">
      Questions? Reply to this email or visit our <a href="${dashboardUrl}" style="color: #2563eb;">help center</a>.
    </div>

    <p>
      Best,<br>
      <strong>The TaxBridge Team</strong>
    </p>

    <div class="footer">
      <p>
        You're receiving this because you signed up for TaxBridge.<br>
        <a href="${unsubscribeUrl}">Unsubscribe</a> from re-engagement emails
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
}

/**
 * Plain text version for email clients that don't support HTML
 */
function generateInactiveUserNudgeText(data: ReengagementEmailData): string {
  const { firstName, totalCalculations, hasCompletedProfile, dashboardUrl, calculatorUrl, unsubscribeUrl } = data;

  let headlineMessage = '';
  let bodyMessage = '';
  let ctaUrl = '';

  if (totalCalculations === 0) {
    headlineMessage = 'Ready to calculate your cross-border tax savings?';
    bodyMessage = `You signed up for TaxBridge but haven't calculated your taxes yet. H-1B and TN visa holders with RSUs can save $5,000-$15,000 using Foreign Tax Credits.`;
    ctaUrl = calculatorUrl;
  } else if (!hasCompletedProfile) {
    headlineMessage = 'Complete your profile to unlock all features';
    bodyMessage = `You've started ${totalCalculations} calculation${totalCalculations > 1 ? 's' : ''}, but your profile is incomplete. Finish setting up to get personalized tax insights.`;
    ctaUrl = dashboardUrl;
  } else {
    headlineMessage = 'Did you finish filing your taxes?';
    bodyMessage = `We noticed you haven't been back in a while. Tax season is here — let's make sure you claim all your cross-border deductions.`;
    ctaUrl = dashboardUrl;
  }

  return `
Hi ${firstName},

${headlineMessage}

${bodyMessage}

What you get with TaxBridge:
- Dual tax calculator - See exactly what you owe in both US and Canada
- Foreign Tax Credit optimizer - Maximize your FTC savings (avg. $8,500/year)
- Form checklist - Never miss a required form (1040, T1, 8833, etc.)
- Multi-year planning - Plan RSU vesting schedules for tax optimization

Get started now: ${ctaUrl}

Tax deadline is approaching fast. Don't leave money on the table.

Questions? Reply to this email.

Best,
The TaxBridge Team

---
Unsubscribe: ${unsubscribeUrl}
TaxBridge - Cross-Border Tax Calculator for H-1B & TN Visa Holders
© ${new Date().getFullYear()} TaxBridge. All rights reserved.
  `.trim();
}

/**
 * Send re-engagement email to an inactive user
 */
export async function sendReengagementEmail(params: {
  email: string;
  firstName: string;
  daysSinceLastActive: number;
  totalCalculations: number;
  hasCompletedProfile: boolean;
}): Promise<boolean> {
  try {
    const { sendEmail } = await import('./sendgrid');
    const { subject, html, text } = getInactiveUserNudgeEmail(params);

    await sendEmail({
      to: params.email,
      subject,
      html,
      text,
      from: {
        email: 'support@taxbridge.app',
        name: 'TaxBridge',
      },
    });

    logger.info(`✓ Re-engagement email sent to ${params.email}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to send re-engagement email to ${params.email}:`, error);
    return false;
  }
}
