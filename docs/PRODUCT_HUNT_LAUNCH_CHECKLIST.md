# Product Hunt Launch - Pre-Flight Checklist

**Use this checklist to verify launch readiness. ALL items must be ✅ before submitting to Product Hunt.**

---

## ⚠️ LAUNCH STATUS: BLOCKED

**Current Status**: ❌ Cannot launch - P0 blockers active
**Blockers**: 4 critical infrastructure items (Stripe, Clerk, PostHog, Sentry)
**Time to Resolve**: 4.25 hours
**Earliest Launch**: March 22, 2026

---

## Phase 1: Infrastructure (CRITICAL - DO NOT SKIP)

### 1. Stripe Production Mode ⏱️ 2 hours
**Status**: ❌ BLOCKING LAUNCH
**Impact**: Cannot process payments → $0 revenue → negative reviews

**Checklist**:
- [ ] Login to https://dashboard.stripe.com
- [ ] Switch to "Production" mode (NOT test)
- [ ] Copy live keys: `sk_live_...` and `pk_live_...`
- [ ] Run activation script with real keys
- [ ] Create webhook for production
- [ ] Update all 9 Vercel environment variables
- [ ] Test payment with 4242 4242 4242 4242
- [ ] Screenshot: Successful payment
- [ ] Screenshot: Payment in Stripe dashboard
- [ ] Refund test payment
- [ ] Evidence saved to: `docs/screenshots/stripe-production/`

---

### 2. Clerk Authentication ⏱️ 30 min
**Status**: ❌ BLOCKING LAUNCH
**Impact**: Users cannot sign up → zero conversions

**Checklist**:
- [ ] Login to https://dashboard.clerk.com
- [ ] Get production keys (pk_live, sk_live)
- [ ] Create production webhook
- [ ] Update 3 Vercel environment variables
- [ ] Test: Sign up as new user
- [ ] Screenshot: Successful signup
- [ ] Evidence saved to: `docs/screenshots/clerk-production/`

---

### 3. PostHog Analytics ⏱️ 30 min
**Status**: ❌ BLOCKING LAUNCH
**Impact**: No tracking → cannot measure Product Hunt ROI

**Checklist**:
- [ ] Login to https://app.posthog.com
- [ ] Get project API key (phc_...)
- [ ] Update 3 Vercel environment variables
- [ ] Run verification script
- [ ] Test: Complete calculator flow
- [ ] Screenshot: Live events in PostHog dashboard
- [ ] Evidence saved to: `docs/screenshots/posthog-live/`

---

### 4. Sentry Error Monitoring ⏱️ 15 min
**Status**: ❌ BLOCKING LAUNCH
**Impact**: Production errors invisible

**Checklist**:
- [ ] Login to https://sentry.io
- [ ] Create auth token
- [ ] Get project DSN
- [ ] Update 4 Vercel environment variables
- [ ] Trigger test error
- [ ] Screenshot: Error in Sentry dashboard
- [ ] Evidence saved to: `docs/screenshots/sentry-production/`

---

## Phase 2: Verification (REQUIRED)

### 5. End-to-End Revenue Test ⏱️ 1 hour
**Status**: ⏳ PENDING (blocked by Phase 1)
**Impact**: Final validation before launch

**Checklist**:
- [ ] Complete full user journey in incognito
- [ ] Screenshot: Each step (8 minimum)
- [ ] Verify: Payment successful
- [ ] Verify: PostHog tracked events
- [ ] Verify: Stripe received payment
- [ ] Refund test payment
- [ ] Evidence saved to: `docs/screenshots/e2e-test/`

---

### 6. Cross-Browser Quick Check ⏱️ 30 min
**Status**: ⏳ OPTIONAL (recommended)

**Checklist**:
- [ ] Chrome desktop
- [ ] Safari desktop
- [ ] Chrome mobile
- [ ] Safari iOS
- [ ] Screenshots saved

---

### 7. Performance Audit ⏱️ 30 min
**Status**: ⏳ OPTIONAL (recommended)

**Checklist**:
- [ ] Build passes (0 errors)
- [ ] Build size < 150MB
- [ ] Lighthouse: Performance >85
- [ ] Lighthouse: Accessibility >90
- [ ] Lighthouse: SEO >95
- [ ] Screenshot saved

---

## Phase 3: Product Hunt Submission

### 8. Pre-Launch Assets ⏱️ 2 hours
**Status**: ✅ READY (assets exist from previous sprints)

**Available**:
- ✅ Product name: TaxBridge
- ✅ Tagline: "US-Canada cross-border tax calculator for H-1B/TN workers with RSUs"
- ✅ Screenshots: 45+ from cross-browser testing
- ✅ Logo: Available
- ✅ Description: Landing page copy
- ⏳ Video: Optional (can add later)

---

### 9. Launch Day (12:01am PT) ⏱️ 8 hours
**Status**: ⏳ BLOCKED (waiting for Phase 1-2)

**Checklist**:
- [ ] Submit at exactly 12:01am PT
- [ ] Post first comment within 5 min
- [ ] Share on Twitter
- [ ] Email beta users
- [ ] Monitor comments every 30 min
- [ ] Respond to ALL comments <1 hour
- [ ] Track ranking hourly
- [ ] Screenshots at launch + end of day

---

## Timeline to Launch

### Fast Path (48 hours from start)

**Day 0 (Start Now)**: Infrastructure Setup
- Hours 0-2: Stripe production
- Hours 2-2.5: Clerk setup
- Hours 2.5-3: PostHog setup
- Hours 3-3.25: Sentry setup
- Hours 3.25-4.25: Update Vercel, redeploy

**Day 1 (Tomorrow)**: Verification
- Hours 0-1: End-to-end revenue test
- Hours 1-1.5: Cross-browser check
- Hours 1.5-2: Performance audit
- Hours 2-4: Final QA + screenshot collection

**Day 2 (March 22)**: LAUNCH
- 12:01am PT: Submit to Product Hunt
- 12:05am PT: First comment
- Hours 1-12: Active monitoring
- Target: Top 5 Product of the Day

---

## Go/No-Go Decision Matrix

### ✅ LAUNCH if ALL true:
1. Stripe processes real payments
2. Users can sign up via Clerk
3. PostHog tracks conversion events
4. Sentry captures errors
5. End-to-end test passed with evidence
6. All screenshots collected

### ❌ DO NOT LAUNCH if ANY true:
1. Stripe still in test mode
2. Signup flow broken
3. No analytics tracking
4. No error monitoring
5. End-to-end test failed
6. Missing evidence

---

## Risk Assessment

### Launching NOW (with blockers):
**Success Probability**: <5%
**Consequences**:
- Negative reviews ("doesn't work")
- Zero revenue despite traffic
- Wasted Product Hunt opportunity
- Reputation damage

### Launching AFTER fixes:
**Success Probability**: 40-60% (Top 5)
**Benefits**:
- Working payments → revenue Day 1
- Positive reviews → boost ranking
- Full analytics → optimize funnel
- Professional experience

---

## Current Blocker Summary

| Item | Status | Time | Blocker? |
|------|--------|------|----------|
| Stripe | ❌ Placeholder keys | 2h | YES |
| Clerk | ❌ Placeholder keys | 30m | YES |
| PostHog | ❌ Placeholder keys | 30m | YES |
| Sentry | ❌ Placeholder token | 15m | YES |
| E2E Test | ⏳ Blocked | 1h | YES |
| Browser Test | ⏳ Optional | 30m | NO |
| Performance | ⏳ Optional | 30m | NO |
| Assets | ✅ Ready | - | NO |

**Total Blocking Time**: 4.25 hours

---

## Next Actions (Priority Order)

1. **START NOW**: Fix Stripe production mode (2 hours)
2. **THEN**: Fix Clerk authentication (30 min)
3. **THEN**: Fix PostHog analytics (30 min)
4. **THEN**: Fix Sentry monitoring (15 min)
5. **WAIT**: Vercel redeploy (2 min)
6. **THEN**: Run end-to-end revenue test (1 hour)
7. **THEN**: Collect all screenshot evidence (30 min)
8. **DECISION**: Go/No-Go based on evidence
9. **IF GO**: Submit to Product Hunt (March 22, 12:01am PT)

---

**Checklist Version**: 1.0
**Last Updated**: 2026-03-19T20:18:00Z
**Owner**: CTO
**Approver**: CEO

**CRITICAL**: DO NOT SKIP PHASE 1. Launching with placeholder keys = guaranteed failure.
