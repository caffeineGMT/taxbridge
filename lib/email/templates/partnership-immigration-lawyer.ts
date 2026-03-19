export interface ImmigrationLawyerPartnerEmailData {
  lawyerName: string;
  lawyerFirmName: string;
  lawyerWebsite?: string;
  numberOfClients?: number;
  specialization?: string; // e.g., "H-1B and TN visa holders"
}

export function getImmigrationLawyerPartnerEmail(data: ImmigrationLawyerPartnerEmailData): {
  subject: string;
  body: string;
} {
  const { lawyerName, lawyerFirmName, lawyerWebsite, numberOfClients, specialization } = data;

  const subject = `Partnership Opportunity: Help Your ${specialization || 'H-1B/TN Visa'} Clients Save $5K-$15K in Taxes`;

  const body = `Hi ${lawyerName},

I hope this email finds you well. I'm reaching out because I believe we have a powerful opportunity to create value for your clients at ${lawyerFirmName}.

**The Problem Your Clients Face:**

When you help H-1B and TN visa holders navigate immigration, they often face a hidden tax burden that costs them $5,000-$15,000 annually:
- RSU taxation in both the US and Canada (double taxation)
- Complex foreign tax credit calculations that CPAs often get wrong
- Missed tax treaty benefits worth thousands of dollars

Your clients trust you with their immigration journey. But after they get their visa, many lose money to preventable tax mistakes.

**The Solution:**

TaxBridge is a specialized tax calculator built specifically for US-Canada cross-border workers with RSUs. We help your clients:
- Calculate exact US and Canada tax liability across multiple years
- Maximize foreign tax credit savings (average $8,400/year)
- Generate CPA-ready tax documents for filing
- Avoid costly mistakes that generic tax software misses

**Partnership Offer:**

I'd like to offer you a **30% revenue share** on every client you refer:
- Your client pays $79/year for premium access
- You earn $23.70 per client, per year (recurring)
- ${numberOfClients ? `If you refer ${Math.min(numberOfClients, 50)} clients, that's $${(numberOfClients * 23.7).toFixed(2)}/year passive income` : 'Most partners earn $500-$2,000/year in passive income'}
- Your clients save $5K-$15K in taxes and see you as a trusted advisor who goes beyond immigration

**Why This Works:**

✅ **Seamless for you:** Just send clients a unique referral link - we handle everything else
✅ **Adds value to your service:** Position yourself as a full-service advisor, not just immigration
✅ **Passive income:** Recurring revenue with zero additional work after initial referral
✅ **Win-win-win:** Your clients save money, you earn commission, we grow together

**Next Steps:**

I'd love to schedule a 15-minute call to:
1. Show you the calculator and partner dashboard
2. Answer any questions about the revenue share model
3. Get you set up with your unique referral link

Are you available for a quick call this week? I have slots open:
- Tuesday 3/21 at 2pm PT
- Wednesday 3/22 at 10am PT
- Thursday 3/23 at 4pm PT

Just reply with your preferred time (or suggest another), and I'll send a calendar invite.

Looking forward to working together to help your clients keep more of their hard-earned money.

Best regards,
Michael Guo
Founder, TaxBridge
https://taxbridge.app
michael@taxbridge.app

P.S. - ${lawyerWebsite ? `I noticed on ${lawyerWebsite} that you ` : 'Since you '}specialize in ${specialization || 'H-1B/TN visa cases'}. Our clients are exactly the same demographic - this partnership could be incredibly valuable for both of us.`;

  return { subject, body };
}
