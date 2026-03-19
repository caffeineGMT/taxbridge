# Product Hunt Launch - Final Execution Guide

**Launch Date:** Tuesday, March 25, 2026 @ 12:01 AM PT
**Product:** TaxBridge (https://taxbridgecpa.com)
**Owner:** Michael Guo (CEO)
**Status:** 🟡 READY PENDING STRIPE ACTIVATION

---

## 🚀 QUICK START (Day-Of Launch)

### T-Minus 15 Minutes (11:45 PM Monday, March 24)

```bash
# Terminal 1: Start dev server (for monitoring dashboard)
npm run dev

# Terminal 2: Start Product Hunt monitoring
npm run launch:start

# Browser: Open dashboard
open http://localhost:3000/launch-dashboard

# Browser: Go to Product Hunt submission
open https://www.producthunt.com/posts/new

# Review submission one final time (all fields filled, screenshots uploaded)
```

### T-Minus 0 (12:01 AM Tuesday, March 25)

1. **Click "Submit for Review" on Product Hunt**
2. **Wait 5-10 minutes for approval**
3. **Once live:**
   - Post first comment (already in clipboard)
   - Pin comment
   - Email beta users "We're live!"
   - Start hourly engagement protocol

---

## 📋 COMPLETE PRE-LAUNCH CHECKLIST

### PHASE 1: REVENUE INFRASTRUCTURE (DO FIRST)

**Timeline:** March 19-23 (5 days before launch)
**Priority:** 🔴 P0-CRITICAL

#### Task 1.1: Activate Stripe Production Mode (2-3 hours)

**Current Status:** ❌ TEST mode (26 placeholder env vars)

**Action:**
```bash
# Follow comprehensive guide
cat docs/STRIPE_PRODUCTION_ACTIVATION_COMPLETE.md

# Key steps:
# 1. Get live Stripe API keys
# 2. Create live Pro price ($79/year)
# 3. Setup webhook endpoint
# 4. Update Vercel environment variables
# 5. Test end-to-end payment flow
# 6. Refund test payment

# Verification:
npm run verify:stripe-production
```

**Success Criteria:**
- ✅ Stripe Dashboard shows "Live mode" badge
- ✅ Pro price ID starts with `price_1...` (not placeholder)
- ✅ Webhook events logged at https://dashboard.stripe.com/webhooks
- ✅ Test payment of $79 processed and refunded

**Blocker:** CANNOT create HUNT20 promo until Stripe is live

---

#### Task 1.2: Create HUNT20 Promo Code (15 minutes)

**Timeline:** March 23, 12:01 AM PT (48 hours before launch)
**Depends on:** Task 1.1 (Stripe must be live first)

**Action:**
```bash
# Automated script (RECOMMENDED)
npx tsx scripts/activate-hunt20-promo.ts

# Expected output:
# ✅ HUNT20 coupon created successfully!
# ✅ Discount: 20% off Pro Annual
# ✅ Valid: March 25 00:01 PT → March 27 23:59 PT (48 hours)
# ✅ Max uses: 100
# ✅ Test session: $79 → $63.20
```

**Manual Alternative:**
1. Go to https://dashboard.stripe.com/coupons
2. Click "Create coupon"
3. Fill in:
   - ID: `HUNT20`
   - Discount: 20% off
   - Duration: Once (first payment only)
   - Max redemptions: 100
   - Redeem by: March 27, 2026 11:59 PM PT
   - Applies to: Pro Annual price ID

**Test:**
```bash
# 1. Go to https://taxbridgecpa.com/pricing
# 2. Click "Get Started" on Pro
# 3. Enter coupon: HUNT20
# 4. Verify: $79 → $63.20 (20% off)
# 5. Complete test checkout with: 4242 4242 4242 4242
# 6. Refund immediately
```

**Success Criteria:**
- ✅ HUNT20 visible in Stripe Dashboard
- ✅ Discount applies correctly at checkout
- ✅ Test payment went through with discount
- ✅ Refund processed

---

### PHASE 2: MARKETING ASSETS (DO SECOND)

**Timeline:** March 24 (1 day before launch)
**Priority:** 🟠 P1-HIGH

#### Task 2.1: Capture Product Screenshots (30 minutes)

**Current Status:** ❌ 0/5 screenshots exist

**Action:**
```bash
# Terminal 1: Start dev server
npm run dev
# Wait for: http://localhost:3000

# Terminal 2: Run screenshot capture
npm run capture:screenshots

# Expected output:
# [1/5] Capturing: Main dashboard with RSU entries and tax overview
# ✓ Saved: /public/product-hunt/screenshots/hero-dashboard.png
# [2/5] Capturing: Foreign Tax Credit calculation results
# ✓ Saved: /public/product-hunt/screenshots/ftc-optimizer.png
# [3/5] Capturing: Required tax forms checklist
# ✓ Saved: /public/product-hunt/screenshots/forms-checklist.png
# [4/5] Capturing: Pricing tiers with Pro plan highlighted
# ✓ Saved: /public/product-hunt/screenshots/pricing-page.png
# [5/5] Capturing: Professional PDF export sample
# ✓ Saved: /public/product-hunt/screenshots/pdf-export.png
```

**Verify:**
```bash
ls -lh public/product-hunt/screenshots/

# Expected:
# -rw-r--r--  234K hero-dashboard.png
# -rw-r--r--  189K ftc-optimizer.png
# -rw-r--r--  156K forms-checklist.png
# -rw-r--r--  178K pricing-page.png
# -rw-r--r--  201K pdf-export.png

# Quality check:
# - All files ~150-250KB
# - Dimensions: 1280x800px
# - Text is crisp and readable
```

**Manual Fallback (if script fails):**
```bash
# Follow manual guide
cat docs/manual-screenshot-guide.md

# Key steps:
# 1. Open Chrome, set window to 1280x800
# 2. Visit each page:
#    - https://taxbridgecpa.com/dashboard
#    - https://taxbridgecpa.com/forms-checklist
#    - https://taxbridgecpa.com/pricing
# 3. Take screenshot (Cmd+Shift+4 on Mac)
# 4. Save to /public/product-hunt/screenshots/
```

**Success Criteria:**
- ✅ 5 PNG files exist
- ✅ All 1280x800px (Product Hunt standard)
- ✅ Text is readable (not blurry)
- ✅ Shows real data (not placeholders)
- ✅ HUNT20 banner visible on pricing page

---

#### Task 2.2: Record Demo Video (1 hour)

**Current Status:** ❌ NOT recorded

**Action:**
```bash
# Read full script
cat docs/DEMO_VIDEO_SCRIPT.md

# Key preparation:
# 1. Install Loom: https://loom.com
# 2. Pre-fill calculator with demo data:
#    - Company: Meta
#    - Grant: 2024-01-15
#    - Vest: 2025-01-15
#    - Shares: 100
#    - Price: $500
#    - US State: Washington
#    - Canada: British Columbia
# 3. Rehearse voiceover 3x (read script aloud)
# 4. Close all browser tabs except taxbridgecpa.com
# 5. Enable Do Not Disturb mode
```

**Recording Workflow:**
1. Open Loom → "Start Recording" → "Screen Only"
2. Navigate: Homepage → Calculator → Dashboard → Pricing
3. Record voiceover (60 seconds exactly)
4. Stop recording
5. Trim to 59-60 seconds
6. Add captions (auto-generated)
7. Publish → Get shareable link

**Script Summary (60 seconds):**
```
[0:00-0:10] Problem: "Filing dual-country taxes is a nightmare..."
[0:10-0:25] Solution: "TaxBridge automates this. Enter RSUs once..."
[0:25-0:45] Features: "See tax breakdown, FTC savings, forms checklist..."
[0:45-0:60] CTA: "Try free. Use HUNT20 for 20% off. $63/year."
```

**Success Criteria:**
- ✅ Duration: 59-60 seconds (max)
- ✅ Resolution: 1080p
- ✅ Audio: Clear, no background noise
- ✅ Captions: Accurate
- ✅ Shareable link works (test in incognito)
- ✅ HUNT20 promo visible in video

**Output:**
```
Video URL: https://www.loom.com/share/[ID]
Add to Product Hunt submission form: "Demo Video" field
```

---

### PHASE 3: LAUNCH INFRASTRUCTURE (DO THIRD)

**Timeline:** March 24 (1 day before launch)
**Priority:** 🟡 P2-MEDIUM

#### Task 3.1: Setup Product Hunt API Token (10 minutes)

**Optional but recommended** for automated monitoring dashboard

**Action:**
1. Go to https://www.producthunt.com/v2/oauth/applications
2. Click "New Application"
3. Fill in:
   - Name: TaxBridge Launch Monitor
   - Redirect URI: http://localhost:3000/auth/callback
4. Click "Create"
5. Copy "API Token"
6. Add to `.env.local`:
   ```bash
   PRODUCT_HUNT_API_TOKEN=your_token_here
   PRODUCT_HUNT_SLUG=taxbridge
   ```

**Test:**
```bash
npm run launch:monitor

# Expected output (mock data if not launched yet):
# 📊 TaxBridge - Hour 0
# 🏆 Ranking: #10 / 10+
# 👍 Upvotes: 0
# 💬 Comments: 0
# ⚡ Velocity: 0 upvotes/hour
```

**Success Criteria:**
- ✅ API token configured
- ✅ Monitoring script runs without errors
- ✅ Dashboard displays mock data

---

#### Task 3.2: Test Launch Dashboard (15 minutes)

**Action:**
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Run monitoring (generates test data)
npm run launch:monitor

# Browser: Open dashboard
open http://localhost:3000/launch-dashboard
```

**Verify Dashboard Shows:**
- ✅ Ranking card (#5 mock)
- ✅ Upvotes card (110 mock)
- ✅ Velocity card (36/hr mock)
- ✅ Time remaining card
- ✅ Hourly chart (upvotes over time)
- ✅ Alert section (low velocity warning)
- ✅ Actions checklist (email beta users, post on Reddit, etc.)

---

### PHASE 4: FINAL PREPARATION (DO LAST)

**Timeline:** March 24, 12:00 PM - 11:45 PM (12 hours before launch)
**Priority:** 🟠 P1-HIGH

#### Task 4.1: Email Beta Users (24hr heads-up)

**When:** March 24, 12:00 PM PT (12 hours before launch)

**Template:**
```
Subject: We're launching on Product Hunt tomorrow at midnight!

Hey [Name],

Quick heads-up: We're launching TaxBridge on Product Hunt tomorrow (Tuesday) at 12:01 AM PT.

I'd love your support! Here's what you can do:

1. Upvote us when we go live (I'll send the link at midnight)
2. Leave a comment about your experience with TaxBridge
3. Share with friends in H-1B/TN visa communities

🎁 Launch special: 20% off Pro with code HUNT20 (48 hours only)
   $79/year → $63/year

Thanks for being an early supporter!

Michael
Founder, TaxBridge
```

**Send to:**
- Beta user list (estimate: 50 users)
- Friends/family who understand the problem
- H-1B/TN visa tech worker contacts

---

#### Task 4.2: Prepare Team Coordination (if applicable)

**When:** March 24, 6:00 PM PT

**Action:**
1. Create Discord channel: #product-hunt-launch
2. Share timeline with team
3. Assign roles:
   - CEO: Hunter (submit product, respond to ALL comments)
   - Team members: Upvote + comment at staggered times
4. Test notifications (everyone gets Product Hunt mobile app)

---

#### Task 4.3: Draft Product Hunt Submission (11:00 PM Monday)

**When:** March 24, 11:00 PM PT (T-minus 1 hour)

**Action:**
1. Go to https://www.producthunt.com/posts/new
2. Fill in all fields (copy from `/docs/PRODUCT_HUNT_SUBMISSION.md`)
3. Upload 5 screenshots (from `/public/product-hunt/screenshots/`)
4. Add demo video URL (from Task 2.2)
5. Review everything 3x
6. DO NOT submit yet (wait until 12:01 AM)

**Checklist:**
- [ ] Product name: TaxBridge
- [ ] Tagline: "Cross-border tax calculator for H-1B tech workers with RSUs"
- [ ] Website: https://taxbridgecpa.com
- [ ] Screenshots: 5 uploaded
- [ ] Demo video: URL added
- [ ] Description: 260 characters (copy from doc)
- [ ] Topics: SaaS, Finance, Productivity
- [ ] Pricing: Free + Paid ($79/year Pro)

---

#### Task 4.4: Copy First Comment to Clipboard (11:50 PM Monday)

**Action:**
```bash
# Copy first comment template
cat docs/PRODUCT_HUNT_SUBMISSION.md | grep -A 30 "First Comment Template"
```

**Template (condensed):**
```
👋 Hey Product Hunt! I'm Michael, founder of TaxBridge.

**The Problem:**
I'm an H-1B tech worker who moved from the US to Canada while still earning RSU income from Meta. Filing taxes became a nightmare - I had to pay both US and Canadian taxes on the same income. My accountant charged $800/year just for RSU calculations, and I STILL ended up overpaying $2,300 in taxes due to incorrectly claimed Foreign Tax Credits.

**The Solution:**
TaxBridge automates dual-country tax calculations for cross-border tech workers.

✅ **Dual Tax Calculation:** US federal + state AND Canada federal + provincial
✅ **FTC Optimizer:** Eliminates double taxation
✅ **Forms Checklist:** Complete list (W-2, 1040-NR, T1, T4, FBAR, 8938, 8833)

**Built for Big Tech:**
- Auto-imports RSU data from Meta, Amazon, Google, Microsoft
- Handles complex equity compensation (RSUs, stock options, ESPP)
- USD/CAD conversion using Bank of Canada official rates

**🎁 Special Launch Offer:**
Use code **HUNT20** for 20% off Pro plan for the next 48 hours ($79 → $63/year)

Ask me anything! 🚀
```

**Test:**
- Copy to Notes app
- Ready to paste at 12:05 AM

---

## 🎬 LAUNCH DAY EXECUTION

### Hour 0: Launch Window (12:01 AM - 1:00 AM)

**12:01 AM:**
- [ ] Click "Submit for Review" on Product Hunt
- [ ] Start timer (watch for approval notification)

**12:05 AM (or whenever approved):**
- [ ] Post first comment (paste from clipboard)
- [ ] Pin first comment
- [ ] Refresh page - verify comment is pinned

**12:10 AM:**
- [ ] Start monitoring: `npm run launch:start`
- [ ] Open dashboard: http://localhost:3000/launch-dashboard
- [ ] Email beta users: "We're live! [PH link]"

**12:15 AM - 1:00 AM:**
- [ ] Share on Twitter, LinkedIn
- [ ] Post in r/h1b, r/PersonalFinanceCanada
- [ ] Monitor comments (respond within 15 min)
- [ ] Check dashboard for first upvotes

---

### Hour 1-7: Night Shift (1:00 AM - 8:00 AM)

**Hourly:**
- [ ] Check dashboard
- [ ] Respond to new comments (within 15 min)
- [ ] Like/upvote all comments

**Target by 8:00 AM:**
- Ranking: Top 10
- Upvotes: 50+
- Comments: 10+

---

### Hour 8-12: Morning Surge (8:00 AM - 12:00 PM)

**Critical Growth Window** (US wakes up)

**8:00 AM:**
- [ ] Check ranking (should be Top 10)
- [ ] Post update: "We're #X on Product Hunt!"
- [ ] Share on Twitter/LinkedIn with ranking

**9:00 AM:**
- [ ] Post on additional subreddits:
  - r/cscareerquestions
  - r/ImmigrationCanada
  - r/PersonalFinanceCanada

**10:00 AM:**
- [ ] Email investor network (if applicable)
- [ ] Share in tech Slack communities

**11:00 AM:**
- [ ] Post on Blind, Levels.fyi
- [ ] Share in company Slack (if allowed)

**12:00 PM:**
- [ ] Rank check (target: Top 5)
- [ ] If rank < #5: Activate emergency protocol

---

### Hour 12-24: Afternoon/Evening (12:00 PM - 12:00 AM)

**12:00 PM - 6:00 PM:**
- [ ] Respond to ALL comments within 15 minutes
- [ ] Monitor dashboard hourly
- [ ] Share positive comments on Twitter

**6:00 PM:**
- [ ] Project final ranking (based on velocity)
- [ ] If trending to Top 3: Celebrate!
- [ ] If not: Final push (email warm leads)

**10:00 PM:**
- [ ] Final engagement sweep
- [ ] Thank all commenters
- [ ] Respond to any unanswered questions

**11:45 PM:**
- [ ] Screenshot final stats
- [ ] Export metrics: `cat data/launch-metrics.json`
- [ ] Draft thank you email for tomorrow

---

## 🚨 EMERGENCY PROTOCOLS

### If Ranking Drops Below #5 by 12:00 PM

**Action Plan:**
1. Email all beta users: "🚨 We need your help - 12 hours left!"
2. Post in 3 additional communities:
   - r/Entrepreneur
   - r/startups
   - Tech worker communities (Blind, Teamblind)
3. DM 20 friends/colleagues asking for upvotes
4. Post Twitter thread with user testimonials
5. Increase comment response speed to <10 minutes

---

### If Velocity Drops Below 10 Upvotes/Hour

**Action Plan:**
1. Post new content in unused community
2. Engage with every comment (ask follow-up questions)
3. Share progress update on Product Hunt (e.g., "Just hit 100 upvotes!")
4. Post from personal Twitter account
5. Tag Product Hunt in all social media posts

---

### If Negative Comment or Troll Attack

**Action Plan:**
1. DO NOT delete or flag (looks defensive)
2. Respond professionally within 10 minutes
3. Acknowledge valid criticism, offer to fix
4. Offer to move discussion to DM/email
5. Post positive team comment immediately after
6. Learn from feedback (if constructive)

---

## ✅ POST-LAUNCH (March 26+)

### Immediate (24 hours)

- [ ] Export final metrics:
  ```bash
  cat data/launch-metrics.json | jq '.metrics[-1]'
  ```
- [ ] Analyze:
  - Final ranking: #___
  - Total upvotes: ___
  - Total comments: ___
  - Website visitors: ___
  - Signups: ___
  - Paid conversions: ___
- [ ] Send thank you email to upvoters
- [ ] Update homepage: "#X Product of the Day" badge
- [ ] Blog post: "How We Launched on Product Hunt"

### Week 1 (March 26 - April 1)

- [ ] Follow up with engaged users (commenters + upvoters)
- [ ] Convert Product Hunt traffic (monitor signup → paid conversion rate)
- [ ] Write launch retrospective:
  - What worked?
  - What didn't work?
  - Key learnings
  - Would we launch again?
- [ ] Share results on Twitter/LinkedIn
- [ ] Plan next growth channel

---

## 📊 SUCCESS METRICS

### Minimum Success (Acceptable)
- 250+ upvotes
- Top 10 Product of the Day
- 500+ website visitors
- 10+ paid conversions

### Target Success (Goal)
- 500+ upvotes
- **Top 3 Product of the Day**
- 1,000+ website visitors
- 20+ paid conversions

### Stretch Success (Amazing!)
- 1,000+ upvotes
- **#1 Product of the Day**
- 2,000+ website visitors
- 50+ paid conversions
- Featured in Product Hunt newsletter

---

## 🔗 QUICK LINKS

**Product Hunt:**
- Submission: https://www.producthunt.com/posts/new
- Dashboard: http://localhost:3000/launch-dashboard

**Stripe:**
- Coupons: https://dashboard.stripe.com/coupons/HUNT20
- Payments: https://dashboard.stripe.com/payments

**TaxBridge:**
- Production: https://taxbridgecpa.com
- Pricing: https://taxbridgecpa.com/pricing

**Documentation:**
- Readiness Checklist: `/docs/PRODUCT_HUNT_LAUNCH_READINESS.md`
- Submission Form: `/docs/PRODUCT_HUNT_SUBMISSION.md`
- Monitoring Guide: `/docs/PRODUCT_HUNT_MONITORING_GUIDE.md`
- HUNT20 Setup: `/docs/STRIPE_HUNT20_COUPON_SETUP.md`
- Demo Video Script: `/docs/DEMO_VIDEO_SCRIPT.md`

---

## 📞 HELP & TROUBLESHOOTING

**Product Hunt API token not working:**
```bash
# Verify token is set
echo $PRODUCT_HUNT_API_TOKEN
# Should show: your_token_here

# Test monitoring with mock data
npm run launch:monitor
# Should show mock metrics even without token
```

**Screenshots failed to capture:**
```bash
# Manual fallback
cat docs/manual-screenshot-guide.md
# Follow step-by-step instructions
```

**HUNT20 promo code not working:**
```bash
# Check Stripe Dashboard
open https://dashboard.stripe.com/coupons/HUNT20

# Verify:
# - Coupon is "Active"
# - Redemption window includes today
# - Max redemptions not reached
```

**Demo video won't upload:**
- Check file size (max 500MB for most platforms)
- Try uploading to YouTube as unlisted
- Use YouTube link in Product Hunt submission

---

**🚀 YOU'RE READY TO LAUNCH! Good luck! 🚀**

---

**Last Updated:** March 19, 2026
**Launch Date:** Tuesday, March 25, 2026 @ 12:01 AM PT
**Owner:** Michael Guo (CEO, TaxBridge)
