# Product Hunt Launch Execution Guide

**Status**: Complete and ready to execute
**Target**: 500+ upvotes, #1-3 Product of the Day, 5,000+ visitors, $1,500+ revenue
**Launch Window**: 48 hours (Tuesday 12:01 AM PST → Thursday 11:59 PM PST)

---

## Pre-Launch Checklist (7 Days Before)

### Day -7: Hunter Outreach

**File**: `/docs/HUNTER_OUTREACH_EXECUTION.md`

**Tasks**:
- [ ] Set launch date (recommend Tuesday or Wednesday)
- [ ] Populate launch date in all DM templates
- [ ] Send first DM to all 10 hunters (Chris Messina, Ryan Hoover, Kevin William David, etc.)
- [ ] Track responses in Hunter Outreach Tracker spreadsheet

**Timeline**:
- 9:00 AM PST: Send DMs to Tier 1 hunters (Chris, Ryan, Kevin)
- 12:00 PM PST: Send DMs to Tier 2 hunters (Hiten, Abadesi, Andrew)
- 3:00 PM PST: Send DMs to Tier 3 hunters (Erik, Ben, Mubashar, Rosie)

**Expected outcome**: 1-2 responses within 48 hours

---

### Day -4: Follow-Up & Beta Email Prep

**Files**:
- `/docs/HUNTER_OUTREACH_EXECUTION.md` (follow-up templates)
- `/docs/BETA_USER_PRELAUNCH_EMAIL.md`

**Tasks**:
- [ ] Send follow-up DM to non-responding hunters
- [ ] Confirm with any interested hunters
- [ ] Prepare beta user email list (50 emails):
  - 20 power users (used calculator 3+ times)
  - 15 trial users (signed up but didn't convert)
  - 10 newsletter subscribers
  - 5 personal network (friends, family, colleagues)
- [ ] Set up SendGrid/Mailchimp account
- [ ] Import email list with segments
- [ ] Schedule emails for Day -1 (Monday) at 8 AM, 10 AM, 2 PM, 6 PM PST

**Expected outcome**: 1 confirmed hunter OR decision to self-hunt

---

### Day -2: Asset Creation & Stripe Setup

**Files**:
- `/docs/STRIPE_HUNT20_COUPON_SETUP.md`
- `/components/launch-banner.tsx`

**Tasks**:
- [ ] Create HUNT20 coupon in Stripe Dashboard
  - Discount: 20% off
  - Duration: Once
  - Max redemptions: 100
  - Redemption window: Launch day 12:01 AM → +48 hours (11:59 PM PST)
  - Applies to: Pro Plan - Annual
- [ ] Test coupon in Stripe Test Mode
- [ ] Deploy launch banner component to website
  - Option 1: Top banner (LaunchBanner)
  - Option 2: Sticky bottom banner (LaunchBannerSticky)
  - Option 3: Pricing page badge (LaunchBannerCompact + DiscountBadge)
- [ ] Test checkout flow with HUNT20 coupon code
- [ ] Capture screenshots (8 images):
  - Run: `npm run capture:screenshots` (if script exists)
  - OR manually capture: Hero, Calculator, Dashboard, Forms, Multi-year, Pricing, FTC detail, Mobile view
- [ ] Record demo video (60-90 seconds):
  - Use Loom, OBS Studio, or QuickTime
  - Follow script in `/docs/DEMO_VIDEO_SCRIPT.md`
  - Add captions/subtitles
  - Export as MP4, <100 MB

**Expected outcome**: Coupon active, banner live, screenshots ready, demo video ready

---

### Day -1: Final Prep & Beta Emails

**Files**:
- `/docs/BETA_USER_PRELAUNCH_EMAIL.md`
- `/docs/SOCIAL_MEDIA_TEMPLATES.md`
- `/docs/LAUNCH_DAY_TIMELINE.md`

**Tasks**:
- [ ] Confirm hunter (or prepare to self-hunt at 12:01 AM)
- [ ] Send beta user emails:
  - 8:00 AM: Email 1 (Beta Users - 20 emails)
  - 10:00 AM: Email 2 (Trial Users - 15 emails)
  - 2:00 PM: Email 3 (Newsletter - 10 emails)
  - 6:00 PM: Email 4 (Personal Network - 5 emails)
- [ ] Write maker comment (choose from `/docs/MAKER_COMMENT_TEMPLATE.md`)
- [ ] Pre-write social media posts (copy from `/docs/SOCIAL_MEDIA_TEMPLATES.md`)
- [ ] Schedule Buffer/Hypefury posts (if using automation)
- [ ] Clear calendar for launch day (12+ hours availability)
- [ ] Set up tracking:
  - Google Sheet: `/docs/UPVOTE_TRACKING_SHEET.md`
  - Product Hunt tabs: Product page, Notifications, Dashboard
  - Google Analytics: Real-time dashboard
  - Stripe Dashboard: Payments tab
- [ ] Set phone alarms: Check PH every 15 minutes (6 AM - 11 PM PST)

**Expected outcome**: All assets ready, beta users notified, tracking set up, calendar cleared

---

## Launch Day Execution (Tuesday)

### 12:01 AM PST: Launch!

**Tasks**:
- [ ] Hunter posts TaxBridge on Product Hunt (or self-post)
- [ ] Within 2 minutes: Post maker comment (use template)
- [ ] Pin maker comment to top
- [ ] Share PH link with hunter (thank them)
- [ ] Update Google Sheet: Hour 0 (0 upvotes, #500+ ranking)

**Expected outcome**: Product live on PH, maker comment posted

---

### 1:00 AM - 5:00 AM PST: Early Momentum

**File**: `/docs/BETA_USER_PRELAUNCH_EMAIL.md` (reminder email)

**Tasks**:
- [ ] Monitor email list responses (expect 15-30 upvotes from 50 emails)
- [ ] Respond to every PH comment within 15 minutes (use `/docs/PH_COMMENT_RESPONSE_PLAYBOOK.md`)
- [ ] Update Google Sheet hourly
- [ ] Track ranking: Target #200 by 1 AM, #100 by 3 AM, #50 by 5 AM

**Expected outcome**: 30-50 upvotes, #50-#100 ranking, 5-10 comments

---

### 6:00 AM PST: Beta User Reminder + Morning Push

**Files**:
- `/docs/BETA_USER_PRELAUNCH_EMAIL.md` (reminder email template)
- `/docs/COMMUNITY_POSTING_PLAYBOOK.md` (Reddit posts)

**Tasks**:
- [ ] Send reminder email to all 50 beta users: "🚀 We're LIVE - upvote now!"
- [ ] Post on r/PersonalFinanceCanada (use template)
- [ ] Monitor PH comments (respond within 10 minutes)
- [ ] Update Google Sheet
- [ ] Track ranking: Target #25-#50

**Expected outcome**: 100-150 upvotes, #25-#50 ranking, 20+ comments

---

### 7:30 AM PST: Hacker News

**File**: `/docs/COMMUNITY_POSTING_PLAYBOOK.md` (HN template)

**Tasks**:
- [ ] Post "Show HN: TaxBridge" on Hacker News
- [ ] Post first comment immediately (technical details, stack, learnings)
- [ ] Monitor HN comments (respond within 15 minutes)
- [ ] Cross-post to PH: "Just posted on HN - feedback welcome!"
- [ ] Update Google Sheet

**Expected outcome**: HN front page (if lucky), 50+ HN points, 200+ upvotes on PH

---

### 9:00 AM - 12:00 PM PST: Peak PH Traffic

**File**: `/docs/COMMUNITY_POSTING_PLAYBOOK.md` (multiple communities)

**Tasks**:
- [ ] 9:00 AM: Post on r/CanadianInvestor
- [ ] 10:30 AM: Post on r/ImmigrationCanada
- [ ] 12:00 PM: Post on LinkedIn (personal post)
- [ ] Monitor PH comments continuously (respond within 10 minutes)
- [ ] Update Google Sheet hourly
- [ ] Track ranking: Target #10-#20 by noon

**Expected outcome**: 250-350 upvotes, #10-#20 ranking, 50+ comments

---

### 1:30 PM - 3:00 PM PST: Social Media Blitz

**File**: `/docs/COMMUNITY_POSTING_PLAYBOOK.md` (Twitter, r/SideProject)

**Tasks**:
- [ ] 1:30 PM: Post Twitter thread (8 tweets)
- [ ] 3:00 PM: Post on r/SideProject
- [ ] Monitor all channels (PH, HN, Reddit, Twitter)
- [ ] Respond to EVERY comment/reply
- [ ] Update Google Sheet
- [ ] Track ranking: Target #5-#10

**Expected outcome**: 400-450 upvotes, #5-#10 ranking, 70+ comments

---

### 4:30 PM - 6:00 PM PST: Final Push for Top 3

**File**: `/docs/COMMUNITY_POSTING_PLAYBOOK.md` (r/cscareerquestions, Indie Hackers)

**Tasks**:
- [ ] 4:30 PM: Post on r/cscareerquestions
- [ ] 6:00 PM: Post on Indie Hackers
- [ ] Post on Facebook Groups (3 groups: H-1B Visa Holders, H-1B to Canada, Tech Workers Immigration)
- [ ] Update Google Sheet
- [ ] Track ranking: Push for #3-#5

**Expected outcome**: 475-500 upvotes, #3-#5 ranking, 85+ comments

---

### 7:30 PM - 11:00 PM PST: Late Evening Sustain

**File**: `/docs/COMMUNITY_POSTING_PLAYBOOK.md` (LinkedIn groups)

**Tasks**:
- [ ] 7:30 PM: Post on LinkedIn Groups (Vancouver Tech Community, Toronto Tech)
- [ ] 9:00 PM: Final Twitter push (quote tweet thread)
- [ ] Respond to remaining PH comments
- [ ] Update Google Sheet
- [ ] Monitor ranking: Hold #3-#5 or push for #1-#2

**Expected outcome**: 500-550 upvotes, #1-#3 ranking (final), 87+ comments

---

### 11:00 PM - 11:59 PM PST: Final Hour

**Tasks**:
- [ ] Respond to last-minute comments
- [ ] Update Google Sheet (final row)
- [ ] Capture final metrics:
  - Total upvotes (e.g., 523)
  - Final ranking (e.g., #2 Product of the Day)
  - Total comments (e.g., 87)
  - Total website traffic (e.g., 5,275 visitors)
  - Total conversions (e.g., 15 Pro customers)
  - Revenue (e.g., $4,485)
- [ ] Screenshot final PH page (for portfolio/retrospective)
- [ ] Thank hunter (if applicable)
- [ ] Celebrate! 🎉

**Expected outcome**: Mission complete! 500+ upvotes, #1-#3 ranking, $1,500-$5,000 revenue

---

## Day After Launch (Wednesday)

### Morning: Cleanup & Analysis

**File**: `/docs/UPVOTE_TRACKING_SHEET.md` (post-launch analysis)

**Tasks**:
- [ ] Respond to remaining PH comments (backlog from overnight)
- [ ] Send thank-you email to beta users (template in `/docs/BETA_USER_PRELAUNCH_EMAIL.md`)
- [ ] Analyze Google Sheet data:
  - Best traffic source (Reddit? HN? Twitter? Email?)
  - Best converting source (Email list likely highest)
  - Peak upvote hours (6-9 AM? 6-9 PM?)
  - Avg comment response time (5 min? 15 min?)
- [ ] Write launch retrospective:
  - What worked (list 3-5 tactics)
  - What didn't work (list 2-3 flops)
  - What to do differently next time (list 2-3 improvements)
- [ ] Export Stripe HUNT20 data:
  - Total redemptions (e.g., 15 customers)
  - Revenue impact (e.g., $3,588 revenue, $897 discount given)
  - Conversion rate (e.g., 0.28% website visitors → Pro customers)

**Expected outcome**: Clean data, learnings documented, thank-yous sent

---

### Afternoon: Press Outreach (Optional)

**If you hit #1-#3 Product of the Day**, reach out to press:

**Target publications**:
- TechCrunch (tips@techcrunch.com)
- BetaKit (story@betakit.com)
- Financial Post (business@financialpost.com)

**Pitch template**:
```
Subject: TaxBridge hits #2 on Product Hunt - cross-border tax for 100K+ tech workers

Hi [Name],

TaxBridge just launched on Product Hunt and hit #2 Product of the Day (523 upvotes, 87 comments).

Quick story:
- I'm a Meta SWE who moved from California to Vancouver
- I overpaid $12K on my RSU taxes due to US-Canada tax treaty complexity
- I built TaxBridge to help 100K+ H-1B/TN visa holders avoid the same mistake
- We hit $6K MRR in 6 weeks (targeting $1M ARR year 1)

This is relevant to your audience because:
- 40,000+ tech workers move US → Canada annually (H-1B, TN, PR)
- Most overpay $10K+ on taxes (don't understand treaty Article XV)
- CPAs charge $3K+ for basic calculations (TaxBridge makes it self-service for $299/yr)

Would you be interested in covering this?

Happy to provide:
- Founder interview (my journey from overpaying → building the product)
- User testimonials (customers saved $5K-$15K each)
- Market data (100K TAM, $100M+ market)

Thanks,
Michael
Founder, TaxBridge
[Product Hunt link] | [TaxBridge URL]
```

**Expected outcome**: 1-2 press mentions (if lucky), or at least warm relationships for future outreach

---

## 48 Hours Post-Launch (Thursday 11:59 PM PST)

### HUNT20 Expires

**File**: `/docs/STRIPE_HUNT20_COUPON_SETUP.md`

**Tasks**:
- [ ] Verify HUNT20 coupon auto-expired (Stripe handles this)
- [ ] Remove launch banner from website (auto-hides via countdown timer)
- [ ] Export final coupon data from Stripe:
  - Total redemptions (e.g., 18 customers)
  - Revenue (e.g., $4,306)
  - Discount given (e.g., $1,076)
- [ ] Update pricing page (remove discount badge)
- [ ] Send final email to email list:
  - "HUNT20 expired - thank you for supporting our launch!"
  - "If you missed it, full price is $299/yr (still 10x cheaper than CPA)"
  - "We hit #2 on PH and got 523 upvotes - you made this happen!"

**Expected outcome**: Launch window closed, full price resumes, final data captured

---

## Success Metrics

### Primary Goals (Must-Achieve)

- ✅ **500+ upvotes** on Product Hunt
- ✅ **#1-3 Product of the Day** ranking
- ✅ **5,000+ visitors** from Product Hunt
- ✅ **$1,500+ revenue** (5+ Pro conversions)

### Stretch Goals (Nice-to-Have)

- 🎯 **#1 Product of the Day** (instead of #2-#3)
- 🎯 **100+ comments** on Product Hunt
- 🎯 **Featured in PH newsletter** (automatic for top 3)
- 🎯 **Press coverage** (TechCrunch, BetaKit, Financial Post)
- 🎯 **10+ Pro conversions** ($3,000+ revenue)

### Tracking

**Real-time** (during launch):
- Google Sheet: Hourly upvote tracking
- Google Analytics: Website traffic by source
- Stripe Dashboard: Payment conversions (filter by HUNT20)

**Post-launch** (after 48 hours):
- Export Stripe data (customers, revenue, coupons)
- Export Google Analytics data (traffic, sources, conversion funnel)
- Export Product Hunt data (screenshot final page)

---

## File Reference

### Documentation (9 files)

1. **HUNTER_OUTREACH_EXECUTION.md** - 10 hunters, personalized DMs, tracking
2. **BETA_USER_PRELAUNCH_EMAIL.md** - 4 email templates, segmentation, 50 users
3. **COMMUNITY_POSTING_PLAYBOOK.md** - 15 communities, posting schedule, templates
4. **PH_COMMENT_RESPONSE_PLAYBOOK.md** - 20 pre-written responses, 15-min SLA
5. **UPVOTE_TRACKING_SHEET.md** - Google Sheet structure, hourly tracking
6. **STRIPE_HUNT20_COUPON_SETUP.md** - Stripe coupon setup, integration, testing
7. **LAUNCH_DAY_TIMELINE.md** - Hour-by-hour checklist (existing)
8. **SOCIAL_MEDIA_TEMPLATES.md** - Twitter, LinkedIn, Reddit posts (existing)
9. **PH_LAUNCH_EXECUTION_GUIDE.md** - This file (master checklist)

### Components (1 file)

10. **components/launch-banner.tsx** - 4 banner variants:
    - `LaunchBanner` (top banner, dismissible)
    - `LaunchBannerCompact` (pricing page badge)
    - `DiscountBadge` (pricing card)
    - `LaunchBannerSticky` (bottom sticky banner)

---

## Integration Checklist

### Website Integration

**1. Add launch banner to layout**:

```typescript
// app/layout.tsx
import { LaunchBanner } from '@/components/launch-banner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LaunchBanner
          launchEndDate={new Date('2026-04-10T23:59:59-07:00')}
          couponCode="HUNT20"
          discountPercent={20}
          dismissible={true}
        />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

**2. Add discount badge to pricing page**:

```typescript
// app/pricing/page.tsx
import { DiscountBadge } from '@/components/launch-banner';

export default function PricingPage() {
  return (
    <div className="pricing-card">
      <DiscountBadge
        originalPrice={299}
        discountedPrice={239.20}
        couponCode="HUNT20"
      />
      {/* Rest of pricing card */}
    </div>
  );
}
```

**3. Integrate HUNT20 coupon into checkout**:

Follow `/docs/STRIPE_HUNT20_COUPON_SETUP.md` for full integration guide.

---

## Timeline Summary

| Day | Tasks | Files Used |
|-----|-------|------------|
| -7 | Hunter outreach (10 DMs) | HUNTER_OUTREACH_EXECUTION.md |
| -4 | Follow-up hunters, prep beta emails | HUNTER_OUTREACH_EXECUTION.md, BETA_USER_PRELAUNCH_EMAIL.md |
| -2 | Create HUNT20 coupon, deploy banner, capture assets | STRIPE_HUNT20_COUPON_SETUP.md, launch-banner.tsx |
| -1 | Send beta emails, finalize prep, clear calendar | BETA_USER_PRELAUNCH_EMAIL.md, LAUNCH_DAY_TIMELINE.md |
| 0 (Launch) | Execute launch day plan (12:01 AM - 11:59 PM) | All files |
| +1 | Cleanup, analysis, thank-yous, press outreach | UPVOTE_TRACKING_SHEET.md, BETA_USER_PRELAUNCH_EMAIL.md |
| +2 | HUNT20 expires, final data export | STRIPE_HUNT20_COUPON_SETUP.md |

---

## Emergency Protocols

### If upvote velocity slows

**Symptoms**: 2 consecutive hours below target velocity

**Actions**:
1. Post in another community (refer to COMMUNITY_POSTING_PLAYBOOK.md)
2. Tweet again with new angle
3. DM 10 friends asking for shares
4. Increase PH comment engagement (respond faster, ask questions)

### If ranking drops below #10

**Symptoms**: Ranking goes from #8 → #11

**Actions**:
1. Boost engagement rate (respond within 5 minutes, not 15)
2. Post maker update on PH (e.g., "Just hit 200 upvotes! Here's what we're building next...")
3. Drive more upvotes (email list reminder, new community post)

### If traffic is high but conversions are low

**Symptoms**: 500+ visitors but only 1-2 conversions (below 0.4%)

**Actions**:
1. Check pricing page (is HUNT20 banner visible?)
2. Add urgency (update banner: "HUNT20 expires in 12 hours")
3. Simplify signup flow (remove friction, one-click checkout)

### If site goes down

**Symptoms**: Visitors reporting errors, Vercel dashboard shows downtime

**Actions**:
1. Check Vercel dashboard (logs, errors, deployment status)
2. Redeploy if needed (Vercel auto-rollback if deployment fails)
3. Post on PH: "We're experiencing high traffic (thanks to PH!), working on it..."
4. Fix issue, post update: "Back online! Sorry for the downtime."

---

## Post-Launch Action Items

### Week 1 (Days 1-7 after launch)

- [ ] Follow up with engaged PH users (DM or email)
- [ ] Implement quick-win feedback (bugs, feature requests)
- [ ] Write blog post: "How we hit #2 on Product Hunt"
- [ ] Share learnings on Twitter/LinkedIn
- [ ] Start CPA partnership outreach (use learnings from PH traction)

### Week 2-4 (Days 8-30 after launch)

- [ ] Track 30-day conversion rate (PH visitors → Pro customers)
- [ ] Calculate ROI (revenue - costs) / time invested
- [ ] Plan next growth channel (SEO? Paid ads? Partnerships?)
- [ ] Build features requested by PH users
- [ ] Prepare for next launch (if applicable)

---

## Success Probability

**With this package**:
- ✅ 10 hunter outreach templates (personalized, proven)
- ✅ 50 beta user emails (segmented, timed)
- ✅ 15 community posts (spaced, compliant)
- ✅ 20 pre-written PH responses (15-min SLA)
- ✅ Hourly tracking dashboard (Google Sheet)
- ✅ HUNT20 coupon (20% off, 48 hours)
- ✅ 4 launch banner variants (top, sticky, compact, badge)

**Target**: 500+ upvotes, #1-3 Product of the Day
**Realistic**: Achievable with 12+ hours of engagement
**Backup**: Even #4-10 generates significant traffic and conversions

---

## Final Checklist

**7 days before**:
- [ ] Hunter outreach (10 DMs sent)
- [ ] Launch date set

**4 days before**:
- [ ] Hunter confirmed (or self-hunt decided)
- [ ] Beta email list prepared (50 emails)

**2 days before**:
- [ ] HUNT20 coupon created in Stripe
- [ ] Launch banner deployed to website
- [ ] Screenshots captured (8 images)
- [ ] Demo video recorded (60-90s)

**1 day before**:
- [ ] Beta emails sent (8 AM, 10 AM, 2 PM, 6 PM)
- [ ] Maker comment written
- [ ] Social posts pre-written
- [ ] Tracking set up (Google Sheet, PH tabs, Analytics)
- [ ] Calendar cleared (12+ hours)

**Launch day**:
- [ ] 12:01 AM: Launch!
- [ ] Respond to EVERY comment within 15 minutes
- [ ] Post in 15 communities throughout the day
- [ ] Update Google Sheet hourly
- [ ] Monitor ranking continuously

**Day after**:
- [ ] Thank-you emails sent
- [ ] Data analyzed
- [ ] Retrospective written

**2 days after**:
- [ ] HUNT20 expired
- [ ] Final data exported

---

**Status**: Complete execution package. All files ready. Launch when ready!

**Good luck!** 🚀
