# Production Smoke Test Report

**Generated:** 2026-03-19T19:30:06.534Z
**Production URL:** https://taxbridge.vercel.app
**Total Duration:** 40.84s

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
**Duration:** 1.29s

**Details:**
✅ Site is UP and accessible (HTTP 200)

**Screenshots:**
- ![homepage-1773948566879.png](./screenshots/homepage-1773948566879.png)

---

### 2. ❌ Calculator Flow End-to-End

**Status:** FAIL
**Duration:** 12.67s

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
- ![calculator-initial-1773948569590.png](./screenshots/calculator-initial-1773948569590.png)

---

### 3. ❌ Signup & Clerk Authentication

**Status:** FAIL
**Duration:** 13.06s

**Details:**
❌ Clerk widget not found on signup page

**Screenshots:**
- ![signup-page-1773948582616.png](./screenshots/signup-page-1773948582616.png)
- ![signup-clerk-widget-1773948592686.png](./screenshots/signup-clerk-widget-1773948592686.png)

---

### 4. ❌ Payment Flow (Stripe)

**Status:** FAIL
**Duration:** 2.84s

**Details:**
❌ Pricing information not visible

**Screenshots:**
- ![pricing-page-1773948595478.png](./screenshots/pricing-page-1773948595478.png)

---

### 5. ❌ PostHog Event Tracking

**Status:** FAIL
**Duration:** 7.65s

**Details:**
❌ PostHog not loaded and no network requests detected

**Screenshots:**
- ![posthog-tracking-1773948603146.png](./screenshots/posthog-tracking-1773948603146.png)

---

### 6. ❌ Sentry Error Monitoring

**Status:** FAIL
**Duration:** 3.32s

**Details:**
⚠️ Sentry not detected - may be disabled or placeholder DSN

**Screenshots:**
- ![sentry-check-1773948606423.png](./screenshots/sentry-check-1773948606423.png)

---

## Evidence

All screenshots saved to: `/Users/michaelguo/hivemind-projects/cross-border-tax/docs/screenshots/smoke-test-2026-03-19`

**Screenshot Files:**
- homepage-1773948566879.png
- calculator-initial-1773948569590.png
- signup-page-1773948582616.png
- signup-clerk-widget-1773948592686.png
- pricing-page-1773948595478.png
- posthog-tracking-1773948603146.png
- sentry-check-1773948606423.png

## Next Steps

### Failed Tests to Address:

- **Calculator Flow End-to-End:** ❌ Calculator flow failed: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('input[type="number"]').first() to be visible

- **Signup & Clerk Authentication:** ❌ Clerk widget not found on signup page
- **Payment Flow (Stripe):** ❌ Pricing information not visible
- **PostHog Event Tracking:** ❌ PostHog not loaded and no network requests detected
- **Sentry Error Monitoring:** ⚠️ Sentry not detected - may be disabled or placeholder DSN
