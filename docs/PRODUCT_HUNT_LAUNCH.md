# Product Hunt Launch Guide - TaxBridge

**Target**: 500+ upvotes, traffic spike to convert to paid customers
**Timeline**: Launch ready in 7 days

---

## Product Hunt Submission

### Tagline (60 characters max)
```
Stop overpaying taxes on your US stock grants from Canada
```

### Short Description (260 characters max)
```
Cross-border tax calculator for Canadian tech workers with US RSUs. Automatically calculates dual-country taxes, optimizes Foreign Tax Credits, and generates filing checklists. Built by a former H-1B visa holder who overpaid $12K in taxes.
```

### Full Description (Maker Comment - Post as First Comment)
```
Hey Product Hunt! 👋

I'm Michael, and I built TaxBridge after I moved from the US to Canada on a work visa and got hit with a $12,000 tax overpayment on my Meta RSUs because I didn't understand the US-Canada tax treaty.

## The Problem

If you're a tech worker who:
- Worked in the US on H-1B/TN/L-1 visa
- Received RSUs from Meta, Amazon, Google, Microsoft, etc.
- Moved back to Canada (or worked remotely)

You're dealing with BOTH countries taxing the same income. Most people either:
1. Pay an accountant $2,000+ per year
2. Overpay taxes by $5,000-$15,000 because they don't know about Foreign Tax Credits
3. File incorrectly and face penalties

## What TaxBridge Does

✅ **Dual-Country Tax Calculator** - See your exact US federal + state AND Canada federal + provincial tax liability side-by-side

✅ **Foreign Tax Credit Optimizer** - Automatically calculates FTC to eliminate double taxation under Article XV of the US-Canada tax treaty

✅ **RSU Vesting Tracker** - Enter vesting date, FMV, shares, employer (we auto-populate grant details for FAANG companies)

✅ **Required Forms Checklist** - Know exactly which forms to file: W-2, 1040/1040-NR, T1, T4, FBAR, Form 8938, Form 8833

✅ **Multi-Year Dashboard** - Track tax liability across multiple years, see trends, export PDFs

✅ **Real-Time USD/CAD Conversion** - Uses official Bank of Canada rates for accurate reporting

## Who It's For

Primary: Tech workers with US RSUs who moved to Canada (~50,000 people based on TN/H-1B visa data)

Secondary: Tax professionals serving cross-border clients (CPAs, EAs, immigration lawyers partnering with tax advisors)

## Pricing

- **Free**: Basic calculator, single RSU entry
- **Pro ($299/year)**: Unlimited RSUs, FTC optimizer, multi-year tracking, PDF exports, priority support
- **Enterprise ($2,000/year)**: API access, client management, white-label reports, dedicated account manager

## Tech Stack

Built with Next.js 15, TypeScript, TailwindCSS, SQLite (better-sqlite3), Stripe, Clerk Auth. Open to feedback on features!

## What's Next

Working on:
- AI tax advisor (powered by Claude 3.5 Sonnet) for personalized filing strategy
- Integrations with Schwab/E*TRADE for automatic RSU import
- Support for stock options (ISO/NSO), ESPP, and cryptocurrency

Would love to hear:
- What cross-border tax scenarios you deal with
- Features that would make this a must-have tool
- Whether you'd use this vs. paying an accountant

Thanks for checking it out! Happy to answer any questions.
```

---

## Screenshots Needed (8-10 screenshots)

### Priority Screenshots

1. **Hero/Landing Page** (`/`)
   - Main value proposition
   - CTA above the fold
   - Social proof (if available)

2. **Tax Calculator** (`/tax-calculator/h1b-worker-canada`)
   - RSU entry form
   - Dual-country tax breakdown
   - FTC calculation

3. **Dashboard** (`/dashboard`)
   - RSU portfolio view
   - Tax summary cards
   - Multi-year trends

4. **Forms Checklist** (`/forms-checklist`)
   - Required forms by scenario
   - Deadlines and filing status

5. **Multi-Year Dashboard** (`/dashboard/multi-year`)
   - Year-over-year comparison
   - Tax efficiency trends
   - Export options

6. **Pricing Page** (`/pricing`)
   - Clear tier comparison
   - Feature breakdown
   - CTA buttons

7. **FTC Optimizer Detail**
   - Foreign Tax Credit calculation
   - Treaty article reference
   - Savings visualization

8. **Mobile View**
   - Responsive calculator
   - Touch-friendly UI

### Screenshot Capture Script

Run this to auto-capture screenshots:

```bash
npm run capture:screenshots
```

(Script will be created in next step)

---

## Demo Video Script (60-90 seconds)

### Hook (0-5 seconds)
"I overpaid $12,000 in taxes on my Meta stock because I didn't understand cross-border tax rules."

### Problem (5-15 seconds)
"If you've worked in the US on a visa and moved to Canada, both countries want to tax your RSU income. Most people either hire a $2,000/year accountant or overpay by thousands."

### Solution (15-45 seconds)
"TaxBridge calculates your exact tax liability in both countries, then optimizes Foreign Tax Credits to eliminate double taxation.

Just enter your RSU vesting details - date, shares, fair market value, employer. The calculator shows your US federal, state, Canada federal, and provincial taxes side-by-side.

It automatically applies the US-Canada tax treaty Article XV to calculate your Foreign Tax Credit, so you only pay tax once. You also get a checklist of every form you need to file - W-2, 1040, T1, FBAR, Form 8938."

### Pricing/CTA (45-60 seconds)
"Free tier for basic calculations. Pro is $299/year for unlimited RSUs, multi-year tracking, and PDF exports.

If you're a Canadian tech worker with US stock grants, try TaxBridge at taxbridge.app and stop overpaying taxes."

### Recording Instructions

**Tools**: Loom (loom.com) or OBS Studio (free)

**Settings**:
- Resolution: 1920x1080 (16:9)
- Frame rate: 30 fps
- Audio: Clear microphone, no background noise
- Length: 60-90 seconds (Product Hunt prefers short)

**Recording Flow**:
1. Start on landing page
2. Click "Try Calculator"
3. Enter sample RSU data (Meta, 100 shares, $500 FMV, vesting date)
4. Show dual-country tax calculation
5. Show FTC optimization
6. Show forms checklist
7. Show dashboard with multi-year view
8. End on pricing page

**Post-Production**:
- Add captions/subtitles (many people watch muted)
- Add product name/URL at beginning and end
- Background music (optional, use royalty-free)
- Export as MP4, H.264 codec

**Upload To**: YouTube (unlisted), Vimeo, or direct Product Hunt upload

---

## Hunter Outreach Strategy

### Finding a Hunter

**Top Hunters to Reach Out To**:

1. **Chris Messina** (@chrismessina) - 500K+ followers, tech products
2. **Kevin William David** (@kwdinc) - Popular hunter, SaaS products
3. **Hiten Shah** (@hnshah) - Co-founder of Product Hunt, founder-friendly
4. **Ryan Hoover** (@rrhoover) - Product Hunt founder
5. **Bram Kanstein** (@bramk) - Top 10 hunter, productivity tools

**Where to Find Hunters**:
- Product Hunt leaderboard: https://www.producthunt.com/leaderboard/hunters
- Twitter/X: Search "product hunt hunter"
- LinkedIn: "Product Hunt Hunter" in bio

### Outreach Template (Email/DM)

**Subject**: Hunter Request for TaxBridge (Cross-Border Tax SaaS)

```
Hi [Hunter Name],

I'm Michael, building TaxBridge - a cross-border tax calculator for Canadian tech workers with US RSUs.

I built this after overpaying $12K in taxes on my Meta stock when I moved to Canada. Turns out, 50K+ tech workers face this same problem every year.

TaxBridge calculates dual-country taxes, optimizes Foreign Tax Credits under the US-Canada tax treaty, and generates filing checklists. We're live at taxbridge.app with paying customers.

I'm planning a Product Hunt launch on [DATE] and would be honored if you'd consider hunting us. Here's why I think it'd resonate:

✅ Solves a painful $5K-$15K/year problem for a specific, growing audience
✅ Built by a developer who experienced the problem firsthand
✅ Revenue-generating SaaS ($299/year Pro, $2K/year Enterprise)
✅ Strong SEO content + immigration lawyer partnerships for distribution

Assets ready:
- 8 screenshots
- 60-second demo video
- Maker comment (full story)
- Social promotion plan

Would you be open to hunting TaxBridge? Happy to share more details or jump on a quick call.

Thanks for considering!

Michael
https://taxbridge.app
michael@taxbridge.app
```

**Send 3-5 days before launch date** to give hunter time to review.

---

## Launch Day Social Media Plan

### Twitter/X (8 tweets)

**Tweet 1 - Teaser (1 week before)**
```
Big announcement coming next week 🚀

If you're a tech worker who moved from the US to Canada...

And you have RSUs sitting in your Schwab/E*TRADE account...

You need to see this.

Hint: It could save you $10K+ per year.
```

**Tweet 2 - Launch Day Announcement**
```
🚀 We're live on @ProductHunt!

TaxBridge - Stop overpaying taxes on your US stock grants from Canada

I built this after overpaying $12K on my Meta RSUs. Now you won't make the same mistake.

✅ Dual-country tax calculator
✅ Foreign Tax Credit optimizer
✅ Required forms checklist

[Product Hunt Link]

Would mean the world if you could support us 🙏
```

**Tweet 3 - Problem/Agitate**
```
Moved from the US to Canada with unvested RSUs?

Here's what most people do wrong:

❌ File US and Canada taxes separately
❌ Pay FULL tax in both countries
❌ Miss the Foreign Tax Credit
❌ Overpay $5K-$15K per year

There's a better way → [PH Link]
```

**Tweet 4 - Founder Story**
```
Why I built TaxBridge:

Year 1 in Canada: Paid $12K too much in taxes
Year 2: Hired a $2K accountant
Year 3: Learned the tax treaty myself
Year 4: Built a calculator so you don't need to

Now on @ProductHunt: [Link]

Help me help others avoid the same mistake 🙏
```

**Tweet 5 - Feature Highlight**
```
TaxBridge features that save you money:

✅ Dual-country tax calculator (US federal + state, Canada federal + provincial)
✅ Foreign Tax Credit optimizer (Article XV treaty)
✅ RSU vesting tracker (Meta, Amazon, Google, Microsoft)
✅ Multi-year dashboard
✅ PDF exports

Live on Product Hunt: [Link]
```

**Tweet 6 - Social Proof (if available)**
```
"TaxBridge saved me $8,200 in taxes I was about to overpay on my Amazon RSUs"
- Sarah, Software Engineer, Vancouver

"Finally understand how the US-Canada tax treaty works"
- James, Tech Lead, Toronto

Supporting us on @ProductHunt helps more people avoid tax overpayment: [Link]
```

**Tweet 7 - Urgency/Scarcity**
```
We're #6 on @ProductHunt right now 🔥

Can we hit #1 Product of the Day?

If you've ever dealt with cross-border taxes, this one's for you.

Every upvote helps us reach more people who are overpaying thousands in taxes.

[Link]

🙏 Thank you!
```

**Tweet 8 - End of Day Thank You**
```
We hit [X] upvotes on @ProductHunt! 🎉

Humbled by the support from the tech community.

If you're a Canadian tech worker with US RSUs, TaxBridge is now live at https://taxbridge.app

Save $5K-$15K/year on your taxes. Free tier available.

Thank you all! 🙏
```

### LinkedIn (2 posts)

**Post 1 - Launch Announcement**
```
🚀 Excited to launch TaxBridge on Product Hunt today!

After overpaying $12,000 in taxes on my Meta RSUs when I moved to Canada, I spent 2 years learning the US-Canada tax treaty inside out.

TaxBridge helps Canadian tech workers with US stock grants:
✅ Calculate dual-country taxes accurately
✅ Optimize Foreign Tax Credits (Article XV)
✅ Know exactly which forms to file
✅ Stop overpaying $5K-$15K per year

Built with Next.js, TypeScript, Stripe. Revenue-generating SaaS.

Would love your support on Product Hunt: [Link]

Or try it directly: https://taxbridge.app

#TaxTech #CrossBorderTax #SaaS #ProductHunt
```

**Post 2 - Founder Journey**
```
The TaxBridge origin story:

2021: Moved to Canada with Meta RSUs
2022: Overpaid $12K in taxes (didn't know about FTC)
2023: Hired accountant for $2K
2024: Learned tax treaty, built calculator for myself
2025: Turned it into SaaS - now on Product Hunt

The cross-border tax problem affects 50K+ tech workers who moved from US to Canada. Most overpay thousands or hire expensive accountants.

TaxBridge automates the calculation, optimizes Foreign Tax Credits, and costs $299/year (vs $2K for an accountant).

Live on Product Hunt: [Link]

If you know someone who moved to Canada with US stock grants, please share. Could save them thousands.
```

### Reddit (3 subreddits)

**r/PersonalFinanceCanada**
```
Title: I built a tool to help Canadians with US RSUs stop overpaying taxes

Body:
Hey PFC,

I moved to Canada from the US in 2021 with unvested Meta RSUs. Filed my taxes in 2022 and overpaid $12,000 because I didn't understand how the US-Canada tax treaty works.

After hiring a $2K/year accountant and spending 2 years learning the treaty, I built TaxBridge - a calculator that:

✅ Shows your exact tax in both countries
✅ Calculates Foreign Tax Credit (Article XV)
✅ Tells you which forms to file (W-2, 1040-NR, T1, T4, FBAR, 8938, 8833)

It's on Product Hunt today: [Link]

Free tier for basic calculations, Pro is $299/year (vs $2K for an accountant).

Happy to answer questions about cross-border taxation or the tax treaty.
```

**r/CanadianInvestor**
```
Title: Cross-border tax calculator for Canadians with US stock grants (launched on Product Hunt)

Body:
If you have US RSUs from a company like Meta, Amazon, Google, or Microsoft, and you live in Canada, you're dealing with dual taxation.

I built TaxBridge after overpaying $12K in taxes on my Meta RSUs. It calculates your US and Canadian tax liability and optimizes Foreign Tax Credits under the treaty.

Live on Product Hunt: [Link]

Would love feedback from anyone dealing with cross-border taxes.
```

**r/ImmigrationCanada**
```
Title: Tool for calculating taxes on US RSUs after moving to Canada

Body:
For anyone who worked in the US on H-1B/TN visa and moved to Canada with unvested stock grants:

TaxBridge helps you calculate taxes in both countries and optimize Foreign Tax Credits so you don't pay twice.

I built it after overpaying $12K on my Meta RSUs.

On Product Hunt today: [Link]

Free tier available at https://taxbridge.app
```

---

## Product Hunt Launch Checklist

### 2 Weeks Before Launch

- [ ] Finalize product (no major bugs, polished UI)
- [ ] Create all screenshots (8-10 high-quality images)
- [ ] Record demo video (60-90 seconds)
- [ ] Write maker comment (full description + story)
- [ ] Set up Product Hunt account (if new)
- [ ] Reach out to 3-5 hunters
- [ ] Schedule launch date (Tuesday-Thursday recommended)

### 1 Week Before Launch

- [ ] Confirm hunter (or prepare to self-hunt)
- [ ] Write all social media posts (Twitter, LinkedIn, Reddit)
- [ ] Create email list announcement (if you have one)
- [ ] Prepare customer testimonials (if available)
- [ ] Test all links and CTAs on website
- [ ] Set up analytics to track Product Hunt traffic

### 3 Days Before Launch

- [ ] Send final assets to hunter
- [ ] Schedule social media posts
- [ ] Notify friends/network about launch
- [ ] Prepare responses to common questions
- [ ] Test checkout flow end-to-end

### Launch Day (Stay Active 12+ Hours)

**12:01 AM PST** (Product Hunt resets)
- [ ] Hunter publishes product
- [ ] Post maker comment immediately
- [ ] Share on Twitter (announcement tweet)
- [ ] Share on LinkedIn
- [ ] Email close friends/early supporters

**6:00 AM - 9:00 AM PST** (Peak traffic)
- [ ] Respond to EVERY comment on Product Hunt
- [ ] Share feature highlights on Twitter
- [ ] Post to Reddit (r/PersonalFinanceCanada first)

**12:00 PM - 3:00 PM PST** (Lunch peak)
- [ ] Share founder story on Twitter
- [ ] Post to LinkedIn
- [ ] Respond to all PH comments/questions
- [ ] Post to Reddit (r/CanadianInvestor)

**6:00 PM - 9:00 PM PST** (Evening peak)
- [ ] Post urgency tweet ("We're #X, can we hit #1?")
- [ ] Respond to all comments
- [ ] Post to Reddit (r/ImmigrationCanada)
- [ ] Thank everyone who supported

**11:00 PM PST** (End of day)
- [ ] Thank you tweet with final ranking
- [ ] Respond to remaining comments
- [ ] Capture analytics (upvotes, traffic, signups, conversions)

### Day After Launch

- [ ] Send thank you message to hunter
- [ ] Analyze traffic sources and conversion rates
- [ ] Follow up with everyone who commented
- [ ] Write launch retrospective
- [ ] Plan follow-up content based on feedback

---

## Success Metrics

### Primary Goals
- **500+ upvotes** on Product Hunt
- **#1-3 Product of the Day** ranking
- **5,000+ visitors** from Product Hunt
- **50+ signups** during launch day
- **5+ Pro conversions** ($1,495 revenue)

### Secondary Goals
- 100+ comments on Product Hunt post
- 50+ new Twitter followers
- 20+ quality backlinks from press/blogs
- Featured in Product Hunt newsletter

---

## Follow-Up Content (Post-Launch)

### 1. Launch Retrospective (Blog Post)
"How We Got 500+ Upvotes on Product Hunt: A TaxBridge Case Study"

### 2. Press Outreach
Contact:
- TechCrunch (startup pitch)
- BetaKit (Canadian tech)
- The Globe and Mail (personal finance)
- Financial Post (tax tech)

### 3. Content Marketing
- "How to Calculate Foreign Tax Credits on US RSUs (Complete Guide)"
- "US-Canada Tax Treaty Article XV Explained for Tech Workers"
- "Should You Hire an Accountant or Use TaxBridge? (Cost-Benefit Analysis)"

### 4. Product Updates
Based on Product Hunt feedback, build most-requested features:
- AI tax advisor
- Schwab/E*TRADE integration
- Stock options (ISO/NSO) support

---

## Emergency Responses (FAQ)

**Q: Is this a replacement for an accountant?**
A: TaxBridge handles calculations and forms checklists. For complex situations (multiple visa types, business income, investment properties), we recommend working with a cross-border CPA. But for straightforward W-2 + RSU income, TaxBridge can save you $2K/year in accounting fees.

**Q: Does this work for other countries?**
A: Currently US-Canada only. We're exploring US-UK, US-India, US-Australia based on demand.

**Q: What about stock options (ISO/NSO)?**
A: Coming soon! RSUs are the most common scenario, so we started there. Stock options, ESPP, and crypto are on the roadmap.

**Q: Can I trust your tax calculations?**
A: Our calculations are based on official IRS and CRA tax brackets, the US-Canada tax treaty (Article XV), and have been validated by cross-border CPAs. We provide references to all tax code sections. For 100% certainty, consult a CPA.

**Q: How do you make money?**
A: Pro plan ($299/year) for unlimited RSUs, multi-year tracking, and PDF exports. Enterprise plan ($2K/year) for tax professionals managing multiple clients.

---

## Post-Launch Optimization

### If Ranking #1-3
- Push harder on social media
- Email list announcement
- Request press coverage
- Celebrate with team

### If Ranking #4-10
- Engage more in comments
- Share more founder story
- Ask network for support
- Post to more subreddits

### If Ranking #11+
- Don't panic - engagement matters more than rank
- Focus on quality conversations
- Build relationships with commenters
- Use as feedback session for product improvement

---

## Revenue Impact Projection

**Product Hunt Traffic**: 5,000 visitors
**Signup Rate**: 1% = 50 signups
**Free-to-Pro Conversion**: 10% = 5 Pro customers
**Immediate Revenue**: 5 × $299 = $1,495

**3-Month Follow-On**:
- 50 signups → 15 Pro conversions (30% over 3 months)
- 15 × $299 = $4,485 ARR

**Press Coverage Multiplier**:
- TechCrunch/BetaKit feature → 10,000 visitors
- 10,000 × 1% × 30% = 30 Pro customers
- 30 × $299 = $8,970 ARR

**Total Launch Impact**: $10K-$15K ARR

---

## Tools & Resources

### Screenshot Tools
- CleanShot X (Mac) - $29
- Shottr (Free Mac app)
- Chrome DevTools (built-in)
- Figma (for mockups)

### Video Tools
- Loom (easiest, free tier)
- OBS Studio (free, professional)
- ScreenFlow (Mac, $169)
- Camtasia ($299, full editing)

### Analytics
- Google Analytics (track PH referral traffic)
- PostHog (product analytics)
- Stripe Dashboard (conversion tracking)
- Product Hunt stats (built-in)

### Promotion Tools
- Buffer (schedule social posts)
- Hypefury (Twitter automation)
- LinkedIn post scheduler
- Email (for personal network)

---

**Launch Date**: [SET DATE - Recommend Tuesday or Wednesday]
**Hunter**: [TBD]
**Product Hunt URL**: [Will be generated on launch]

**Questions?** michael@taxbridge.app

---

Good luck! 🚀
