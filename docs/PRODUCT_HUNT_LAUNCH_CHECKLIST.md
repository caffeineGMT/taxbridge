# Product Hunt Launch - Blocker Resolution Checklist

**Date Created:** March 19, 2026
**Target Launch Date:** TBD (after all P0s resolved)
**Estimated Time:** 10-14 hours

---

## Phase 1: Deploy Correct Application (CRITICAL)

**Duration:** 2-4 hours
**Status:** ⏳ PENDING

- [ ] **Investigate deployment issue**
  - [ ] Check Vercel deployment logs
  - [ ] Verify local codebase has correct application
  - [ ] Check git branch being deployed
  - [ ] Check Vercel project settings (repo, branch, build command)
  - **Time:** 1 hour

- [ ] **Deploy correct US-Canada RSU tax calculator**
  - [ ] Verify correct Next.js application in local codebase
  - [ ] Build locally: `npm run build`
  - [ ] Commit and push to GitHub
  - [ ] Wait for Vercel deployment
  - **Time:** 1 hour

- [ ] **Verify deployment successful**
  - [ ] Visit https://taxbridge.vercel.app - shows correct app
  - [ ] Title: "TaxBridge - US-Canada RSU Tax Calculator" (not Nigerian e-invoicing)
  - [ ] Description: H-1B/TN visa workers with RSUs (not Nigerian SMEs)
  - [ ] GET /us-canada-tax-calculator → HTTP 200
  - [ ] GET /pricing → HTTP 200
  - [ ] GET /sign-up → HTTP 200
  - **Time:** 30 min

---

## Phase 2: Activate Production Keys

**Duration:** 3-4 hours (can run in parallel)
**Status:** ⏳ PENDING

### 2.1: Stripe Production (P0-CRITICAL)

**Time:** 2 hours
**Status:** ⏳ PENDING

- [ ] **Get LIVE Stripe keys**
  - [ ] Login to https://dashboard.stripe.com
  - [ ] Toggle to "Production" mode (NOT test)
  - [ ] Copy publishable key: pk_live_...
  - [ ] Copy secret key: sk_live_...
  - **Time:** 15 min

- [ ] **Create LIVE price IDs**
  - [ ] Set STRIPE_SECRET_KEY env var: `export STRIPE_SECRET_KEY=sk_live_YOUR_KEY`
  - [ ] Run: `npx tsx scripts/activate-stripe-production-annual.ts`
  - [ ] Copy Basic price ID: price_...
  - [ ] Copy Pro price ID: price_...
  - **Time:** 30 min

- [ ] **Create webhook**
  - [ ] Go to https://dashboard.stripe.com/webhooks
  - [ ] Add endpoint: https://taxbridge.vercel.app/api/stripe/webhook
  - [ ] Select events: checkout.session.completed, customer.subscription.*
  - [ ] Copy webhook secret: whsec_...
  - **Time:** 15 min

- [ ] **Update Vercel environment variables**
  - [ ] Go to https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
  - [ ] Set STRIPE_SECRET_KEY (production scope)
  - [ ] Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (production scope)
  - [ ] Set STRIPE_WEBHOOK_SECRET (production scope)
  - [ ] Set STRIPE_BASIC_PRICE_ID (production scope)
  - [ ] Set NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID (production scope)
  - [ ] Set STRIPE_PRO_PRICE_ID (production scope)
  - [ ] Set NEXT_PUBLIC_STRIPE_PRO_PRICE_ID (production scope)
  - [ ] Redeploy: `git commit --allow-empty -m "Trigger redeploy" && git push`
  - **Time:** 30 min

- [ ] **Test payment flow**
  - [ ] Visit https://taxbridge.vercel.app/pricing
  - [ ] Click "Subscribe" on Pro plan
  - [ ] Enter test card: 4242 4242 4242 4242, exp: 12/34, CVC: 123
  - [ ] Complete payment
  - [ ] Verify success in Stripe dashboard
  - [ ] REFUND the test payment immediately
  - **Time:** 30 min

### 2.2: Clerk Production (P0-CRITICAL)

**Time:** 30 minutes
**Status:** ⏳ PENDING

- [ ] **Get LIVE Clerk keys**
  - [ ] Login to https://dashboard.clerk.com
  - [ ] Go to API Keys → Production
  - [ ] Copy publishable key: pk_live_...
  - [ ] Copy secret key: sk_live_...
  - **Time:** 10 min

- [ ] **Update Vercel environment variables**
  - [ ] Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (production)
  - [ ] Set CLERK_SECRET_KEY (production)
  - [ ] Redeploy
  - **Time:** 10 min

- [ ] **Test signup flow**
  - [ ] Visit https://taxbridge.vercel.app/sign-up
  - [ ] Verify Clerk widget loads
  - [ ] Create test account
  - [ ] Verify successful signup
  - **Time:** 10 min

### 2.3: PostHog Analytics (P0-CRITICAL)

**Time:** 30 minutes
**Status:** ⏳ PENDING

- [ ] **Get PostHog keys**
  - [ ] Login to https://app.posthog.com
  - [ ] Go to Settings → Project API Key
  - [ ] Copy API key: phc_...
  - [ ] Copy project ID: numeric_id
  - **Time:** 10 min

- [ ] **Update Vercel environment variables**
  - [ ] Set NEXT_PUBLIC_POSTHOG_KEY (production)
  - [ ] Set POSTHOG_PROJECT_ID (production)
  - [ ] Redeploy
  - **Time:** 10 min

- [ ] **Verify tracking**
  - [ ] Run: `npm run verify:posthog`
  - [ ] Visit https://taxbridge.vercel.app/us-canada-tax-calculator
  - [ ] Check PostHog dashboard for live events (<30 sec)
  - [ ] Screenshot PostHog dashboard
  - **Time:** 10 min

### 2.4: Sentry Monitoring (P0-CRITICAL)

**Time:** 15 minutes
**Status:** ⏳ PENDING

- [ ] **Get Sentry keys**
  - [ ] Login to https://sentry.io
  - [ ] Get DSN: https://YOUR_KEY@o0000000.ingest.sentry.io/0000000
  - [ ] Get auth token from Settings → Auth Tokens
  - **Time:** 5 min

- [ ] **Update Vercel environment variables**
  - [ ] Set NEXT_PUBLIC_SENTRY_DSN (production)
  - [ ] Set SENTRY_AUTH_TOKEN (production)
  - [ ] Redeploy
  - **Time:** 5 min

- [ ] **Verify error capture**
  - [ ] Visit production site
  - [ ] Check Sentry dashboard for events
  - **Time:** 5 min

---

## Phase 3: Product Hunt Assets

**Duration:** 3-4 hours
**Status:** ⏳ PENDING

### 3.1: Demo Video

**Time:** 2 hours
**Status:** ⏳ PENDING

- [ ] **Script demo (15 min)**
  - [ ] 0-10s: Problem statement (H-1B/TN workers overpay taxes)
  - [ ] 10-20s: Calculator demo (enter RSU details)
  - [ ] 20-40s: Results walkthrough (tax breakdown, FTC savings)
  - [ ] 40-50s: Pricing/call to action
  - [ ] 50-60s: Closing (HUNT20 promo code)

- [ ] **Record demo (1 hour)**
  - [ ] Use Loom, ScreenFlow, or OBS Studio
  - [ ] Record 1080p, 60fps
  - [ ] Show calculator in action
  - [ ] Highlight key features

- [ ] **Edit and upload (45 min)**
  - [ ] Edit to 60 seconds max
  - [ ] Add captions/text overlays
  - [ ] Upload to YouTube (unlisted) or Vimeo
  - [ ] Get embed URL

### 3.2: Screenshots

**Time:** 30 minutes
**Status:** ⏳ PENDING

- [ ] **Capture production screenshots**
  - [ ] Homepage (full page screenshot)
  - [ ] Calculator initial state
  - [ ] Calculator with results
  - [ ] Pricing page
  - [ ] Dashboard (if applicable)
  - [ ] Minimum 5 screenshots, 1920x1080 or higher
  - [ ] Save to docs/screenshots/product-hunt-launch/

### 3.3: HUNT20 Promo Code

**Time:** 30 minutes
**Status:** ⏳ PENDING

- [ ] **Create Stripe promo code**
  - [ ] Login to Stripe dashboard
  - [ ] Go to Products → Coupons
  - [ ] Create coupon: 20% off, code "HUNT20"
  - [ ] Apply to Basic and Pro plans
  - [ ] Set expiration: 7 days from launch

- [ ] **Test promo code**
  - [ ] Visit pricing page
  - [ ] Enter HUNT20 at checkout
  - [ ] Verify 20% discount applied

### 3.4: Product Hunt Description

**Time:** 1 hour
**Status:** ⏳ PENDING

- [ ] **Write description (100-300 words)**
  - [ ] Problem: H-1B/TN workers with RSUs face complex cross-border tax
  - [ ] Solution: TaxBridge calculates US/Canada taxes, FTC optimization
  - [ ] Value: Save $5K-$20K/year in overpaid taxes
  - [ ] CTA: Try free calculator, use HUNT20 for 20% off
  - **Time:** 45 min

- [ ] **Prepare launch details**
  - [ ] Tagline (60 chars max)
  - [ ] Topics/tags (5-10 relevant tags)
  - [ ] First comment (expand on problem/solution)
  - **Time:** 15 min

---

## Phase 4: Final Verification

**Duration:** 2 hours
**Status:** ⏳ PENDING

- [ ] **Full smoke test**
  - [ ] Run: `npx tsx scripts/production-smoke-test.ts`
  - [ ] Result: 6/6 tests passing (100%)
  - [ ] Screenshot results
  - **Time:** 30 min

- [ ] **Real payment test**
  - [ ] Complete full payment flow with real card
  - [ ] Verify payment in Stripe dashboard
  - [ ] Refund immediately
  - **Time:** 30 min

- [ ] **Signup flow end-to-end**
  - [ ] Sign up new account
  - [ ] Verify email confirmation works
  - [ ] Complete onboarding
  - [ ] Test calculator as logged-in user
  - **Time:** 30 min

- [ ] **Analytics verification**
  - [ ] Check PostHog dashboard for events
  - [ ] Verify funnel tracking working
  - [ ] Screenshot analytics
  - **Time:** 15 min

- [ ] **Error monitoring verification**
  - [ ] Check Sentry dashboard
  - [ ] Trigger test error
  - [ ] Verify error captured
  - **Time:** 15 min

---

## Phase 5: Schedule Product Hunt Launch

**Duration:** 1 hour
**Status:** ⏳ PENDING

- [ ] **Submit to Product Hunt**
  - [ ] Go to https://www.producthunt.com/posts/new
  - [ ] Name: TaxBridge
  - [ ] Tagline: (from Phase 3.4)
  - [ ] Description: (from Phase 3.4)
  - [ ] Demo video: (embed URL from Phase 3.1)
  - [ ] Screenshots: (upload 5+ from Phase 3.2)
  - [ ] Topics/tags: (from Phase 3.4)
  - [ ] Launch date: **Tuesday 12:01am PT**
  - **Time:** 30 min

- [ ] **Prepare monitoring plan**
  - [ ] Set up hourly monitoring schedule
  - [ ] Prepare response templates for comments
  - [ ] Create tracking spreadsheet for metrics
  - **Time:** 30 min

---

## Launch Day Monitoring

**Day of Launch:**
- [ ] **Hour 1-6:** Check every hour
  - [ ] PostHog: signups, calculator completions, payments
  - [ ] Sentry: any critical errors
  - [ ] Product Hunt: respond to comments within 30 min

- [ ] **Hour 6-24:** Check every 2 hours
  - [ ] Monitor metrics
  - [ ] Respond to questions
  - [ ] Share on social media

---

## Success Metrics (Day 1)

**Minimum:**
- 50+ upvotes on Product Hunt
- 10+ signups
- 1+ paid conversion
- 0 critical errors in Sentry

**Target:**
- 100+ upvotes
- 50+ signups
- 5+ paid conversions
- Top 5 product of the day

**Stretch:**
- 200+ upvotes
- 100+ signups
- 10+ paid conversions
- #1 product of the day

---

**Last Updated:** March 19, 2026
**Status:** All phases pending - Start with Phase 1
**Next Action:** Investigate deployment issue (wrong app deployed)
