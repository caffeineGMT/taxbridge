# Sprint 04: Production Quality & Bug Fixes

**Sprint Duration:** March 19-26, 2026 (7 days)
**Focus:** Fix critical build failures, test failures, input validation bugs, and complete incomplete features

---

## 🔴 CRITICAL FINDINGS (P0)

### 1. **BUILD FAILURE - BLOCKS DEPLOYMENT**
**Status:** ❌ Build exits with code 1
**Impact:** Cannot deploy to production

**Issue:** Multiple pages fail to prerender during static export:
- `/dashboard/import`
- `/blog/[slug]`
- `/api/enterprise/clients`
- `/api/webhooks/clerk`
- `/tax-calculator/[slug]`

**Error:** `ENOENT: no such file or directory, open '.next/build-manifest.json'`

**Root Cause:** Pages attempting to prerender but build manifest missing during export phase.

**Fix Required:**
1. Add `export const dynamic = "force-dynamic"` to API routes
2. Verify `/blog/[slug]` generateStaticParams is correct
3. Fix next.config.ts export settings
4. Test build completes with exit code 0

---

### 2. **TEST FAILURES - 6 UNIT TESTS FAILING**
**Status:** ❌ 6/191 unit tests fail
**Impact:** Input validation broken for real user scenarios

**Failing Tests (lib/__tests__/input-validation.test.ts):**
1. ❌ "should strip letters from input" - `sanitizeCurrencyInput('abc123def')` returns `''` instead of `'123'`
2. ❌ "should handle mixed alphanumeric with currency symbols" - `'$1,abc,000.50def'` returns `''` instead of `'1000.50'`
3. ❌ "should handle multiple commas" - returns `''` instead of `'1000000000'`
4. ❌ "should handle multiple decimal points" - returns `'100.5075'` instead of `'100.50'`
5. ❌ "should handle single decimal point with no trailing digits" - returns `'100.'` instead of `''`
6. ❌ "High-value Meta RSU grant ($500k)" - returns `500227.75` instead of `500247.75`

**Root Cause:** Logic bugs in `lib/input-validation.ts`:
- Line 77: `replace(/[^0-9.-]/g, '')` strips non-numeric chars correctly
- BUT: Lines 80-84 fix multiple decimals creating `'100.5075'` but don't re-split before precision check (line 112)
- Need to re-split `parts` variable after fixing multiple decimals

---

### 3. **PLAYWRIGHT TEST INFRASTRUCTURE BROKEN**
**Status:** ❌ ALL 204 E2E tests timeout
**Impact:** No E2E test coverage, can't verify user flows

**Issue:**
- Tests run via `npx playwright test` but dev server never starts
- Tests timeout at `page.goto('/')` because localhost:3000 not listening
- Playwright test files also imported into Vitest causing framework conflicts

**Fix Required:**
1. Update package.json scripts:
   - `"test:unit": "vitest run"`
   - `"test:e2e": "playwright test"`
   - `"test:all": "npm run test:unit && npm run test:e2e"`
2. Add `playwright.config.ts` webServer config:
   ```ts
   webServer: {
     command: 'npm run dev',
     port: 3000,
     reuseExistingServer: !process.env.CI,
   }
   ```
3. Separate test configs so Vitest doesn't run Playwright tests

---

## 🟠 HIGH PRIORITY ISSUES (P1)

### 4. **INCOMPLETE FEATURES - 5 MISSING COMPONENTS**
**Location:** `/dashboard/multi-year/page.tsx`
**Impact:** Multi-year dashboard shows placeholder text instead of functional UI

**Missing Components (5 TODOs):**
1. `YearSelector.tsx` - dropdown to select tax year
2. `FTCCarryforwardBanner.tsx` - alert showing carryforward opportunities
3. `IncomeLineChart.tsx` - line chart of income over years (Recharts ~300KB)
4. `CumulativeTaxAreaChart.tsx` - stacked area chart of tax burden
5. Line 16 imports commented out

**Current State:** Page loads but charts/selectors don't exist.

---

### 5. **CODE QUALITY - 351 CONSOLE.LOG STATEMENTS**
**Status:** ⚠️ Not production-ready
**Impact:** No structured logging, can't debug production issues

**Issues:**
- No log levels (can't separate debug from errors)
- console.logs expose data in browser console
- No correlation IDs for request tracing
- Can't aggregate logs in monitoring tools (Sentry/Datadog)

**Fix Required:**
1. Install Winston or Pino for structured logging
2. Create `lib/logger.ts` with log levels (debug, info, warn, error)
3. Replace all 351 console statements:
   - `console.log()` → `logger.info()` or `logger.debug()`
   - `console.error()` → `logger.error()`
   - `console.warn()` → `logger.warn()`
4. For client-side: use PostHog or Sentry
5. Gate debug logs behind `process.env.NODE_ENV === 'development'`

**Target:** 0 console.log statements in production code

---

### 6. **DEPRECATED SENTRY SDK API**
**Files Affected:**
- `app/api/ai/tax-advice/route.ts` (2 TODOs)
- `app/api/stripe/webhook/route.ts` (1 TODO)

**Issue:** Using deprecated `Sentry.startTransaction()` API (deprecated in v8+)

**Fix Required:**
```typescript
// OLD (deprecated):
Sentry.startTransaction({ name: 'operation' })

// NEW:
Sentry.startSpan({ name: 'operation' }, () => { ... })
```

---

### 7. **PLACEHOLDER TRACKING IDS**
**Files Affected:**
- `app/layout.tsx`
- `lib/google-ads/conversion-tracking.ts`

**Placeholders Found:**
- `GOOGLE_ADS_ID = 'AW-XXXXXXXXXX'`
- `META_PIXEL_ID = 'XXXXXXXXXXXXXXXXX'`
- 5 Google Ads conversion IDs (all `AW-XXXXXXXXXX/XXXX`)

**Decision Required:**
- **Option A:** Remove all placeholder code (saves bundle size) - RECOMMENDED unless actively running paid ads
- **Option B:** Configure real IDs from Google Ads / Meta Business Manager

---

### 8. **MISSING EMAIL NOTIFICATIONS**
**Impact:** Users don't receive confirmation emails for critical actions

**Missing Emails (4 TODOs):**
1. Enterprise client invite (with Clerk link)
2. Partner signup confirmation
3. Partner approval (with referral code)
4. Partner rejection (with reason)

**Fix Required:**
1. Create email templates using React Email or similar
2. Implement Resend.send() in each route
3. Add error handling (don't block main action if email fails)

---

## 🔵 MEDIUM PRIORITY (P2)

### 9. **SECURITY - ENTERPRISE ACCESS CONTROL DISABLED**
**File:** `app/enterprise/clients/page.tsx`
**Issue:** TODO comment disables organization access checks

```typescript
// TODO: Re-enable enterprise organization access checks when org schema is added
```

**Vulnerability:** ANY authenticated user can access `/enterprise/clients`, not just enterprise org members.

**Fix Required:**
1. Check if organization schema exists in database
2. If exists: re-enable access checks
3. If not: add organizations table + access control middleware
4. Test: regular users get 403/redirect on /enterprise routes

---

### 10. **BUNDLE SIZE OPTIMIZATION**
**Current State:**
- Most routes: 220-241 kB First Load JS (acceptable)
- Recharts library: ~300KB (used for charts)
- Webpack warnings: serializing big strings (194KB, 180KB, 139KB)

**Investigation Needed:**
1. Run bundle analyzer: `npm run build -- --analyze`
2. Consider Recharts alternatives (Chart.js ~50KB, or custom D3)
3. Verify code splitting working (dynamic imports)
4. Check for duplicate dependencies

**Target:** Reduce bundle size by 20% (220KB → 180KB First Load JS)

---

## SPRINT 04 TASK BREAKDOWN

| Priority | Task | Deadline | Est. Hours |
|----------|------|----------|-----------|
| 🔴 P0 | Fix build failures (prerender errors) | Mar 20 | 4h |
| 🔴 P0 | Fix 6 input validation unit tests | Mar 20 | 3h |
| 🔴 P0 | Fix Playwright test infrastructure | Mar 20 | 4h |
| 🟠 P1 | Complete 5 missing dashboard components | Mar 22 | 8h |
| 🟠 P1 | Replace 351 console.logs with Winston | Mar 23 | 6h |
| 🟠 P1 | Update deprecated Sentry SDK API | Mar 23 | 2h |
| 🟠 P1 | Fix/remove placeholder tracking IDs | Mar 24 | 2h |
| 🟠 P1 | Implement 4 missing email notifications | Mar 25 | 6h |
| 🔵 P2 | Re-enable enterprise access control | Mar 26 | 4h |
| 🔵 P2 | Bundle size audit + optimization | Mar 26 | 4h |

**Total Estimated Hours:** 43 hours
**Sprint Capacity:** 5 engineers × 7 days × 8 hours = 280 hours
**Utilization:** 15% (aggressive sprint with buffer for testing)

---

## ACCEPTANCE CRITERIA

### Sprint Complete When:
- ✅ Build completes with exit code 0 (no prerender errors)
- ✅ All 191 unit tests pass (0 failures)
- ✅ All 204 Playwright E2E tests can reach the app (may have some failures, but no timeouts)
- ✅ Multi-year dashboard fully functional with all 5 components
- ✅ Zero console.log statements in production code
- ✅ Sentry SDK updated to latest API
- ✅ No placeholder tracking IDs (either real IDs or code removed)
- ✅ All 4 email notifications sending successfully
- ✅ Enterprise routes properly access-controlled
- ✅ Bundle size reduction plan documented with top 3 opportunities

---

## RISK ASSESSMENT

**High Risk:**
1. **Build failures** - Blocks all deployments, must fix immediately
2. **Test infrastructure** - Can't verify features work without E2E tests

**Medium Risk:**
1. **Input validation bugs** - Users entering invalid data may break calculator
2. **Missing components** - Dashboard looks incomplete/unprofessional

**Low Risk:**
1. **Console.logs** - Production works but harder to debug
2. **Bundle size** - Performance impact but not blocking

---

## NOTES FOR ENGINEERS

1. **P0 tasks MUST be completed by EOD March 20** - these block everything else
2. **Don't skip tests** - Fix them, don't disable them
3. **When in doubt, ask** - Don't leave TODOs for "later"
4. **Test locally before committing** - Run `npm run build` and `npm test` first
5. **Use feature branches** - Don't push broken code to main

---

## METRICS TO TRACK

- Build success rate: Currently 0% → Target 100%
- Unit test pass rate: Currently 96.8% (185/191) → Target 100%
- E2E test pass rate: Currently 0% (all timeout) → Target >80%
- Console.log count: Currently 351 → Target 0
- TODO count: Currently 13 → Target 0
- Bundle size: Currently 220KB → Target <180KB

---

**Sprint Created:** March 19, 2026
**Sprint Owner:** CEO (Product Evaluation)
**Engineering Team:** 5 engineers available
