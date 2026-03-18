# TaxBridge Revenue Roadmap: Path to $1M ARR

**Last Updated:** March 18, 2026
**Current Status:** Product ready, Stripe in test mode, 50 SEO pages live
**Target:** $1M Annual Recurring Revenue
**Timeline:** 12-18 months

---

## Executive Summary

TaxBridge has a production-ready MVP with comprehensive features:
- ✅ Dual US/Canada tax calculation with Treaty Article XV
- ✅ Foreign Tax Credit optimizer
- ✅ 50 programmatic SEO pages (geo + employer-targeted)
- ✅ Stripe integration (test mode)
- ✅ Referral program, notifications, enterprise features
- ✅ AI tax advisor, CSV import, PDF export

**The Gap:** Zero revenue because Stripe is in test mode. Distribution and conversion need aggressive execution.

---

## Revenue Math

**Target:** $1M ARR

**Path 1 - Pro-Heavy:**
- 3,350 Pro users × $299/year = $1,001,650

**Path 2 - Enterprise-Heavy:**
- 500 Enterprise seats × $2,000/year = $1,000,000

**Path 3 - Blended (Most Realistic):**
- 2,500 Pro users × $299 = $747,500
- 100 Enterprise seats × $2,000 = $200,000
- 100 tax filing services × $799 = $79,900 (one-time)
- **Total:** ~$1M ARR + $80K one-time

---

## Critical Path Tasks (MUST DO FIRST)

### 🚨 Revenue Blocker: Stripe Production Mode
**Due:** March 20, 2026
**Impact:** Blocks 100% of revenue
**Action:**
1. Go to dashboard.stripe.com → switch to Production mode
2. Copy live keys (sk_live_*, pk_live_*)
3. Run `npm run setup:stripe` to create products
4. Update Vercel env vars with live price IDs
5. Set up production webhook endpoint
6. Test end-to-end with real card
7. Deploy

**Success Metric:** First paying customer within 48 hours

### 🎯 Google Ads Campaign Launch
**Due:** March 25, 2026
**Budget:** $500/month (scale to $2K if CPA < $100)
**Target Keywords:**
- "H1B RSU tax calculator" (500-1K monthly searches)
- "US Canada cross border tax" (200-500 searches)
- "Meta RSU tax Canada" (100-200 searches)
- Competitor terms: "TurboTax cross border"

**Landing Page:** /lp/calculator (already exists)
**Conversion Goal:** CPA < $150 for Pro trial
**Expected:** 3-5 Pro conversions/month at $500 budget

---

## High-Impact Acquisition Channels

### 1. SEO + Content (Organic Growth)
**Status:** Foundation built (50 pages), needs backlinks + content**

**Tasks:**
- ✅ Lead magnet: "Complete H-1B RSU Tax Guide 2026" PDF (30 pages)
  - Gate behind email capture
  - Target: 500 downloads in Month 1
- ✅ Backlink strategy: 20 high-quality links from immigration/finance sites
  - Guest posts on AILA, CanadaVisa, MyVisaJobs
  - Answer Quora questions
  - Submit to Investopedia/NerdWallet directories
- ✅ YouTube tutorial: "How to Calculate RSU Taxes After Moving to Canada"
  - 5-minute screencast walkthrough
  - Target: 1K views = 50 signups

**Expected Impact:** 200 organic signups/month by Month 6

### 2. Viral/Community (Zero-Cost Channels)
**Leverage founder story + authentic community participation**

**Tasks:**
- ✅ Product Hunt launch (March 30)
  - Target: Top 5 product of the day
  - Expected: 1K visitors, 50 signups, 5-10 Pro
- ✅ LinkedIn viral post from personal account
  - "I saved $12K on my Meta RSU taxes using this calculator"
  - Boost with $100 ad spend
  - Target: 10K impressions, 20 signups
- ✅ Reddit strategy (non-spammy, helpful)
  - r/PersonalFinanceCanada: Cross-border tax guide
  - r/cscareerquestions: RSU tax trap story
  - r/ExpatFinance: Treaty Article XV explained
  - Target: 500 upvotes combined, 10 Pro conversions
- ✅ Referral program enhancement
  - $50 credit for referrer + referee (both sides win)
  - Viral coefficient target: 0.3

**Expected Impact:** 3-5 viral moments = 500 signups in 6 months

### 3. Paid Retargeting (Convert Calculator Users)
**Meta Pixel + Facebook/Instagram ads**

**Tasks:**
- ✅ Meta Pixel setup (already in .env)
- ✅ Custom audiences:
  - Calculator users who didn't sign up (30-day retention)
  - Signups who didn't upgrade (90-day retention)
- ✅ Ad creative:
  - Carousel showcasing features ($5/day)
  - Testimonials from H-1B users ($10/day)
  - Deadline urgency near April 15/30 ($15/day)

**Budget:** $500/month
**Expected:** 2% retargeting conversion = 16 conversions = $4,800 MRR

---

## Conversion Optimization

### Email Drip Campaign (Free → Pro)
**7-email sequence triggered on signup:**

1. Day 0: Welcome + calculator tutorial
2. Day 2: "How FTC optimizer works" (feature showcase)
3. Day 4: Case study - "$8K saved by Sarah (Meta SWE)"
4. Day 7: Trial offer - "Try Pro free for 7 days"
5. Day 10: Urgency - "Don't miss filing deadline" + countdown
6. Day 14: Social proof - "Join 500+ H-1B holders"
7. Day 21: Last chance - "Final reminder + 20% discount"

**Target:** 15% free→trial conversion
**Implementation:** SendGrid dynamic templates

### Seasonal Campaign: Tax Deadline Urgency
**April 15 (US) + April 30 (Canada)**

**Tactics:**
- Email blast: "Deadline in 7 days - upgrade to Pro"
- Dashboard banner with countdown timer
- Special pricing: Pro $249 (save $50) valid until April 30
- Google Ads bid increase 2x during April
- Social media urgency posts

**Expected:** 3-5x normal conversion during deadline weeks

### Live Chat (High-Intent Pages)
**Intercom on pricing, checkout, SEO pages**

**Auto-messages:**
- Pricing page after 30 sec: "Questions about TaxBridge?"
- Checkout abandonment: "Having trouble? Let me assist"
- Free tier limit: "Upgrade to Pro - I can help you choose"

**Cost:** $79/month
**Expected:** 5% conversion lift

---

## B2B/Enterprise Revenue

### Immigration Lawyer Partnerships
**30% revenue share model**

**Target Markets:**
- Vancouver, BC (H-1B → Canada hub)
- Seattle, WA (Amazon, Microsoft proximity)
- SF Bay Area (Meta, Google, Apple)
- NYC (finance + tech)

**Pitch:**
> "Your clients ask about cross-border taxes. We handle it, you get 30% commission on every paid subscription ($90/Pro, $600/Enterprise)."

**Target:** 5 active partners × 2-3 referrals/month = 10-15 Pro conversions/month = $4,500 MRR

### Enterprise Cold Sales
**Outbound to immigration law firms**

**You Already Have:**
- `scripts/scrape-aila-firms.ts` (scraper)
- `scripts/outreach-check-followups.ts` (follow-up tracker)

**Execution:**
1. Scrape 200 immigration firms from AILA directory (BC/WA/CA/NY)
2. Personalized email: "I noticed [Firm] handles H-1B cases. Your clients who move to Canada likely ask about cross-border taxes. TaxBridge automates this—white-label dashboard for 50+ clients, $2K/year. Can I show you a demo?"
3. Follow up 3x (Day 3, Day 7, Day 14)
4. Book demos via Calendly

**Target:** 10% response = 20 calls, 20% close = 4 Enterprise customers = $8K MRR

### CPA-Reviewed Tax Filing Service
**$799 full-service tier**

**Value Prop:**
- Customer pays $799
- Gets TaxBridge Pro ($299 value) + full 1040-NR + T1 preparation + review + filing
- TaxBridge takes $299, CPA partner takes $500

**Target Market:**
- Users who view forms checklist but don't complete
- Free tier users overwhelmed by complexity

**Expected:** 50 filing customers/year = $40K revenue + 50 Pro retention

---

## Product Enhancements (Lower Priority)

### Plaid Integration - Auto RSU Import
**Reduce data entry friction**

**Flow:**
1. User clicks "Import RSUs from brokerage"
2. Plaid modal authenticates Fidelity/E*TRADE
3. Pull transactions tagged as "RSU vest"
4. Auto-populate RSU entries

**Cost:** $1/user/month
**Expected Lift:** +20% signup→activation conversion
**Implementation:** 2-3 days using Plaid API

---

## Marketing & PR

### Press Coverage
**Target Publications:**
- BetaKit (Canadian tech press)
- TechCrunch
- VancouverTechJournal

**Story Angle:**
> "Meta engineer solves own immigration tax nightmare, builds SaaS helping 1000+ cross-border workers save $12K each"

**Expected:** 1 major publication = 5K visitors, 200 signups, 20 Pro conversions + lasting SEO boost

### Affiliate Program
**20% commission for finance bloggers/YouTubers**

**Target Affiliates:**
- Personal finance YouTubers (Graham Stephan, Andrei Jikh audience)
- Immigration influencers
- Cross-border tax bloggers

**Commission:**
- $60 per Pro signup
- $400 per Enterprise signup

**Expected:** 10 active affiliates × 5 conversions/month = 50 conversions = $15K MRR (cost: $3K)

### Content Marketing - Social Video
**TikTok/Instagram Reels + YouTube Shorts**

**Format:** 10-second vertical videos
- "You moved to Canada but still got Meta RSUs? Here's what you're missing 🧵"
- "That $100K RSU vest? You might owe tax in TWO countries"
- "Foreign Tax Credit saved me $12K - here's how"

**Frequency:** 3x/week
**Target:** 1 video hits 100K views = 5K site visits = 250 signups

### Educational Webinar
**Monthly "Cross-Border Tax Office Hours"**

**Format:**
- 1-hour Zoom webinar
- Cover Treaty Article XV, FTC optimization, common mistakes
- Q&A session
- Attendees get 30% discount code

**Promotion:** LinkedIn, Reddit, immigration forums (2 weeks ahead)
**Expected:** 50 attendees/month, 20% upgrade = 10 Pro conversions = $3K MRR
**Bonus:** Evergreen YouTube SEO content

---

## 6-Month Milestones

### Month 1 (March 2026)
- ✅ Move Stripe to production
- ✅ Launch Google Ads ($500/mo)
- ✅ Product Hunt launch
- ✅ LinkedIn viral post
- **Target:** First 10 paying customers, $3K MRR

### Month 2 (April 2026)
- Tax deadline urgency campaign (April 15 + 30)
- Email drip campaign live
- Reddit organic posts
- Meta retargeting ads live
- **Target:** 25 paying customers, $7.5K MRR

### Month 3 (May 2026)
- 5 immigration lawyer partnerships signed
- Lead magnet PDF live (500 downloads)
- YouTube tutorial published (1K views)
- First Enterprise customer signed
- **Target:** 50 paying customers + 1 Enterprise, $17K MRR

### Month 4 (June 2026)
- 20 high-quality backlinks acquired
- Intercom live chat installed
- Affiliate program launched (10 affiliates)
- Press coverage (BetaKit or TechCrunch)
- **Target:** 100 paying customers + 2 Enterprise, $34K MRR

### Month 5 (July 2026)
- Enterprise cold sales (4 customers closed)
- CPA tax filing service launched (10 customers)
- Monthly webinar series started
- TikTok/Reels content (1 viral hit)
- **Target:** 150 paying customers + 6 Enterprise, $57K MRR

### Month 6 (August 2026)
- Google Ads scaled to $2K/mo
- Plaid integration live
- 200 organic signups/month from SEO
- Referral program driving 30 signups/month
- **Target:** 250 paying customers + 10 Enterprise, $95K MRR

---

## 12-Month Revenue Projection

**Conservative Path:**
- Month 6: $95K MRR → $1.14M ARR run rate
- Month 12: $150K MRR → $1.8M ARR

**Realistic Path (accounting for churn, seasonality):**
- Month 12: 2,500 Pro users = $747K ARR
- Month 12: 100 Enterprise seats = $200K ARR
- **Total: $947K ARR** ✅ Near $1M target

**Optimistic Path (1 breakout channel):**
- Viral TikTok video (1M views) = 50K site visits = 2.5K signups
- Or major press coverage (TechCrunch) = 20K visitors = 1K signups
- **Total: $1.5M+ ARR**

---

## Success Metrics (KPIs to Track)

### Acquisition Metrics
- Organic traffic from SEO pages: Target 10K visitors/month by Month 6
- Google Ads CPA: Target < $150 for Pro trial
- Viral coefficient (referrals): Target 0.3
- Email list growth: Target 5K emails by Month 6

### Conversion Metrics
- Free → Pro trial conversion: Target 15%
- Trial → Paid conversion: Target 40%
- Overall signup → paid: Target 6%
- Enterprise demo → close: Target 20%

### Revenue Metrics
- MRR growth rate: Target 30% month-over-month
- Churn rate: Target < 5% monthly
- Average revenue per user (ARPU): Target $300
- Customer acquisition cost (CAC): Target < $200
- LTV:CAC ratio: Target > 3:1

### Product Metrics
- Time to first calculation: Target < 2 minutes
- Activation rate (completed 1 RSU entry): Target 60%
- DAU/MAU ratio: Target 0.2 (weekly usage during tax season)

---

## Investment Required

### Paid Marketing Budget (Months 1-6)
- Google Ads: $500-2,000/month × 6 = $6,000
- Meta retargeting: $500/month × 6 = $3,000
- LinkedIn boost: $100 × 3 posts = $300
- **Total:** $9,300

### Tools & Software
- Intercom: $79/month × 6 = $474
- SendGrid: $20/month × 6 = $120
- Plaid: $1/user (variable)
- **Total:** ~$600

### Content Creation
- PDF design (Fiverr): $50
- Video editing: $200
- **Total:** $250

### Grand Total Investment: ~$10,000 for first 6 months
**Expected Return:** $95K MRR × 6 months = $570K total revenue
**ROI:** 57x

---

## Risks & Mitigation

### Risk 1: Stripe stays in test mode (human error)
**Mitigation:** Top priority task, due March 20. Blocks all other work.

### Risk 2: Google Ads CPA too high (> $200)
**Mitigation:** Start with $500/month, test for 2 weeks. If CPA > $200, pause and focus on organic.

### Risk 3: Product Hunt launch flops
**Mitigation:** Rally Meta coworkers, BC tech community upvotes. Worst case: 200 visitors instead of 1K.

### Risk 4: Immigration lawyers don't respond to cold outreach
**Mitigation:** Warm intros via BC Tech Association, Vancouver immigration law networks.

### Risk 5: Tax season ends (April 30), conversion drops
**Mitigation:** Multi-year tracking feature, "Don't wait until next tax season" messaging, expand to other visa types (L-1, O-1).

---

## Next Actions (This Week)

1. **TODAY:** Move Stripe to production mode → First paying customer
2. **March 20:** Set up Google Ads account + conversion tracking
3. **March 22:** Publish LinkedIn viral post
4. **March 25:** Launch Google Ads campaign ($500/mo)
5. **March 27:** Complete lead magnet PDF
6. **March 28:** Post to Reddit (r/PersonalFinanceCanada)
7. **March 30:** Product Hunt launch

---

**Built for revenue. Built to scale. Let's hit $1M.**
