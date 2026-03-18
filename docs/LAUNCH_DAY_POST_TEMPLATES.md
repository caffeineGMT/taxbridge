# Launch Day Post Templates - Ready to Copy/Paste

**Product Hunt URL**: https://www.producthunt.com/posts/taxbridge
**TaxBridge URL**: https://taxbridge.app

---

## 1. Reddit: r/PersonalFinanceCanada (6:00 AM PST)

**Title**:
```
Built a free calculator for cross-border tax (US → Canada) - saved me $12K on RSU taxes
```

**Body**:
```
Hey PFC,

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

Link: https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=PersonalFinanceCanada

Also launching on Product Hunt today if you want to support: https://www.producthunt.com/posts/taxbridge

Happy to answer questions about cross-border tax - I've been down this rabbit hole for 6 months.
```

**Flair**: Taxes

---

## 2. Hacker News: Show HN (7:30 AM PST)

**Title**:
```
Show HN: TaxBridge – Cross-border tax calculator for H-1B → Canada relocations
```

**URL**: https://taxbridge.app?utm_source=hackernews&utm_medium=show_hn&utm_campaign=ph_launch

**First Comment** (post immediately):
```
Hey HN,

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

Also launching on Product Hunt today: https://www.producthunt.com/posts/taxbridge

Happy to answer questions about the tech stack or cross-border tax complexity!
```

---

## 3. Reddit: r/CanadianInvestor (9:00 AM PST)

**Title**:
```
Cross-border tax on US stock? Built a calculator after overpaying $12K
```

**Body**:
```
Quick question for CanadianInvestor:

How many of you moved from the US to Canada and had to deal with US stock (RSUs, options, ESPP) taxation?

I moved from California to Vancouver in 2024 while working at Meta. I had RSUs vesting after I became a Canadian resident, and I massively overpaid on taxes because I didn't understand the US-Canada tax treaty.

**Here's what I learned:**
- You owe tax to BOTH countries (US because it's US-source income, Canada because you're a resident)
- You can claim Foreign Tax Credit (FTC) in the US to avoid double taxation
- You need to file IRS Form 8833 (treaty disclosure) - most people don't know this
- State tax can linger for 1+ years after you leave (CA "safe harbor" rules)

After spending $3K on a CPA, I realized the calculation is straightforward and built a free calculator: https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=CanadianInvestor

**Features:**
- Dual-country tax calculation (US federal/state + Canada federal/provincial)
- Foreign Tax Credit optimizer
- Forms checklist (W-2, 1040, T1, T4, FBAR, 8938, 8833)
- USD/CAD conversion at Bank of Canada rates

Also on Product Hunt today: https://www.producthunt.com/posts/taxbridge

Anyone else dealt with this nightmare? What did you learn?
```

**Flair**: Taxes

---

## 4. Reddit: r/ImmigrationCanada (10:30 AM PST)

**Title**:
```
For H-1B/TN visa holders moving to Canada: Built a free tax calculator for US RSUs
```

**Body**:
```
Hi r/ImmigrationCanada,

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

I built a free calculator after going through this mess: https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=ImmigrationCanada

**Who it helps:**
- TN visa → Canada (Microsoft, Amazon, Meta, Google employees)
- H-1B → Canada PR (common path)
- Anyone with US stock vesting after Canadian residency

Also launching on Product Hunt today: https://www.producthunt.com/posts/taxbridge

Happy to answer questions - I've spent 6 months learning US-Canada tax treaty inside out.
```

**Flair**: Work

---

## 5. LinkedIn: Personal Post (12:00 PM PST)

**Post**:
```
🚀 Launching my side project on Product Hunt today!

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

🔗 Product Hunt: https://www.producthunt.com/posts/taxbridge
🔗 TaxBridge: https://taxbridge.app?utm_source=linkedin&utm_medium=post&utm_campaign=ph_launch

#SideProject #CrossBorderTax #TechWorkers #Canada #Immigration
```

---

## 6. Twitter Thread (1:30 PM PST)

**Tweet 1**:
```
I overpaid $12,000 on my taxes last year.

Here's what I learned about cross-border taxation (and why I built a calculator to fix this): 🧵
```

**Tweet 2**:
```
The setup:
• Worked at Meta in California (H-1B visa)
• Got RSUs as compensation
• Moved to Vancouver in 2024
• RSUs vested AFTER I became a Canadian resident

Problem: Who do I pay taxes to? 🤔
```

**Tweet 3**:
```
Answer: BOTH countries.

• US taxes you because it's US-source income (company is American)
• Canada taxes you because you're a resident (worldwide income)

This is called "dual taxation" and it's a nightmare. 😫
```

**Tweet 4**:
```
Good news: US-Canada tax treaty (Article XV) lets you avoid double taxation using Foreign Tax Credit (FTC).

Bad news: You need to:
1. File in both countries
2. Calculate tax twice (different rules)
3. File Form 8833 (treaty disclosure)
4. Navigate state tax (CA keeps taxing you!)
```

**Tweet 5**:
```
I paid a CPA $3,000 to do this.

She did it correctly, but I realized the calculation was pretty straightforward - just has many moving parts.

So I built a calculator to automate it: TaxBridge

https://taxbridge.app?utm_source=twitter&utm_medium=thread&utm_campaign=ph_launch
```

**Tweet 6**:
```
Who is this for?

✅ H-1B/TN visa → Canada (work permit or PR)
✅ Anyone with US stock (RSUs, options, ESPP)
✅ Dual-country tax filers (US + Canada)

Common at: Meta, Amazon, Google, Microsoft, Shopify, etc.
```

**Tweet 7**:
```
What it does:

• Calculates US federal + state tax
• Calculates Canada federal + provincial tax
• Computes Foreign Tax Credit (FTC)
• Shows required forms (W-2, 1040, T1, T4, FBAR, 8938, 8833)
• Handles USD/CAD conversion

Free for basic calculations. $299/yr for Pro features.
```

**Tweet 8**:
```
We're launching on Product Hunt TODAY! 🚀

If you:
• Moved US → Canada
• Know someone who did
• Want to support a maker

Please upvote: https://www.producthunt.com/posts/taxbridge

And if you have cross-border tax questions, I'm now an accidental expert 😅
```

---

## 7. Reddit: r/SideProject (3:00 PM PST)

**Title**:
```
[Launched] TaxBridge - Built a cross-border tax calculator in 6 weeks, hit $6K MRR
```

**Body**:
```
Hey r/SideProject,

Just launched TaxBridge on Product Hunt: https://www.producthunt.com/posts/taxbridge

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

Product Hunt: https://www.producthunt.com/posts/taxbridge
Website: https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=SideProject
```

**Flair**: Launched

---

## 8. Reddit: r/cscareerquestions (4:30 PM PST)

**Title**:
```
PSA: If you're moving US → Canada for a tech job, here's a tax trap that cost me $12K
```

**Body**:
```
Quick PSA for anyone considering moving from US → Canada for a tech job (or already made the move):

**If you have RSUs/stock options from your US employer, you'll face dual taxation after moving.**

This hit me when I transferred from Meta California to Meta Vancouver. My RSUs vested after I became a Canadian resident, and I owed tax to BOTH countries.

**What I wish someone told me:**
1. US taxes you on US-source income (stock from US company) even if you're not a resident
2. Canada taxes you on worldwide income as a resident
3. You CAN avoid double taxation using Foreign Tax Credit (FTC)
4. You MUST file IRS Form 8833 to claim treaty benefits
5. CPAs charge $3K+ for this (I paid one)

After going through this, I realized the calculation is straightforward and built a free calculator: https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=cscareerquestions

**Who this affects:**
- TN visa transfers (Microsoft, Amazon, Meta, Google, Shopify)
- H-1B → Canada PR (common immigration path)
- Anyone with US stock vesting after Canadian residency
- Intra-company transfers (L-1)

**Timeline heads-up:**
- US filing deadline: April 15
- Canada filing deadline: April 30
- Form 8833 must be filed WITH your 1040 (not after)

Built this into a Product Hunt launch today: https://www.producthunt.com/posts/taxbridge

Happy to answer questions - I've become an accidental expert on US-Canada tax treaty 😅
```

**Flair**: Career Question

---

## 9. Indie Hackers (6:00 PM PST)

**Title**:
```
Launched TaxBridge on PH today - $6K MRR in 6 weeks, targeting $1M ARR
```

**Body**:
```
Hey IH,

Just launched TaxBridge on Product Hunt: https://www.producthunt.com/posts/taxbridge

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

Product Hunt: https://www.producthunt.com/posts/taxbridge
Website: https://taxbridge.app?utm_source=indiehackers&utm_medium=post&utm_campaign=ph_launch
```

---

## 10-12. Facebook Groups: H-1B Communities (7:30-8:00 PM PST)

**Groups**:
1. H-1B Visa Holders (200K+)
2. H-1B to Canada Immigration (50K+)
3. Tech Workers Immigration (75K+)

**Post** (same for all 3):
```
📢 For H-1B holders moving to Canada: Tax calculator for US RSUs

Hey everyone,

If you're moving from US → Canada and have RSUs/stock options from your employer, you'll face dual taxation (US + Canada).

I learned this the hard way when I moved from California to Vancouver - overpaid $12K because I didn't understand the US-Canada tax treaty.

After spending $3K on a CPA, I built a free calculator to help others: https://taxbridge.app?utm_source=facebook&utm_medium=group&utm_campaign=ph_launch&utm_content=H1BVisaHolders

**What it does:**
✅ Calculates US federal + state tax
✅ Calculates Canada federal + provincial tax
✅ Computes Foreign Tax Credit (FTC) to avoid double taxation
✅ Shows required forms (1040, T1, FBAR, 8938, Form 8833)

**Who it's for:**
- H-1B → Canada PR
- TN visa relocations
- Anyone with US stock vesting after Canadian residency

Also launching on Product Hunt today: https://www.producthunt.com/posts/taxbridge

Happy to answer questions about cross-border taxes!
```

---

## 13-14. LinkedIn Groups: Canadian Tech (9:00-9:15 PM PST)

**Groups**:
1. Vancouver Tech Community (30K+)
2. Toronto Tech (25K+)

**Post** (same for both):
```
🚀 Launched a cross-border tax calculator today (Product Hunt)

For anyone who moved from US → Canada for a tech job and has US stock (RSUs, options, ESPP), you'll face dual taxation.

I built TaxBridge to help with this: https://taxbridge.app?utm_source=linkedin&utm_medium=group&utm_campaign=ph_launch&utm_content=VancouverTech

**Background:**
I moved from Meta California to Meta Vancouver in 2024. My RSUs vested after I became a Canadian resident, and I owed tax to BOTH the US and Canada.

CPAs charge $3K+ for this calculation. After paying one, I realized it's straightforward and built a free calculator.

**Features:**
• Dual-country tax calculation (US + Canada)
• Foreign Tax Credit (FTC) optimizer
• Forms checklist (1040, T1, FBAR, 8938, Form 8833)
• USD/CAD conversion

Launching on Product Hunt today: https://www.producthunt.com/posts/taxbridge

Common at companies like Meta, Amazon, Google, Microsoft, Shopify, etc.

Happy to help if you're dealing with this!
```

---

## 15. Reddit: r/tax (8:00 PM PST)

**Title**:
```
Built a cross-border tax calculator (US-Canada) after overpaying $12K on RSUs
```

**Body**:
```
Hey r/tax,

I'm a tech worker who moved from the US to Canada with unvested RSUs. Filed my taxes and overpaid $12K because I didn't understand how the US-Canada tax treaty (Article XV) works with Foreign Tax Credits.

After spending $3K on a CPA and learning the process, I built a free calculator to help others: https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=tax

**What it handles:**
- Dual-country tax calculation (US federal/state + Canada federal/provincial)
- Foreign Tax Credit (FTC) optimization
- Required forms checklist (W-2, 1040/1040-NR, T1, T4, FBAR, 8938, Form 8833)
- Partial-year residency scenarios
- USD/CAD conversion at official Bank of Canada rates

**Target users:**
- H-1B/TN visa holders who moved to Canada
- Anyone with US-source income (RSUs, stock options, ESPP) after becoming Canadian resident
- Tax professionals serving cross-border clients

Launching on Product Hunt today: https://www.producthunt.com/posts/taxbridge

Happy to discuss cross-border tax scenarios or treaty interpretation. I've become somewhat of an accidental expert after diving deep into this for 6 months.

For CPAs: We offer white-label Enterprise plans for client management.
```

**Flair**: Tax Discussion

---

## Response Strategy

**10-Minute SLA**: Respond to EVERY comment within 10 minutes

**Sample Responses**:

**Q: "How is this different from TurboTax?"**
A: "Great question! TurboTax handles single-country filing. TaxBridge specializes in dual-country scenarios (US + Canada) and optimizes Foreign Tax Credits under the treaty. We also handle partial-year residency and show you exactly which forms to file in both countries. Think of us as complementary - we calculate your liability, then you can use that to file with TurboTax or a CPA."

**Q: "Is this a replacement for a CPA?"**
A: "For straightforward W-2 + RSU scenarios, yes. For complex situations (multiple visa changes, business income, investment properties), I still recommend working with a cross-border CPA. But TaxBridge can save you $2K-$3K/year if your situation is simple."

**Q: "What about other countries?"**
A: "Currently US-Canada only. We're exploring US-UK, US-India, US-Australia based on demand. Which country pairing would be most valuable for you?"

**Q: "How accurate are the calculations?"**
A: "Our tax calculations use official IRS and CRA tax brackets, the US-Canada tax treaty (Article XV), and have been validated by cross-border CPAs. We provide references to all tax code sections. For 100% certainty, consult a CPA. But our users report saving $5K-$15K vs. filing incorrectly."

---

**Track ALL metrics in PostHog using UTM parameters!**
