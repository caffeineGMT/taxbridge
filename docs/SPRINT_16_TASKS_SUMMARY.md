# Sprint 16 - Tasks Summary (Quick Reference)

**Created**: March 19, 2026, 9:00 PM PST
**Total Tasks**: 7 (4 P0-CRITICAL, 3 P1-HIGH)

---

## P0-CRITICAL (All due March 20, 2026)

### 1. Emergency Deployment - Deploy Correct Application
- **ID**: 46a0ed9a
- **Deadline**: March 20, 1:00 AM PST (4 hours from now)
- **Time**: 30 min
- **Issue**: Production shows Nigeria e-invoicing admin dashboard instead of US-Canada RSU tax calculator
- **Fix**: Redeploy from main branch
- **Evidence**: Screenshot of production homepage with US-Canada content

### 2. Fix Calculator Route
- **ID**: 42d2363c
- **Deadline**: March 20, 2:00 AM PST
- **Time**: 1 hour
- **Issue**: /calculator and /us-canada-tax-calculator both return 404
- **Fix**: Debug routing, make calculator accessible
- **Evidence**: Calculator screenshot with sample calculation

### 3. Fix Pricing Page Route
- **ID**: b55f5f26
- **Deadline**: March 20, 2:00 AM PST
- **Time**: 30 min
- **Issue**: /pricing returns 404 despite page existing in codebase
- **Fix**: Debug routing (build cache? deployment mismatch?)
- **Evidence**: Pricing page screenshot showing plans

### 4. Replace Production Environment Variables
- **ID**: 63b176fe
- **Deadline**: March 20, 12:00 PM PST
- **Time**: 2-4 hours
- **Issue**: RECURRING ISSUE - Marked done 7 times (Sprint 8-15), still all placeholders
- **Fix**: Replace ALL 28 env vars in Vercel: Stripe, Clerk, PostHog, Sentry, SendGrid, etc.
- **Evidence**: (1) Vercel env vars screenshot, (2) Stripe test payment, (3) PostHog events

---

## P1-HIGH (Due March 21-22, 2026)

### 5. Revenue Smoke Test
- **ID**: ab780e22
- **Deadline**: March 21, 11:59 PM PST
- **Time**: 1 hour
- **Prereq**: After P0 fixes complete
- **Task**: Execute full payment flow with real credit card
- **Evidence**: (1) Stripe transaction screenshot, (2) Confirmation email, (3) PostHog funnel

### 6. Production Content Audit
- **ID**: cfdbc230
- **Deadline**: March 21, 11:59 PM PST
- **Time**: 2 hours
- **Prereq**: After deployment fix
- **Task**: Verify ALL pages show US-Canada content, no Nigeria references
- **Evidence**: Content audit checklist with 10+ screenshots

### 7. SEO Emergency Fix
- **ID**: a6635cc3
- **Deadline**: March 22, 11:59 PM PST
- **Time**: 1 hour
- **Prereq**: After deployment fix
- **Task**: Submit correct sitemap to GSC, request re-crawl
- **Evidence**: GSC screenshot showing sitemap submitted

---

## Critical Path Timeline

**TONIGHT (March 19-20, 9:00 PM - 2:00 AM PST)**:
1. [9:00-9:30 PM] Task 1: Emergency deployment - fix wrong app
2. [9:30-10:30 PM] Task 2: Fix calculator route
3. [10:30-11:00 PM] Task 3: Fix pricing route
4. [11:00 PM - 3:00 AM] Task 4: Start replacing env vars

**TOMORROW (March 20, Day)**:
- Complete Task 4: Finish replacing all 28 env vars
- Verify all production systems working

**MARCH 21-22**:
- Task 5: Revenue smoke test
- Task 6: Content audit
- Task 7: SEO fix

---

## Task IDs for Reference

```
46a0ed9a - Emergency Deployment
42d2363c - Fix Calculator Route
b55f5f26 - Fix Pricing Route
63b176fe - Replace Env Vars (8th sprint)
ab780e22 - Revenue Smoke Test
cfdbc230 - Content Audit
a6635cc3 - SEO Emergency Fix
```

---

## Success Criteria

**Minimum for "Crisis Resolved"**:
- ✅ Production shows US-Canada tax calculator (not Nigeria app)
- ✅ Calculator route works
- ✅ Pricing route works

**Minimum for "Revenue Ready"**:
- ✅ All 3 above + 28 env vars replaced
- ✅ Revenue smoke test passed

**Minimum for "Launch Ready"**:
- ✅ All 5 above + content audit clean
- ✅ SEO sitemap fixed

---

## Files Created

- `docs/SPRINT_16_CEO_AUDIT.md` - Full audit (13-issue breakdown)
- `docs/SPRINT_16_EXECUTIVE_SUMMARY.md` - 2-page exec summary
- `docs/SPRINT_16_DEPLOYMENT_CRISIS.md` - Emergency runbook
- `docs/SPRINT_16_TASKS_SUMMARY.md` - This quick reference

---

**Status**: 7 tasks created in scheduler database
**Grade**: F (15/100) - PRODUCTION CRISIS
**Severity**: CATASTROPHIC - Wrong application deployed to production
**Impact**: 0% user acquisition, $0 revenue, SEO disaster
