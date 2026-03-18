# 🚀 Product Hunt Launch - Master Execution Guide

**Launch Date:** Tuesday, March 25, 2026 @ 12:01 AM PST
**Goal:** #1 Product of the Day (500+ upvotes)
**Status:** ✅ READY TO EXECUTE

---

## ⚡ Quick Start (Execute in Order)

### Phase 1: Pre-Launch Setup (March 18-24)

**Day 7-1 Before Launch:**
```bash
# 1. Generate screenshots (10 min)
npm run dev
# In another terminal:
npm run capture:screenshots

# 2. Create HUNT20 promo code (5 min)
npm run create:hunt20
npm run test:hunt20

# 3. Initialize community posting system (5 min)
npm run launch:init
```

**Manual Tasks:**
- [ ] Schedule Product Hunt submission (use `PRODUCT_HUNT_SUBMISSION_FORM.md`)
- [ ] Execute pre-launch teaser campaign (see `PRE_LAUNCH_TEASER_CAMPAIGN.md`)
- [ ] Send beta user email 24 hours before (see `BETA_USER_PRELAUNCH_EMAIL.md`)

---

### Phase 2: Launch Day (March 25)

**Timeline:**
```
12:01 AM - Product Hunt goes live
12:05 AM - Post first comment + tweet launch announcement
12:10 AM - Send beta user email with PH link
6:00 AM  - Start community posting (15 communities over 15 hours)
All Day  - Respond to ALL comments within 10-15 minutes
11:59 PM - Day ends, ranking locked
```

**Commands:**
```bash
# Monitor launch dashboard (leave running)
npm run launch:dashboard

# Check responses every 10 minutes
npm run launch:check-responses

# Update metrics hourly
npm run launch:update-metrics [community-id]
```

---

## 📋 Complete Checklist

### 2 Weeks Before (March 11)

**Technical Setup:**
- [ ] Verify Stripe is in Live Mode
- [ ] Test payment flow end-to-end
- [ ] Verify PostHog tracking working
- [ ] Check Sentry error monitoring
- [ ] Test all screenshots pages render correctly
- [ ] Verify email sending (SendGrid)

**Content Preparation:**
- [ ] Read all launch documentation
- [ ] Review Product Hunt submission form
- [ ] Watch demo video examples
- [ ] Study first comment template
- [ ] Review community post templates

---

### 1 Week Before (March 18)

**Asset Creation:**
- [ ] Run `npm run capture:screenshots` (generates 5 images)
- [ ] Verify screenshots saved to `public/product-hunt/screenshots/`
- [ ] Record 60-second Loom demo video
- [ ] Create Product Hunt thumbnail (240x240px logo)
- [ ] Prepare 4 feature images for tweets

**Promo Code:**
- [ ] Run `npm run create:hunt20`
- [ ] Verify code created in Stripe Live Mode
- [ ] Run `npm run test:hunt20`
- [ ] Test checkout flow with HUNT20 code
- [ ] Confirm discount: $299 → $239

**Pre-Launch Campaign:**
- [ ] Post Twitter thread (Day 7) - See `TWITTER_LAUNCH_CONTENT.md`
- [ ] Post LinkedIn story (Day 6)
- [ ] Post Twitter demo (Day 5)
- [ ] Post Indie Hackers teaser (Day 4)
- [ ] Collect upvote request list (Notion/Sheet)

---

### 3 Days Before (March 22)

**Product Hunt Submission:**
- [ ] Go to https://www.producthunt.com/posts/new
- [ ] Fill form using `PRODUCT_HUNT_SUBMISSION_FORM.md`
- [ ] Upload 5 screenshots
- [ ] Upload thumbnail (240x240px)
- [ ] Add demo video URL
- [ ] Select topics: SaaS, Finance, Productivity, Developer Tools, Tax
- [ ] Click "Schedule for later"
- [ ] Set date: March 25, 2026
- [ ] Set time: 12:01 AM Pacific
- [ ] Save draft and verify

**Community Posts:**
- [ ] Run `npm run launch:init` (generates 15 posts)
- [ ] Review all posts in `data/launch-posts/`
- [ ] Verify UTM links work
- [ ] Check schedule in `data/launch-posts/SCHEDULE.md`

---

### 1 Day Before (March 24)

**Final Verification:**
- [ ] HUNT20 code active in Stripe
- [ ] Product Hunt submission scheduled correctly
- [ ] Screenshots uploaded to PH
- [ ] Demo video URL added
- [ ] First comment ready in clipboard
- [ ] Beta user email ready to send

**Launch Day Prep:**
- [ ] Clear calendar for 15+ hours
- [ ] Set alarms:
  - 11:50 PM (10 min warning)
  - 12:01 AM (launch time)
  - 12:03 AM (post first comment)
  - 12:10 AM (send beta email)
  - Every 3 hours (tweet updates)
- [ ] Charge laptop & phone
- [ ] Prepare coffee/snacks
- [ ] Open tabs:
  - Product Hunt
  - Stripe Dashboard
  - PostHog Dashboard
  - Twitter
  - Reddit
  - Email

**Pre-Launch Campaign:**
- [ ] Post T-24 hours Twitter thread
- [ ] Send beta user email (8 AM)
- [ ] Post "Ask HN" on Hacker News (3 PM)
- [ ] Send DMs to upvote requesters

---

### Launch Day (March 25)

#### Hour 0: Midnight Launch (12:01 AM - 1:00 AM)

**12:01 AM:**
- [ ] Verify Product Hunt listing is live
- [ ] Check all fields displayed correctly
- [ ] Verify screenshots loaded
- [ ] Verify demo video playing

**12:03 AM:**
- [ ] Post first comment (from `PRODUCT_HUNT_SUBMISSION_FORM.md` line 241)
- [ ] Pin first comment
- [ ] Upvote your own comment

**12:05 AM:**
- [ ] Tweet launch announcement
- [ ] Tag @ProductHunt
- [ ] Include PH link + HUNT20 code
- [ ] Retweet from personal account

**12:10 AM:**
- [ ] Send beta user email with PH link
- [ ] Send DMs to all upvote requesters (Twitter, LinkedIn, IH)
- [ ] Post in Slack/Discord communities

**12:15 AM:**
- [ ] Start monitoring dashboard: `npm run launch:dashboard`
- [ ] Watch for first comments
- [ ] Respond within 10 minutes

---

#### Hour 6: Morning Push (6:00 AM - 12:00 PM)

**6:00 AM:**
- [ ] Post Reddit r/PersonalFinanceCanada
- [ ] Mark as posted: `npm run launch:mark-posted reddit-pfc [URL]`
- [ ] Tweet morning update (current ranking + upvote count)
- [ ] Post LinkedIn launch announcement

**7:30 AM:**
- [ ] Post Hacker News "Show HN"
- [ ] Mark as posted: `npm run launch:mark-posted hackernews [URL]`

**8:00 AM:**
- [ ] Post Reddit r/h1b
- [ ] Mark as posted: `npm run launch:mark-posted reddit-h1b [URL]`

**9:00 AM:**
- [ ] Post Reddit r/CanadianInvestor
- [ ] Mark as posted: `npm run launch:mark-posted reddit-canadianinvestor [URL]`
- [ ] Tweet feature highlight

**10:30 AM:**
- [ ] Post Reddit r/ImmigrationCanada
- [ ] Mark as posted: `npm run launch:mark-posted reddit-immigration-canada [URL]`

---

#### Hour 12: Midday Push (12:00 PM - 6:00 PM)

**12:00 PM:**
- [ ] Post LinkedIn personal profile
- [ ] Mark as posted: `npm run launch:mark-posted linkedin-personal [URL]`
- [ ] Tweet midday update (ranking + upvotes)

**1:30 PM:**
- [ ] Post Twitter thread (8 tweets)
- [ ] Mark as posted: `npm run launch:mark-posted twitter-thread [URL]`

**3:00 PM:**
- [ ] Post Reddit r/SideProject
- [ ] Mark as posted: `npm run launch:mark-posted reddit-sideproject [URL]`
- [ ] Tweet user testimonial

**4:30 PM:**
- [ ] Post Reddit r/cscareerquestions
- [ ] Mark as posted: `npm run launch:mark-posted reddit-cscareerquestions [URL]`

---

#### Hour 18: Evening Push (6:00 PM - 12:00 AM)

**6:00 PM:**
- [ ] Post Indie Hackers "Share Your Product"
- [ ] Post Discord Levels.fyi #general
- [ ] Mark both as posted
- [ ] Tweet evening update

**7:30 PM:**
- [ ] Post Facebook H-1B groups (×3)
- [ ] Mark as posted: `npm run launch:mark-posted facebook-h1b-groups [URL]`

**8:00 PM:**
- [ ] Post Reddit r/tax
- [ ] Post TechCrunch article comments
- [ ] Mark as posted

**9:00 PM:**
- [ ] Post LinkedIn tech groups (×2)
- [ ] Mark as posted: `npm run launch:mark-posted linkedin-tech-groups [URL]`
- [ ] Tweet success story

**11:00 PM:**
- [ ] Tweet final hour push
- [ ] Mass tag supporters
- [ ] Post final updates on all platforms

**11:59 PM:**
- [ ] Screenshot final ranking
- [ ] Export dashboard metrics
- [ ] Thank top commenters

---

## 📊 Success Metrics (Track in Real-Time)

### Primary Metrics

**Product Hunt:**
- [ ] 500+ upvotes (goal: #1 Product of the Day)
- [ ] 100+ comments
- [ ] Top 3 ranking by midnight

**Website Traffic:**
- [ ] 1,000+ visitors from Product Hunt
- [ ] 500+ UTM-tagged clicks from communities
- [ ] 100+ signups

**Revenue:**
- [ ] 20+ HUNT20 redemptions ($4,780+)
- [ ] 50+ Pro conversions (stretch: $11,950+)

### Secondary Metrics

**Engagement:**
- [ ] 200+ total social media shares
- [ ] 50+ Reddit upvotes across all posts
- [ ] 30+ Hacker News points
- [ ] 20+ LinkedIn comments

**Response Time:**
- [ ] Average response time < 15 minutes
- [ ] 100% comments responded to

---

## 🎯 Hourly Checklist (Repeat Every Hour)

```bash
# 1. Check Product Hunt ranking
# Go to: https://www.producthunt.com/products/taxbridge
Current ranking: #__
Current upvotes: __
New comments: __

# 2. Respond to all new comments (within 15 min)
# See response templates in PRODUCT_HUNT_SUBMISSION_FORM.md

# 3. Update community metrics
npm run launch:update-metrics [community-id]

# 4. Check Stripe for new conversions
# Go to: https://dashboard.stripe.com/payments
HUNT20 redemptions: __
Revenue today: $__

# 5. Monitor PostHog traffic
# Go to: https://app.posthog.com
Website visitors: __
PH traffic: __
Community traffic: __

# 6. Tweet update (every 3 hours)
# See TWITTER_LAUNCH_CONTENT.md for templates
```

---

## 💬 Response Strategy

### Product Hunt Comments

**Respond within 10-15 minutes to:**
- All questions (use templates from `PRODUCT_HUNT_SUBMISSION_FORM.md`)
- All compliments (thank + ask for upvote if not yet done)
- All feature requests (acknowledge + add to roadmap)
- All competitor mentions (explain differentiation)

**Response Templates:**

**"Is this a replacement for an accountant?"**
```
Great question! TaxBridge handles calculations and form guidance. For simple W-2 + RSU income, it can replace a $2K/year accountant.

For complex situations (multiple visa types, business income, properties), we recommend working with a cross-border CPA. But TaxBridge can help you understand the basics and reduce your accountant's hours.

Think of it as: DIY for simple cases, smart starting point for complex ones.
```

**"Does this work for other countries?"**
```
Currently US-Canada only (US-Canada Tax Treaty Article XV).

Expanding to:
• US-UK (April 2026)
• US-India (June 2026)
• US-Australia (Q3 2026)

Which corridor would you find most valuable?
```

**"Can I trust your tax calculations?"**
```
Absolutely fair question. Here's how we ensure accuracy:

✅ Based on official IRS & CRA tax brackets (updated annually)
✅ Uses US-Canada Tax Treaty Article XV
✅ References all tax code sections in output
✅ Validated by cross-border CPAs during development
✅ Open to feedback - if you find an error, we fix it immediately

TaxBridge provides calculations, not tax advice. For 100% certainty, consult a licensed CPA.

Would love to hear from any CPAs in the community for additional validation!
```

---

### Reddit/HN Comments

**Key principles:**
- Be helpful, not sales-y
- Share specific examples and numbers
- Acknowledge limitations honestly
- Thank everyone who engages
- Don't spam HUNT20 code (mention once per thread)

**Example:**
```
Hey! I'm the founder of TaxBridge.

[Empathize with their specific situation]

This is exactly why I built TaxBridge. [Explain how it solves their problem]

Happy to answer any questions about cross-border tax or the product!

Also launching on Product Hunt today if you want to check it out: [PH link]
```

---

## 📈 Monitoring Dashboards

### Keep Open in Browser Tabs

**Product Hunt:**
- [ ] Your product page (refresh every 10 min)
- [ ] Comments section (respond immediately)
- [ ] Ranking page (track position)

**Stripe:**
- [ ] Payments page (watch conversions real-time)
- [ ] HUNT20 promo code page (track redemptions)
- [ ] Dashboard (revenue counter)

**PostHog:**
- [ ] Events dashboard (UTM campaign filter)
- [ ] Funnels (PH → Signup → Pro conversion)
- [ ] Real-time traffic (current visitors)

**Community Tracking:**
- [ ] `npm run launch:dashboard` (terminal)
- [ ] Notion/Sheet with post URLs and metrics

**Social Media:**
- [ ] Twitter notifications
- [ ] LinkedIn notifications
- [ ] Reddit inbox
- [ ] HN replies

---

## 🛠️ Troubleshooting

### Issue: Product Hunt submission not going live at 12:01 AM

**Cause:** Submission not approved yet (manual review)

**Fix:**
1. Wait 5-10 minutes (PH reviews before going live)
2. Check email for approval notification
3. If not live by 12:15 AM, contact PH support: https://www.producthunt.com/support

---

### Issue: HUNT20 code not working

**Fix:**
```bash
# Check if code exists
npm run test:hunt20

# If error, check Stripe manually
# Go to: https://dashboard.stripe.com/promotion_codes
# Search: HUNT20
# Verify: Active, 20% off, valid dates

# If missing, recreate
npm run create:hunt20
```

---

### Issue: Screenshot upload failed on PH

**Fix:**
1. Verify file sizes < 5MB each
2. Verify format: PNG or JPG
3. Verify dimensions: 1280x800px
4. Try different browser (Chrome recommended)
5. Regenerate screenshots: `npm run capture:screenshots`

---

### Issue: Community post marked as spam

**Fix:**
1. Don't panic - happens sometimes
2. Contact subreddit/community mods
3. Explain: launching on PH, sharing with relevant community
4. Offer to answer questions or provide value
5. If removed, move to next community

---

### Issue: Not getting upvotes/engagement

**Fix:**
1. Check response time (should be < 15 min)
2. Post more updates on social media
3. DM people who requested PH link
4. Ask beta users to comment (not just upvote)
5. Share specific stories/examples in comments
6. Post in more communities (have backup list)

---

## 📂 Documentation Reference

| Document | Purpose |
|----------|---------|
| `PRODUCT_HUNT_SUBMISSION_FORM.md` | Complete PH submission (copy-paste) |
| `PRODUCT_HUNT_QUICK_START.md` | 5-minute quick start guide |
| `HUNT20_QUICK_START.md` | Discount code setup |
| `PRE_LAUNCH_TEASER_CAMPAIGN.md` | 7-day pre-launch campaign |
| `TWITTER_LAUNCH_CONTENT.md` | All tweets (copy-paste ready) |
| `BETA_USER_PRELAUNCH_EMAIL.md` | Beta user email templates |
| `LAUNCH_DAY_EXECUTION_READY.md` | Community posting guide |
| `data/launch-posts/SCHEDULE.md` | 15-hour posting schedule |
| `data/launch-posts/*.md` | Individual post templates |

---

## 🎯 Post-Launch (Day After)

### Wednesday, March 26

**Morning (9:00 AM):**
- [ ] Tweet thank you + final ranking
- [ ] Post LinkedIn results update
- [ ] Email beta users with results
- [ ] Screenshot final PH page

**Analytics Export:**
- [ ] Export PH metrics (upvotes, comments, traffic)
- [ ] Export Stripe data (HUNT20 redemptions, revenue)
- [ ] Export PostHog data (funnel, attribution, conversion)
- [ ] Export community metrics: `npm run launch:dashboard`

**Retrospective:**
- [ ] What worked well?
- [ ] What could be improved?
- [ ] Which communities drove most traffic?
- [ ] Which response templates worked best?
- [ ] What would you do differently next time?

**Documentation:**
- [ ] Create `LAUNCH_RETROSPECTIVE.md`
- [ ] Document final metrics
- [ ] Archive all screenshots
- [ ] Save top comments/testimonials

---

## ✅ Final Pre-Launch Verification (Day Before)

**Run this checklist 24 hours before launch:**

### Technical
- [ ] `npm run dev` - Site loads correctly
- [ ] `npm run test:hunt20` - Discount code works
- [ ] `npm run launch:dashboard` - Tracking system operational
- [ ] Screenshots exist: `ls public/product-hunt/screenshots/`
- [ ] Stripe Live Mode active
- [ ] PostHog tracking working
- [ ] Email sending configured (SendGrid)

### Content
- [ ] Product Hunt submission scheduled
- [ ] First comment ready
- [ ] All 15 community posts generated
- [ ] Beta user email ready
- [ ] Twitter content prepared
- [ ] Response templates reviewed

### Logistics
- [ ] Calendar cleared for 15+ hours
- [ ] Alarms set
- [ ] Laptop charged
- [ ] Phone charged
- [ ] Coffee/snacks ready
- [ ] All browser tabs bookmarked
- [ ] Team notified (if applicable)

---

## 🎉 You're Ready!

**Everything is prepared. Just follow this guide step-by-step.**

**Launch Day Motto:**
- Respond fast (< 15 min)
- Be helpful, not sales-y
- Share real stories and numbers
- Thank everyone
- Have fun!

**Goal: #1 Product of the Day with 500+ upvotes! 🚀**

---

**Last Updated:** March 18, 2026
**Launch:** Tuesday, March 25, 2026 @ 12:01 AM PST
**Status:** ✅ READY TO EXECUTE
