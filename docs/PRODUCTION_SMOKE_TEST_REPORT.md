# Production Smoke Test Report

**Generated:** 2026-03-19T19:47:07.173Z
**Production URL:** https://taxbridge.vercel.app
**Total Duration:** 39.89s

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
**Duration:** 2.02s

**Details:**
✅ Site is UP and accessible (HTTP 200)

**Screenshots:**
- ![homepage-1773949589201.png](./screenshots/homepage-1773949589201.png)

---

### 2. ❌ Calculator Flow End-to-End

**Status:** FAIL
**Duration:** 11.14s

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
- ![calculator-initial-1773949590374.png](./screenshots/calculator-initial-1773949590374.png)

---

### 3. ❌ Signup & Clerk Authentication

**Status:** FAIL
**Duration:** 11.97s

**Details:**
❌ Clerk widget not found on signup page

**Screenshots:**
- ![signup-page-1773949602310.png](./screenshots/signup-page-1773949602310.png)
- ![signup-clerk-widget-1773949612372.png](./screenshots/signup-clerk-widget-1773949612372.png)

---

### 4. ❌ Payment Flow (Stripe)

**Status:** FAIL
**Duration:** 3.12s

**Details:**
❌ Pricing information not visible

**Screenshots:**
- ![pricing-page-1773949615450.png](./screenshots/pricing-page-1773949615450.png)

---

### 5. ❌ PostHog Event Tracking

**Status:** FAIL
**Duration:** 7.96s

**Details:**
❌ PostHog not loaded and no network requests detected

**Screenshots:**
- ![posthog-tracking-1773949623414.png](./screenshots/posthog-tracking-1773949623414.png)

---

### 6. ❌ Sentry Error Monitoring

**Status:** FAIL
**Duration:** 3.68s

**Details:**
⚠️ Sentry not detected - may be disabled or placeholder DSN

**Screenshots:**
- ![sentry-check-1773949627057.png](./screenshots/sentry-check-1773949627057.png)

---

## Evidence

All screenshots saved to: `/Users/michaelguo/hivemind-projects/cross-border-tax/docs/screenshots/smoke-test-2026-03-19`

**Screenshot Files:**
- homepage-1773949589201.png
- calculator-initial-1773949590374.png
- signup-page-1773949602310.png
- signup-clerk-widget-1773949612372.png
- pricing-page-1773949615450.png
- posthog-tracking-1773949623414.png
- sentry-check-1773949627057.png

## Next Steps

### Failed Tests to Address:

- **Calculator Flow End-to-End:** ❌ Calculator flow failed: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('input[type="number"]').first() to be visible

- **Signup & Clerk Authentication:** ❌ Clerk widget not found on signup page
- **Payment Flow (Stripe):** ❌ Pricing information not visible
- **PostHog Event Tracking:** ❌ PostHog not loaded and no network requests detected
- **Sentry Error Monitoring:** ⚠️ Sentry not detected - may be disabled or placeholder DSN
