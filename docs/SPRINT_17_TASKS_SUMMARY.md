# SPRINT 17 TASKS - QUICK REFERENCE

**Sprint Goal:** Unblock revenue and establish baseline metrics
**Timeline:** March 19-26, 2026
**Total Tasks:** 15 (4 P0, 4 P1, 4 P2, 3 P3)
**Estimated Time:** 38-46 hours total

---

## P0-CRITICAL: Revenue Unblocking (4-6 hours) — DUE: March 20, 2026

### Task 1: Replace Stripe Production Keys - ACTUAL Configuration
- **Time:** 2 hours
- **Owner:** CTO
- **Blocker:** ALL revenue
- **Steps:**
  1. Login to Stripe dashboard → toggle to Production mode
  2. Copy API keys (sk_live_, pk_live_)
  3. Run `export STRIPE_SECRET_KEY=sk_live_... && npx tsx scripts/activate-stripe-production-annual.ts`
  4. Get 3 price IDs (Basic $49, Pro $79, Enterprise $2K)
  5. Update 10 Vercel env vars
  6. Deploy to production
- **Evidence:** Screenshot of Stripe dashboard showing Live mode + 3 price IDs
- **Acceptance:** `curl https://taxbridge.vercel.app/api/stripe/prices` returns live price IDs

### Task 2: Replace Clerk Production Keys - Fix Signup
- **Time:** 30 minutes
- **Owner:** Senior Engineer
- **Blocker:** User signups
- **Steps:**
  1. Login to Clerk dashboard
  2. Copy 3 production keys
  3. Update Vercel env vars
  4. Deploy + test signup works
- **Evidence:** Screenshot of successful new account creation
- **Acceptance:** Clerk widget renders in <2s, user shows in Clerk dashboard

### Task 3: Fix Calculator Timeout - Remove force-dynamic
- **Time:** 2 hours
- **Owner:** Frontend Engineer
- **Blocker:** Calculator flow
- **Steps:**
  1. Remove `export const dynamic = 'force-dynamic'` from `app/(marketing)/us-canada-tax-calculator/page.tsx` line 26
  2. Add loading skeleton UI
  3. Test renders in <3s
  4. Update smoke test timeout to 5s
- **Evidence:** Playwright screenshot showing inputs visible in <3s
- **Acceptance:** Calculator smoke test passes

### Task 4: Revenue Smoke Test - Full Payment E2E
- **Time:** 1 hour
- **Owner:** QA Engineer
- **Prerequisites:** Tasks 1-3 complete
- **Steps:**
  1. Complete calculator
  2. Sign up new account
  3. Checkout with test card (4242 4242 4242 4242)
  4. Verify payment in Stripe
  5. Verify "Pro" badge in app
  6. Refund test payment
- **Evidence:** 5 screenshots (calculator, signup, checkout, Stripe payment, Pro badge)
- **Acceptance:** Payment succeeds, user account shows "Pro", PostHog event fired

---

## P1-HIGH: Visibility & Baseline (2-3 hours) — DUE: March 21-22, 2026

### Task 5: Activate PostHog Production Tracking
- **Time:** 15 minutes
- **Steps:**
  1. Copy API key from PostHog dashboard
  2. Update 2 Vercel env vars (NEXT_PUBLIC_POSTHOG_KEY, POSTHOG_PROJECT_ID)
  3. Deploy
  4. Run `npm run verify:posthog`
- **Evidence:** Screenshot showing events in PostHog dashboard (last 24h)

### Task 6: Activate Sentry Error Monitoring
- **Time:** 10 minutes
- **Steps:**
  1. Copy DSN from Sentry dashboard
  2. Update 2 Vercel env vars
  3. Trigger test error
  4. Verify appears in Sentry
- **Evidence:** Screenshot of Sentry showing captured error

### Task 7: Establish 7-Day Funnel Baseline
- **Time:** 2 hours
- **Prerequisites:** Task 5 complete
- **Steps:**
  1. Configure PostHog funnel: Landing → Calculator → Signup → Payment
  2. Let run 7 days
  3. Export baseline data
  4. Create daily report cron
- **Evidence:** Funnel visualization + CSV export
- **Metrics:** visitors, completion %, drop-off points

### Task 8: Set Up Production Monitoring
- **Time:** 30 minutes
- **Deliverables:**
  - UptimeRobot → ping taxbridge.vercel.app every 5min
  - Sentry alert → error rate >1%
  - Revenue check cron → daily at 9am
- **Evidence:** UptimeRobot dashboard screenshot

---

## P2-MEDIUM: Optimization & Growth (16-20 hours) — DUE: March 23-28, 2026

### Task 9: Fix E2E Test Infrastructure
- **Time:** 8 hours
- **Steps:**
  1. Fix Playwright config (timeouts, retries)
  2. Add GitHub Actions CI workflow
  3. Get 6/6 smoke tests passing
  4. Add CI badge to README
- **Evidence:** Green CI badge

### Task 10: Launch 3 A/B Tests (PostHog Experiments)
- **Time:** 4 hours
- **Tests:**
  1. Headline: "Save $15K+" vs "Calculate Tax in 10 Min" vs "Stop Overpaying"
  2. CTA: "Get Free Report" vs "Start Calculating" vs "See My Savings"
  3. Pricing: $49/year vs $79/year vs $99/year
- **Goal:** 15-35% conversion lift
- **Evidence:** PostHog experiment results screenshot

### Task 11: Reduce Build Size to <100MB
- **Time:** 4 hours
- **Current:** 137MB (37% over target)
- **Tactics:**
  - Code splitting for calculator
  - Image optimization (next/image)
  - Tree shaking unused deps
- **Evidence:** Build output <100MB

### Task 12: User Testing - Interview 10 Free Users
- **Time:** 1 week
- **Steps:**
  1. Email 10 users who completed calculator but didn't upgrade
  2. Offer $20 Amazon gift card for 30min interview
  3. Ask: "What almost stopped you from upgrading?"
  4. Document top 3 friction points
- **Evidence:** Interview notes + friction heatmap

---

## P3-LOW: Launch & Scale (8-12 hours) — DUE: March 24-26, 2026

### Task 13: Product Hunt Launch
- **Time:** 3 hours
- **Prerequisites:** ALL P0 tasks complete + 48h smoke test passing
- **Launch Gates:**
  - [ ] 6/6 smoke tests passing
  - [ ] At least 1 real payment processed
  - [ ] PostHog tracking working
  - [ ] Calculator <10s completion time
  - [ ] Error rate <1%
- **Steps:**
  1. Submit to Product Hunt
  2. Launch Tuesday 12:01am PT
  3. Share to network
- **Evidence:** PH URL + upvote count
- **Goal:** 100+ upvotes, 50+ signups

### Task 14: Reddit Growth Campaign
- **Time:** 4 hours
- **Subreddits:**
  - r/cscareerquestions (post calculator results case study)
  - r/h1b (answer tax questions, link to calculator)
  - r/PersonalFinanceCanada (cross-border tax tips)
- **Evidence:** 3 Reddit post links

### Task 15: Partnership Outreach
- **Time:** 2 hours
- **Targets:**
  - 10 immigration lawyers
  - 5 CPAs specializing in cross-border tax
- **Offer:** 30% revenue share
- **Evidence:** Email template + send log (20 emails)

---

## TASK PRIORITY MATRIX

| Priority | Count | Time | Impact | Deadline |
|----------|-------|------|--------|----------|
| **P0-CRITICAL** | 4 | 4-6h | Unblocks revenue | Mar 20 |
| **P1-HIGH** | 4 | 2-3h | Visibility & baseline | Mar 21-22 |
| **P2-MEDIUM** | 4 | 16-20h | Optimization | Mar 23-28 |
| **P3-LOW** | 3 | 8-12h | Growth & launch | Mar 24-26 |

---

## EXECUTION SEQUENCE

### Day 1 (March 19, 2026) — 4-6 hours
**Focus:** Revenue unblocking
- [ ] Task 1: Replace Stripe keys (2h)
- [ ] Task 2: Replace Clerk keys (30min)
- [ ] Task 3: Fix calculator timeout (2h)
- [ ] Task 4: Revenue smoke test (1h)

**End of Day 1:**
- ✅ Payment flow works end-to-end
- ✅ Can create accounts
- ✅ Calculator loads in <3s
- ✅ 6/6 smoke tests passing

---

### Day 2 (March 20, 2026) — 2-3 hours
**Focus:** Analytics & monitoring
- [ ] Task 5: Activate PostHog (15min)
- [ ] Task 6: Activate Sentry (10min)
- [ ] Task 8: Production monitoring (30min)
- [ ] Task 7: Start 7-day funnel baseline (15min setup)

**End of Day 2:**
- ✅ PostHog tracking events
- ✅ Sentry catching errors
- ✅ UptimeRobot pinging site
- ✅ Revenue monitoring active

---

### Days 3-5 (March 21-23, 2026) — 8 hours
**Focus:** Test infrastructure + A/B tests
- [ ] Task 9: Fix E2E tests (8h)
- [ ] Task 10: Launch 3 A/B tests (4h)

**End of Day 5:**
- ✅ CI/CD pipeline working
- ✅ 3 A/B experiments running
- ✅ User interviews scheduled

---

### Days 6-7 (March 24-25, 2026) — 12 hours
**Focus:** Optimization + launch prep
- [ ] Task 11: Reduce build size (4h)
- [ ] Task 12: User interviews (ongoing, 1 week)
- [ ] Task 13: Product Hunt launch prep (3h)

**End of Day 7:**
- ✅ Build size <100MB
- ✅ 3+ user interviews complete
- ✅ Product Hunt scheduled

---

### Day 8 (March 26, 2026) — 6 hours
**Focus:** Launch & growth
- [ ] Task 13: Product Hunt launch execution (3h active monitoring)
- [ ] Task 14: Reddit campaign (4h)
- [ ] Task 15: Partnership outreach (2h)

**End of Day 8:**
- ✅ Product Hunt live
- ✅ Reddit posts driving traffic
- ✅ Partnership emails sent

---

## SUCCESS METRICS BY DAY

| Day | Key Metric | Target | Actual |
|-----|------------|--------|--------|
| Day 1 | Smoke test pass rate | 100% (6/6) | ___ |
| Day 2 | PostHog events captured | >100 | ___ |
| Day 3 | CI/CD tests passing | 100% | ___ |
| Day 4 | A/B tests launched | 3 | ___ |
| Day 5 | User interviews scheduled | 10 | ___ |
| Day 6 | Build size | <100MB | ___ |
| Day 7 | Product Hunt launch ready | Yes/No | ___ |
| Day 8 | PH upvotes | >100 | ___ |

---

## TASK DEPENDENCIES

```
Day 1:
Task 1 (Stripe) ────┐
Task 2 (Clerk) ─────┼──→ Task 4 (Smoke Test)
Task 3 (Calculator) ┘

Day 2:
Task 5 (PostHog) ───→ Task 7 (Funnel Baseline)
Task 6 (Sentry)
Task 8 (Monitoring)

Day 3-5:
Task 9 (E2E Tests) ──→ Task 13 (PH Launch Gate)
Task 10 (A/B Tests)
Task 11 (Build Size)

Day 6-8:
Task 12 (Interviews) ──→ (Ongoing feedback loop)
Task 13 (PH Launch) ───→ Task 14 (Reddit)
                       └─→ Task 15 (Partnerships)
```

---

## EVIDENCE CHECKLIST

Each task MUST provide evidence before marking "done":

### P0 Tasks
- [ ] Task 1: Stripe dashboard screenshot (Live mode + 3 price IDs)
- [ ] Task 2: Clerk signup flow screenshot
- [ ] Task 3: Playwright screenshot (calculator renders <3s)
- [ ] Task 4: 5 screenshots (full payment flow)

### P1 Tasks
- [ ] Task 5: PostHog events screenshot
- [ ] Task 6: Sentry error screenshot
- [ ] Task 7: Funnel visualization + CSV
- [ ] Task 8: UptimeRobot dashboard screenshot

### P2 Tasks
- [ ] Task 9: CI green badge
- [ ] Task 10: PostHog experiment results
- [ ] Task 11: Build output <100MB
- [ ] Task 12: Interview notes (10 users)

### P3 Tasks
- [ ] Task 13: Product Hunt URL + upvotes
- [ ] Task 14: 3 Reddit post URLs
- [ ] Task 15: Email send log (20 sent)

---

## BLOCKED/AT-RISK TASKS

### Currently Blocked
- **Task 4** (Revenue smoke test) → Blocked by Tasks 1-3
- **Task 7** (Funnel baseline) → Blocked by Task 5
- **Task 13** (Product Hunt) → Blocked by ALL P0 tasks

### At Risk
- **Task 10** (A/B tests) → Risk if PostHog not configured
- **Task 12** (User interviews) → Risk if no users exist (need signups working)

---

## COMMUNICATIONS PLAN

### Daily Standup (9am PT)
- Yesterday: What shipped?
- Today: What's the focus?
- Blockers: What's stuck?
- Evidence: What proof do we have?

### End of Day Report (5pm PT)
- Tasks completed (with evidence links)
- Metrics updated (MRR, smoke test %, funnel baseline)
- Tomorrow's priorities

### End of Week Review (Friday 3pm PT)
- Sprint 17 grade (updated from C+ baseline)
- Revenue: MRR, paying customers, conversion rate
- Launch readiness: Product Hunt gates met?

---

## ROLLBACK PLAN

If production breaks during sprint:

1. **Immediate:** Revert last deployment (Vercel dashboard)
2. **Within 15min:** Run smoke test to verify rollback worked
3. **Within 1h:** Root cause analysis
4. **Within 4h:** Fix deployed with verification

**Rollback Triggers:**
- Smoke test pass rate drops below 80%
- Error rate >5% for >10 minutes
- Site down (HTTP 500) for >5 minutes
- Checkout success rate <50%

---

## VERIFICATION COMMANDS

Run these before marking tasks complete:

```bash
# Task 1: Verify Stripe configuration
npm run verify:stripe:mode
curl https://taxbridge.vercel.app/api/stripe/prices

# Task 2: Verify Clerk configuration
npm run verify:clerk

# Task 3: Verify calculator performance
npm run smoke:test -- --grep "Calculator Flow"

# Task 4: Full revenue smoke test
npm run smoke:test

# Task 5: Verify PostHog tracking
npm run verify:posthog

# Task 6: Verify Sentry monitoring
npm run verify:sentry

# Task 7: Check funnel baseline
npm run funnel:baseline

# Task 8: Check monitoring status
npm run monitoring:status

# Tasks 9-15: Run full CI/CD pipeline
npm run ci:full
```

---

## CONTACT & ESCALATION

### Task Ownership
- **P0 Tasks:** CTO directly (revenue-critical)
- **P1 Tasks:** Senior Engineers
- **P2 Tasks:** Mid-level Engineers
- **P3 Tasks:** Junior Engineers + Marketing

### Escalation Path
1. **Blocked <2h:** Slack team channel
2. **Blocked >2h:** Direct message task owner
3. **Blocked >4h:** CEO escalation
4. **Revenue-impacting:** Immediate CEO escalation

---

**Quick Reference Created:** March 19, 2026
**Sprint Duration:** 7 days (March 19-26)
**Total Estimated Hours:** 38-46 hours
**Critical Path:** Tasks 1-4 (must complete Day 1)
**Launch Gate:** Product Hunt (March 26, pending gates)

**Full Audit:** `docs/SPRINT_17_CEO_AUDIT.md`
**This Summary:** `docs/SPRINT_17_TASKS_SUMMARY.md`
