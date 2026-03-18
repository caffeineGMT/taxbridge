/**
 * Marketing Content Templates for CPA/Accountant Partners
 * Pre-written email templates, social media posts, and marketing materials
 */

export interface PartnerMarketingContent {
  emailTemplates: EmailTemplate[];
  socialPosts: SocialPost[];
  marketingCopy: MarketingCopy;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  targetAudience: string;
}

export interface SocialPost {
  platform: 'linkedin' | 'twitter' | 'facebook';
  content: string;
  hashtags: string[];
}

export interface MarketingCopy {
  shortDescription: string;
  longDescription: string;
  valueProps: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export function generateEmailTemplates(
  firmName: string,
  partnerName: string,
  referralUrl: string
): EmailTemplate[] {
  return [
    {
      subject: "Simplify Your Cross-Border Tax Calculations",
      targetAudience: "H-1B/TN visa holders with RSU income",
      body: `Hi [Client Name],

I wanted to share a tool that many of our cross-border clients have found incredibly helpful.

If you're working in the US on an H-1B or TN visa and receiving RSU compensation, calculating your tax obligations across both countries can be complex and time-consuming.

TaxBridge is a specialized calculator that handles:
• US federal and state tax calculations
• Canadian federal and provincial tax calculations
• Foreign Tax Credit optimization to avoid double taxation
• Treaty Article XV compliance
• Automatic USD/CAD conversion

I've partnered with them to provide our clients with accurate, instant tax calculations. You can try it free for 14 days:

${referralUrl}

This will save you hours of manual calculations and ensure accuracy in your tax planning.

Let me know if you have any questions!

Best regards,
${partnerName}
${firmName}`
    },
    {
      subject: "Year-End Tax Planning: Cross-Border Considerations",
      targetAudience: "Clients with cross-border income",
      body: `Dear [Client Name],

As we approach year-end, it's a good time to review your cross-border tax situation.

For clients with income in both the US and Canada, accurate tax planning is essential to:
✓ Minimize your tax liability
✓ Avoid double taxation through proper Foreign Tax Credit claims
✓ Ensure compliance with both IRS and CRA requirements

I recommend using TaxBridge, a specialized tool I've vetted for cross-border tax calculations. It's designed specifically for professionals like you with RSU income and dual-country obligations.

Get started with a free trial: ${referralUrl}

This will help us work together more efficiently on your year-end tax planning.

Feel free to reach out with any questions.

Regards,
${partnerName}
${firmName}`
    },
    {
      subject: "New RSU Grant? Here's What You Need to Know",
      targetAudience: "Tech workers with new RSU grants",
      body: `Hi [Client Name],

Congratulations on your RSU grant! This is exciting, but it also creates important tax planning considerations, especially if you're working across the US-Canada border.

Key things to understand:
• RSUs are taxed as ordinary income when they vest
• Both US and Canada may have taxing rights
• Foreign Tax Credit can eliminate double taxation
• Timing of vesting affects which country has primary taxing rights

To help you plan ahead, I recommend TaxBridge - a calculator I trust for cross-border RSU tax scenarios:

${referralUrl}

It will show you exactly what to expect at each vesting date, across both countries.

Let's discuss your specific situation on our next call.

Best,
${partnerName}
${firmName}`
    },
    {
      subject: "Recommended Resource for Cross-Border Clients",
      targetAudience: "General clients with US-Canada tax obligations",
      body: `Hello [Client Name],

I'm always looking for ways to provide better service to clients with cross-border tax situations.

I've recently partnered with TaxBridge, a specialized tax calculator built specifically for H-1B and TN visa holders with RSU income who live in Canada.

Why I recommend it:
→ Accurate dual-country tax calculations
→ Foreign Tax Credit optimization
→ Treaty compliance built-in
→ Saves significant time vs. manual calculations
→ Generates reports you can use for tax filing

Try it free for 14 days: ${referralUrl}

This tool complements our services and will help us work together more effectively.

Questions? Just reply to this email.

${partnerName}
${firmName}`
    },
    {
      subject: "Immigration Status Change? Update Your Tax Strategy",
      targetAudience: "Clients who recently moved to Canada",
      body: `Hi [Client Name],

I wanted to follow up on your recent move to Canada. This is an important time to reassess your tax situation, particularly if you have US-sourced income like RSUs.

When you become a Canadian tax resident while maintaining US income, several things change:
• You're now taxed on worldwide income in Canada
• The US continues to tax your US-sourced income
• Proper planning can avoid double taxation
• Filing requirements increase (T1, FBAR, 8938, etc.)

To help you understand your new obligations, I recommend TaxBridge - a tool designed for exactly this scenario:

${referralUrl}

It will show you what taxes you owe in each country and how to claim foreign tax credits properly.

Let's schedule a call to review your specific situation.

Best regards,
${partnerName}
${firmName}`
    }
  ];
}

export function generateSocialPosts(
  firmName: string,
  referralUrl: string
): SocialPost[] {
  return [
    {
      platform: 'linkedin',
      content: `Cross-border tax calculations don't have to be complicated.

If you're an H-1B or TN visa holder with RSU income now living in Canada, calculating your tax obligations across both countries can take hours of manual work.

I've partnered with TaxBridge to provide our clients with instant, accurate calculations for:
✅ US federal & state taxes
✅ Canadian federal & provincial taxes
✅ Foreign Tax Credit optimization
✅ Treaty Article XV compliance

This specialized tool is built specifically for cross-border professionals and can save you days of work during tax season.

Try it free for 14 days: ${referralUrl}

#CrossBorderTax #H1B #TNVisa #RSUTax #TaxPlanning #CanadianTax #USTax`,
      hashtags: ['CrossBorderTax', 'H1B', 'TNVisa', 'RSUTax', 'TaxPlanning']
    },
    {
      platform: 'linkedin',
      content: `Year-end tax tip for cross-border professionals:

If you have RSU income from US tech companies (Meta, Amazon, Google, Microsoft) and you're now a Canadian resident, proper tax planning is essential.

Many clients don't realize they can use Foreign Tax Credits to eliminate double taxation on the same income.

At ${firmName}, we help clients navigate these complex situations. For accurate calculations, we recommend TaxBridge: ${referralUrl}

What cross-border tax questions are you dealing with? Drop them in the comments.

#TaxPlanning #CrossBorderTax #Immigration #TechWorkers`,
      hashtags: ['TaxPlanning', 'CrossBorderTax', 'Immigration', 'TechWorkers']
    },
    {
      platform: 'twitter",
      content: `H-1B → Canadian PR? Your RSU tax situation just got complex.

Don't spend hours on manual calculations. Use @TaxBridgeApp for instant dual-country tax calculations.

Free trial: ${referralUrl}

#CrossBorderTax #H1B #TechTax`,
      hashtags: ['CrossBorderTax', 'H1B', 'TechTax']
    },
    {
      platform: 'twitter",
      content: `Hot take: Most cross-border tax software doesn't handle RSU income properly.

That's why we recommend TaxBridge to our clients - it's built specifically for H-1B/TN workers with equity comp.

Try it: ${referralUrl}

#TaxTech #EquityComp`,
      hashtags: ['TaxTech', 'EquityComp']
    },
    {
      platform: 'linkedin',
      content: `Common mistake I see with cross-border clients:

Not properly calculating Foreign Tax Credits, leading to double taxation on the same income.

The US-Canada tax treaty (Article XV) provides relief, but you need accurate calculations to claim it properly.

For clients with RSU income, we recommend TaxBridge - it handles treaty compliance automatically: ${referralUrl}

Questions about cross-border tax? Connect with me or visit ${firmName}.

#TaxMistakes #ForeignTaxCredit #CrossBorder`,
      hashtags: ['TaxMistakes', 'ForeignTaxCredit', 'CrossBorder']
    }
  ];
}

export function generateMarketingCopy(): MarketingCopy {
  return {
    shortDescription: 'TaxBridge simplifies cross-border tax calculations for H-1B and TN visa holders with RSU income who are Canadian residents.",
    longDescription: `TaxBridge is the leading tax calculator built specifically for cross-border professionals navigating US-Canada tax obligations.

Designed for H-1B and TN visa holders working at tech companies (Meta, Amazon, Google, Microsoft) who receive RSU compensation and are now Canadian tax residents, TaxBridge handles the complex dual-country calculations that would otherwise take hours of manual work.

The platform calculates US federal and state taxes, Canadian federal and provincial taxes, optimizes Foreign Tax Credit claims to eliminate double taxation, ensures treaty compliance (Article XV), and automatically converts currencies at Bank of Canada rates.

Trusted by CPAs, immigration lawyers, and tax professionals across North America, TaxBridge streamlines the tax planning process for cross-border clients.`,
    valueProps: [
      'Instant dual-country tax calculations (US + Canada)",
      'Foreign Tax Credit optimization to avoid double taxation",
      'Treaty Article XV compliance built-in",
      'Supports all major employers (Meta, Amazon, Google, Microsoft)",
      'Automatic USD/CAD conversion at Bank of Canada rates",
      'Multi-year dashboard for long-term planning",
      'PDF export for tax filing documentation",
      'Form recommendations (1040, T1, FBAR, 8938, 8833)",
      '14-day free trial, no credit card required'
    ],
    faqs: [
      {
        question: "Who is TaxBridge for?",
        answer: "TaxBridge is designed for H-1B and TN visa holders who worked in the US at tech companies (Meta, Amazon, Google, Microsoft), received RSU compensation, and are now Canadian tax residents. It handles the complex dual-country tax calculations.'
      },
      {
        question: "How does Foreign Tax Credit optimization work?",
        answer: "TaxBridge calculates the optimal FTC claim to prevent double taxation. It determines which country has primary taxing rights based on Treaty Article XV, then calculates the exact credit to claim on your other country's return.'
      },
      {
        question: "What forms do I still need to file?",
        answer: "You still need to file your regular tax returns (1040 or 1040-NR for US, T1 for Canada) plus potentially FBAR, Form 8938, and Form 8833. TaxBridge provides form recommendations and calculation support, but you or your accountant will file the actual returns.'
      },
      {
        question: "How accurate are the calculations?",
        answer: "TaxBridge uses current IRS and CRA tax brackets, treaty provisions, and Bank of Canada exchange rates. While it provides highly accurate estimates, we always recommend working with a qualified CPA for final tax filing, especially for complex situations.'
      },
      {
        question: "Can I use this if I'm still on H-1B in the US?",
        answer: "TaxBridge is optimized for those who are now Canadian tax residents with US-sourced RSU income. If you're still a US resident, you may not need dual-country calculations yet.'
      },
      {
        question: "What if my RSUs are from a company not listed?",
        answer: "Currently TaxBridge supports Meta, Amazon, Google, and Microsoft (the most common employers for H-1B holders). Support for additional employers is coming soon. You can still manually enter RSU data from any employer.'
      },
      {
        question: "Is there a free trial?",
        answer: "Yes, TaxBridge offers a 14-day free trial with full access to all features. No credit card required for the trial.'
      },
      {
        question: "How does the partner program work?",
        answer: "CPAs, accountants, and immigration lawyers can join our partner program to earn 20% recurring commission on client referrals. Partners get co-branded landing pages, marketing materials, and dedicated support.'
      }
    ]
  };
}

export function generatePerformanceReport(
  firmName: string,
  partnerName: string,
  stats: {
    total_referrals: number;
    total_revenue: number;
    pending_commissions: number;
    paid_commissions: number;
    conversion_rate: number;
    last_30_days: number;
    monthly_trend: Array<{ month: string; count: number; revenue: number }>;
  }
): string {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return `# TaxBridge Partner Performance Report
## ${firmName}
### ${currentMonth}

---

## Executive Summary

**Partner:** ${partnerName}
**Period:** ${currentMonth}
**Report Generated:** ${new Date().toLocaleDateString()}

---

## Key Metrics

### Overall Performance
- **Total Referrals:** ${stats.total_referrals}
- **Total Revenue Earned:** $${stats.total_revenue.toFixed(2)}
- **Conversion Rate:** ${stats.conversion_rate.toFixed(1)}%
- **Average Commission:** $${(stats.total_revenue / Math.max(stats.total_referrals, 1)).toFixed(2)}

### Last 30 Days
- **New Referrals:** ${stats.last_30_days}
- **Growth Rate:** ${stats.total_referrals > 0 ? ((stats.last_30_days / stats.total_referrals) * 100).toFixed(1) : 0}% of total

### Payment Status
- **Pending Commissions:** $${stats.pending_commissions.toFixed(2)}
- **Paid to Date:** $${stats.paid_commissions.toFixed(2)}
- **Next Payout Date:** ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()}

---

## Monthly Trend

${stats.monthly_trend.map(m =>
  `**${m.month}:** ${m.count} referrals, $${m.revenue.toFixed(2)} earned`
).join('\n')}

---

## Insights & Recommendations

### Performance Highlights
${stats.last_30_days > 0 ? '✅ Active referral activity in the last 30 days' : '⚠️ No recent referrals - consider ramping up marketing'}
${stats.conversion_rate > 3 ? '✅ Conversion rate exceeds industry average (2-3%)' : '💡 Opportunity to improve conversion rate through targeted messaging'}

### Growth Opportunities
1. **Email Campaigns:** Send monthly tax tips to clients with cross-border income
2. **Social Media:** Share TaxBridge on LinkedIn to reach professional network
3. **Client Meetings:** Mention TaxBridge during year-end tax planning sessions
4. **Webinars:** Host a webinar on cross-border tax planning featuring TaxBridge

### Best Practices
- Focus on clients who recently moved from US to Canada
- Target H-1B and TN visa holders in tech industry
- Emphasize time savings and accuracy in your messaging
- Share your co-branded landing page in email signatures

---

## Support & Resources

Need help increasing referrals? Contact our partner success team:
📧 partners@taxbridge.app
📞 Schedule a strategy call

---

*This report is confidential and intended for ${firmName} only.*
`;
}
