# SPRINT PLAN - Production Readiness & Revenue Protection
**Date:** March 19, 2026
**Status:** URGENT - Production Blockers Identified
**Grade:** C- (60/100) - Functional but NOT production-ready for $1M revenue target

---

## 🚨 CRITICAL FINDINGS - CEO EVALUATION

### Build Status: FAILING ❌
```
Error: useSearchParams() should be wrapped in a suspense boundary at page "/survey/cancellation"
Build exited with code 1
```

**Root Cause:** `next.config.ts` has `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`, silencing all TypeScript/ESLint errors. This is CATASTROPHIC for a revenue-generating product.

---

## 📊 PRODUCTION READINESS SCORECARD

| Category | Grade | Issues |
|----------|-------|--------|
| **Build Quality** | F | Build failing, errors silenced, no type safety |
| **Database** | D | SQLite won't work in Vercel production (readonly FS) |
| **Test Coverage** | D- | Only 226 lines of E2E tests, critical flows untested |
| **Security** | C | No rate limiting, no CSP, CSRF vulnerable |
| **Performance** | C+ | Bundle size OK, but no code splitting, lazy loading gaps |
| **Monitoring** | C | Sentry configured but using deprecated APIs |
| **Completeness** | C | Multiple TODO features, placeholder IDs, missing emails |
| **Revenue Protection** | D | Payment flow not fully tested, no fraud prevention |

**Overall:** C- (60/100) - Not ready for paying customers at scale

---

## 🎯 SPRINT TASKS - 10 HIGH-PRIORITY IMPROVEMENTS

### P0 - PRODUCTION BLOCKERS (Must Fix Before Launch)

#### 1. **[P0-CRITICAL] Fix Build Configuration & Errors**
**Priority:** 🔴 P0
**Estimate:** 4 hours
**Impact:** Build currently failing, type safety completely disabled

**Tasks:**
- Remove `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` from next.config.ts
- Fix Suspense boundary error in `/app/survey/cancellation/page.tsx`
- Run `npm run build` and fix ALL TypeScript errors (currently hidden)
- Add pre-commit hook to prevent builds with errors
- Document all fixed errors for future reference

**Acceptance Criteria:**
- ✅ `npm run build` passes with ZERO errors
- ✅ No type safety shortcuts in config
- ✅ Pre-commit hook blocks bad commits
- ✅ CI/CD pipeline added to verify builds

**Revenue Impact:** HIGH - Broken builds = downtime = lost revenue

---

#### 2. **[P0-CRITICAL] SQLite → PostgreSQL Migration**
**Priority:** 🔴 P0
**Estimate:** 8 hours
**Impact:** SQLite DOES NOT WORK in Vercel serverless (readonly filesystem)

**Tasks:**
- Set up PostgreSQL database (Vercel Postgres or Supabase)
- Create migration script: SQLite → PostgreSQL
- Update `lib/db/index.ts` to use PostgreSQL connection
- Test all DB queries (subscriptions, users, affiliates, referrals)
- Update environment variables in Vercel
- Add database connection pooling
- Test with 1000+ concurrent users

**Acceptance Criteria:**
- ✅ PostgreSQL connected in production
- ✅ All existing SQLite data migrated
- ✅ Connection pooling configured
- ✅ Load tested (1000 concurrent connections)
- ✅ Rollback plan documented

**Revenue Impact:** CRITICAL - No database = no payments = $0 revenue

---

#### 3. **[P0-CRITICAL] API Rate Limiting & DoS Protection**
**Priority:** 🔴 P0
**Estimate:** 6 hours
**Impact:** ZERO rate limiting on API routes - vulnerable to DoS and cost attacks

**Current Gaps:**
- `/api/ai/tax-advice` - Claude API calls (could rack up $1000s in bills)
- `/api/stripe/webhook` - no verification beyond signature
- All enterprise APIs - no rate limits
- Email APIs - spam vulnerability

**Tasks:**
- Install `@upstash/ratelimit` (Redis-based)
- Add rate limiting middleware for all API routes
- Implement tiered limits:
  - Free users: 10 requests/hour
  - Pro users: 100 requests/hour
  - Enterprise: 1000 requests/hour
- Add IP-based limits for unauthenticated routes
- Log rate limit violations to Sentry
- Add rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)

**Acceptance Criteria:**
- ✅ All API routes have rate limiting
- ✅ Tiered limits by subscription tier
- ✅ Rate limit violations logged to Sentry
- ✅ Test with 1000 requests/second (should block)

**Revenue Impact:** CRITICAL - Prevents API abuse, protects Anthropic costs

---

### P1 - HIGH PRIORITY (Launch Blockers)

#### 4. **[P1-HIGH] E2E Test Coverage - Critical Flows**
**Priority:** 🟠 P1
**Estimate:** 12 hours
**Impact:** Only 226 lines of E2E tests - payment flows NOT tested end-to-end

**Critical Flows to Test:**
1. **Payment Flow (HIGHEST PRIORITY)**
   - Sign up → Free trial → Payment → Subscription active
   - Failed payment handling
   - Webhook processing
   - Subscription cancellation

2. **Tax Calculator Flow**
   - Input RSUs → Calculate taxes → View results
   - Multi-year projections
   - Export PDF
   - Save calculations

3. **Enterprise Flow**
   - Request demo → Admin approval → Client invite → Client login

4. **Mobile Responsiveness**
   - Calculator on iOS/Android
   - Payment on mobile
   - Dashboard on tablets

**Tasks:**
- Create `tests/e2e/payment-flow.spec.ts` (Stripe test mode)
- Create `tests/e2e/tax-calculator.spec.ts`
- Create `tests/e2e/enterprise-flow.spec.ts`
- Create `tests/e2e/mobile.spec.ts`
- Add CI pipeline to run tests on every PR
- Target: 500+ lines of test coverage

**Acceptance Criteria:**
- ✅ Payment flow tested end-to-end (Stripe test mode)
- ✅ Tax calculator tested (all input combinations)
- ✅ Mobile tests pass on iOS + Android (Playwright)
- ✅ Tests run in CI/CD (GitHub Actions)

**Revenue Impact:** HIGH - Prevents payment bugs, ensures revenue flows

---

#### 5. **[P1-HIGH] Complete Multi-Year Dashboard Components**
**Priority:** 🟠 P1
**Estimate:** 6 hours
**Impact:** Multi-year tracking is advertised but 4 components are TODO stubs

**Missing Components:**
- `YearSelector` - Switch between tax years
- `FTCCarryforwardBanner` - Show foreign tax credit carryforward
- `IncomeLineChart` - Visualize income over years (Recharts)
- `CumulativeTaxAreaChart` - Show cumulative tax burden (Recharts)

**Tasks:**
- Implement `components/dashboard/YearSelector.tsx`
- Implement `components/dashboard/FTCCarryforwardBanner.tsx`
- Implement `components/dashboard/IncomeLineChart.tsx` (lazy loaded)
- Implement `components/dashboard/CumulativeTaxAreaChart.tsx` (lazy loaded)
- Add data fetching from DB (multi-year calculations)
- Add loading states (Suspense)
- Add error boundaries

**Acceptance Criteria:**
- ✅ All 4 components implemented
- ✅ Charts lazy loaded (reduce initial bundle)
- ✅ Data fetched from DB (cached)
- ✅ Mobile responsive (tested on iPhone/Android)

**Revenue Impact:** MEDIUM - Feature completeness increases conversions

---

#### 6. **[P1-HIGH] Fix All TODOs & Placeholder IDs**
**Priority:** 🟠 P1
**Estimate:** 4 hours
**Impact:** Google Ads, Meta Pixel, email notifications all have placeholders

**TODOs Found:**
1. Google Ads ID: `AW-XXXXXXXXXX` (placeholder)
2. Meta Pixel ID: `XXXXXXXXXXXXXXXXX` (placeholder)
3. Cookie consent GA ID: `UA-XXXXX-Y` (placeholder)
4. Enterprise client invites: "TODO: Send email with invite link"
5. Partner approvals: "TODO: Send approval email to partner"
6. Sentry SDK: "TODO: Update to new Sentry SDK API"
7. Enterprise org access: "TODO: Re-enable organization access checks"

**Tasks:**
- Get real Google Ads conversion ID from Google Ads account
- Get real Meta Pixel ID from Facebook Business Manager
- Set up SendGrid templates for:
  - Enterprise client invites
  - Partner approval/rejection emails
- Update Sentry SDK to new API (`startSpan`, `captureRequestError`)
- Re-enable enterprise organization access checks

**Acceptance Criteria:**
- ✅ All placeholder IDs replaced with real values
- ✅ Email notifications working (test in production)
- ✅ Sentry SDK updated (no deprecation warnings)
- ✅ Google Ads tracking conversions
- ✅ Meta Pixel tracking page views

**Revenue Impact:** MEDIUM - Proper tracking improves ad ROI

---

### P2 - IMPORTANT (Polish & Optimization)

#### 7. **[P2-MEDIUM] Security Headers & CSRF Protection**
**Priority:** 🔵 P2
**Estimate:** 3 hours
**Impact:** Missing CSP header, no CSRF tokens on forms

**Tasks:**
- Add Content-Security-Policy (CSP) header to `next.config.ts`
- Add CSRF token generation/validation middleware
- Add CSRF tokens to all forms (calculator, enterprise, payment)
- Add Strict-Transport-Security (HSTS) header
- Test with security scanner (Mozilla Observatory)

**Acceptance Criteria:**
- ✅ CSP header configured (no inline scripts allowed)
- ✅ CSRF protection on all POST routes
- ✅ HSTS header enabled (force HTTPS)
- ✅ Security score A+ on Mozilla Observatory

**Revenue Impact:** LOW - Prevents security breaches, builds trust

---

#### 8. **[P2-MEDIUM] Performance Optimization - Code Splitting**
**Priority:** 🔵 P2
**Estimate:** 4 hours
**Impact:** Bundle size warnings (194KB, 139KB, 180KB strings)

**Tasks:**
- Lazy load Recharts library (only load when needed)
- Implement React.lazy() for dashboard components
- Code split by route (next/dynamic)
- Optimize images (next/image with blur placeholders)
- Add loading skeletons for async components
- Run Lighthouse audit (target score >90)

**Acceptance Criteria:**
- ✅ Recharts lazy loaded (not in initial bundle)
- ✅ Dashboard components code split
- ✅ Lighthouse score >90 (Performance)
- ✅ First Contentful Paint <1.5s
- ✅ Time to Interactive <3s

**Revenue Impact:** MEDIUM - Faster load = higher conversions

---

#### 9. **[P2-MEDIUM] Error Boundaries & Fallback UIs**
**Priority:** 🔵 P2
**Estimate:** 3 hours
**Impact:** Only 5 error boundaries for entire app - many routes lack error handling

**Tasks:**
- Add `error.tsx` to all route segments:
  - `/app/dashboard/error.tsx`
  - `/app/enterprise/error.tsx`
  - `/app/lp/error.tsx`
  - `/app/api/error.tsx` (API error handler)
- Add branded error UI (not generic "Something went wrong")
- Add error reporting to Sentry from error boundaries
- Add "Retry" and "Contact Support" CTAs

**Acceptance Criteria:**
- ✅ All routes have error boundaries
- ✅ Branded error UI with recovery options
- ✅ Errors auto-reported to Sentry
- ✅ Test by throwing errors (verify recovery)

**Revenue Impact:** LOW - Better UX, reduces support tickets

---

#### 10. **[P2-MEDIUM] Monitoring & Alerting Setup**
**Priority:** 🔵 P2
**Estimate:** 3 hours
**Impact:** Sentry configured but using deprecated APIs, no uptime monitoring

**Tasks:**
- Update Sentry SDK to latest (remove all TODOs)
- Add `instrumentation.ts` for Sentry (Next.js 15 pattern)
- Set up Uptime monitoring (Vercel Monitoring or UptimeRobot)
- Configure Slack/email alerts for:
  - Build failures
  - High error rates (>1% of requests)
  - Payment failures (Stripe webhook errors)
  - API rate limit violations
- Add PostHog session recordings (10% sample)

**Acceptance Criteria:**
- ✅ Sentry SDK updated (no deprecation warnings)
- ✅ Uptime monitoring configured (5min checks)
- ✅ Slack alerts working (test with fake errors)
- ✅ PostHog session recordings enabled
- ✅ Error rate dashboard in Sentry

**Revenue Impact:** MEDIUM - Faster incident response = less downtime

---

## 📈 EXPECTED OUTCOMES

### After Sprint Completion:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Production Readiness** | 60% | 90% | +30% |
| **Build Success Rate** | 0% (failing) | 100% | +100% |
| **Test Coverage** | 5% | 60% | +55% |
| **API Security** | F | A | Critical |
| **Database Scalability** | D (SQLite) | A (PostgreSQL) | Critical |
| **Error Detection** | C | A | +2 grades |
| **Performance (Lighthouse)** | 85 | 92+ | +7 points |

### Revenue Protection:
- ✅ Payment flow fully tested → Prevents revenue loss from bugs
- ✅ Rate limiting → Prevents API cost explosions
- ✅ PostgreSQL → Handles 10,000+ users (vs SQLite 10 concurrent)
- ✅ Monitoring → Detects revenue issues within 5 minutes

---

## 🚀 EXECUTION PLAN

### Phase 1: Production Blockers (Days 1-2)
**Priority:** P0 tasks ONLY
**Duration:** 2 days
**Blockers:** Cannot launch without these

1. Fix build configuration & errors (4h)
2. SQLite → PostgreSQL migration (8h)
3. API rate limiting (6h)

**Deliverable:** Production-ready infrastructure

---

### Phase 2: Launch Blockers (Days 3-4)
**Priority:** P1 tasks
**Duration:** 2 days
**Goal:** Feature completeness + testing

4. E2E test coverage (12h)
5. Complete multi-year dashboard (6h)
6. Fix TODOs & placeholder IDs (4h)

**Deliverable:** Fully tested, complete product

---

### Phase 3: Polish & Optimization (Day 5)
**Priority:** P2 tasks
**Duration:** 1 day
**Goal:** Performance + security hardening

7. Security headers & CSRF (3h)
8. Performance optimization (4h)
9. Error boundaries (3h)
10. Monitoring & alerting (3h)

**Deliverable:** Production-grade polish

---

## ✅ DEFINITION OF DONE

A task is complete when:
- ✅ Code written and tested locally
- ✅ `npm run build` passes with ZERO errors
- ✅ Unit tests added (if applicable)
- ✅ E2E tests added (for user-facing features)
- ✅ Code reviewed (self-review minimum)
- ✅ Committed to GitHub with descriptive message
- ✅ Deployed to staging (GitHub Pages)
- ✅ Manually tested in staging
- ✅ No Sentry errors after 24 hours

---

## 🎯 SUCCESS CRITERIA

Sprint is successful when:
- ✅ All P0 tasks completed (100%)
- ✅ 80%+ of P1 tasks completed
- ✅ 50%+ of P2 tasks completed
- ✅ Build passing on every commit
- ✅ Test coverage >60%
- ✅ Lighthouse score >90
- ✅ Zero critical Sentry errors
- ✅ Ready for Product Hunt launch

---

## 📞 ESCALATION

If blocked:
1. Check CLAUDE.md for guidance
2. Review completed tasks for context
3. Search codebase for similar implementations
4. Create GitHub issue with:
   - What you tried
   - Error messages
   - Expected vs actual behavior

**DO NOT:** Skip tasks, create placeholders, or commit broken code.

---

**Last Updated:** March 19, 2026 at 9:00 PM PST
**Next Review:** After Phase 1 completion (2 days)
