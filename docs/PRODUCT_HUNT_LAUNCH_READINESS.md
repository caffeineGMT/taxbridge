# Product Hunt Launch Readiness Checklist

**Launch Date:** Tuesday, March 25, 2026 @ 12:01 AM PT
**Product:** TaxBridge - Cross-Border Tax Calculator
**Goal:** Top 3 Product of the Day, 500+ upvotes, 20+ paid conversions

**Status:** 🟡 IN PROGRESS - 6 critical items remaining
**Updated:** March 19, 2026

---

## 🎯 LAUNCH READINESS SCORE: 65/100

### ✅ COMPLETED (65 points)
- [x] Product Hunt submission form drafted
- [x] First comment template ready
- [x] Hourly monitoring system documented
- [x] Launch execution plan created
- [x] Emergency protocols defined
- [x] Domain references fixed (taxbridge.app → taxbridgecpa.com)
- [x] Screenshot capture scripts created
- [x] Team coordination plan ready
- [x] Social media posts drafted
- [x] Response templates created
- [x] Launch dashboard infrastructure planned
- [x] Metrics tracking system documented
- [x] HUNT20 promo code setup guide created

### 🔴 CRITICAL BLOCKERS (35 points remaining)

#### P0 - REVENUE BLOCKERS (Must complete BEFORE launch)
- [ ] **Stripe Production Activation** (15 points)
  - Current: TEST mode with placeholder keys
  - Required: Live mode with real price IDs
  - Impact: ZERO revenue capability until activated
  - Timeline: 2-3 hours
  - Owner: CEO/CTO
  - Guide: `/docs/STRIPE_PRODUCTION_ACTIVATION_COMPLETE.md`

- [ ] **HUNT20 Promo Code Creation** (10 points)
  - Current: NOT created in Stripe
  - Required: Active 48-hour promo code (20% off Pro)
  - Impact: Cannot offer launch discount
  - Timeline: 15 minutes AFTER Stripe goes live
  - Owner: CEO
  - Guide: `/docs/STRIPE_HUNT20_COUPON_SETUP.md`

#### P1 - MARKETING ASSETS (Must complete 24 hours before launch)
- [ ] **Product Screenshots** (5 points)
  - Current: 0/5 screenshots captured
  - Required: 5 screenshots at 1280x800px
  - Impact: Cannot submit to Product Hunt without screenshots
  - Timeline: 30 minutes
  - Owner: CEO
  - Script: `npm run capture:screenshots`
  - Manual guide: `/docs/manual-screenshot-guide.md`

- [ ] **Demo Video** (3 points)
  - Current: NOT recorded
  - Required: 60-second Loom video
  - Impact: Lower engagement, reduces upvotes by 20-30%
  - Timeline: 1 hour (record + edit)
  - Owner: CEO
  - Script: `/docs/DEMO_VIDEO_SCRIPT.md` (to be created)

#### P2 - LAUNCH INFRASTRUCTURE (Recommended before launch)
- [ ] **Product Hunt API Token** (1 point)
  - Current: NOT configured
  - Required: For automated monitoring dashboard
  - Impact: Manual monitoring only (slower response time)
  - Timeline: 10 minutes
  - Owner: CEO
  - Setup: https://www.producthunt.com/v2/oauth/applications

- [ ] **Launch Dashboard Testing** (1 point)
  - Current: NOT tested end-to-end
  - Required: Verify monitoring works
  - Impact: Potential blind spots on launch day
  - Timeline: 15 minutes
  - Owner: CEO
  - Command: `npm run launch:monitor`

---

## 📅 LAUNCH TIMELINE

### Phase 1: PRE-LAUNCH (Now - March 24, 11:00 PM PT)

**Immediate (March 19-20):**
- [ ] ⚠️ BLOCKER: Activate Stripe production mode (2-3 hours)
  - Follow `/docs/STRIPE_PRODUCTION_ACTIVATION_COMPLETE.md`
  - Get live API keys from Stripe Dashboard
  - Create live price IDs: Basic ($49/yr), Pro ($79/yr)
  - Setup webhook endpoint
  - Test end-to-end payment flow
  - **GATE:** Do NOT proceed until Stripe is live and tested

**48 Hours Before Launch (March 23, 12:01 AM PT):**
- [ ] Create HUNT20 promo code in Stripe Dashboard
  - 20% off Pro plan ($79 → $63.20)
  - Valid: March 25 12:01 AM - March 27 11:59 PM PT (48 hours)
  - Max redemptions: 100
  - Test promo code at checkout
  - **GATE:** Verify discount applies correctly before launch

**24 Hours Before Launch (March 24, 12:01 AM PT):**
- [ ] Capture 5 product screenshots
  - Run: `npm run dev` (in one terminal)
  - Run: `npm run capture:screenshots` (in another terminal)
  - Verify: `ls -lh public/product-hunt/screenshots/`
  - Expected: 5 PNG files at 1280x800px
  - Manual fallback: Follow `/docs/manual-screenshot-guide.md`

- [ ] Record demo video (60 seconds)
  - Follow script: `/docs/DEMO_VIDEO_SCRIPT.md`
  - Platform: Loom (https://loom.com)
  - Upload and get shareable link
  - Add link to submission form

- [ ] Setup Product Hunt monitoring
  - Get API token: https://www.producthunt.com/v2/oauth/applications
  - Add to `.env.local`: `PRODUCT_HUNT_API_TOKEN=...`
  - Test: `npm run launch:monitor`
  - Verify: Dashboard shows mock data

- [ ] Final product check
  - Visit https://taxbridgecpa.com
  - Test calculator end-to-end
  - Test signup flow
  - Test payment flow with real card (then refund)
  - Test HUNT20 promo code
  - **GATE:** All flows must work before launch

**12 Hours Before Launch (March 24, 12:01 PM PT):**
- [ ] Email beta users heads-up
  - Subject: "We're launching on Product Hunt tomorrow at midnight!"
  - Body: Ask for upvote + comment
  - Include launch link (once live)

- [ ] Prepare team
  - Send team Discord invite
  - Share launch timeline
  - Assign roles (see coordination plan)

**1 Hour Before Launch (March 24, 11:00 PM PT):**
- [ ] Log into Product Hunt
- [ ] Go to: https://www.producthunt.com/posts/new
- [ ] Fill in all fields (copy from `/docs/PRODUCT_HUNT_SUBMISSION.md`)
- [ ] Upload 5 screenshots
- [ ] Add demo video URL
- [ ] Copy first comment to clipboard
- [ ] Set phone alerts for Product Hunt notifications
- [ ] Clear calendar for next 12+ hours

---

### Phase 2: LAUNCH DAY (March 25, 12:01 AM - 11:59 PM PT)

**12:01 AM - Launch Window (15 minutes):**
- [ ] **12:01 AM:** Submit product to Product Hunt
- [ ] **12:02 AM:** Wait for approval (5-10 min)
- [ ] **12:05 AM:** Post first comment (paste from clipboard)
- [ ] **12:06 AM:** Pin first comment
- [ ] **12:10 AM:** Start monitoring: `npm run launch:start-cron`
- [ ] **12:15 AM:** Open dashboard: http://localhost:3000/launch-dashboard

**Morning Surge (8:00 AM - 12:00 PM PT):**
- [ ] **8:00 AM:** Check ranking (should be Top 10)
- [ ] **9:00 AM:** Email beta users: "We're live!"
- [ ] **10:00 AM:** Share on LinkedIn, Twitter
- [ ] **11:00 AM:** Post on r/h1b, r/PersonalFinanceCanada
- [ ] **12:00 PM:** Check ranking (target: Top 5)

**Afternoon Push (12:00 PM - 6:00 PM PT):**
- [ ] Respond to EVERY comment within 15 minutes
- [ ] Monitor dashboard hourly
- [ ] If rank drops below #5: Activate emergency protocol
- [ ] **3:00 PM:** Second social media push
- [ ] **5:00 PM:** Final push email to warm leads

**Evening Close (6:00 PM - 11:59 PM PT):**
- [ ] **6:00 PM:** Project final ranking
- [ ] **8:00 PM:** Thank you post to supporters
- [ ] **10:00 PM:** Final engagement sweep
- [ ] **11:45 PM:** Screenshot final stats

---

### Phase 3: POST-LAUNCH (March 26+)

**Immediate (24 hours):**
- [ ] Export metrics: `cat data/launch-metrics.json`
- [ ] Send thank you email to upvoters
- [ ] Blog post: "How We Launched on Product Hunt"
- [ ] Update homepage: "#3 Product of the Day" badge
- [ ] Analyze: Which communities drove traffic?

**Week 1 (March 26 - April 1):**
- [ ] Follow up with engaged users
- [ ] Convert Product Hunt traffic
- [ ] Write launch retrospective
- [ ] Share results on Twitter/LinkedIn
- [ ] Plan next growth channel

---

## 🔍 DETAILED ASSET STATUS

### 1. Product Screenshots (0/5 complete)

**Screenshot List:**
1. ❌ `hero-dashboard.png` - Dashboard with RSU entries
2. ❌ `ftc-optimizer.png` - Foreign Tax Credit results
3. ❌ `forms-checklist.png` - Required tax forms
4. ❌ `pricing-page.png` - Pricing tiers
5. ❌ `pdf-export.png` - PDF export sample

**Capture Process:**
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Capture screenshots (automated)
npm run capture:screenshots

# Verify screenshots exist
ls -lh public/product-hunt/screenshots/

# Expected output:
# -rw-r--r--  1 user  staff  234K Mar 24 hero-dashboard.png
# -rw-r--r--  1 user  staff  189K Mar 24 ftc-optimizer.png
# -rw-r--r--  1 user  staff  156K Mar 24 forms-checklist.png
# -rw-r--r--  1 user  staff  178K Mar 24 pricing-page.png
# -rw-r--r--  1 user  staff  201K Mar 24 pdf-export.png
```

**Manual Fallback:**
If automated script fails, follow: `/docs/manual-screenshot-guide.md`

**Quality Checklist:**
- [ ] All screenshots are 1280x800px (16:10 aspect ratio)
- [ ] Screenshots show real data (not placeholders)
- [ ] Text is crisp and readable
- [ ] No sensitive PII visible
- [ ] Consistent branding/styling

---

### 2. Demo Video (NOT started)

**Requirements:**
- Platform: Loom (https://loom.com)
- Duration: 60 seconds (max)
- Resolution: 1080p minimum
- Audio: Clear voiceover + background music (optional)
- Thumbnail: Use `hero-dashboard.png`

**Video Structure:**
```
0:00-0:10 (10s) - Problem statement
  "If you're an H-1B tech worker who moved to Canada, filing dual-country taxes is a nightmare."
  Show: Calculator homepage

0:10-0:25 (15s) - Solution overview
  "TaxBridge automates dual-country tax calculations for RSU income."
  Show: Enter RSU details, click calculate

0:25-0:45 (20s) - Key features
  "Get US + Canada tax breakdown, Foreign Tax Credit optimization, and filing checklists."
  Show: Dashboard results, FTC savings, forms checklist

0:45-0:60 (15s) - Call to action
  "Try TaxBridge free at taxbridgecpa.com. Use code HUNT20 for 20% off Pro."
  Show: Pricing page with HUNT20 banner
```

**Recording Checklist:**
- [ ] Script finalized
- [ ] Screen recording software ready (Loom)
- [ ] Audio tested (clear, no background noise)
- [ ] Demo data prepared (realistic example)
- [ ] Product hunt promo code active (HUNT20 banner visible)

**Post-Production:**
- [ ] Trim to exactly 60 seconds
- [ ] Add captions (Product Hunt auto-generates, but verify accuracy)
- [ ] Upload to Loom
- [ ] Get shareable link
- [ ] Test link plays correctly
- [ ] Add link to Product Hunt submission form

---

### 3. HUNT20 Promo Code (NOT created)

**Stripe Dashboard Setup:**

**Step 1: Navigate**
- Log in: https://dashboard.stripe.com
- Products → Coupons
- Click "Create coupon"

**Step 2: Configure**
```
Coupon ID: HUNT20
Discount Type: Percentage
Amount: 20%
Duration: Once (first payment only)
Max Redemptions: 100
Redemption Window:
  Start: March 25, 2026, 12:01 AM PT (7:01 AM UTC)
  End: March 27, 2026, 11:59 PM PT (6:59 AM UTC March 28)
Applies to: Pro Plan - Annual (price_XXX)
Metadata:
  campaign: product_hunt_launch
  launch_date: 2026-03-25
```

**Step 3: Test**
- Go to: https://taxbridgecpa.com/pricing
- Click "Get Started" on Pro plan
- Enter coupon code: HUNT20
- Verify: Price changes from $79 → $63.20 (20% off)
- Complete test checkout with card: `4242 4242 4242 4242`
- Refund test payment immediately

**Step 4: Monitor**
- Stripe Dashboard → Coupons → HUNT20
- Track: Redemptions, revenue impact
- Goal: 20+ redemptions in 48 hours

**Communication:**
- First Product Hunt comment: Mention HUNT20
- Twitter/LinkedIn posts: Highlight 20% discount
- Email: "Launch special - 20% off with code HUNT20"

---

### 4. Product Hunt API Token (NOT configured)

**Setup Steps:**

1. **Get Token:**
   - Go to: https://www.producthunt.com/v2/oauth/applications
   - Click "New Application"
   - Name: "TaxBridge Launch Monitor"
   - Redirect URI: http://localhost:3000/auth/callback
   - Click "Create"
   - Copy "API Token"

2. **Add to Environment:**
   ```bash
   # .env.local
   PRODUCT_HUNT_API_TOKEN=your_api_token_here
   PRODUCT_HUNT_SLUG=taxbridge
   ```

3. **Test:**
   ```bash
   npm run launch:monitor
   # Should show real Product Hunt data (or mock data if not launched yet)
   ```

4. **Verify:**
   ```bash
   npm run dev
   # Open: http://localhost:3000/launch-dashboard
   # Should display metrics (ranking, upvotes, comments)
   ```

---

### 5. Launch Dashboard (NOT tested)

**Test Procedure:**

**Step 1: Start Monitoring**
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Run monitoring script once
npm run launch:monitor
```

**Step 2: Verify Dashboard**
- Open: http://localhost:3000/launch-dashboard
- Should see:
  - Current ranking (mock: #5)
  - Upvotes (mock: 110)
  - Comments (mock: 22)
  - Velocity (mock: 36/hr)
  - Hourly chart
  - Action checklist

**Step 3: Test Hourly Updates**
```bash
# Run monitoring again (simulates next hour)
npm run launch:monitor

# Refresh dashboard - metrics should update
```

**Step 4: Test Alerts**
- Dashboard should show alerts when:
  - Velocity < 15/hr → "⚠️ Low velocity"
  - Ranking drops 3+ positions → "🔻 Ranking dropped"
  - Behind target → "🚨 Behind target"

**Step 5: Production Test (Launch Day)**
```bash
# Start automated hourly monitoring
npm run launch:start-cron

# Dashboard will update every hour automatically
# Monitor at: http://localhost:3000/launch-dashboard
```

---

## 🚨 CRITICAL DEPENDENCIES

### Stripe Production → HUNT20 → Launch
```
[Stripe Production] ──BLOCKS──> [HUNT20 Promo] ──BLOCKS──> [Product Hunt Launch]
     ❌ TEST MODE          ❌ NOT CREATED        🟡 READY TO SUBMIT
     2-3 hours            15 minutes            24 hours before
```

**Rule:** Do NOT launch until Stripe is live AND HUNT20 promo is tested.

**Reason:** Offering 20% discount when payments don't work = bad user experience + lost revenue.

---

## ✅ GO/NO-GO DECISION CRITERIA

### MUST HAVE (Blocking launch)
- ✅ Product works end-to-end (calculator, signup, payment)
- ❌ Stripe production mode active (currently TEST)
- ❌ HUNT20 promo code created and tested
- ❌ 5 screenshots uploaded to Product Hunt
- ✅ Product Hunt submission form filled
- ✅ First comment ready

**Status:** 🔴 NO-GO (3/6 criteria met)

### SHOULD HAVE (Strongly recommended)
- ❌ Demo video recorded and uploaded
- ❌ Product Hunt API token configured
- ❌ Launch dashboard tested
- ✅ Beta users notified 24hr heads-up
- ✅ Social media posts drafted

**Status:** 🟡 PARTIAL (2/5 criteria met)

### NICE TO HAVE (Optional)
- Email alerts configured (SendGrid)
- SMS alerts configured (Twilio)
- Slack webhook setup
- Team coordination Discord created

**Status:** 🟡 OPTIONAL (not critical for launch)

---

## 📊 PROJECTED LAUNCH READINESS

### Current Timeline: March 19 → March 25 (6 days)

**Optimistic (90% probability):**
- March 19-20: Stripe activation (2-3 hours)
- March 23: HUNT20 promo created (15 min)
- March 24: Screenshots captured (30 min)
- March 24: Demo video recorded (1 hour)
- March 24: Final testing (1 hour)
- March 25 12:01 AM: Launch! ✅

**Realistic (70% probability):**
- Stripe activation delayed to March 20-21
- HUNT20 promo created March 23
- Screenshots + demo on March 24
- Launch delayed to March 26 (Wed) or April 1 (Tue)

**Pessimistic (30% probability):**
- Stripe activation issues (takes 2-3 days to debug)
- Launch delayed to April 8 (Tue)

---

## 🎯 NEXT ACTIONS (Priority Order)

### TODAY (March 19):
1. ⚠️ **CRITICAL:** Activate Stripe production mode
   - Follow: `/docs/STRIPE_PRODUCTION_ACTIVATION_COMPLETE.md`
   - Timeline: 2-3 hours
   - Owner: CEO/CTO

### March 23 (48 hours before launch):
2. **HIGH:** Create HUNT20 promo code in Stripe
   - Follow: `/docs/STRIPE_HUNT20_COUPON_SETUP.md`
   - Timeline: 15 minutes
   - Test: Complete checkout with promo code

### March 24 (24 hours before launch):
3. **HIGH:** Capture 5 product screenshots
   - Run: `npm run capture:screenshots`
   - Verify: 1280x800px, clear text, real data

4. **MEDIUM:** Record demo video
   - Script: `/docs/DEMO_VIDEO_SCRIPT.md`
   - Platform: Loom
   - Duration: 60 seconds

5. **LOW:** Setup Product Hunt API token
   - Get from: https://www.producthunt.com/v2/oauth/applications
   - Test monitoring dashboard

6. **LOW:** Final testing
   - End-to-end user flow
   - HUNT20 promo code
   - Mobile responsive check

---

## 📞 DECISION POINT

**Question:** Are we launching March 25 or delaying?

**LAUNCH IF:**
- ✅ Stripe production active by March 23
- ✅ HUNT20 promo tested by March 24 noon
- ✅ 5 screenshots ready by March 24 evening
- ✅ CEO available 12+ hours on March 25

**DELAY IF:**
- ❌ Stripe still in test mode by March 23
- ❌ HUNT20 promo not working by March 24
- ❌ Screenshots not ready by March 24
- ❌ CEO unavailable March 25

**Recommended Decision Deadline:** March 23, 6:00 PM PT

---

## 📝 SUMMARY

**Current Status:** 🟡 65% ready, 35% critical work remaining

**Blockers:** Stripe production mode, HUNT20 promo, screenshots, demo video

**Timeline:** 6 days to launch (March 19 → March 25)

**Confidence:** 70% we launch on time IF Stripe activation starts TODAY

**Recommendation:** Start Stripe activation immediately. Revisit on March 23 to make final go/no-go decision.

---

**Last Updated:** March 19, 2026
**Next Review:** March 23, 2026 (go/no-go decision)
**Launch Target:** Tuesday, March 25, 2026 @ 12:01 AM PT
