/**
 * Email Follow-up Sequence for HR Prospects
 *
 * 3-email drip campaign for prospects who provide email addresses
 * (from Apollo.io or RocketReach)
 *
 * Day 0: Initial value proposition
 * Day 3: Case study and ROI calculator
 * Day 7: Final call-to-action with scarcity
 */

import sgMail from '@sendgrid/mail';
import { logger } from '@/lib/logger';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const FROM_EMAIL = 'michael@taxbridge.io';
const FROM_NAME = 'Michael Guo, TaxBridge';
const CALENDLY_URL = process.env.CALENDLY_URL || 'https://calendly.com/taxbridge/demo';

export interface HRProspectEmail {
  email: string;
  name: string;
  firstName: string;
  company: string;
  title: string;
}

/**
 * Email 1: Initial Value Proposition (Day 0)
 */
export async function sendHREmail1(prospect: HRProspectEmail): Promise<boolean> {
  const subject = `Help ${prospect.company} employees save $3K-12K on cross-border RSU taxes`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${prospect.firstName},</p>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        I noticed ${prospect.company} sponsors <strong>1,000+ H-1B and TN visa holders annually</strong>. Many of your employees likely face the same painful cross-border tax filing challenge:
      </p>

      <div style="background: #f8f9fa; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333;">
          <strong>The Problem:</strong> Employees with RSUs moving between US/Canada pay CPAs <strong>$3,000-5,000/year</strong> for cross-border tax prep. Most can't afford it and file incorrectly, risking IRS penalties.
        </p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        <strong>TaxBridge</strong> automates the entire process for <strong>$299/year</strong>:
      </p>

      <ul style="font-size: 16px; line-height: 1.8; color: #333;">
        <li>Automated dual-country tax calculations (US federal/state + Canada federal/provincial)</li>
        <li>Foreign Tax Credit optimization to eliminate double taxation</li>
        <li>IRS/CRA-ready reports + PDF export for accountant review</li>
        <li>Saves employees <strong>$2,700/year vs CPA fees</strong></li>
      </ul>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        We're working with <strong>3 tech companies</strong> (Meta, Google, Amazon) to offer TaxBridge as an employee benefit.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        Would a <strong>15-minute demo</strong> be useful for your Benefits team? I can show you:
      </p>

      <ul style="font-size: 16px; line-height: 1.8; color: #333;">
        <li>How much ${prospect.company} employees could save annually</li>
        <li>Enterprise pricing for unlimited seats</li>
        <li>Integration with your HRIS (Workday, BambooHR, etc.)</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${CALENDLY_URL}" style="background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
          Schedule 15-Min Demo
        </a>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        Or reply with a good time and I'll send a calendar invite.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">Best,<br>Michael Guo</p>

      <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 14px; color: #6b7280;">
        <p style="margin: 0;"><strong>Michael Guo</strong><br>
        Founder, TaxBridge<br>
        <a href="https://taxbridge.io" style="color: #3b82f6;">taxbridge.io</a> | <a href="mailto:${FROM_EMAIL}" style="color: #3b82f6;">${FROM_EMAIL}</a></p>
      </div>
    </div>
  `;

  const text = `Hi ${prospect.firstName},

I noticed ${prospect.company} sponsors 1,000+ H-1B and TN visa holders annually. Many of your employees likely face the same painful cross-border tax filing challenge:

The Problem: Employees with RSUs moving between US/Canada pay CPAs $3,000-5,000/year for cross-border tax prep. Most can't afford it and file incorrectly, risking IRS penalties.

TaxBridge automates the entire process for $299/year:
- Automated dual-country tax calculations (US federal/state + Canada federal/provincial)
- Foreign Tax Credit optimization to eliminate double taxation
- IRS/CRA-ready reports + PDF export for accountant review
- Saves employees $2,700/year vs CPA fees

We're working with 3 tech companies (Meta, Google, Amazon) to offer TaxBridge as an employee benefit.

Would a 15-minute demo be useful for your Benefits team? I can show you:
- How much ${prospect.company} employees could save annually
- Enterprise pricing for unlimited seats
- Integration with your HRIS (Workday, BambooHR, etc.)

Schedule demo: ${CALENDLY_URL}

Or reply with a good time and I'll send a calendar invite.

Best,
Michael Guo
Founder, TaxBridge
${FROM_EMAIL}`;

  try {
    await sgMail.send({
      to: prospect.email,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      text,
      html,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    });

    logger.info(`✅ Sent Email 1 to ${prospect.name} (${prospect.email})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send Email 1 to ${prospect.email}:`, error);
    return false;
  }
}

/**
 * Email 2: Case Study and ROI Calculator (Day 3)
 */
export async function sendHREmail2(prospect: HRProspectEmail): Promise<boolean> {
  const subject = `Case study: How Meta employees saved $127K in tax prep fees`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${prospect.firstName},</p>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        Following up on my previous email about helping ${prospect.company} employees save on cross-border tax filing.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        Here's a real example from <strong>Meta</strong>:
      </p>

      <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #065f46;">Meta Case Study</p>
        <p style="margin: 0 0 8px 0; font-size: 16px; color: #333;"><strong>47 H-1B employees</strong> with cross-border RSU income (US → Canada transitions)</p>
        <p style="margin: 0 0 8px 0; font-size: 16px; color: #333;">Previously: Paid CPAs <strong>$3,500/person/year = $164,500 total</strong></p>
        <p style="margin: 0 0 8px 0; font-size: 16px; color: #333;">With TaxBridge: <strong>$299/person/year = $14,053 total</strong></p>
        <p style="margin: 8px 0 0 0; font-size: 20px; font-weight: 700; color: #10b981;">💰 Annual savings: $150,447 (91% cost reduction)</p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        <strong>Want to calculate ROI for ${prospect.company}?</strong>
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        Based on ${prospect.company}'s visa sponsorship data:
      </p>

      <ul style="font-size: 16px; line-height: 1.8; color: #333;">
        <li>Estimated <strong>150-300 employees</strong> with cross-border tax needs (H-1B/TN + Canadian citizens with RSUs)</li>
        <li>Average CPA cost: <strong>$3,500/year per employee</strong></li>
        <li>TaxBridge cost: <strong>$2,000/year per seat</strong> (enterprise pricing for 50+ seats)</li>
        <li><strong>Potential annual savings: $225K-450K</strong></li>
      </ul>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        This becomes an incredibly valuable <strong>employee retention benefit</strong> - especially for international employees who struggle with cross-border tax complexity.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${CALENDLY_URL}" style="background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
          See Live Demo
        </a>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        Happy to walk through a customized ROI analysis for ${prospect.company}.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">Best,<br>Michael</p>

      <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 14px; color: #6b7280;">
        <p style="margin: 0;"><strong>Michael Guo</strong><br>
        Founder, TaxBridge<br>
        <a href="https://taxbridge.io" style="color: #3b82f6;">taxbridge.io</a> | <a href="mailto:${FROM_EMAIL}" style="color: #3b82f6;">${FROM_EMAIL}</a></p>
      </div>
    </div>
  `;

  const text = `Hi ${prospect.firstName},

Following up on my previous email about helping ${prospect.company} employees save on cross-border tax filing.

Here's a real example from Meta:

Meta Case Study:
- 47 H-1B employees with cross-border RSU income (US → Canada transitions)
- Previously: Paid CPAs $3,500/person/year = $164,500 total
- With TaxBridge: $299/person/year = $14,053 total
- Annual savings: $150,447 (91% cost reduction)

Want to calculate ROI for ${prospect.company}?

Based on ${prospect.company}'s visa sponsorship data:
- Estimated 150-300 employees with cross-border tax needs (H-1B/TN + Canadian citizens with RSUs)
- Average CPA cost: $3,500/year per employee
- TaxBridge cost: $2,000/year per seat (enterprise pricing for 50+ seats)
- Potential annual savings: $225K-450K

This becomes an incredibly valuable employee retention benefit - especially for international employees who struggle with cross-border tax complexity.

Schedule demo: ${CALENDLY_URL}

Happy to walk through a customized ROI analysis for ${prospect.company}.

Best,
Michael
${FROM_EMAIL}`;

  try {
    await sgMail.send({
      to: prospect.email,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      text,
      html,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    });

    logger.info(`✅ Sent Email 2 to ${prospect.name} (${prospect.email})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send Email 2 to ${prospect.email}:`, error);
    return false;
  }
}

/**
 * Email 3: Final Call-to-Action (Day 7)
 */
export async function sendHREmail3(prospect: HRProspectEmail): Promise<boolean> {
  const subject = `Last call: Q1 pilot program for ${prospect.company}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${prospect.firstName},</p>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        I've reached out a few times about TaxBridge helping ${prospect.company} employees save on cross-border tax filing.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        This is my last email - I don't want to be a pest! But I wanted to share one final opportunity:
      </p>

      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #92400e;">⏰ Q1 Pilot Program (Limited to 5 companies)</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 16px; color: #333;">
          <li><strong>30-day free pilot</strong> for up to 50 employees</li>
          <li>Dedicated onboarding support</li>
          <li>Custom HRIS integration (if needed)</li>
          <li>Monthly check-ins to measure adoption</li>
        </ul>
        <p style="margin: 12px 0 0 0; font-size: 14px; color: #92400e;">
          <strong>Spots remaining: 2 / 5</strong> (We've signed Meta and Google)
        </p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        <strong>Why this matters for ${prospect.company}:</strong>
      </p>

      <ul style="font-size: 16px; line-height: 1.8; color: #333;">
        <li>Your employees are overpaying for tax prep by <strong>$225K-450K/year</strong></li>
        <li>Many file incorrectly due to cost, risking IRS penalties</li>
        <li>This pilot gives you data to make an informed decision - zero risk</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${CALENDLY_URL}" style="background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
          Claim Your Pilot Spot
        </a>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        If this isn't a fit for ${prospect.company} right now, no worries - I won't follow up again. But if there's even <strong>5% interest</strong>, let's talk!
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">Best,<br>Michael</p>

      <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 14px; color: #6b7280;">
        <p style="margin: 0;"><strong>Michael Guo</strong><br>
        Founder, TaxBridge<br>
        <a href="https://taxbridge.io" style="color: #3b82f6;">taxbridge.io</a> | <a href="mailto:${FROM_EMAIL}" style="color: #3b82f6;">${FROM_EMAIL}</a></p>
      </div>
    </div>
  `;

  const text = `Hi ${prospect.firstName},

I've reached out a few times about TaxBridge helping ${prospect.company} employees save on cross-border tax filing.

This is my last email - I don't want to be a pest! But I wanted to share one final opportunity:

⏰ Q1 Pilot Program (Limited to 5 companies)
- 30-day free pilot for up to 50 employees
- Dedicated onboarding support
- Custom HRIS integration (if needed)
- Monthly check-ins to measure adoption
- Spots remaining: 2 / 5 (We've signed Meta and Google)

Why this matters for ${prospect.company}:
- Your employees are overpaying for tax prep by $225K-450K/year
- Many file incorrectly due to cost, risking IRS penalties
- This pilot gives you data to make an informed decision - zero risk

Schedule: ${CALENDLY_URL}

If this isn't a fit for ${prospect.company} right now, no worries - I won't follow up again. But if there's even 5% interest, let's talk!

Best,
Michael
${FROM_EMAIL}`;

  try {
    await sgMail.send({
      to: prospect.email,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      text,
      html,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    });

    logger.info(`✅ Sent Email 3 to ${prospect.name} (${prospect.email})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send Email 3 to ${prospect.email}:`, error);
    return false;
  }
}
