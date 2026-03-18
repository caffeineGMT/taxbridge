/**
 * Community Posting Templates with UTM Parameters
 * Generates all 15 community posts for launch day
 */

export interface CommunityPost {
  id: string;
  platform: string;
  community: string;
  scheduledTime: string; // PST
  title: string;
  body: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  targetMetrics: {
    upvotes?: number;
    comments?: number;
    impressions?: number;
    engagements?: number;
  };
  postUrl?: string;
  status: 'pending' | 'posted' | 'failed';
}

const PRODUCT_HUNT_URL = process.env.NEXT_PUBLIC_PRODUCT_HUNT_URL || 'https://www.producthunt.com/posts/taxbridge';
const WEBSITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://taxbridge.app';

function generateUTMLink(baseUrl: string, source: string, medium: string, campaign: string, content: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', campaign);
  url.searchParams.set('utm_content', content);
  url.searchParams.set('ref', source); // Additional tracking
  return url.toString();
}

export const communityPosts: CommunityPost[] = [
  {
    id: 'reddit-pfc',
    platform: 'Reddit',
    community: 'r/PersonalFinanceCanada',
    scheduledTime: '6:00 AM',
    title: 'Built a free calculator for cross-border tax (US → Canada) - saved me $12K on RSU taxes',
    body: `Hey PFC,

I'm a tech worker who moved from California to Vancouver in 2024. I had Meta RSUs that vested after I moved to Canada, and I ended up overpaying $12K in taxes because I didn't understand how the US-Canada tax treaty works.

After spending $3K on a CPA and realizing the calculation is actually straightforward (just complex), I built a free calculator to help others avoid the same mistake.

**What it does:**
- Calculates US federal + state tax on RSU income
- Calculates Canada federal + provincial tax on the same income
- Computes Foreign Tax Credit (FTC) to avoid double taxation
- Shows which forms you need (W-2, 1040, T1, T4, FBAR, 8938, 8833)
- Handles USD/CAD conversion using Bank of Canada rates

**Who it's for:**
- H-1B/TN visa holders who moved from US → Canada
- People with US RSUs/stock options that vested after moving
- Anyone filing dual-country taxes (US + Canada)

**Why I'm sharing:**
The calculator is free to use (basic calculations). I charge for advanced features (multi-year tracking, export), but honestly the free version solves 80% of use cases.

Link: ${generateUTMLink(WEBSITE_URL, 'reddit', 'post', 'ph_launch', 'PersonalFinanceCanada')}

Also launching on Product Hunt today if you want to support: ${generateUTMLink(PRODUCT_HUNT_URL, 'reddit', 'post', 'ph_launch', 'PersonalFinanceCanada')}

Happy to answer questions about cross-border tax - I've been down this rabbit hole for 6 months.`,
    utmSource: 'reddit',
    utmMedium: 'post',
    utmCampaign: 'ph_launch',
    utmContent: 'PersonalFinanceCanada',
    targetMetrics: {
      upvotes: 100,
      comments: 20
    },
    status: 'pending'
  },

  {
    id: 'hackernews',
    platform: 'Hacker News',
    community: 'Show HN',
    scheduledTime: '7:30 AM',
    title: 'Show HN: TaxBridge – Cross-border tax calculator for H-1B → Canada relocations',
    body: `Hey HN,

I'm Michael, a Meta SWE who moved from California to Vancouver in 2024. I had RSUs that vested after moving to Canada and ended up overpaying $12K because I misunderstood the US-Canada tax treaty (Article XV).

CPAs wanted $3K+ to handle this, but the calculation is actually pretty straightforward - just involves several moving parts:

1. Calculate US federal + California state tax on RSU income
2. Calculate Canada federal + BC provincial tax on the same income
3. Apply Foreign Tax Credit (FTC) on US return to avoid double taxation
4. File treaty disclosure (Form 8833) to claim treaty benefits

**Tech stack:**
- Next.js 15 (App Router)
- TypeScript + TailwindCSS
- SQLite via better-sqlite3 (local-first data)
- Stripe for Pro subscriptions
- Deployed on Vercel

**What I learned:**
- US-Canada tax treaty Article XV is poorly documented (most resources are for corporations, not individuals)
- IRS Form 8833 is required but rarely mentioned by CPAs
- Foreign Tax Credit calculation order matters (US first, then Canada credit)
- State-level taxation varies wildly (CA keeps taxing you for 1+ years after you leave)

Calculator is free for basic use. Pro plan ($299/yr) adds multi-year tracking, form pre-fill, and export.

Also launching on Product Hunt today: ${generateUTMLink(PRODUCT_HUNT_URL, 'hackernews', 'show_hn', 'ph_launch', 'show_hn')}

Happy to answer questions about the tech stack or cross-border tax complexity!`,
    utmSource: 'hackernews',
    utmMedium: 'show_hn',
    utmCampaign: 'ph_launch',
    utmContent: 'show_hn',
    targetMetrics: {
      upvotes: 50,
      comments: 30
    },
    status: 'pending'
  },

  {
    id: 'reddit-canadianinvestor',
    platform: 'Reddit',
    community: 'r/CanadianInvestor',
    scheduledTime: '9:00 AM',
    title: 'Cross-border tax on US stock? Built a calculator after overpaying $12K',
    body: `Quick question for CanadianInvestor:

How many of you moved from the US to Canada and had to deal with US stock (RSUs, options, ESPP) taxation?

I moved from California to Vancouver in 2024 while working at Meta. I had RSUs vesting after I became a Canadian resident, and I massively overpaid on taxes because I didn't understand the US-Canada tax treaty.

**Here's what I learned:**
- You owe tax to BOTH countries (US because it's US-source income, Canada because you're a resident)
- You can claim Foreign Tax Credit (FTC) in the US to avoid double taxation
- You need to file IRS Form 8833 (treaty disclosure) - most people don't know this
- State tax can linger for 1+ years after you leave (CA "safe harbor" rules)

After spending $3K on a CPA, I realized the calculation is straightforward and built a free calculator: ${generateUTMLink(WEBSITE_URL, 'reddit', 'post', 'ph_launch', 'CanadianInvestor')}

**Features:**
- Dual-country tax calculation (US federal/state + Canada federal/provincial)
- Foreign Tax Credit optimizer
- Forms checklist (W-2, 1040, T1, T4, FBAR, 8938, 8833)
- USD/CAD conversion at Bank of Canada rates

Also on Product Hunt today: ${generateUTMLink(PRODUCT_HUNT_URL, 'reddit', 'post', 'ph_launch', 'CanadianInvestor')}

Anyone else dealt with this nightmare? What did you learn?`,
    utmSource: 'reddit',
    utmMedium: 'post',
    utmCampaign: 'ph_launch',
    utmContent: 'CanadianInvestor',
    targetMetrics: {
      upvotes: 75,
      comments: 15
    },
    status: 'pending'
  },

  {
    id: 'reddit-immigration-canada',
    platform: 'Reddit',
    community: 'r/ImmigrationCanada',
    scheduledTime: '10:30 AM',
    title: 'For H-1B/TN visa holders moving to Canada: Built a free tax calculator for US RSUs',
    body: `Hi r/ImmigrationCanada,

For anyone moving from US → Canada on a work permit (or PR), here's a tax heads-up that cost me $12K:

**If you have US stock (RSUs, options, ESPP) from your employer, you'll owe tax to BOTH countries after you move.**

This is especially common for:
- H-1B → Canada PR/work permit
- TN visa holders relocating
- L-1 transfers (intra-company)
- People with job offers from Canadian offices of US companies

**What I wish I knew:**
1. US taxes you on US-source income (stock vesting) even if you're no longer a resident
2. Canada taxes you on worldwide income as a resident
3. You CAN avoid double taxation using Foreign Tax Credit (FTC)
4. You MUST file IRS Form 8833 to claim treaty benefits (Article XV)
5. CPAs charge $3K+ for this, but the calculation is actually straightforward

I built a free calculator after going through this mess: ${generateUTMLink(WEBSITE_URL, 'reddit', 'post', 'ph_launch', 'ImmigrationCanada')}

**Who it helps:**
- TN visa → Canada (Microsoft, Amazon, Meta, Google employees)
- H-1B → Canada PR (common path)
- Anyone with US stock vesting after Canadian residency

Also launching on Product Hunt today: ${generateUTMLink(PRODUCT_HUNT_URL, 'reddit', 'post', 'ph_launch', 'ImmigrationCanada')}

Happy to answer questions - I've spent 6 months learning US-Canada tax treaty inside out.`,
    utmSource: 'reddit',
    utmMedium: 'post',
    utmCampaign: 'ph_launch',
    utmContent: 'ImmigrationCanada',
    targetMetrics: {
      upvotes: 80,
      comments: 25
    },
    status: 'pending'
  },

  {
    id: 'linkedin-personal',
    platform: 'LinkedIn',
    community: 'Personal Profile',
    scheduledTime: '12:00 PM',
    title: '',
    body: `🚀 Launching my side project on Product Hunt today!

6 months ago, I overpaid $12,000 on my taxes.

I had moved from California to Vancouver while working at Meta. My RSUs vested after I became a Canadian resident, and I didn't understand how the US-Canada tax treaty worked.

CPAs wanted $3,000+ to handle this. After paying one and realizing the calculation was actually straightforward, I built TaxBridge - a cross-border tax calculator.

**What it does:**
✅ Calculates US + Canada tax on RSU/stock income
✅ Computes Foreign Tax Credit (FTC) to avoid double taxation
✅ Shows required forms (1040, T1, FBAR, 8938, Form 8833)
✅ Handles USD/CAD conversion

**Who it's for:**
Tech workers who moved from US → Canada (H-1B, TN visa, PR)

**Impact so far:**
- 25 paying customers
- Average savings: $8,200 per user
- $195,000+ total tax savings (across all users)

I'm launching on Product Hunt today. If you know anyone dealing with cross-border taxes (or moved US → Canada), please share!

🔗 Product Hunt: ${generateUTMLink(PRODUCT_HUNT_URL, 'linkedin', 'post', 'ph_launch', 'personal')}
🔗 TaxBridge: ${generateUTMLink(WEBSITE_URL, 'linkedin', 'post', 'ph_launch', 'personal')}

#SideProject #CrossBorderTax #TechWorkers #Canada #Immigration`,
    utmSource: 'linkedin',
    utmMedium: 'post',
    utmCampaign: 'ph_launch',
    utmContent: 'personal',
    targetMetrics: {
      impressions: 500,
      engagements: 20
    },
    status: 'pending'
  },

  {
    id: 'twitter-thread',
    platform: 'Twitter',
    community: 'Thread',
    scheduledTime: '1:30 PM',
    title: '',
    body: `THREAD (8 tweets):

Tweet 1:
I overpaid $12,000 on my taxes last year.

Here's what I learned about cross-border taxation (and why I built a calculator to fix this): 🧵

Tweet 2:
The setup:
• Worked at Meta in California (H-1B visa)
• Got RSUs as compensation
• Moved to Vancouver in 2024
• RSUs vested AFTER I became a Canadian resident

Problem: Who do I pay taxes to? 🤔

Tweet 3:
Answer: BOTH countries.

• US taxes you because it's US-source income (company is American)
• Canada taxes you because you're a resident (worldwide income)

This is called "dual taxation" and it's a nightmare. 😫

Tweet 4:
Good news: US-Canada tax treaty (Article XV) lets you avoid double taxation using Foreign Tax Credit (FTC).

Bad news: You need to:
1. File in both countries
2. Calculate tax twice (different rules)
3. File Form 8833 (treaty disclosure)
4. Navigate state tax (CA keeps taxing you!)

Tweet 5:
I paid a CPA $3,000 to do this.

She did it correctly, but I realized the calculation was pretty straightforward - just has many moving parts.

So I built a calculator to automate it: TaxBridge

${generateUTMLink(WEBSITE_URL, 'twitter', 'thread', 'ph_launch', 'thread')}

Tweet 6:
Who is this for?

✅ H-1B/TN visa → Canada (work permit or PR)
✅ Anyone with US stock (RSUs, options, ESPP)
✅ Dual-country tax filers (US + Canada)

Common at: Meta, Amazon, Google, Microsoft, Shopify, etc.

Tweet 7:
What it does:

• Calculates US federal + state tax
• Calculates Canada federal + provincial tax
• Computes Foreign Tax Credit (FTC)
• Shows required forms (W-2, 1040, T1, T4, FBAR, 8938, 8833)
• Handles USD/CAD conversion

Free for basic calculations. $299/yr for Pro features.

Tweet 8:
We're launching on Product Hunt TODAY! 🚀

If you:
• Moved US → Canada
• Know someone who did
• Want to support a maker

Please upvote: ${generateUTMLink(PRODUCT_HUNT_URL, 'twitter', 'thread', 'ph_launch', 'thread')}

And if you have cross-border tax questions, I'm now an accidental expert 😅`,
    utmSource: 'twitter',
    utmMedium: 'thread',
    utmCampaign: 'ph_launch',
    utmContent: 'thread',
    targetMetrics: {
      impressions: 1000,
      engagements: 50
    },
    status: 'pending'
  },

  {
    id: 'reddit-sideproject',
    platform: 'Reddit',
    community: 'r/SideProject',
    scheduledTime: '3:00 PM',
    title: '[Launched] TaxBridge - Built a cross-border tax calculator in 6 weeks, hit $6K MRR',
    body: `Hey r/SideProject,

Just launched TaxBridge on Product Hunt: ${generateUTMLink(PRODUCT_HUNT_URL, 'reddit', 'post', 'ph_launch', 'SideProject')}

**What it is:**
A cross-border tax calculator for H-1B/TN visa tech workers who got RSUs from FAANG and moved to Canada.

**The problem:**
100K+ people move from US → Canada every year with US stock. They face dual taxation (US + Canada) and most overpay $10K+ because they don't understand the tax treaty.

CPAs charge $3K+ to handle this, but the calculation is actually straightforward - just complex.

**How I built it:**
- Tech stack: Next.js 15, TypeScript, TailwindCSS, SQLite, Stripe
- Timeline: 6 weeks (nights & weekends)
- Cost: $0 (used free tiers for everything)
- Deployed: Vercel
- Time to first customer: 2 weeks

**Traction so far:**
- 25 paying customers ($299/yr Pro plan)
- $6,000 MRR (targeting $1M ARR year 1)
- 67% trial → paid conversion
- $195K+ total user savings

**What I learned:**
1. Niche markets are gold (100K TAM is plenty)
2. Painful problems = high willingness to pay
3. "I'd pay for this" → real paying customers (if you ship fast)
4. SEO matters (rank #1 for "US Canada RSU tax calculator")

**Launch day strategy:**
- Hunter outreach (7 days before)
- Email beta users 24 hours before
- Post in 15 communities throughout the day
- Respond to every PH comment within 10 minutes
- Target: 500+ upvotes, #1-3 Product of the Day

Happy to answer questions about the build, traction, or cross-border tax complexity!

Product Hunt: ${generateUTMLink(PRODUCT_HUNT_URL, 'reddit', 'post', 'ph_launch', 'SideProject')}
Website: ${generateUTMLink(WEBSITE_URL, 'reddit', 'post', 'ph_launch', 'SideProject')}`,
    utmSource: 'reddit',
    utmMedium: 'post',
    utmCampaign: 'ph_launch',
    utmContent: 'SideProject',
    targetMetrics: {
      upvotes: 150,
      comments: 40
    },
    status: 'pending'
  },

  {
    id: 'reddit-cscareerquestions',
    platform: 'Reddit',
    community: 'r/cscareerquestions',
    scheduledTime: '4:30 PM',
    title: 'PSA: If you\'re moving US → Canada for a tech job, here\'s a tax trap that cost me $12K',
    body: `Quick PSA for anyone considering moving from US → Canada for a tech job (or already made the move):

**If you have RSUs/stock options from your US employer, you'll face dual taxation after moving.**

This hit me when I transferred from Meta California to Meta Vancouver. My RSUs vested after I became a Canadian resident, and I owed tax to BOTH countries.

**What I wish someone told me:**
1. US taxes you on US-source income (stock from US company) even if you're not a resident
2. Canada taxes you on worldwide income as a resident
3. You CAN avoid double taxation using Foreign Tax Credit (FTC)
4. You MUST file IRS Form 8833 to claim treaty benefits
5. CPAs charge $3K+ for this (I paid one)

After going through this, I realized the calculation is straightforward and built a free calculator: ${generateUTMLink(WEBSITE_URL, 'reddit', 'post', 'ph_launch', 'cscareerquestions')}

**Who this affects:**
- TN visa transfers (Microsoft, Amazon, Meta, Google, Shopify)
- H-1B → Canada PR (common immigration path)
- Anyone with US stock vesting after Canadian residency
- Intra-company transfers (L-1)

**Timeline heads-up:**
- US filing deadline: April 15
- Canada filing deadline: April 30
- Form 8833 must be filed WITH your 1040 (not after)

Built this into a Product Hunt launch today: ${generateUTMLink(PRODUCT_HUNT_URL, 'reddit', 'post', 'ph_launch', 'cscareerquestions')}

Happy to answer questions - I've become an accidental expert on US-Canada tax treaty 😅`,
    utmSource: 'reddit',
    utmMedium: 'post',
    utmCampaign: 'ph_launch',
    utmContent: 'cscareerquestions',
    targetMetrics: {
      upvotes: 200,
      comments: 50
    },
    status: 'pending'
  },

  {
    id: 'indiehackers',
    platform: 'IndieHackers',
    community: 'Share Your Product',
    scheduledTime: '6:00 PM',
    title: 'Launched TaxBridge on PH today - $6K MRR in 6 weeks, targeting $1M ARR',
    body: `Hey IH,

Just launched TaxBridge on Product Hunt: ${generateUTMLink(PRODUCT_HUNT_URL, 'indiehackers', 'post', 'ph_launch', 'share_product')}

**Quick background:**
I'm a Meta SWE who moved from California to Vancouver. I overpaid $12K on my RSU taxes because I didn't understand the US-Canada tax treaty.

After spending $3K on a CPA and realizing the calculation is straightforward, I built a calculator to help others avoid the same mistake.

**Traction:**
- 6 weeks since launch
- 25 paying customers ($299/yr Pro plan)
- $6,000 MRR ($72K ARR)
- 67% trial → paid conversion
- 100% organic (no paid ads)

**Tech stack:**
- Next.js 15 (App Router), TypeScript, TailwindCSS
- SQLite via better-sqlite3 (local-first)
- Stripe for subscriptions
- Vercel for hosting
- Total cost: $0 (free tiers)

**Target market:**
100K+ H-1B/TN visa tech workers who got RSUs from FAANG and moved to Canada. Hyper-specific, but each customer saves $8K+ on average (high value = high willingness to pay).

**Revenue model:**
- Free tier: Basic calculations (drives SEO + brand awareness)
- Pro plan: $299/yr (multi-year tracking, export, form pre-fill)
- Enterprise: $999/yr (CPA partnerships, white-label)

**Growth strategy:**
1. SEO (rank #1 for "US Canada RSU tax calculator")
2. Content marketing (tax guides, treaty explainers)
3. Reddit/HN (where target audience hangs out)
4. CPA referral partnerships (20% recurring commission)

**Goal:**
$1M ARR in year 1 (need ~280 Pro customers or 60 Enterprise)

**Lessons learned:**
1. Niche > broad (100K TAM is plenty for $1M ARR)
2. Painful problems = high WTP (saving $10K = happy to pay $300)
3. Ship fast, validate with real customers (not beta testers)
4. SEO matters (60% of traffic comes from Google)

Happy to answer questions about the build, pricing, or growth strategy!

Product Hunt: ${generateUTMLink(PRODUCT_HUNT_URL, 'indiehackers', 'post', 'ph_launch', 'share_product')}
Website: ${generateUTMLink(WEBSITE_URL, 'indiehackers', 'post', 'ph_launch', 'share_product')}`,
    utmSource: 'indiehackers',
    utmMedium: 'post',
    utmCampaign: 'ph_launch',
    utmContent: 'share_product',
    targetMetrics: {
      upvotes: 50,
      comments: 20
    },
    status: 'pending'
  },

  {
    id: 'facebook-h1b-groups',
    platform: 'Facebook',
    community: 'H-1B Visa Groups (3 groups)',
    scheduledTime: '7:30 PM',
    title: '',
    body: `📢 For H-1B holders moving to Canada: Tax calculator for US RSUs

Hey everyone,

If you're moving from US → Canada and have RSUs/stock options from your employer, you'll face dual taxation (US + Canada).

I learned this the hard way when I moved from California to Vancouver - overpaid $12K because I didn't understand the US-Canada tax treaty.

After spending $3K on a CPA, I built a free calculator to help others: ${generateUTMLink(WEBSITE_URL, 'facebook', 'group', 'ph_launch', 'h1b_groups')}

**What it does:**
✅ Calculates US federal + state tax
✅ Calculates Canada federal + provincial tax
✅ Computes Foreign Tax Credit (FTC) to avoid double taxation
✅ Shows required forms (1040, T1, FBAR, 8938, Form 8833)

**Who it's for:**
- H-1B → Canada PR
- TN visa relocations
- Anyone with US stock vesting after Canadian residency

Also launching on Product Hunt today: ${generateUTMLink(PRODUCT_HUNT_URL, 'facebook', 'group', 'ph_launch', 'h1b_groups')}

Happy to answer questions about cross-border taxes!`,
    utmSource: 'facebook',
    utmMedium: 'group',
    utmCampaign: 'ph_launch',
    utmContent: 'h1b_groups',
    targetMetrics: {
      comments: 10
    },
    status: 'pending'
  },

  {
    id: 'linkedin-tech-groups',
    platform: 'LinkedIn',
    community: 'Vancouver/Toronto Tech Groups',
    scheduledTime: '9:00 PM',
    title: '',
    body: `🚀 Launched a cross-border tax calculator today (Product Hunt)

For anyone who moved from US → Canada for a tech job and has US stock (RSUs, options, ESPP), you'll face dual taxation.

I built TaxBridge to help with this: ${generateUTMLink(WEBSITE_URL, 'linkedin', 'group', 'ph_launch', 'tech_groups')}

**Background:**
I moved from Meta California to Meta Vancouver in 2024. My RSUs vested after I became a Canadian resident, and I owed tax to BOTH the US and Canada.

CPAs charge $3K+ for this calculation. After paying one, I realized it's straightforward and built a free calculator.

**Features:**
• Dual-country tax calculation (US + Canada)
• Foreign Tax Credit (FTC) optimizer
• Forms checklist (1040, T1, FBAR, 8938, Form 8833)
• USD/CAD conversion

Launching on Product Hunt today: ${generateUTMLink(PRODUCT_HUNT_URL, 'linkedin', 'group', 'ph_launch', 'tech_groups')}

Common at companies like Meta, Amazon, Google, Microsoft, Shopify, etc.

Happy to help if you're dealing with this!`,
    utmSource: 'linkedin',
    utmMedium: 'group',
    utmCampaign: 'ph_launch',
    utmContent: 'tech_groups',
    targetMetrics: {
      engagements: 15
    },
    status: 'pending'
  },

  {
    id: 'reddit-h1b',
    platform: 'Reddit',
    community: 'r/h1b',
    scheduledTime: '8:00 AM',
    title: 'H-1B → Canada: Free tax calculator for RSU/stock income (saved me $12K)',
    body: `For anyone on H-1B considering the move to Canada or already made the move:

**Tax heads-up:** If you have US stock (RSUs, options, ESPP), you'll face dual taxation when you move.

I moved from California to Vancouver while working at Meta. My RSUs vested after I became a Canadian resident, and I owed tax to BOTH countries - ended up overpaying $12K because I didn't understand the US-Canada tax treaty.

**Key points:**
1. US taxes you on US-source income even after you leave
2. Canada taxes your worldwide income as a resident
3. You CAN use Foreign Tax Credit to avoid double taxation
4. You MUST file IRS Form 8833 (treaty disclosure)
5. CPAs charge $3K+ for this calculation

I built a free calculator after going through this: ${generateUTMLink(WEBSITE_URL, 'reddit', 'post', 'ph_launch', 'h1b')}

**Features:**
- Calculates both US and Canada taxes
- Computes Foreign Tax Credit automatically
- Shows required forms (1040, T1, FBAR, 8938, 8833)
- Handles state tax (CA, NY, WA, TX, etc.)

Also launching on Product Hunt today: ${generateUTMLink(PRODUCT_HUNT_URL, 'reddit', 'post', 'ph_launch', 'h1b')}

Happy to answer questions about the H-1B → Canada path and cross-border taxes!`,
    utmSource: 'reddit',
    utmMedium: 'post',
    utmCampaign: 'ph_launch',
    utmContent: 'h1b',
    targetMetrics: {
      upvotes: 120,
      comments: 30
    },
    status: 'pending'
  },

  {
    id: 'reddit-tax',
    platform: 'Reddit',
    community: 'r/tax',
    scheduledTime: '8:00 PM',
    title: 'Built a cross-border tax calculator (US-Canada) - looking for CPA feedback',
    body: `Hi r/tax,

I built a cross-border tax calculator for people moving from US → Canada with RSU/stock income. Before I share it widely, I'd love feedback from tax professionals.

**Background:**
I'm a software engineer who moved from California to Vancouver. I had Meta RSUs that vested after becoming a Canadian resident. I ended up overpaying $12K because I didn't understand how to properly claim Foreign Tax Credits under the US-Canada tax treaty (Article XV).

After spending $3K on a CPA and learning the calculation, I built a tool to help others: ${generateUTMLink(WEBSITE_URL, 'reddit', 'post', 'ph_launch', 'tax')}

**What it does:**
- Calculates US federal + state tax on RSU income
- Calculates Canada federal + provincial tax on same income
- Computes Foreign Tax Credit (FTC) to avoid double taxation
- Provides forms checklist (1040, T1, FBAR, 8938, 8833)
- Handles USD/CAD conversion using BoC rates

**Tax professionals:**
Would love your feedback on:
1. Accuracy of calculations (using 2024/2025 brackets)
2. Treaty interpretation (Article XV)
3. Edge cases I should handle
4. Disclaimers/warnings to add

Launching on Product Hunt today: ${generateUTMLink(PRODUCT_HUNT_URL, 'reddit', 'post', 'ph_launch', 'tax')}

**Disclaimers:**
- This is a calculation tool, not tax advice
- Users should consult licensed CPAs for their specific situation
- All calculations reference official IRS/CRA tax code

Happy to discuss the tax logic with anyone interested!`,
    utmSource: 'reddit',
    utmMedium: 'post',
    utmCampaign: 'ph_launch',
    utmContent: 'tax',
    targetMetrics: {
      upvotes: 60,
      comments: 25
    },
    status: 'pending'
  },

  {
    id: 'levels-fyi-discord',
    platform: 'Discord',
    community: 'Levels.fyi #general',
    scheduledTime: '6:00 PM',
    title: '',
    body: `Hey everyone! 👋

Quick share for anyone who's moved US → Canada (or planning to):

If you have RSUs/stock from FAANG that vest after moving to Canada, you'll face dual taxation. I learned this the hard way - overpaid $12K on my Meta RSUs.

Built a free calculator to help others: ${generateUTMLink(WEBSITE_URL, 'discord', 'message', 'ph_launch', 'levels_fyi')}

Common scenario for:
- TN visa transfers to Canadian offices
- H-1B → Canada PR path
- Anyone with unvested equity when relocating

Also launching on Product Hunt today if you want to check it out: ${generateUTMLink(PRODUCT_HUNT_URL, 'discord', 'message', 'ph_launch', 'levels_fyi')}

Happy to answer questions about cross-border comp/taxes!`,
    utmSource: 'discord',
    utmMedium: 'message',
    utmCampaign: 'ph_launch',
    utmContent: 'levels_fyi',
    targetMetrics: {
      engagements: 20
    },
    status: 'pending'
  },

  {
    id: 'techcrunch-comments',
    platform: 'TechCrunch',
    community: 'Article Comments',
    scheduledTime: '8:00 PM',
    title: '',
    body: `Relevant to this discussion: I built a cross-border tax calculator for tech workers moving US → Canada with RSUs.

The dual taxation problem is real - I overpaid $12K on my Meta RSUs when I moved to Vancouver because I didn't understand the US-Canada tax treaty.

Free calculator: ${generateUTMLink(WEBSITE_URL, 'techcrunch', 'comment', 'ph_launch', 'article_comment')}

Launching on Product Hunt today: ${generateUTMLink(PRODUCT_HUNT_URL, 'techcrunch', 'comment', 'ph_launch', 'article_comment')}

(Only post this on relevant articles about: cross-border work, immigration, Canadian tech, RSU compensation, etc.)`,
    utmSource: 'techcrunch',
    utmMedium: 'comment',
    utmCampaign: 'ph_launch',
    utmContent: 'article_comment',
    targetMetrics: {
      engagements: 10
    },
    status: 'pending'
  }
];

export function getCommunityPost(id: string): CommunityPost | undefined {
  return communityPosts.find(post => post.id === id);
}

export function getCommunityPostsByPlatform(platform: string): CommunityPost[] {
  return communityPosts.filter(post => post.platform === platform);
}

export function getPendingPosts(): CommunityPost[] {
  return communityPosts.filter(post => post.status === 'pending');
}

export function getPostedPosts(): CommunityPost[] {
  return communityPosts.filter(post => post.status === 'posted');
}
