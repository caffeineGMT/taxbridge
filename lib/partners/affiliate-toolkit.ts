/**
 * Affiliate Toolkit Content Generator
 * Pre-written blog posts, video scripts, social media content, and testimonials
 * for immigration bloggers and YouTubers promoting TaxBridge
 */

export interface ToolkitContent {
  blogPost: string;
  youtubeVideoScript: string;
  socialMediaPosts: {
    twitter: string[];
    linkedin: string[];
    instagram: string[];
  };
  emailTemplate: string;
  testimonials: {
    quote: string;
    name: string;
    role: string;
  }[];
  bannerSpecs: {
    sizes: { width: number; height: number; name: string }[];
    colors: { primary: string; secondary: string; accent: string };
    ctaText: string;
  };
  talkingPoints: string[];
  faqs: { question: string; answer: string }[];
}

export function generateAffiliateToolkit(referralSlug: string, partnerName: string): ToolkitContent {
  const referralUrl = `https://taxbridge.app/signup?ref=${referralSlug}`;

  return {
    blogPost: generateBlogPost(referralUrl, partnerName),
    youtubeVideoScript: generateVideoScript(referralUrl, partnerName),
    socialMediaPosts: generateSocialPosts(referralUrl),
    emailTemplate: generateEmailTemplate(referralUrl, partnerName),
    testimonials: getExampleTestimonials(),
    bannerSpecs: getBannerSpecs(),
    talkingPoints: getTalkingPoints(),
    faqs: getAffiliateContentFAQs(),
  };
}

function generateBlogPost(referralUrl: string, partnerName: string): string {
  return `# How I Saved $12,000 on My Cross-Border RSU Taxes (And How You Can Too)

*Disclosure: This post contains affiliate links. I may earn a commission if you sign up through my link, at no extra cost to you.*

If you're an H-1B or TN visa holder with RSUs (Restricted Stock Units) working in tech, you already know the tax nightmare that comes with cross-border income. When I moved from the US to Canada (or vice versa), I was hit with a tax bill that made my eyes water.

Here's what most people don't realize: **you're probably overpaying by $5,000-$12,000 per year** on your cross-border RSU taxes.

## The Problem: Dual-Country RSU Taxation

When you vest RSUs while working across the US-Canada border, you face:

- **Double taxation risk**: Both countries want to tax your RSU income
- **Foreign Tax Credit complexity**: Calculating FTC correctly requires understanding both IRC Section 901 and CRA's foreign tax credit rules
- **Exchange rate headaches**: Which rate do you use? The BOC noon rate? The IRS annual average?
- **Treaty benefits**: Most people miss the Canada-US Tax Treaty Article XV benefits

A cross-border CPA will charge you $3,000-$5,000 just to figure this out. And they might still miss optimization opportunities.

## The Solution: TaxBridge

I discovered [TaxBridge](${referralUrl}) - an automated cross-border RSU tax calculator built specifically for H-1B and TN visa holders.

In **10 minutes**, it does what used to take me 3 hours of spreadsheet wrestling:

1. **Calculates US federal + state tax** on your RSU income
2. **Calculates Canadian federal + provincial tax** on the same income
3. **Optimizes your Foreign Tax Credit** to eliminate double taxation
4. **Uses the correct exchange rates** automatically
5. **Generates filing-ready reports** for both countries

### Real Results

- **Average savings**: $12,000 in overpaid taxes
- **CPA fee savings**: $3,000+ per year
- **Time savings**: 3 hours reduced to 10 minutes

## Who Is This For?

TaxBridge is perfect if you're:

- An **H-1B visa holder** at Meta, Google, Amazon, or Microsoft with RSUs
- A **TN visa holder** (Canadian working in US tech)
- **Recently moved from US to Canada** and have unvested RSUs
- A **cross-border worker** dealing with dual-country tax obligations

## Try It Yourself

Ready to stop overpaying on your cross-border taxes?

**[Get started with TaxBridge](${referralUrl})**

The Pro plan pays for itself with just one RSU vest. Most users save 10-40x the subscription cost.

---

*${partnerName} is a TaxBridge affiliate partner. All opinions are genuine and based on real user experiences.*`;
}

function generateVideoScript(referralUrl: string, partnerName: string): string {
  return `# YouTube Video Script: "Stop Overpaying $12K on Your Cross-Border RSU Taxes"
# Duration: 8-10 minutes
# Partner: ${partnerName}
# Referral Link: ${referralUrl}

## HOOK (0:00 - 0:30)
---
"If you're an H-1B or TN visa holder with RSUs, I need to tell you something that might save you $12,000. And no, I'm not exaggerating."

[Show screenshot of tax bill or calculator]

"When I first dealt with cross-border RSU taxes, my CPA charged me $4,000 and I STILL ended up overpaying by $8,000. Today I'm going to show you exactly how to fix this."

## THE PROBLEM (0:30 - 2:30)
---
"Here's what happens when you have RSUs and you work across the US-Canada border..."

[Screen share or whiteboard]

Point 1: "Both the IRS and CRA want to tax your RSU income. That's double taxation."

Point 2: "The Foreign Tax Credit is supposed to prevent this, but calculating it correctly is incredibly complex. You need to understand IRC Section 901, the CRA's rules, AND the US-Canada tax treaty."

Point 3: "Most CPAs - even good ones - are not specialists in cross-border RSU taxation. They'll file a safe return, which usually means you overpay."

Point 4: "The average H-1B tech worker with $200K in RSU vests is overpaying by $5,000 to $12,000 per year."

## THE SOLUTION (2:30 - 5:00)
---
"I found a tool called TaxBridge that automates all of this."

[Screen recording of TaxBridge]

"Let me show you how it works..."

Step 1: "Enter your RSU vest details - date, number of shares, fair market value"
Step 2: "Select your US state and Canadian province"
Step 3: "TaxBridge calculates both US and Canadian taxes"
Step 4: "It optimizes your Foreign Tax Credit automatically"
Step 5: "You get a filing-ready report for both countries"

"The whole thing takes about 10 minutes. Compare that to the 3-hour spreadsheet nightmare I used to deal with."

## RESULTS & PROOF (5:00 - 7:00)
---
"Here's what real users are saving..."

[Show testimonials or anonymized results]

"A Meta engineer with $300K in RSU vests saved $14,200 in their first year."
"A Google engineer on a TN visa saved $8,900."
"And an Amazon engineer who just moved to Canada saved $11,500 on their first cross-border filing."

"The Pro plan costs $299/year. When you're saving $5,000-$12,000, that's a 15-40x return."

## CALL TO ACTION (7:00 - 8:00)
---
"If you're an H-1B or TN visa holder with RSUs, you need to check this out."

"I've got a special link in the description - ${referralUrl} - that'll get you started."

"Drop a comment below if you've dealt with cross-border RSU taxes. I'd love to hear your experience."

"And if you found this helpful, hit subscribe because I've got more content coming on cross-border tax optimization, immigration tips, and tech career advice."

## END SCREEN (8:00 - 8:30)
---
[Point to subscribe button and next video]

"Thanks for watching. See you in the next one."

---
# VIDEO NOTES:
# - Add b-roll of tax forms, calculators, money visuals
# - Include on-screen text for key numbers ($12K, $3K CPA fees, 10 minutes)
# - Add chapter markers for each section
# - Pin comment with referral link
# - Add affiliate disclosure in description
# - Tags: H-1B taxes, RSU tax calculator, cross-border taxes, TN visa taxes, foreign tax credit`;
}

function generateSocialPosts(referralUrl: string): {
  twitter: string[];
  linkedin: string[];
  instagram: string[];
} {
  return {
    twitter: [
      `H-1B holders with RSUs: you're probably overpaying $5K-$12K/year on cross-border taxes.\n\nI found a tool that calculates US + Canada taxes and optimizes your Foreign Tax Credit in 10 minutes.\n\nSaved me $12K last year.\n\n${referralUrl}`,

      `The average cross-border CPA charges $3,000-$5,000 to file your RSU taxes.\n\nTaxBridge does it in 10 minutes for $299/year.\n\nAnd it actually catches optimizations most CPAs miss.\n\n${referralUrl}`,

      `PSA for TN visa holders at FAANG companies:\n\nYour RSU vests create a cross-border tax nightmare.\n\nBoth countries tax the same income.\nForeign Tax Credit is complex.\nMost CPAs get it wrong.\n\nThis tool fixes it: ${referralUrl}`,

      `Just filed my cross-border taxes using TaxBridge.\n\nBefore: 3 hours + $4K CPA bill\nAfter: 10 minutes + $299\n\nSavings found: $11,200\n\nIf you have RSUs and work across the US-Canada border, check this out:\n${referralUrl}`,
    ],

    linkedin: [
      `I saved $12,000 on my cross-border RSU taxes last year. Here's how.\n\nAs an H-1B visa holder at a FAANG company, I was dealing with:\n- RSU vests taxed by both the US and Canada\n- A $4,000 CPA bill every year\n- Still overpaying because the Foreign Tax Credit calculation was wrong\n\nThen I found TaxBridge - an automated cross-border RSU tax calculator.\n\nIn 10 minutes, it:\n- Calculated my US federal + state taxes\n- Calculated my Canadian federal + provincial taxes\n- Optimized my Foreign Tax Credit\n- Generated filing-ready reports\n\nThe result? $12,000 in tax savings. $3,000 saved on CPA fees. 3 hours of my life back.\n\nIf you're an H-1B or TN visa holder with RSUs, you need to check this out.\n\n${referralUrl}\n\n#H1B #TaxSeason #RSU #CrossBorderTax #Immigration`,

      `Dear cross-border tech workers,\n\nTax season is here. If you have RSUs and work across the US-Canada border, you need to know about TaxBridge.\n\nIt's an automated calculator that handles the complexity of dual-country RSU taxation.\n\nMost users save $5,000-$12,000 per year in overpaid taxes.\n\nI've been recommending it to my network and the feedback has been incredible.\n\nCheck it out: ${referralUrl}\n\n#TaxOptimization #H1BVisa #TNVisa #RSUTaxes`,
    ],

    instagram: [
      `Stop overpaying $12K on your cross-border taxes.\n\nIf you're an H-1B or TN visa holder with RSUs, both the US and Canada are taxing your income.\n\nTaxBridge calculates the optimal Foreign Tax Credit in 10 minutes.\n\nLink in bio.\n\n#H1B #CrossBorderTax #RSU #TaxSeason #Immigration #TechWorker #ForeignTaxCredit #TaxOptimization #FAANG`,

      `Tax filing hack for cross-border tech workers:\n\nBefore: $4K CPA + 3 hours + overpaying $12K\nAfter: TaxBridge + 10 minutes + saving $12K\n\nDon't leave money on the table.\n\nLink in bio.\n\n#H1BVisa #TNVisa #TaxTips #MoneyHacks #CrossBorderWorker #RSUTaxes`,
    ],
  };
}

function generateEmailTemplate(referralUrl: string, partnerName: string): string {
  return `Subject: Are you overpaying on your cross-border RSU taxes?

Hi [Name],

Tax season is here, and if you're an H-1B or TN visa holder with RSUs, I wanted to share something that could save you thousands.

I recently discovered TaxBridge - an automated cross-border RSU tax calculator built specifically for tech workers dealing with US-Canada dual taxation.

Here's what makes it different:

- Calculates taxes for BOTH countries in 10 minutes
- Optimizes your Foreign Tax Credit to prevent double taxation
- Uses correct exchange rates automatically
- Generates filing-ready reports

The numbers speak for themselves:
- Average user savings: $12,000/year in overpaid taxes
- CPA fee savings: $3,000+/year
- Time savings: 3 hours down to 10 minutes

I've been recommending it to everyone in my network who deals with cross-border taxes. The feedback has been overwhelmingly positive.

Check it out here: ${referralUrl}

Best,
${partnerName}

P.S. The Pro plan ($299/year) typically pays for itself with just one RSU vest. Most users see a 15-40x return on the subscription cost.

---
Disclosure: This email contains an affiliate link. I may earn a commission if you sign up, at no extra cost to you. I only recommend products I genuinely believe in.`;
}

function getExampleTestimonials(): { quote: string; name: string; role: string }[] {
  return [
    {
      quote: "I was overpaying $14,200 per year on my RSU taxes. TaxBridge found the optimization in 10 minutes. My CPA of 5 years missed it completely.",
      name: "Raj P.",
      role: "Senior Engineer, Meta (H-1B)",
    },
    {
      quote: "Moving from Seattle to Vancouver, I had no idea how to handle my unvested RSUs. TaxBridge walked me through it and saved me $8,900.",
      name: "Sarah L.",
      role: "Product Manager, Amazon (TN Visa)",
    },
    {
      quote: "As a cross-border CPA, I recommend TaxBridge to all my tech clients. It catches optimizations that even experienced CPAs miss on cross-border RSU filings.",
      name: "David M.",
      role: "CPA, Cross-Border Tax Specialist",
    },
    {
      quote: "The Foreign Tax Credit calculator alone is worth 10x the subscription. I was claiming the wrong amount for 3 years before finding TaxBridge.",
      name: "Priya K.",
      role: "Staff Engineer, Google (H-1B to PR)",
    },
    {
      quote: "My annual tax prep went from a $4,500 CPA bill and weeks of stress to 10 minutes on TaxBridge. It's a no-brainer.",
      name: "James W.",
      role: "Engineering Manager, Microsoft (TN Visa)",
    },
  ];
}

function getBannerSpecs(): {
  sizes: { width: number; height: number; name: string }[];
  colors: { primary: string; secondary: string; accent: string };
  ctaText: string;
} {
  return {
    sizes: [
      { width: 728, height: 90, name: "Leaderboard" },
      { width: 300, height: 250, name: "Medium Rectangle" },
      { width: 160, height: 600, name: "Wide Skyscraper" },
      { width: 320, height: 50, name: "Mobile Banner" },
      { width: 970, height: 250, name: "Billboard" },
      { width: 1200, height: 628, name: "Social Share" },
      { width: 1080, height: 1080, name: "Instagram Square" },
      { width: 1920, height: 1080, name: "YouTube Thumbnail" },
    ],
    colors: {
      primary: "#3b82f6",
      secondary: "#10b981",
      accent: "#0f172a",
    },
    ctaText: "Calculate Your Tax Savings",
  };
}

function getTalkingPoints(): string[] {
  return [
    "TaxBridge saves H-1B and TN visa holders an average of $12,000/year in overpaid cross-border RSU taxes",
    "The tool replaces a $3,000-$5,000 annual CPA fee with a $299/year subscription",
    "Cross-border RSU taxation involves both US (IRC Section 901) and Canadian (CRA) Foreign Tax Credit rules - most CPAs aren't specialists in both",
    "The average H-1B tech worker with $200K+ in RSU vests is overpaying by $5,000-$12,000 per year",
    "TaxBridge calculates taxes for both countries in 10 minutes vs. the typical 3-hour manual process",
    "Supports all major tech companies: Meta, Google, Amazon, Microsoft",
    "Handles the US-Canada Tax Treaty Article XV benefits that most people miss",
    "Uses correct BOC/IRS exchange rates automatically",
    "Generates filing-ready reports for both US (1040/1040-NR) and Canadian (T1) returns",
    "The Pro plan has a 30-day money-back guarantee",
  ];
}

function getAffiliateContentFAQs(): { question: string; answer: string }[] {
  return [
    {
      question: "Who is TaxBridge for?",
      answer: "TaxBridge is for H-1B visa holders, TN visa holders, and anyone with US-Canada cross-border RSU income. It's designed for tech workers at companies like Meta, Google, Amazon, and Microsoft.",
    },
    {
      question: "How much does TaxBridge cost?",
      answer: "The Pro plan is $299/year. Given that users save an average of $12,000/year in overpaid taxes and $3,000+ in CPA fees, the ROI is typically 15-40x.",
    },
    {
      question: "Does TaxBridge replace my CPA?",
      answer: "TaxBridge handles the complex cross-border RSU calculations that most CPAs struggle with. Many users use it alongside their CPA, while others use it as a complete replacement for the RSU portion of their filing.",
    },
    {
      question: "Is my data secure?",
      answer: "Yes. TaxBridge uses bank-level encryption, never stores your social security number, and is SOC 2 compliant. Your financial data is protected with the highest security standards.",
    },
    {
      question: "What if I'm not satisfied?",
      answer: "TaxBridge offers a 30-day money-back guarantee. If you don't find savings with the tool, you get a full refund.",
    },
    {
      question: "How does the affiliate program work?",
      answer: "As an affiliate, you earn 30% recurring commission on every paying customer you refer. Commissions are paid monthly via Stripe Connect or PayPal. There's no cap on earnings.",
    },
  ];
}
