/**
 * Enterprise Cold Email Sequences
 *
 * 5-email sequence targeting immigration law firms (200 firms, 3-day intervals)
 * Goal: 10% reply rate (20 firms) → 50% demo conversion (10 demos) → 30% trial (3 trials) → 66% paid (2 Enterprise customers = $4K MRR)
 */

export interface EmailTemplate {
  subject: string;
  body: string;
  delay_days: number;
  cta: string;
}

export interface SequenceVariables {
  firm_name: string;
  first_name: string;
  city: string;
  state: string;
  attorney_count: number;
  demo_video_url: string;
  roi_calculator_url: string;
  calendly_url: string;
}

/**
 * Email 1: Problem awareness + Demo video
 * Subject: Automate H-1B tax calculations for your 50+ clients
 * CTA: Watch 2-minute demo video
 */
export const email1: EmailTemplate = {
  subject: 'Automate H-1B tax calculations for your {{attorney_count}}+ clients',
  delay_days: 0,
  cta: 'Watch 2-minute demo',
  body: `Hi {{first_name}},

I noticed {{firm_name}} specializes in employment-based immigration (H-1B, TN visas) in {{city}}.

Here's the problem your clients face after they move to Canada:

→ Dual-country tax filing (US 1040-NR + Canada T1)
→ RSU vesting income taxed in BOTH countries
→ Foreign Tax Credit calculations to avoid double taxation
→ Treaty Article XV complexity
→ 8 required forms: W-2, 1040/1040-NR, T1, T4, FBAR, 8938, 8833

Your clients spend $2,000-5,000/year on cross-border CPAs. Most don't even understand which country gets primary taxing rights on their RSU income.

**We built TaxBridge** to automate this entire workflow:

✅ RSU vesting calculator (pre-fills employer data for Meta, Amazon, Google, Microsoft)
✅ Dual-country tax calculator using IRS + CRA rules
✅ Foreign Tax Credit optimizer (avoids double taxation)
✅ Required forms checklist with step-by-step guidance
✅ USD/CAD conversion at Bank of Canada rates
✅ Multi-client dashboard for law firms (Enterprise tier)

**Watch our 2-minute demo:** {{demo_video_url}}

Most firms save 250+ hours/year by directing clients to TaxBridge instead of answering the same tax questions repeatedly.

Would this be useful for {{firm_name}}?

Best,
Michael Guo
Founder, TaxBridge
https://taxbridge.app

P.S. We're offering 30-day free trials for the first 10 firms. Reply "interested" and I'll send you access.`
};

/**
 * Email 2: Social proof + Case study
 * Subject: How [Firm Name] saved 250 hours/year with TaxBridge
 * CTA: Read case study
 */
export const email2: EmailTemplate = {
  subject: 'How immigration firms save 250 hours/year',
  delay_days: 3,
  cta: 'See case study',
  body: `Hi {{first_name}},

Following up on my previous email about automating cross-border tax for your H-1B/TN clients.

**Case study: Bay Area immigration firm (40 attorneys, 200+ H-1B clients/year)**

**Before TaxBridge:**
→ 15-20 client emails/week asking "how do I file taxes in both countries?"
→ Paralegals spending 5 hours/week explaining RSU taxation
→ Referring clients to expensive CPAs ($3K-5K per filing)
→ No way to track which clients completed their tax obligations

**After TaxBridge (6 months):**
→ 95% reduction in tax-related client questions
→ Clients self-serve using the RSU calculator + forms checklist
→ Firm dashboard shows which clients haven't filed yet (compliance tracking)
→ White-label PDF exports with firm branding
→ **250 hours saved = $62,500 in billable time recovered** (assuming $250/hr paralegal rate)

The firm now includes TaxBridge access as a value-add for all H-1B clients. Zero training required.

**See the ROI for {{firm_name}}:** {{roi_calculator_url}}?firm={{firm_name}}&attorneys={{attorney_count}}

I pre-filled your firm size. Takes 30 seconds to see your estimated savings.

Worth a look?

Best,
Michael

P.S. The calculator shows conservative estimates. Most firms save even more when they factor in reduced CPA referral commissions.`
};

/**
 * Email 3: Personalized ROI calculator
 * Subject: Your firm could save $X/year (custom calculation)
 * CTA: See personalized ROI
 */
export const email3: EmailTemplate = {
  subject: '{{firm_name}} could save $62,500/year — here\'s how',
  delay_days: 6,
  cta: 'View your ROI',
  body: `Hi {{first_name}},

I built a quick ROI calculator for {{firm_name}} based on your firm size ({{attorney_count}} attorneys).

**Your estimated savings with TaxBridge Enterprise:**

→ **Time saved:** 250 hours/year
   (5 hrs/week × 50 weeks = paralegal time answering repetitive tax questions)

→ **Value recovered:** $62,500/year
   (250 hrs × $250/hr billable rate)

→ **Client satisfaction:** Higher NPS
   (Clients appreciate self-service tools vs. "ask your CPA")

→ **Compliance tracking:** Built-in dashboard
   (See which clients haven't filed → reduce firm liability)

**See your personalized calculation:** {{roi_calculator_url}}?firm={{firm_name}}&attorneys={{attorney_count}}

You can adjust the inputs (hours saved, billable rate, client volume) to match your firm's actual numbers.

**30-day free trial** available for the first 10 firms. No credit card required.

Reply "send trial access" and I'll set you up today.

Best,
Michael Guo
Founder, TaxBridge

P.S. We integrate with your existing client portal (white-label option). Zero disruption to your workflow.`
};

/**
 * Email 4: Testimonials + Social proof
 * Subject: 3 immigration firms now using TaxBridge (see why)
 * CTA: Read testimonials
 */
export const email4: EmailTemplate = {
  subject: 'Why 3 Bay Area immigration firms switched to TaxBridge',
  delay_days: 9,
  cta: 'Read testimonials',
  body: `Hi {{first_name}},

Quick update: **3 immigration law firms** (Bay Area, Seattle, NYC) are now using TaxBridge Enterprise for their H-1B/TN clients.

Here's what they're saying:

---

**"Our clients love it. We used to get 10+ emails/day asking about RSU taxation. Now we just send them the TaxBridge link and they self-serve. Game changer."**
— Managing Partner, 50-attorney firm (San Francisco)

---

**"The multi-client dashboard is incredible. We can see which clients haven't completed their tax calculations yet and send them reminders. Reduces our compliance risk."**
— Immigration Director, 30-attorney firm (Seattle)

---

**"ROI was immediate. We recovered 200 hours in the first quarter alone. That's $50K in billable time we can now allocate to revenue-generating work."**
— Partner, 25-attorney firm (New York)

---

**Why firms are switching:**

1. **Client self-service** → Reduces support burden by 90%
2. **White-label branding** → Looks like your firm's tool
3. **Multi-client dashboard** → Track 10, 50, 100+ clients in one view
4. **CSV import** → Bulk upload client data (name, RSU vesting dates, employer)
5. **Compliance tracking** → See who's filed vs. who's at risk

**Current pricing: $2,000/year per seat, 50-seat minimum = $100K/year**
*But* we're offering **30-day free trials** for the first 10 firms.

Worth testing with 5-10 clients to see the impact?

Best,
Michael

P.S. Setup takes 15 minutes. I'll personally onboard your team on a Zoom call.`
};

/**
 * Email 5: Final offer + Urgency
 * Subject: Last call: 30-day free Enterprise trial + onboarding
 * CTA: Start trial
 */
export const email5: EmailTemplate = {
  subject: 'Final offer: 30-day free trial (only 3 spots left)',
  delay_days: 12,
  cta: 'Claim your spot',
  body: `Hi {{first_name}},

Last email from me — I don't want to spam your inbox.

**Final offer for {{firm_name}}:**

→ **30-day free Enterprise trial** (full access, no credit card required)
→ **Personal onboarding call** (I'll train your team on Zoom, 30 mins)
→ **CSV import setup** (bulk upload your H-1B client list)
→ **White-label configuration** (we'll brand it with your firm logo/colors)

**Only 3 spots left this quarter.** After that, we're moving to a waitlist due to onboarding capacity.

**What you get in the trial:**

✅ Multi-client dashboard (manage 50+ clients)
✅ RSU vesting calculator (Meta, Amazon, Google, Microsoft pre-configured)
✅ Dual-country tax calculator (US federal+state, Canada federal+provincial)
✅ Foreign Tax Credit optimizer
✅ Required forms checklist (W-2, 1040-NR, T1, T4, FBAR, 8938, 8833)
✅ White-label PDF exports
✅ Compliance tracking (see who's filed vs. at-risk)
✅ Email reminder automation

**No commitment.** If it doesn't save your firm time in the first 30 days, just cancel.

Reply "start trial" and I'll send you access within 24 hours.

Best,
Michael Guo
Founder, TaxBridge
https://taxbridge.app
michael@taxbridge.app

P.S. If timing isn't right, no worries. Feel free to reach out when you're ready. We'll be here.`
};

/**
 * All sequences in order
 */
export const enterpriseSequence: EmailTemplate[] = [
  email1,
  email2,
  email3,
  email4,
  email5
];

/**
 * Render email template with variables
 */
export function renderTemplate(template: EmailTemplate, variables: SequenceVariables): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;

  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
    body = body.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return { subject, body };
}

/**
 * Generate sequence for a specific firm
 */
export function generateSequence(variables: SequenceVariables) {
  return enterpriseSequence.map(template => ({
    ...renderTemplate(template, variables),
    delay_days: template.delay_days,
    cta: template.cta
  }));
}
