# Production Smoke Test Report

**Generated:** 2026-03-19T18:57:41.188Z
**Production URL:** https://taxbridge.vercel.app
**Total Duration:** 58.68s

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
**Duration:** 1.36s

**Details:**
✅ Site is UP and accessible (HTTP 200)

**Screenshots:**
- ![homepage-1773946603746.png](./screenshots/homepage-1773946603746.png)

---

### 2. ❌ Calculator Flow End-to-End

**Status:** FAIL
**Duration:** 31.07s

**Details:**
❌ Calculator flow failed: page.fill: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('input[name="income"]')


**Error:**
```
page.fill: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('input[name="income"]')

```

**Screenshots:**
- ![calculator-initial-1773946604862.png](./screenshots/calculator-initial-1773946604862.png)

---

### 3. ❌ Signup & Clerk Authentication

**Status:** FAIL
**Duration:** 12.92s

**Details:**
❌ Clerk widget not found on signup page

**Screenshots:**
- ![signup-page-1773946637726.png](./screenshots/signup-page-1773946637726.png)
- ![signup-clerk-widget-1773946647791.png](./screenshots/signup-clerk-widget-1773946647791.png)

---

### 4. ❌ Payment Flow (Stripe)

**Status:** FAIL
**Duration:** 2.02s

**Details:**
❌ Pricing information not visible

**Screenshots:**
- ![pricing-page-1773946649809.png](./screenshots/pricing-page-1773946649809.png)

---

### 5. ❌ PostHog Event Tracking

**Status:** FAIL
**Duration:** 6.92s

**Details:**
❌ PostHog not loaded and no network requests detected

**Screenshots:**
- ![posthog-tracking-1773946656731.png](./screenshots/posthog-tracking-1773946656731.png)

---

### 6. ❌ Sentry Error Monitoring

**Status:** FAIL
**Duration:** 4.39s

**Details:**
⚠️ Sentry not detected - may be disabled or placeholder DSN

**Screenshots:**
- ![sentry-check-1773946661065.png](./screenshots/sentry-check-1773946661065.png)

---

## Evidence

All screenshots saved to: `/Users/michaelguo/hivemind-projects/cross-border-tax/docs/screenshots/smoke-test-2026-03-19`

**Screenshot Files:**
- homepage-1773946603746.png
- calculator-initial-1773946604862.png
- signup-page-1773946637726.png
- signup-clerk-widget-1773946647791.png
- pricing-page-1773946649809.png
- posthog-tracking-1773946656731.png
- sentry-check-1773946661065.png

## Next Steps

### Failed Tests to Address:

- **Calculator Flow End-to-End:** ❌ Calculator flow failed: page.fill: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('input[name="income"]')

- **Signup & Clerk Authentication:** ❌ Clerk widget not found on signup page
- **Payment Flow (Stripe):** ❌ Pricing information not visible
- **PostHog Event Tracking:** ❌ PostHog not loaded and no network requests detected
- **Sentry Error Monitoring:** ⚠️ Sentry not detected - may be disabled or placeholder DSN
