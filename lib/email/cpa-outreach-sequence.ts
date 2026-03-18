/**
 * CPA Partner Outreach Email Sequence
 *
 * 3-email sequence optimized for immigration law firms
 * targeting H-1B/TN clients with RSU compensation
 */

export interface EmailTemplate {
  day: number;
  subject: string;
  body: string;
  cta: string;
  type: 'intro' | 'follow-up' | 'value-add';
}

/**
 * Generate personalized email sequence
 */
export function generateEmailSequence(
  firmName: string,
  contactName: string,
  city: string
): EmailTemplate[] {
  const firstName = contactName.split(' ')[0];

  return [
    // Email 1: Initial outreach (Day 0)
    {
      day: 0,
      type: 'intro',
      subject: `Partnership opportunity: Help your H-1B clients with RSU taxes`,
      body: `Hi ${firstName},

I noticed ${firmName} specializes in employment-based immigration in ${city}. Many of your H-1B and TN clients likely receive RSU compensation from tech companies (Meta, Google, Amazon, etc.).

We built TaxBridge specifically for this cross-border tax complexity:

• Tracks RSU vesting schedules across US and Canada
• Calculates dual-country tax liability with Foreign Tax Credit optimization
• Generates Form 1116 recommendations automatically
• Handles currency conversion and multi-year scenarios

**Why partner with us:**
→ 20% recurring commission on every client referral
→ Co-branded landing page with your firm name
→ Pre-written email templates and social posts
→ Real-time analytics dashboard

Your clients get accurate tax calculations. You earn passive income. Win-win.

Interested in a quick 15-min demo?

Best,
Michael Guo
Founder, TaxBridge
https://taxbridge.app`,
      cta: 'Schedule 15-min demo'
    },

    // Email 2: Follow-up with social proof (Day 3)
    {
      day: 3,
      type: 'follow-up',
      subject: `Re: Partnership opportunity`,
      body: `Hi ${firstName},

Following up on my previous email about TaxBridge.

Quick context: We're already working with immigration law firms in SF, Seattle, and NYC. Their H-1B clients love the tool because it saves them $500-2,000 in accountant fees every tax season.

**What makes us different:**
• Built specifically for cross-border RSU taxation (not generic tax software)
• Covers 100% of H-1B → Canada immigration scenarios
• $299/year vs. $1,500+ for manual CPA calculations
• Free 14-day trial with full feature access

**Your commission:**
• Pro Plan ($299/yr) = $59.80 per client per year
• Enterprise ($2,000/yr) = $400 per client per year
• Recurring revenue as long as they stay subscribed

Average firm refers 10-20 clients in the first year = $600-1,200 recurring income.

Would you have 10 minutes this week to see the platform?

Best,
Michael`,
      cta: 'Reply to schedule'
    },

    // Email 3: Video demo + final value-add (Day 7)
    {
      day: 7,
      type: 'value-add',
      subject: `[Video] See how TaxBridge helps your H-1B clients`,
      body: `Hi ${firstName},

I recorded a quick 2-minute video showing exactly how TaxBridge works for your H-1B clients moving to Canada:

[VIDEO DEMO LINK - to be recorded]

**Real example:**
→ Client: H-1B holder at Meta, moving to Vancouver
→ RSU grants: $200K vesting over 4 years
→ Tax challenge: US taxed at vesting, Canada taxes at sale, need to claim FTC
→ TaxBridge solution: Calculates exact FTC amounts, generates Form 1116, saves ~$12K

**Your partner benefits:**
✓ Co-branded landing page: yourfirm.com/taxbridge
✓ Marketing kit with email templates, social posts, FAQs
✓ Monthly performance reports (referrals, revenue, conversions)
✓ 20% commission paid automatically via Stripe

**What other firms are saying:**
"We refer every H-1B client who mentions RSUs. Easy passive income."
— Immigration Partner, Seattle

This is my last email, but if you're interested, I'm happy to get you set up this week.

Best,
Michael

P.S. If H-1B/RSU clients aren't your focus, no worries! Let me know if there's someone else at ${firmName} I should connect with.`,
      cta: 'Watch demo & reply'
    }
  ];
}

/**
 * Generate approval email for new partners
 */
export function generateApprovalEmail(
  partnerName: string,
  firmName: string,
  referralCode: string,
  landingPageUrl: string,
  portalUrl: string
): {
  subject: string;
  body: string;
} {
  return {
    subject: `Welcome to TaxBridge Partner Program! Your referral link is ready`,
    body: `Hi ${partnerName},

Great news! ${firmName} has been approved for the TaxBridge Partner Program.

**Your Partner Resources:**

🔗 **Co-Branded Landing Page:**
${landingPageUrl}

Share this link with your H-1B/TN clients. It features ${firmName}'s name and builds instant credibility.

📊 **Partner Portal:**
${portalUrl}

Track your referrals, commissions, and performance in real-time.

📧 **Marketing Resources:**
• Email templates (5 pre-written)
• Social media posts (LinkedIn, Twitter)
• Marketing kit with FAQs and value props
• Monthly performance reports

All available in your partner portal.

**Commission Structure:**
• 20% recurring on all subscriptions
• Pro Plan ($299/yr) = $59.80/client/year
• Enterprise ($2,000/yr) = $400/client/year
• Paid monthly via Stripe

**Next Steps:**
1. Log into your partner portal
2. Download email templates and marketing kit
3. Share your co-branded landing page with clients
4. Track conversions in your dashboard

**Support:**
Email me directly at michael@taxbridge.app with any questions. I'm here to help you succeed.

Looking forward to a great partnership!

Best,
Michael Guo
Founder, TaxBridge
https://taxbridge.app

---

**Quick Tips for Success:**
• Mention TaxBridge during H-1B status update calls
• Add a signature line: "Need help with RSU taxes? Check out TaxBridge (link)"
• Post once on LinkedIn with your referral link
• Forward to clients who mention stock compensation

Most partners get their first referral within 2 weeks of sharing the link.
`
  };
}

/**
 * Export sequence for Instantly.ai CSV upload
 */
export function formatForInstantly(
  firmName: string,
  contactEmail: string,
  contactName: string,
  city: string,
  state: string
): {
  email: string;
  firstName: string;
  firmName: string;
  city: string;
  state: string;
  email1Subject: string;
  email1Body: string;
  email2Subject: string;
  email2Body: string;
  email3Subject: string;
  email3Body: string;
} {
  const sequence = generateEmailSequence(firmName, contactName, city);
  const firstName = contactName.split(' ')[0];

  return {
    email: contactEmail,
    firstName,
    firmName,
    city,
    state,
    email1Subject: sequence[0].subject,
    email1Body: sequence[0].body,
    email2Subject: sequence[1].subject,
    email2Body: sequence[1].body,
    email3Subject: sequence[2].subject,
    email3Body: sequence[2].body
  };
}
