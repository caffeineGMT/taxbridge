export interface CPAPartnerEmailData {
  cpaName: string;
  cpaFirmName: string;
  cpaWebsite?: string;
  numberOfClients?: number;
  specialization?: string; // e.g., "cross-border tax"
}

export function getCPAPartnerEmail(data: CPAPartnerEmailData): {
  subject: string;
  body: string;
} {
  const { cpaName, cpaFirmName, cpaWebsite, numberOfClients, specialization } = data;

  const subject = `Partnership Opportunity: Automated US-Canada Tax Tool for Your ${specialization || 'Cross-Border'} Clients`;

  const body = `Hi ${cpaName},

I hope this email finds you well. I'm reaching out because I built a tool that could save you 5-10 hours per cross-border tax client while adding a recurring revenue stream to your practice.

**The Problem:**

You know firsthand that US-Canada cross-border tax for H-1B/TN workers with RSUs is:
- Time-intensive (foreign tax credit calculations, treaty benefits, multi-year projections)
- Error-prone (Sprintax and TurboTax don't handle RSU vesting schedules correctly)
- Hard to scale (each client requires custom spreadsheets and manual calculations)

Your clients need expert guidance, but the grunt work of tax calculations eats into your profitability.

**The Solution:**

TaxBridge is a specialized calculator that automates the heavy lifting:
- Calculates exact US and Canada tax liability across multiple years
- Handles complex RSU vesting schedules and double taxation scenarios
- Generates Form 1116 worksheets and CPA-ready documentation
- Designed by CPAs who specialize in cross-border tax

**Partnership Offer:**

I'd like to offer you a **30% revenue share** for every client you refer:
- Your client pays $79/year for premium access
- You earn $23.70 per client, per year (recurring)
- ${numberOfClients ? `If you refer ${Math.min(numberOfClients, 30)} clients, that's $${(numberOfClients * 23.7).toFixed(2)}/year passive income` : 'Most CPA partners earn $1,000-$3,000/year'}
- **Plus:** You can white-label the tool and charge clients separately for your expert review

**Why This Works:**

✅ **Saves you time:** Automate the calculations, focus on strategy and client advisory
✅ **Recurring revenue:** Annual subscriptions = predictable passive income
✅ **Better client outcomes:** Clients get instant estimates and year-round access
✅ **Scalability:** Handle 2x more cross-border clients without hiring another associate

**Real Example:**

One of our beta CPAs used TaxBridge to:
- Cut cross-border prep time from 8 hours → 3 hours per client
- Handle 15 additional clients per tax season = $22,500 additional revenue
- Earn $355/year in passive referral income (15 clients × $23.70)
- Total impact: $22,855/year increase

**Next Steps:**

I'd love to schedule a 20-minute call to:
1. Demo the calculator and show you the CPA-ready outputs
2. Walk through the partner dashboard and payment tracking
3. Answer questions about integration with your workflow

Are you available for a call this week? I have slots open:
- Tuesday 3/21 at 11am PT
- Wednesday 3/22 at 3pm PT
- Thursday 3/23 at 1pm PT

Just reply with your preferred time (or suggest another), and I'll send a calendar invite.

Looking forward to helping you scale your cross-border practice more efficiently.

Best regards,
Michael Guo
Founder, TaxBridge
https://taxbridgecpa.com
michael@taxbridgecpa.com

P.S. - ${cpaWebsite ? `I saw on ${cpaWebsite} that you ` : 'Since you '}specialize in ${specialization || 'cross-border tax'}. I'd love to get your feedback on the tool - CPAs like you have been instrumental in making TaxBridge accurate and compliant.`;

  return { subject, body };
}
