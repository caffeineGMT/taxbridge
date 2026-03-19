# Product Hunt Launch - EXECUTION PLAN

**Status:** READY FOR EXECUTION (Pending Manual Tasks)
**Launch Date:** Tuesday, March 25, 2026 at 12:01 AM PT
**Current Date:** March 19, 2026
**Days Until Launch:** 6 days

---

## 🎯 Launch Objectives

**Primary Goal:** Top 3 Product of the Day
**Metrics:**
- 500+ upvotes
- 100+ comments
- 50+ paying customers
- $2,450+ revenue (Day 1)

---

## ✅ COMPLETED PREPARATIONS

### Documentation & Strategy (100% Complete)
- ✅ Launch checklist created (LAUNCH_CHECKLIST.md)
- ✅ War room protocol prepared (WAR_ROOM.md)
- ✅ CMO brief delivered (CMO_BRIEF.md)
- ✅ Hunter outreach templates ready (HUNTER_OUTREACH.md)
- ✅ First comment pre-written (FIRST_COMMENT.md)
- ✅ Response templates created (30+ templates)
- ✅ Social media playbook ready
- ✅ Asset requirements documented

### Product Readiness
- ✅ Build passes with zero errors
- ✅ Unit tests: 191/191 passing (100%)
- ✅ Production site live at taxbridge.app
- ✅ Calculator mathematically validated
- ✅ Mobile responsive
- ✅ Performance optimized

---

## ⚠️ CRITICAL BLOCKERS (Requires Manual Execution)

### 1. Stripe Production Activation
**Status:** ❌ NOT COMPLETE (REVENUE BLOCKER)
**Priority:** P0 - MUST BE DONE FIRST
**Time Required:** 30-60 minutes

**Current State:**
- `.env.production` contains placeholder keys: `pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE`
- Cannot accept real payments until activated

**Action Required:**
1. Log into Stripe Dashboard → Developers → API Keys
2. Toggle to "Viewing live data" mode
3. Copy Publishable Key (starts with `pk_live_`)
4. Copy Secret Key (starts with `sk_live_`)
5. Update Vercel environment variables:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `STRIPE_SECRET_KEY=sk_live_...`
6. Redeploy production
7. Test checkout with real credit card
8. Verify payment appears in Stripe Dashboard
9. Refund test payment

**Documentation:** See `docs/STRIPE_PRODUCTION_SETUP.md`

**Deadline:** March 22 EOD (Must be live 72 hours before launch)

---

### 2. PRODUCTHUNT50 Promo Code Creation
**Status:** ❌ NOT CREATED (MARKETING BLOCKER)
**Priority:** P0 - REQUIRED FOR LAUNCH
**Time Required:** 20-30 minutes

**Promo Details:**
- **Code:** PRODUCTHUNT50
- **Discount:** 50% off first year
- **Original Price:** $49/year
- **Discounted Price:** $24/year
- **Duration:** First payment only (Once)
- **Max Redemptions:** 500
- **Valid:** March 25, 12:01 AM PT → March 27, 11:59 PM PT (48 hours)
- **Applies To:** TaxBridge Pro - Annual

**Action Required:**
1. Access Stripe Dashboard in LIVE MODE (requires Blocker #1 complete)
2. Navigate to Products → Coupons → Create coupon
3. Configure coupon:
   - ID: `PRODUCTHUNT50`
   - Discount: 50% off
   - Duration: Once
   - Max redemptions: 500
   - Expiration: March 27, 2026 11:59 PM PT
4. Apply to "TaxBridge Pro - Annual" product
5. Add metadata:
   - `campaign: product_hunt_launch`
   - `launch_date: 2026-03-25`
6. Test at checkout: verify $49 → $24.50 price reduction

**Deadline:** March 23 EOD

---

### 3. Product Hunt Assets Creation
**Status:** ❌ NOT CREATED (SUBMISSION BLOCKER)
**Priority:** P0 - REQUIRED FOR SUBMISSION
**Time Required:** 4-6 hours

**Required Assets:**

#### A. Logo (240x240px PNG, transparent background)
- Export from design tool or create simple text logo
- Save as: `launch/product-hunt/assets/logo.png`

#### B. Gallery Screenshots (5-8 images, 1920x1080px)
Required shots:
1. **Landing Page** - Hero section showing value prop
2. **Calculator Interface** - Form with sample data filled in
3. **Results Visualization** - Tax breakdown with charts
4. **Multi-Year Dashboard** - Historical data view
5. **Mobile Responsive** - Show mobile experience
6. (Optional) PDF Export Sample
7. (Optional) Testimonial/Social Proof
8. (Optional) Feature Comparison

**Screenshot Process:**
```bash
# Start dev server
npm run dev

# Use macOS screenshot tool: Cmd+Shift+4
# Or use CleanShot X / Snagit for annotations

# Resize to 1920x1080px
# Compress with TinyPNG (<500 KB each)
# Save to: launch/product-hunt/assets/gallery/
```

#### C. Demo Video (60-90 seconds, 1080p, <100 MB)
**Script:**
1. (0-10s) Problem: "Cross-border workers lose thousands to tax inefficiency"
2. (10-20s) Solution: "TaxBridge shows exactly what you owe in US and Canada"
3. (20-40s) Demo: Show calculator → Enter data → View results
4. (40-60s) Features: Multi-year tracking, PDF exports, expert support
5. (60-75s) Call to action: "Try free today, use code PRODUCTHUNT50"
6. (75-90s) End card: Logo + website URL

**Tools:**
- Loom (easiest, auto-uploads)
- QuickTime Screen Recording
- OBS Studio (professional)
- Add captions with Descript or Kapwing

**Save as:** `launch/product-hunt/assets/demo-video.mp4`

**Deadline:** March 24 EOD (6 PM PT)

---

## 📅 EXECUTION TIMELINE (March 19-25)

### Wednesday, March 19 (TODAY)
**Priority:** Set up infrastructure and start asset creation

- [ ] **Deploy this execution plan** (commit and push)
- [ ] **Create hunter research list** (identify 15 potential hunters)
- [ ] **Start logo creation** (1 hour)
- [ ] **Capture 2-3 screenshots** (landing, calculator) (1 hour)
- [ ] **Review and approve $2,000 paid promo budget**

**Deliverables:**
- Execution plan committed
- Hunter outreach list ready
- 30% of assets complete (logo + 2 screenshots)

---

### Thursday, March 20
**Priority:** Complete assets and start outreach

- [ ] **CRITICAL: Activate Stripe production mode** (see Blocker #1)
- [ ] **Complete screenshot gallery** (5-8 images)
- [ ] **Record demo video** (60-90 seconds)
- [ ] **Send hunter outreach** (10-15 personalized DMs)
- [ ] **Start 5-day social media countdown** (Twitter/LinkedIn post #1)

**Deliverables:**
- Stripe LIVE mode activated ✅
- All assets 80% complete
- Hunter outreach sent to 15 people
- Social media countdown started

---

### Friday, March 21
**Priority:** Secure hunter and finalize assets

- [ ] **Create PRODUCTHUNT50 promo code in Stripe** (see Blocker #2)
- [ ] **Test promo code at checkout** ($49 → $24.50)
- [ ] **Finalize all assets** (logo, screenshots, video)
- [ ] **Follow up with hunters** (reply to responses)
- [ ] **Purchase PH Featured Placement** ($500)
- [ ] **Social media countdown** (post #2)
- [ ] **Send influencer outreach** (20 DMs to tax CPAs, H-1B YouTubers)

**Deliverables:**
- PRODUCTHUNT50 code live and tested ✅
- All assets 100% complete ✅
- Hunter follow-ups sent
- PH Featured Placement purchased

---

### Saturday, March 22
**Priority:** Mobilize supporters and prepare paid ads

- [ ] **Confirm hunter commitment** (get written "yes" by EOD)
- [ ] **Compile supporter list** (50 people: friends, beta users, advisors)
- [ ] **Create WhatsApp coordination group** (for launch day)
- [ ] **Design ad creatives** (Twitter, Reddit, LinkedIn)
- [ ] **Write "comment starters"** (make it easy for supporters)
- [ ] **Social media countdown** (post #3)

**Deliverables:**
- Hunter confirmed ✅
- Supporter list compiled (50 people)
- WhatsApp group created
- Ad creatives ready

---

### Sunday, March 23
**Priority:** Final prep and team coordination

- [ ] **Upload assets to Product Hunt** (test submission flow)
- [ ] **Schedule PH submission** for March 25, 12:01 AM PT
- [ ] **Brief supporters** (send instructions + comment starters)
- [ ] **Configure paid ads** (Twitter $1K, Reddit $300, LinkedIn $200)
- [ ] **Create Slack war room** (#taxbridge-launch)
- [ ] **Social media countdown** (post #4)
- [ ] **Test end-to-end checkout** (with PRODUCTHUNT50 code)

**Deliverables:**
- PH submission scheduled ✅
- Supporters briefed
- Paid ads configured
- War room created

---

### Monday, March 24 (DAY BEFORE LAUNCH)
**Priority:** Final checks and team readiness

- [ ] **Final asset review** (logo, screenshots, video) - 10 AM PT
- [ ] **Send email teaser to subscribers** (500+ people) - 6 PM PT
- [ ] **Final social media countdown** (post #5) - 8 PM PT
- [ ] **Set alarms for midnight launch** (12:01 AM PT)
- [ ] **Print response templates** (bookmark for quick access)
- [ ] **Test PH submission one more time**
- [ ] **Get sleep** 😴 (need energy for 24-hour war room)

**Deliverables:**
- Email blast sent ✅
- All systems GO ✅
- Team rested and ready

---

### Tuesday, March 25 (LAUNCH DAY 🚀)

#### Shift 1: Midnight Launch (12:01 AM - 6:00 AM PT)
**Owner:** Founder or designated team member

- [ ] **12:01 AM: Submit product to Product Hunt**
- [ ] **12:02 AM: Post first comment** (founder story)
- [ ] **12:03 AM: Share link in war room**
- [ ] **12:05 AM: Alert WhatsApp supporters**
- [ ] **12:30 AM: Monitor for approval**
- [ ] **1:00 AM - 6:00 AM: Reply to every comment (<10 min SLA)**

#### Shift 2: Morning Blitz (6:00 AM - 12:00 PM PT)
**Owner:** CMO or marketing lead

- [ ] **6:00 AM: Email blast to all subscribers**
- [ ] **6:15 AM: Twitter launch thread** (5-7 tweets)
- [ ] **6:30 AM: LinkedIn founder post**
- [ ] **7:00 AM: Reddit posts** (r/h1b, r/ImmigrationCanada)
- [ ] **7:30 AM: Activate paid ads** (Twitter, Reddit, LinkedIn)
- [ ] **8:00 AM: Hacker News submission** (Show HN)
- [ ] **9:00 AM: Indie Hackers post**
- [ ] **All morning: Reply to every PH comment** (<10 min SLA)

#### Shift 3: Afternoon Engagement (12:00 PM - 6:00 PM PT)
**Owner:** Founder + team

- [ ] **12:00 PM: Mid-day progress tweet** (thank supporters)
- [ ] **2:00 PM: Monitor ranking** (#1 goal check)
- [ ] **3:00 PM: Activate backup supporters** (if needed)
- [ ] **4:00 PM: Influencer outreach check-ins**
- [ ] **All afternoon: Maintain comment reply velocity**

#### Shift 4: Evening Push (6:00 PM - 11:59 PM PT)
**Owner:** Founder + team

- [ ] **6:00 PM: "Last 6 hours!" reminder tweet**
- [ ] **8:00 PM: Thank top commenters** (personal DMs)
- [ ] **10:00 PM: Final push** (ping supporters one more time)
- [ ] **11:00 PM: Screenshot metrics** (upvotes, comments, rank)
- [ ] **11:30 PM: Draft "We did it!" recap post**
- [ ] **11:59 PM: Capture final ranking**

---

### Wednesday, March 26 (DAY AFTER)
**Priority:** Capitalize on momentum

- [ ] **9:00 AM: Post results on Twitter/LinkedIn** (with screenshots)
- [ ] **10:00 AM: Send thank-you email to supporters**
- [ ] **11:00 AM: Add Product Hunt badge to website**
- [ ] **2:00 PM: Press outreach** (TechCrunch, immigration blogs)
- [ ] **4:00 PM: Analytics review** (conversion rates, drop-offs)
- [ ] **6:00 PM: Implement quick-win feedback** (top feature requests)

---

## 🎯 WAR ROOM MONITORING (Launch Day)

### Real-Time Metrics Dashboard
Track every 30 minutes:

| Time | Upvotes | Comments | Rank | Traffic | Trials | Revenue |
|------|---------|----------|------|---------|--------|---------|
| 1:00 AM | | | | | | |
| 2:00 AM | | | | | | |
| 3:00 AM | | | | | | |
| 6:00 AM | | | | | | |
| 9:00 AM | | | | | | |
| 12:00 PM | | | | | | |
| 3:00 PM | | | | | | |
| 6:00 PM | | | | | | |
| 9:00 PM | | | | | | |
| 11:59 PM | | | | | | |

### Response Time SLA
- **VIP Comments:** <5 minutes
- **Questions:** <10 minutes
- **Feature Requests:** <15 minutes
- **Criticism:** <15 minutes (diplomatic)

### Success Milestones
- [ ] 50 upvotes (first hour)
- [ ] 100 upvotes (6 hours)
- [ ] 200 upvotes (12 hours)
- [ ] 400 upvotes (18 hours)
- [ ] 500+ upvotes (24 hours)
- [ ] Top 3 ranking by 6 PM PT

---

## 💰 PAID PROMOTION BUDGET

**Total Approved:** $2,000

**Allocation:**
- **$1,000:** Twitter Ads (H-1B, TN visa, cross-border tax keywords)
- **$500:** Product Hunt Featured Placement (homepage top slot)
- **$300:** Reddit Promoted Posts (r/h1b, r/ImmigrationCanada)
- **$200:** LinkedIn Sponsored Content (immigration professionals)

**Expected ROI:**
- 10K+ clicks @ $0.20 avg CPC
- 500+ trial signups (5% conversion)
- 50+ paying customers (10% trial-to-paid)
- $2,450+ revenue (50 × $49) → positive ROI Day 1

---

## 🚨 CRISIS PROTOCOLS

### If Falling Behind in Rankings
1. Activate backup supporter list (20 more people)
2. Increase paid ad spend (+$500)
3. DM top 10 Product Hunt influencers
4. Post in more Reddit communities

### If Hunter Cancels Last-Minute
1. Self-hunt with team account
2. Notify supporters of backup plan
3. Execute normal launch protocol
4. Expect 20-30% lower upvotes (still winnable)

### If Assets Aren't Ready
1. Launch with minimal assets (logo + 3 screenshots)
2. Add video and remaining screenshots within 6 hours
3. Update submission (PH allows edits on launch day)

### If Stripe Production Not Active
1. **DO NOT LAUNCH** - revenue blocker is non-negotiable
2. Delay launch to April 1
3. Send apology email to supporters
4. Use extra time to create exceptional assets

---

## ✅ PRE-LAUNCH CHECKLIST (March 24, 11 PM PT)

**Product:**
- [ ] Stripe live mode activated and tested
- [ ] PRODUCTHUNT50 code created and tested
- [ ] Production site stable (zero 500 errors)
- [ ] Calculator accuracy verified
- [ ] Mobile responsive confirmed

**Assets:**
- [ ] Logo uploaded (240x240px)
- [ ] Gallery screenshots uploaded (5-8 images)
- [ ] Demo video uploaded (60-90 sec, <100 MB)
- [ ] First comment pre-written (ready to paste)
- [ ] Tagline finalized (<60 characters)
- [ ] Description finalized (260 characters)

**Team:**
- [ ] Hunter confirmed and briefed
- [ ] Supporter list compiled (50 people)
- [ ] WhatsApp group created
- [ ] War room Slack channel created
- [ ] Shifts assigned (midnight, morning, afternoon, evening)

**Marketing:**
- [ ] Email blast scheduled (6 AM PT)
- [ ] Paid ads configured (ready to activate)
- [ ] Social media posts queued
- [ ] Response templates bookmarked

**Final:**
- [ ] Alarm set for 12:01 AM PT
- [ ] Phone charged
- [ ] Coffee ready ☕
- [ ] Energy high 🚀

---

## 📊 SUCCESS CRITERIA

### Must-Have (Launch Considered Successful)
- ✅ #1, #2, or #3 Product of the Day
- ✅ 500+ upvotes
- ✅ 100+ comments
- ✅ 50+ new paying customers
- ✅ $2,450+ revenue (Day 1)

### Nice-to-Have (Exceptional Performance)
- Top 5 Product of the Week
- Featured in PH newsletter (500K subscribers)
- Press coverage (TechCrunch, immigration blogs)
- 1,000+ upvotes
- 100+ paying customers
- $4,900+ revenue (Day 1)

---

## 🔗 RESOURCES

**Launch Materials:**
- All docs in `/launch/product-hunt/`
- Quick reference: `README.md`
- Detailed checklist: `LAUNCH_CHECKLIST.md`
- War room protocol: `WAR_ROOM.md`
- CMO responsibilities: `CMO_BRIEF.md`

**External Resources:**
- [Product Hunt Launch Guide](https://www.producthunt.com/stories/how-to-launch-on-product-hunt-7-tips-from-the-community)
- [PH Maker Community](https://www.producthunt.com/makers)

**Emergency Contacts:**
- Founder: [Add phone number]
- CMO: [Add phone number]
- Hunter: [Add phone number]

---

## 🎯 NEXT IMMEDIATE ACTIONS

**Today (March 19):**
1. Review this execution plan
2. Approve $2,000 paid promo budget
3. Start logo creation (1 hour)
4. Capture first 2-3 screenshots (1 hour)
5. Research and identify 15 potential hunters

**Tomorrow (March 20):**
1. **CRITICAL: Activate Stripe production mode** (30-60 min)
2. Complete screenshot gallery (3 hours)
3. Record demo video (2 hours)
4. Send hunter outreach (15 DMs)
5. Start social media countdown

---

**STATUS:** Ready to execute. Awaiting manual completion of 3 critical blockers (Stripe production, PRODUCTHUNT50 code, assets). Timeline is aggressive but achievable with daily progress.

**RECOMMENDATION:** Begin asset creation TODAY (March 19) to stay on track for March 25 launch. Stripe activation must be complete by March 22 EOD.

---

**Prepared by:** Engineering Team
**Date:** March 19, 2026
**Next Review:** March 20, 2026 (daily standups until launch)
