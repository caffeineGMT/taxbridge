# Sprint 14 Task List - Quick Reference

**Date:** March 19, 2026
**Total Tasks:** 18
**Total Effort:** 71.5 hours
**Timeline:** 17 days (March 19 - April 5)

---

## P0 - CRITICAL (5 tasks, 9.5 hours) ⏰ March 19-22

| ID | Task | Assigned | Hours | Deadline | Status |
|----|------|----------|-------|----------|--------|
| **P0-1** | **Production Site Down - Reconnect Vercel** | CTO | 2h | Mar 19 11:59PM | 🔴 URGENT |
| **P0-2** | **Activate Stripe Production Mode** | CTO | 2h | Mar 20 6:00PM | 🔴 BLOCKER |
| **P0-3** | **Configure 24+ Environment Variables** | CTO + Junior | 4h | Mar 21 EOD | 🔴 BLOCKER |
| **P0-4** | **Increase Free Tier Limit (1→10 entries)** | Any Engineer | 0.25h | Mar 19 11:59PM | 🟡 EASY WIN |
| **P0-5** | **Migrate SQLite → PostgreSQL** | Backend Eng | 2h | Mar 22 EOD | 🟠 SCALABILITY |

---

## P1 - HIGH (5 tasks, 14 hours) - March 23-24

| ID | Task | Assigned | Hours | Deadline | Status |
|----|------|----------|-------|----------|--------|
| **P1-6** | **Add Sign-Up Flow Tracking** | Frontend Eng | 2h | Mar 23 | 🔵 ANALYTICS |
| **P1-7** | **Add "Continue as Free" Button** | Frontend Eng | 3h | Mar 23 | 🔵 CONVERSION |
| **P1-8** | **Track Onboarding Step-by-Step** | Frontend Eng | 4h | Mar 24 | 🔵 ANALYTICS |
| **P1-9** | **Improve Checkout Error Messages** | Frontend Eng | 3h | Mar 24 | 🔵 UX |
| **P1-10** | **Reduce A/B Tests (6→2)** | Frontend Eng | 2h | Mar 23 | 🔵 OPTIMIZATION |

---

## P2 - MEDIUM (5 tasks, 22 hours) - March 25-28

| ID | Task | Assigned | Hours | Deadline | Status |
|----|------|----------|-------|----------|--------|
| **P2-11** | **Reduce Build Size (432MB→200MB)** | Senior Eng | 6h | Mar 26 | ⚪ PERF |
| **P2-12** | **Fix TypeScript Errors (91→0)** | 2x Mid Eng | 12h | Mar 28 | ⚪ QUALITY |
| **P2-13** | **Exit-Intent Popup Cooldown (24h→7d)** | Frontend Eng | 1h | Mar 25 | ⚪ UX |
| **P2-14** | **Track Calculator Email CTA** | Any Engineer | 0.25h | Mar 23 | ⚪ ANALYTICS |
| **P2-15** | **Add Dashboard Error Boundary** | Frontend Eng | 2h | Mar 26 | ⚪ RELIABILITY |

---

## P3 - LOW (3 tasks, 26 hours) - March 30 - April 5

| ID | Task | Assigned | Hours | Deadline | Status |
|----|------|----------|-------|----------|--------|
| **P3-16** | **Cross-Device State Sync** | Backend Eng | 8h | Mar 30 | ⚪ FEATURE |
| **P3-17** | **Guided Product Tour** | Frontend Eng | 12h | Apr 5 | ⚪ FEATURE |
| **P3-18** | **Pricing Comparison Table** | Frontend Eng | 6h | Apr 2 | ⚪ FEATURE |

---

## Critical Path (First 48 Hours)

### TODAY (March 19) - 6 hours ⏰
```
09:00-11:00  P0-1  Reconnect Vercel + Deploy         [CTO]
11:00-11:15  P0-4  Increase free tier to 10 entries  [Any]
11:15-13:00  P0-2  Activate Stripe production        [CTO]
13:00-17:00  P0-3  Configure environment variables   [CTO + Junior]
17:00-18:00        Production smoke test + monitoring
```

**EOD Success Criteria:**
- ✅ https://taxbridgecpa.com/ returns HTTP 200
- ✅ Stripe test payment works
- ✅ Sign-up flow functional
- ✅ Free tier = 10 entries

---

### Tomorrow (March 20) - 4 hours
```
09:00-11:00  P0-5  PostgreSQL migration              [Backend]
11:00-13:00  P1-10 Reduce A/B tests to 2            [Frontend]
14:00-16:00  P1-6  Add sign-up tracking              [Frontend]
```

---

## Task Dependencies

```
P0-1 (Deploy)
  ├─> P0-2 (Stripe) [BLOCKED until deployed]
  └─> P0-3 (Env Vars) [BLOCKED until deployed]

P0-4 (Free Tier) [INDEPENDENT - can do anytime]

P0-5 (PostgreSQL) [Can deploy with SQLite, migrate within 48h]

P1-6, P1-7, P1-8, P1-9 [All independent, can parallelize]

P1-10 (A/B Test) [INDEPENDENT]

P2-11 through P3-18 [All independent]
```

---

## Engineer Assignments

### CTO (8 hours Day 1)
- P0-1: Vercel deployment (2h)
- P0-2: Stripe activation (2h)
- P0-3: Environment variables (4h)

### Backend Engineer (10 hours over 2 days)
- P0-5: PostgreSQL migration (2h)
- P3-16: Cross-device sync (8h)

### Frontend Engineer #1 (14 hours over 3 days)
- P1-6: Sign-up tracking (2h)
- P1-7: Free tier button (3h)
- P1-8: Onboarding tracking (4h)
- P1-9: Error messages (3h)
- P1-10: A/B test reduction (2h)

### Frontend Engineer #2 (9 hours over 4 days)
- P2-13: Exit-intent cooldown (1h)
- P2-15: Error boundary (2h)
- P3-18: Pricing table (6h)

### Senior Engineer (18 hours over 5 days)
- P2-11: Build size optimization (6h)
- P3-17: Product tour (12h)

### Mid-Level Engineers x2 (12 hours each over 3 days)
- P2-12: TypeScript errors (12h total, split 6h each)

### Junior Developer (4 hours Day 1)
- P0-3: Help with env var setup (4h)

### Any Engineer (Quick wins - 30 minutes)
- P0-4: Free tier increase (15 min)
- P2-14: Email CTA tracking (15 min)

---

## Launch Gates (ALL must pass before revenue launch)

### Technical Gates
- [ ] Production site HTTP 200 (not 000)
- [ ] Build passes with 0 errors
- [ ] Unit tests 191/191 passing
- [ ] E2E tests >80% passing (165+ of 206)
- [ ] TypeScript errors <50

### Revenue Gates
- [ ] Stripe live mode active
- [ ] Test payment $0.50 → refund successful
- [ ] Webhook events processing
- [ ] Free tier = 10 entries (not 1)

### Infrastructure Gates
- [ ] Database on PostgreSQL
- [ ] Environment variables set (Clerk, SendGrid, Sentry, PostHog)
- [ ] Error monitoring active (Sentry)
- [ ] Analytics tracking (PostHog)

### UX Gates
- [ ] Sign-up flow tracked
- [ ] "Continue as Free" option exists
- [ ] Checkout errors show actionable messages
- [ ] Dashboard has error boundary

---

## Week 1 Success Metrics (March 19-25)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Site Uptime | 99.9% | Vercel analytics |
| First Paying Customer | 1 | Stripe dashboard |
| Sign-Up Conversion | 5-10% | PostHog funnel |
| Free→Paid Conversion | 2-5% | PostHog funnel |
| Calculator Completions | 50+/day | PostHog events |
| MRR | $50-200 | Stripe MRR chart |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Vercel account suspended | 10% | CRITICAL | Pre-check billing, ToS compliance |
| DNS propagation delay | 30% | HIGH | Use Vercel DNS, not third-party |
| Stripe activation rejected | 15% | CRITICAL | Business verification docs ready |
| PostgreSQL migration data loss | 20% | MEDIUM | Backup SQLite before migration |
| First payment fails | 25% | MEDIUM | Test with 3 different cards |
| Env var typos break site | 40% | HIGH | Validation script before deploy |

---

## Files Modified This Sprint

**Created:**
- `/docs/SPRINT_14_CEO_AUDIT.md` (comprehensive audit)
- `/docs/SPRINT_14_TASKS_SUMMARY.md` (this file)

**To Be Modified:**
- `/lib/paywall.ts` (P0-4: free tier increase)
- `/app/(auth)/sign-up/page.tsx` (P1-6: sign-up tracking)
- `/components/rsu/rsu-entry-form.tsx` (P1-7: free tier CTA)
- `/components/onboarding-wizard.tsx` (P1-8: step tracking)
- `/app/pricing/page.tsx` (P1-9: error messages, P2-13: exit-intent)
- `/app/page.tsx` (P1-10: A/B test reduction)
- `/components/ROICalculator.tsx` (P2-14: email tracking)
- `/app/dashboard/page.tsx` (P2-15: error boundary)
- `/next.config.mjs` (P2-11: build optimization)
- `Various .ts/.tsx files` (P2-12: TypeScript fixes)

---

## Command Reference

### Deploy & Test
```bash
# Local build verification
npm run build

# Deploy to Vercel (after Day 1 fixes)
git push origin main  # Auto-deploys if configured

# Test production
curl https://taxbridgecpa.com/
curl https://taxbridgecpa.com/api/health

# Database migration
npm run db:postgres:init
```

### Analytics Verification
```bash
# Verify PostHog tracking
npm run verify:posthog-funnel

# Check error monitoring
# Visit: https://sentry.io/organizations/taxbridge/issues/
```

### Testing
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# TypeScript check
npx tsc --noEmit
```

---

## Success Criteria Summary

### Day 1 (March 19) ✅
- Production site LIVE
- Stripe production mode ACTIVE
- Free tier = 10 entries

### Week 1 (March 25) ✅
- First paying customer
- All P0 + P1 tasks complete
- Sign-up funnel fully tracked

### Week 2 (March 31) ✅
- TypeScript errors <50
- Build size <200MB
- MRR $200-500

### Month 1 (April 19) ✅
- MRR $1,000-2,000
- Organic traffic 500+/day
- Product Hunt launched

---

**Status:** Ready for execution. Assign CTO to P0-1 immediately.
**Next Update:** March 20, 2026 (after Day 1 completion)
