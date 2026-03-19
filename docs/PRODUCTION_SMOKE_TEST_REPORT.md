# Production Smoke Test Report

**Generated:** 2026-03-19T18:59:43.318Z
**Production URL:** https://taxbridge.vercel.app
**Total Duration:** 36.94s

## Summary

- ✅ **Passed:** 1/6
- ❌ **Failed:** 5/6
- 📊 **Success Rate:** 16.7%

## Overall Status

### ❌ CRITICAL FAILURES - NOT PRODUCTION READY

5 critical test(s) failed. Production deployment not recommended.

## Test Results

### 1. ✅ Site Accessibility Check

**Status:** PASS
**Duration:** 1.37s

**Details:**
✅ Site is UP and accessible (HTTP 200)

**Screenshots:**
- ![homepage-1773946747663.png](./screenshots/homepage-1773946747663.png)

---

### 2. ❌ Calculator Flow End-to-End

**Status:** FAIL
**Duration:** 13.18s

**Details:**
❌ Calculator flow failed: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('input[type="number"]').first() to be visible


**Error:**
```
locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('input[type="number"]').first() to be visible

```

**Screenshots:**
- ![calculator-initial-1773946750859.png](./screenshots/calculator-initial-1773946750859.png)

---

### 3. ❌ Signup & Clerk Authentication

**Status:** FAIL
**Duration:** 12.22s

**Details:**
❌ Clerk widget not found on signup page

**Screenshots:**
- ![signup-page-1773946763040.png](./screenshots/signup-page-1773946763040.png)
- ![signup-clerk-widget-1773946773119.png](./screenshots/signup-clerk-widget-1773946773119.png)

---

### 4. ❌ Payment Flow (Stripe)

**Status:** FAIL
**Duration:** 1.70s

**Details:**
❌ Pricing information not visible

**Screenshots:**
- ![pricing-page-1773946774780.png](./screenshots/pricing-page-1773946774780.png)

---

### 5. ❌ PostHog Event Tracking

**Status:** FAIL
**Duration:** 5.54s

**Details:**
❌ PostHog not loaded and no network requests detected

**Screenshots:**
- ![posthog-tracking-1773946780315.png](./screenshots/posthog-tracking-1773946780315.png)

---

### 6. ❌ Sentry Error Monitoring

**Status:** FAIL
**Duration:** 2.93s

**Details:**
⚠️ Sentry not detected - may be disabled or placeholder DSN

**Screenshots:**
- ![sentry-check-1773946783218.png](./screenshots/sentry-check-1773946783218.png)

---

## Evidence

All screenshots saved to: `/Users/michaelguo/hivemind-projects/cross-border-tax/docs/screenshots/smoke-test-2026-03-19`

**Screenshot Files:**
- homepage-1773946747663.png
- calculator-initial-1773946750859.png
- signup-page-1773946763040.png
- signup-clerk-widget-1773946773119.png
- pricing-page-1773946774780.png
- posthog-tracking-1773946780315.png
- sentry-check-1773946783218.png

## Next Steps

### Failed Tests to Address:

- **Calculator Flow End-to-End:** ❌ Calculator flow failed: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('input[type="number"]').first() to be visible

- **Signup & Clerk Authentication:** ❌ Clerk widget not found on signup page
- **Payment Flow (Stripe):** ❌ Pricing information not visible
- **PostHog Event Tracking:** ❌ PostHog not loaded and no network requests detected
- **Sentry Error Monitoring:** ⚠️ Sentry not detected - may be disabled or placeholder DSN
