# Sprint 08 Tasks - Quick Reference
**Created:** March 19, 2026
**Sprint Duration:** March 19-26, 2026 (7 days)
**Total Tasks:** 13
**Estimated Hours:** 46.5 hours

---

## 🚨 P0-CRITICAL (7 tasks) — MUST FIX BEFORE LAUNCH

### Task 1: Stripe Live Mode Activation ⭐ TOP PRIORITY
**Deadline:** March 20, 2026 8:00 PM PST
**Estimate:** 4 hours
**Assigned To:** TBD

**Deliverables:**
- [ ] Log into Stripe Dashboard → Switch to LIVE MODE
- [ ] Create Pro product ($99/year) → Get real `price_xxx` ID
- [ ] Create Enterprise product ($2000/seat) → Get real `price_xxx` ID
- [ ] Generate live API keys: `sk_live_xxx`, `pk_live_xxx`
- [ ] Configure webhook endpoint → Get `whsec_xxx` secret
- [ ] Update `.env.production` with all LIVE values
- [ ] Test real $1 charge end-to-end
- [ ] Verify webhook receipt fires correctly

**Acceptance Criteria:**
- Real Stripe charge completes successfully
- Webhook fires and updates database
- Zero test mode keys in .env.production

---

### Task 2: Add Error Handling to 85 API Routes
**Deadline:** March 21, 2026 12:00 PM PST
**Estimate:** 8 hours
**Assigned To:** TBD

**Deliverables:**
- [ ] Audit all 87 API routes in `/app/api/*`
- [ ] Add try/catch blocks to 85 routes missing error handling
- [ ] Standardize error response format: `{ error: string, code: string, details?: any }`
- [ ] Add Sentry error tracking to all catch blocks
- [ ] Test error scenarios: DB down, Stripe down, invalid input

**Acceptance Criteria:**
- 100% of API routes (87/87) have try/catch error handling
- All errors return consistent JSON format
- Sentry captures all production errors

---

### Task 3: Optimize Build Size from 898MB to <150MB
**Deadline:** March 22, 2026 12:00 PM PST
**Estimate:** 6 hours
**Assigned To:** TBD

**Deliverables:**
- [ ] Enable Next.js experimental.optimizePackageImports for Recharts
- [ ] Lazy load all chart components: `const Chart = dynamic(() => import('recharts'))`
- [ ] Compress all images to WebP format
- [ ] Add `priority` or `loading="lazy"` to all `<Image>` components
- [ ] Analyze bundle: `npm run build && npx @next/bundle-analyzer`
- [ ] Remove unused dependencies: `npx depcheck`
- [ ] Disable source maps: `productionBrowserSourceMaps: false`

**Acceptance Criteria:**
- `.next` folder size <150MB (currently 898MB)
- Largest JS chunk <200KB (currently 365KB)
- Build completes in <3 minutes

---

### Task 4: Fix E2E Test Infrastructure (100% Failure → 100% Pass)
**Deadline:** March 21, 2026 8:00 PM PST
**Estimate:** 3 hours
**Assigned To:** TBD

**Deliverables:**
- [ ] Fix `tests/global-setup.ts:26` race condition (ERR_CONNECTION_REFUSED)
- [ ] Remove `await page.goto()` from global-setup OR add retry logic
- [ ] Run all 206 tests locally: `npx playwright test`
- [ ] Add Playwright to CI/CD (GitHub Actions)

**Acceptance Criteria:**
- 100% E2E test pass rate (206/206 tests green)
- All tests pass in CI/CD pipeline
- Zero ERR_CONNECTION_REFUSED errors

---

### Task 5: Remove All 189 Console.Log Statements
**Deadline:** March 22, 2026 8:00 PM PST
**Estimate:** 5 hours
**Assigned To:** TBD

**Deliverables:**
- [ ] Find all console.log statements: `grep -r "console.log" app/ components/ lib/`
- [ ] Replace with structured logging: `import logger from '@/lib/logger'`
- [ ] Use `process.env.NODE_ENV === 'development'` for debug logs
- [ ] Add ESLint rule: `no-console: 'error'`
- [ ] Verify zero console output: `npm run build && grep -r "console.log" .next/`

**Acceptance Criteria:**
- Zero console.log statements in production code
- ESLint enforces no-console rule
- No PII exposed in browser console

---

### Task 6: Fix 19 NPM Security Vulnerabilities (2 Critical, 2 High)
**Deadline:** March 20, 2026 6:00 PM PST
**Estimate:** 2 hours
**Assigned To:** TBD

**Deliverables:**
- [ ] Run: `npm audit --json > audit-report.json`
- [ ] Fix critical/high: `npm audit fix --force`
- [ ] Manually upgrade if needed: `npm install package@latest`
- [ ] Verify build passes after upgrades
- [ ] Rerun audit: Target 0 critical/high vulnerabilities

**Acceptance Criteria:**
- Zero critical vulnerabilities
- Zero high vulnerabilities
- Build passes with updated dependencies

---

### Task 7: Upgrade Next.js from 15.5.13 to 16.2.0
**Deadline:** March 21, 2026 4:00 PM PST
**Estimate:** 4 hours
**Assigned To:** TBD

**Deliverables:**
- [ ] Review Next.js 16.x changelog for breaking changes
- [ ] Upgrade: `npm install next@latest react@latest react-dom@latest`
- [ ] Test all pages manually (calculator, dashboard, checkout)
- [ ] Verify build passes: `npm run build`
- [ ] Verify E2E tests pass after upgrade
- [ ] Check Vercel deployment compatibility

**Acceptance Criteria:**
- Next.js version 16.2.0 installed
- All pages render correctly
- Build passes with zero errors
- E2E tests pass

---

## 🟠 P1-HIGH (3 tasks) — QUALITY BASELINE

### Task 8: Establish Lighthouse CI Baseline
**Deadline:** March 22, 2026 6:00 PM PST
**Estimate:** 3 hours
**Assigned To:** TBD

**Deliverables:**
- [ ] Install Lighthouse CI: `npm install -D @lhci/cli`
- [ ] Run baseline: `npx lhci autorun --collect.url=http://localhost:3000`
- [ ] Document baseline scores (Performance, Accessibility, Best Practices, SEO)
- [ ] Fix critical issues (score <85)
- [ ] Add Lighthouse CI to GitHub Actions

**Acceptance Criteria:**
- Performance score >85
- Accessibility score >90
- Lighthouse CI runs on every PR

---

### Task 9: Increase ARIA Coverage from 35% to >80%
**Deadline:** March 23, 2026 4:00 PM PST
**Estimate:** 6 hours
**Assigned To:** TBD

**Deliverables:**
- [ ] Add ARIA labels to all form inputs
- [ ] Add ARIA roles to interactive elements (buttons, links, modals)
- [ ] Test with VoiceOver (Mac) and NVDA (Windows)
- [ ] Verify >80% ARIA coverage

**Acceptance Criteria:**
- All form inputs have aria-label or aria-labelledby
- All interactive elements have proper ARIA roles
- Screen readers can navigate entire app

---

### Task 10: Fix Production Site (503 Error → 200 OK)
**Deadline:** March 20, 2026 4:00 PM PST
**Estimate:** 2 hours
**Assigned To:** TBD

**Deliverables:**
- [ ] Verify domain ownership in Vercel dashboard
- [ ] Check DNS records: `dig taxbridgecpa.com`
- [ ] Redeploy if needed: `vercel --prod`
- [ ] Test: `curl -I https://taxbridgecpa.com` → 200 OK
- [ ] Add health check endpoint: `/api/health`

**Acceptance Criteria:**
- https://taxbridgecpa.com returns 200 OK
- Health check endpoint responds
- DNS resolves correctly

---

## 🔵 P2-MEDIUM (3 tasks) — POLISH

### Task 11: Add Alt Text to 3 Missing Images
**Deadline:** March 23, 2026 (no specific time)
**Estimate:** 30 minutes
**Assigned To:** TBD

**Deliverables:**
- [ ] Find images: `grep -r "<Image" components/ app/ | grep -v "alt="`
- [ ] Add descriptive alt text
- [ ] Add ESLint rule: `jsx-a11y/alt-text: 'error'`

**Acceptance Criteria:**
- All images have alt text
- ESLint enforces alt text requirement

---

### Task 12: Resolve or Remove 17 TODO/FIXME Comments
**Deadline:** March 23, 2026
**Estimate:** 2 hours
**Assigned To:** TBD

**Deliverables:**
- [ ] Review TODOs: `grep -r "TODO\|FIXME" app/ components/ lib/`
- [ ] Complete or remove each TODO
- [ ] Create GitHub issues for deferred TODOs

**Acceptance Criteria:**
- Zero TODO/FIXME comments in critical files
- All deferred work tracked in GitHub

---

### Task 13: Activate Clerk Live Mode Keys
**Deadline:** March 23, 2026
**Estimate:** 1 hour
**Assigned To:** TBD

**Deliverables:**
- [ ] Generate Clerk production keys
- [ ] Update `.env.production` with `pk_live_xxx` and `sk_live_xxx`
- [ ] Test authentication flow in production

**Acceptance Criteria:**
- Clerk keys in LIVE MODE
- Authentication works in production

---

## 📊 SPRINT METRICS

### Effort Distribution
- **P0 Critical:** 32 hours (69%)
- **P1 High:** 11 hours (24%)
- **P2 Medium:** 3.5 hours (7%)

### Timeline
- **Week 1 (Mar 19-21):** P0 tasks (32 hours)
- **Week 2 (Mar 22-23):** P1 tasks (11 hours)
- **Week 3 (Mar 24):** P2 tasks (3.5 hours)
- **Launch (Mar 25-26):** QA + Go-live

### Success Gates
Before launching revenue:
- [ ] All 7 P0 tasks completed
- [ ] Build passes with zero errors
- [ ] Stripe accepting real payments
- [ ] Zero critical/high security vulns
- [ ] 100% E2E test pass rate
- [ ] Production site returns 200 OK

---

## 🎯 TASK IDS (for tracking)

Tasks will be created with these short IDs for reference:

**P0 Tasks:**
- `stripe-live` — Task 1: Stripe activation
- `api-errors` — Task 2: API error handling
- `build-size` — Task 3: Build optimization
- `e2e-fix` — Task 4: E2E test fix
- `console-logs` — Task 5: Remove console.logs
- `npm-vulns` — Task 6: Fix vulnerabilities
- `nextjs-upgrade` — Task 7: Next.js upgrade

**P1 Tasks:**
- `lighthouse` — Task 8: Lighthouse CI
- `aria` — Task 9: ARIA coverage
- `prod-site` — Task 10: Fix production site

**P2 Tasks:**
- `alt-text` — Task 11: Image alt text
- `todos` — Task 12: Resolve TODOs
- `clerk-live` — Task 13: Clerk live mode

---

**End of Sprint 08 Tasks Summary**
