# SPRINT 18 - TASKS SUMMARY

**Project:** TaxBridge Cross-Border Tax Calculator
**Sprint Goal:** Fix production environment blockers + activate revenue
**Timeline:** March 19-26, 2026 (7 days)
**Overall Grade:** D (62/100) - NOT PRODUCTION-READY

---

## EXECUTIVE SUMMARY

🔴 **CRITICAL FINDING:** Production is 100% non-functional for real users
- All environment variables are placeholders
- Revenue IMPOSSIBLE (Stripe test mode)
- Authentication BROKEN (Clerk placeholder keys)
- Analytics DISABLED (PostHog placeholder)
- Error monitoring OFF (Sentry placeholder)

**Impact:** $0 MRR for 8+ sprints despite claiming "ready for launch"

**Good News:**
- ✅ Build quality excellent (137MB, 0 console.logs, 4 low vulnerabilities)
- ✅ Free tier increased to 10 RSU entries
- ✅ Product Hunt assets ready
- ✅ Production site accessible (taxbridge.vercel.app HTTP 200)

**Action Required:** Replace 6 placeholder env vars → test revenue flow → launch Product Hunt

---

## P0-CRITICAL (MUST FIX THIS WEEK)

### 1. [P0-CRITICAL] Replace Stripe Production Keys - REVENUE BLOCKER (8th Sprint)
**Priority:** CRITICAL
**Deadline:** March 20, 2026 EOD
**Estimate:** 2 hours
**Blocker:** Cannot accept payments, $0 revenue capability

**Current State:**
```bash
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE
STRIPE_BASIC_PRICE_ID=price_YOUR_LIVE_BASIC_PRICE_ID
STRIPE_PRO_PRICE_ID=price_YOUR_LIVE_PRO_PRICE_ID
```

**Action:**
1. Create Stripe production account
2. Run `scripts/activate-stripe-production-annual.ts`
3. Update Vercel env vars
4. Test checkout with real card + immediate refund
5. Verify webhook delivery

**Evidence Required:**
- Stripe dashboard screenshot showing LIVE mode
- Test transaction ID (e.g., `pi_abc123`)
- Webhook event log screenshot

**Tags:** revenue, blocker, stripe, p0

---

### 2. [P0-CRITICAL] Replace Clerk Production Keys - Site Returns 500 Errors
**Priority:** CRITICAL
**Deadline:** March 20, 2026 EOD
**Estimate:** 30 minutes
**Blocker:** Sign up/login BROKEN for all users

**Current State:**
```bash
CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET=whsec_YOUR_CLERK_WEBHOOK_SECRET
```

**Action:**
1. Login to Clerk dashboard
2. Get production keys
3. Update Vercel env vars
4. Test sign up flow

**Evidence Required:**
- Clerk dashboard screenshot
- Sign up flow test recording

**Tags:** authentication, blocker, clerk, p0

---

### 3. [P0-CRITICAL] Replace PostHog Production Key - No Funnel Tracking
**Priority:** CRITICAL
**Deadline:** March 20, 2026 EOD
**Estimate:** 15 minutes
**Blocker:** ZERO analytics, cannot optimize conversion

**Current State:**
```bash
POSTHOG_PROJECT_ID=YOUR_PROJECT_ID
```

**Action:**
1. Login to PostHog
2. Get project ID
3. Update Vercel env vars
4. Verify events flowing

**Evidence Required:**
- PostHog dashboard screenshot showing events

**Tags:** analytics, blocker, posthog, p0

---

### 4. [P0-CRITICAL] Replace Sentry Auth Token - No Error Monitoring
**Priority:** CRITICAL
**Deadline:** March 20, 2026 EOD
**Estimate:** 15 minutes
**Blocker:** Production crashes invisible

**Current State:**
```bash
SENTRY_AUTH_TOKEN=YOUR_SENTRY_AUTH_TOKEN
```

**Action:**
1. Login to Sentry
2. Create auth token
3. Update Vercel env vars
4. Trigger test error to verify

**Evidence Required:**
- Sentry dashboard screenshot showing error captured

**Tags:** monitoring, blocker, sentry, p0

---

### 5. [P0-CRITICAL] Execute End-to-End Revenue Smoke Test
**Priority:** CRITICAL
**Deadline:** March 20, 2026 EOD (AFTER tasks 1-4)
**Estimate:** 30 minutes
**Blocker:** Payment flow unverified

**Test Steps:**
1. Open https://taxbridge.vercel.app in incognito
2. Complete calculator with real RSU data
3. Sign up (verify Clerk works)
4. Click "Upgrade to Pro"
5. Complete Stripe checkout with REAL credit card
6. Capture $1 payment (then refund immediately)
7. Verify: Stripe webhook fires, DB updates subscription_tier to 'pro'
8. Verify: Can now add 11+ RSU entries (free tier bypassed)
9. Check Sentry dashboard for any errors

**Evidence Required:**
- Screen recording of full flow
- Stripe transaction ID
- Database query: `SELECT subscription_tier FROM user_profiles WHERE id='...'` showing 'pro'
- PostHog event: `upgrade_completed`

**Tags:** revenue, testing, end-to-end, p0

---

## P1-HIGH (NEXT 3-5 DAYS)

### 6. [P1-HIGH] Product Hunt Launch Execution - ACTUALLY Submit (8+ Sprints "Ready")
**Priority:** HIGH
**Deadline:** March 25, 2026 (Tuesday 12:01am PT)
**Estimate:** 2 hours coordination
**Blocker:** WAIT for P0 completion (cannot launch broken product)

**Current Status:**
- ✅ Screenshots captured
- ✅ Launch guide written
- ✅ Response templates ready
- ❌ Launch NOT scheduled
- ❌ Hunter not identified

**Action:**
1. WAIT for tasks 1-5 completion (revenue verified)
2. Schedule launch for Tuesday 12:01am PT
3. Recruit hunter (>1000 followers)
4. Activate PostHog tracking
5. Prepare day-of support

**Evidence Required:**
- Product Hunt submission confirmation
- Launch scheduler screenshot
- Hunter confirmation

**Tags:** launch, product-hunt, marketing, p1

---

### 7. [P1-HIGH] SEO Verification - Confirm 42 Blog Articles Indexed
**Priority:** HIGH
**Deadline:** March 22, 2026
**Estimate:** 15 minutes verification + 7-14 days Google crawl
**Blocker:** Organic traffic uncertain

**Action:**
1. Verify sitemap live: https://taxbridge.vercel.app/sitemap.xml
2. Check Google Search Console indexing status
3. Submit sitemap to GSC if needed
4. Track "Impressions" metric

**Evidence Required:**
- GSC screenshot showing indexed pages count
- Sitemap XML inspection

**Tags:** seo, organic-traffic, verification, p1

---

### 8. [P1-HIGH] Pricing Strategy Revision - Test $49 vs $29 vs $79/year
**Priority:** HIGH
**Deadline:** March 23, 2026 (setup) + 14 days data
**Estimate:** 2 hours setup
**Impact:** Competitor research shows $29/year market rate

**Current Pricing:**
- Basic: $49/year
- Pro: $79/year

**Competitor Pricing:**
- SimpleTax: $15/year
- Sprintax: $29/year
- TurboTax: $49/year

**Recommendation:** Test 3 variants (33/33/33 traffic split)
- Variant A: $49/year (current)
- Variant B: $29/year (competitor match)
- Variant C: $79/year (current pro)

**Expected Impact:**
- Conversion rate: 2% → 5% (2.5x increase at $29)
- Revenue: -37% per customer BUT +156% total revenue

**Evidence Required:**
- PostHog experiment screenshot
- 14-day conversion data

**Tags:** pricing, conversion, ab-test, p1

---

## P2-MEDIUM (LATER THIS SPRINT)

### 9. [P2-MEDIUM] Landing Page A/B Test Deployment
**Priority:** MEDIUM
**Deadline:** March 24, 2026
**Estimate:** 1 hour deployment + 14 days data

**Current Status:**
- ✅ 3 variants built (pain point, social proof, urgency)
- ❌ NOT deployed to production
- ❌ NOT connected to analytics

**Action:**
1. Deploy variants to Vercel
2. Configure PostHog feature flags
3. Set 33/33/33 traffic split
4. Track "calculator_completed" event
5. Run 14-day test

**Tags:** landing-page, ab-test, conversion, p2

---

### 10. [P2-MEDIUM] Checkout Page UX Improvements
**Priority:** MEDIUM
**Deadline:** March 26, 2026
**Estimate:** 4 hours

**Improvements:**
1. Add progress indicator (Step 1/3)
2. Inline validation errors
3. Trust badges (Stripe, SSL)
4. Simplify payment form
5. Exit-intent popup

**Expected Impact:** +10-20% checkout conversion

**Tags:** checkout, ux, conversion, p2

---

### 11. [P2-MEDIUM] Free Tier Upgrade Prompts
**Priority:** MEDIUM
**Deadline:** March 26, 2026
**Estimate:** 3 hours

**Current Issue:** Free users hit 10 RSU limit but no clear upgrade CTA

**Improvements:**
1. Upgrade modal on 10th RSU entry
2. Warning at 8 RSUs: "2 more entries, then upgrade required"
3. Email automation: "You're at 8/10 RSUs"
4. Dashboard banner: "Upgrade to Pro"

**Expected Impact:** +25% free → paid conversion

**Tags:** conversion, free-tier, upgrade-prompts, p2

---

## P3-LOW (NEXT SPRINT)

### 12. [P3-LOW] Cross-Browser Testing
**Priority:** LOW
**Deadline:** March 28, 2026
**Estimate:** 2 hours testing + 2-4 hours fixes

**Browsers:**
- Safari (Mac + iOS) - 30% H1B workers
- Firefox - 5% market share
- Edge - 10% corporate users
- Chrome Android - 25% mobile

**Tags:** qa, cross-browser, testing, p3

---

### 13. [P3-LOW] Accessibility Audit (WCAG 2.1 AA)
**Priority:** LOW
**Deadline:** March 30, 2026
**Estimate:** 4 hours

**Issues:**
- 162 missing ARIA labels
- Color contrast violations
- No keyboard navigation for modals
- Screen reader cannot navigate calculator

**Tags:** accessibility, wcag, a11y, p3

---

## TASK TIMELINE

### Day 1-2 (March 19-20): P0 BLOCKERS
- Replace Stripe production keys (2 hours)
- Replace Clerk production keys (30 min)
- Replace PostHog production key (15 min)
- Replace Sentry auth token (15 min)
- Execute end-to-end revenue smoke test (30 min)

**Gate:** $1 revenue captured in Stripe dashboard

---

### Day 3-5 (March 21-23): P1 REVENUE ACTIVATION
- Product Hunt launch execution (2 hours)
- SEO verification (15 min)
- Pricing strategy A/B test setup (2 hours)

**Gate:** Product Hunt live + first organic customer

---

### Day 6-7 (March 24-26): P2 OPTIMIZATION
- Landing page A/B test deployment (1 hour)
- Checkout UX improvements (4 hours)
- Free tier upgrade prompts (3 hours)

**Gate:** Conversion rate improving

---

### Week 2 (March 27-30): P3 QUALITY
- Cross-browser testing (2-4 hours)
- Accessibility audit (4 hours)

**Gate:** Production quality excellent

---

## SUCCESS CRITERIA

### Sprint Success (Week 1)
- ✅ $1+ revenue captured (first dollar)
- ✅ Signup flow works (Clerk production)
- ✅ Analytics tracking (PostHog events)
- ✅ Error monitoring (Sentry active)
- ✅ Product Hunt launched

### Month 1 Success
- 🎯 $500-1,000 MRR
- 🎯 10-20 paying customers
- 🎯 2-4% conversion rate
- 🎯 100+ daily visitors from SEO

---

## GRADING

**Current:** D (62/100) - NOT PRODUCTION-READY
**After P0:** B+ (85/100) - PRODUCTION-READY
**After P1:** A- (92/100) - REVENUE-READY
**After P2/P3:** A (95/100) - OPTIMIZED

---

## RECOMMENDATIONS

### IMMEDIATE (Today)
1. STOP all new feature work
2. CREATE Stripe production account
3. REPLACE all placeholder env vars
4. TEST revenue flow end-to-end
5. SCHEDULE Product Hunt launch

### LEADERSHIP DECISION
**Question:** Product Hunt launch timing
- Option A (RECOMMENDED): Wait 2-3 days for revenue verification
- Option B (RISKY): Launch immediately, fix payments live

**My Recommendation:** Option A - Don't launch broken product

---

**Sprint 18 Status:** 📋 PLANNED
**Tasks Created:** 13 tasks (5 P0, 3 P1, 3 P2, 2 P3)
**Next Review:** March 22, 2026 (after P0 completion)

---

**"Don't launch a broken product. Fix P0 blockers first, THEN launch."**
