# Sprint 07 Tasks - Quick Reference
**Created:** March 19, 2026
**Timeline:** 7 days (March 20-26)
**Total Tasks:** 10 (5 P0, 3 P1, 2 P2)

---

## P0 - CRITICAL BLOCKERS (Must fix before launch)

### Task 1: [P0-CRITICAL] Build Size 798MB → <100MB (Deployment Blocker)
**Deadline:** March 21, 2026
**Effort:** 8-10 hours
**Engineer:** eng-bundle-optimizer

**Problem:**
- .next directory is 798MB (8x target of 100MB)
- Causing 5-10min Vercel deployments
- Risk of OOM crashes in production

**Root Causes:**
1. Recharts library (128KB per page) in 4 files
2. snoowrap (Reddit monitoring) not needed for MVP
3. No tree-shaking enabled
4. Unoptimized images

**Action Items:**
1. Remove snoowrap + @types/snoowrap from package.json
2. Delete lib/reddit/* directory
3. Replace Recharts with Chart.js in:
   - app/dashboard/revenue-analytics/page.tsx
   - app/launch-dashboard/launch-charts.tsx
   - app/dashboard/multi-year/components.tsx
   - components/tax/tax-comparison-chart.tsx
4. Enable tree-shaking in next.config.js
5. Run: `du -sh .next` → verify <100MB

**Success Criteria:** Build size <100MB, Vercel deploy <2min

---

### Task 2: [P0-CRITICAL] Fix 19 Security Vulnerabilities (2 critical, 2 high)
**Deadline:** March 21, 2026
**Effort:** 4-6 hours
**Engineer:** eng-security

**Problem:**
- 2 CRITICAL: form-data unsafe random (CVE), qs arrayLimit DoS
- 2 HIGH: Various dependency issues
- 11 MODERATE: Including Next.js image cache growth

**Root Cause:** snoowrap dependency chain (request → form-data, qs)

**Action Items:**
1. Remove snoowrap + @types/snoowrap (Reddit feature is P3)
2. Delete lib/reddit/* directory
3. Run: `npm audit fix --force`
4. Update Next.js to 16.2.0+ in package.json
5. Run: `npm audit --production` → verify 0 critical/high

**Success Criteria:** 0 critical or high vulnerabilities

---

### Task 3: [P0-CRITICAL] Activate Stripe Production Mode (Revenue Blocker)
**Deadline:** March 21, 2026
**Effort:** 2-3 hours
**Engineer:** eng-stripe

**Problem:**
- Current: pk_test_ and sk_test_ keys only
- .env.production has placeholders: "sk_live_YOUR_LIVE_SECRET_KEY_HERE"
- ZERO REVENUE POSSIBLE

**Action Items:**
1. Follow docs/STRIPE_PRODUCTION_SETUP.md (30min guide)
2. Get sk_live_ and pk_live_ keys from Stripe Dashboard (Production mode)
3. Run: `npm run setup:stripe` to create live price IDs
4. Copy price IDs to .env.production
5. Add webhook endpoint: https://taxbridge.app/api/stripe/webhook
6. Get webhook secret, add to .env.production
7. Add all vars to Vercel (Settings → Environment Variables → Production)
8. Create HUNT20 promo code (20% off, 500 redemptions, expires April 30)
9. Test live checkout: Use $0.50 test transaction, verify in Stripe Dashboard

**Success Criteria:** Live payment successful, revenue tracked in Stripe

---

### Task 4: [P0-CRITICAL] Replace Console.log with Structured Logging (PII Risk)
**Deadline:** March 22, 2026
**Effort:** 10-14 hours
**Engineer:** eng-logging

**Problem:**
- 148 files with console.log, console.error, console.warn
- Exposing PII: emails, tax data, Stripe keys in browser console
- Performance degradation
- No production debugging capability

**Action Items:**
1. Create lib/logger.ts with Pino structured logger:
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  browser: { asObject: true },
  redact: ['email', 'ssn', 'stripeKey', 'apiKey'],
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,
});

export default logger;
```
2. Install: `npm install pino pino-pretty`
3. Replace all 148 files:
   - console.log → logger.debug
   - console.error → logger.error
   - console.warn → logger.warn
4. Add Sentry integration for error logs
5. Run: `grep -r "console\." app lib components | wc -l` → verify 0

**Success Criteria:** 0 console.log files, PII redacted in logs

---

### Task 5: [P0-CRITICAL] Fix E2E Test Infrastructure (Quality Gate)
**Deadline:** March 22, 2026
**Effort:** 6-8 hours
**Engineer:** eng-e2e

**Problem:**
- All 206 Playwright tests failing with ERR_CONNECTION_REFUSED
- Missing webServer config in playwright.config.ts
- Cannot verify production readiness

**Action Items:**
1. Edit playwright.config.ts, add webServer:
```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120000,
}
```
2. Run: `npx playwright test --project=chromium` → verify passing
3. Fix any failing tests (calculator, checkout, dashboard)
4. Enable all projects: chromium, firefox, webkit, edge
5. Run: `npx playwright test` → verify 206/206 passing

**Success Criteria:** 100% E2E test pass rate (206/206)

---

## P1 - HIGH PRIORITY

### Task 6: [P1-HIGH] Configure Production Environment Variables
**Deadline:** March 23, 2026
**Effort:** 4-6 hours
**Engineer:** eng-devops

**Problem:**
- All .env.production values are placeholders
- Clerk, Sentry, SendGrid, Google Ads, Meta Pixel not configured

**Action Items:**
1. Get API keys from each platform:
   - Clerk: Dashboard → API Keys → Production
   - Sentry: Settings → Auth Tokens → Create Token
   - SendGrid: Settings → API Keys → Create API Key
   - Anthropic: Console → API Keys → Create Key
   - Google Ads: Create conversion tracking ID
   - Meta Pixel: Events Manager → Create Pixel
2. Add to Vercel environment variables (Production only)
3. Test each integration:
   - Clerk: Sign up/sign in flow
   - Sentry: Trigger test error, verify in dashboard
   - SendGrid: Send test email
   - PostHog: Track test event
4. Create PRODUCTION_SETUP_CHECKLIST.md

**Success Criteria:** All integrations working in production

---

### Task 7: [P1-HIGH] Product Hunt Launch Preparation (Marketing Critical)
**Deadline:** March 25, 2026 (RECOMMEND DELAY to April 1)
**Effort:** 16-20 hours
**Engineer:** eng-marketing

**Problem:**
- Previous gate check: 0/4 gates passed
- No launch assets (logo, screenshots, demo video)
- HUNT20 promo code not created
- Submission not scheduled
- Launch date March 25 (6 days) = HIGH RISK

**RECOMMENDATION:** Delay to April 1 for +7 days buffer (85% success vs 45%)

**Action Items:**
1. Create HUNT20 promo code in Stripe (covered in Task 3)
2. Create launch assets:
   - Logo: 512x512 PNG with transparent background
   - Screenshots: 5 images (1280x800) - calculator, results, dashboard, multi-year, pricing
   - Demo video: 60sec screencast with voiceover (<100MB)
3. Write Product Hunt copy:
   - Tagline: "US-Canada cross-border tax calculator for H-1B/TN workers with RSUs" (80 chars)
   - Description: 260 characters
   - First comment: Detailed feature list
4. Schedule submission for 12:01am PT launch day
5. Notify CEO: DELAY RECOMMENDED to April 1

**Success Criteria:** All assets ready, submission scheduled OR delay approved

---

### Task 8: [P1-HIGH] Lighthouse Performance Baseline & Optimization
**Deadline:** March 23, 2026
**Effort:** 3-4 hours
**Engineer:** eng-performance

**Problem:**
- No Lighthouse audit ever run
- Unknown Core Web Vitals, accessibility, SEO scores

**Action Items:**
1. Install: `npm install -D @lhci/cli`
2. Create lighthouserc.json config
3. Run: `npx lhci autorun --upload.target=temporary-public-storage`
4. Document baseline scores:
   - Performance: __/100
   - Accessibility: __/100
   - Best Practices: __/100
   - SEO: __/100
5. Fix issues to meet targets:
   - Performance: >85
   - Accessibility: >90
   - Best Practices: >95
   - SEO: >95
6. Create LIGHTHOUSE_BASELINE.md report

**Success Criteria:** All scores meet targets

---

## P2 - MEDIUM PRIORITY

### Task 9: [P2-MEDIUM] Clean Up TODO/FIXME Comments (Technical Debt)
**Deadline:** March 26, 2026
**Effort:** 4-6 hours
**Engineer:** eng-cleanup

**Problem:**
- 33 TODO/FIXME/HACK comments scattered across codebase
- Down from 40 in Sprint 06 (progress!)

**Action Items:**
1. Run: `grep -r "TODO\|FIXME\|HACK" app lib components`
2. For each comment:
   - If trivial: Fix immediately
   - If complex: Create GitHub issue
   - Remove comment from code
3. Verify: `grep -r "TODO" app lib components | wc -l` → 0

**Success Criteria:** 0 TODO comments remaining

---

### Task 10: [P2-MEDIUM] Production Smoke Test (Final QA)
**Deadline:** March 24, 2026
**Effort:** 2-3 hours
**Engineer:** eng-qa

**Problem:**
- Need full end-to-end QA on production before launch

**Action Items:**
1. Test on production (taxbridge.vercel.app):
   - Calculator: Enter data, verify accuracy
   - Signup: Create account with real email
   - Checkout: Stripe live payment ($0.50 test)
   - Dashboard: Verify data loads correctly
   - Multi-year: Test projections
   - Email: Verify SendGrid sends
   - Analytics: Verify PostHog tracks events
2. Test on mobile (iOS Safari, Android Chrome)
3. Test cross-browser (Firefox, Edge, Safari desktop)
4. Create PRODUCTION_SMOKE_TEST_REPORT.md

**Success Criteria:** All user flows working on production

---

## LAUNCH GATES

### ⛔ BLOCKING (Must Complete)
- [ ] Task 1: Build size <100MB ✅ Currently: 798MB
- [ ] Task 2: 0 security vulnerabilities ✅ Currently: 19 (2 critical)
- [ ] Task 3: Stripe live mode ✅ Currently: TEST mode
- [ ] Task 4: 0 console.log ✅ Currently: 148 files
- [ ] Task 5: E2E 100% passing ✅ Currently: 0%

### 🟠 CRITICAL (Should Complete)
- [ ] Task 6: Production env vars ✅ Currently: placeholders
- [ ] Task 8: Lighthouse >85 ✅ Currently: unknown

### ✅ OPTIONAL (Post-Launch)
- [ ] Task 7: Product Hunt (can delay to April 1)
- [ ] Task 9: TODO cleanup
- [ ] Task 10: Smoke test (do after P0 fixes)

---

## TIMELINE

| Date | Phase | Tasks | Hours |
|------|-------|-------|-------|
| **Thu 3/20** | P0 Fixes (Part 1) | Tasks 1-2 | 12-16h |
| **Fri 3/21** | P0 Fixes (Part 2) | Tasks 3-5 | 18-25h |
| **Sat 3/22** | P1 Quality | Tasks 6, 8 | 7-10h |
| **Sun 3/23** | P1 Polish | Task 4 (finish) | 4-6h |
| **Mon 3/24** | P2 Testing | Task 10 | 2-3h |
| **Tue 3/25** | **LAUNCH DECISION** | CEO approval | - |
| **Wed 3/26** | Product Hunt (DELAYED) | Task 7 | 16-20h |

**Total Effort:** 32-42 hours
**Target Launch:** March 25-27 (conditional on P0 completion)

---

## ENGINEER ASSIGNMENTS

| Engineer ID | Task | Priority | Deadline |
|-------------|------|----------|----------|
| eng-bundle-optimizer | Task 1: Build size | P0 | Mar 21 |
| eng-security | Task 2: Security vulns | P0 | Mar 21 |
| eng-stripe | Task 3: Stripe live | P0 | Mar 21 |
| eng-logging | Task 4: Console.log | P0 | Mar 22 |
| eng-e2e | Task 5: E2E tests | P0 | Mar 22 |
| eng-devops | Task 6: Env vars | P1 | Mar 23 |
| eng-marketing | Task 7: Product Hunt | P1 | Mar 25 |
| eng-performance | Task 8: Lighthouse | P1 | Mar 23 |
| eng-cleanup | Task 9: TODO cleanup | P2 | Mar 26 |
| eng-qa | Task 10: Smoke test | P2 | Mar 24 |

---

**Created:** March 19, 2026
**Next:** Create tasks via scheduler, dispatch engineers
