# 🎯 Final Pre-Revenue Quality Gate - QA Checklist

**Date**: 2026-03-18
**QA Engineer**: CTO
**Status**: 🔴 IN PROGRESS
**Blocker Status**: YES - Revenue activation blocked until all CRITICAL items pass

---

## 📋 CRITICAL PATH TESTS (Must Pass)

### 1. ⚠️ **STRIPE INTEGRATION** - REVENUE BLOCKER
**Status**: 🔴 FAILED
**Severity**: P0 - CRITICAL

#### Issues Found:
- ❌ **Stripe in TEST mode** - Using `sk_test_` keys, not production `sk_live_` keys
- ❌ **Placeholder price IDs** - `price_1ProAnnual` and `price_1EntAnnual` are not real Stripe price IDs
- ❌ **Webhook secret not configured** - Using placeholder `whsec_YOUR_WEBHOOK_SECRET_HERE`
- ❌ **Google Ads tracking placeholders** - `AW-XXXXXXXXXX` not replaced with real conversion ID
- ❌ **Meta Pixel placeholder** - `XXXXXXXXXXXXXXXXX` not replaced with real pixel ID

#### Required Actions:
1. Switch Stripe to **PRODUCTION MODE**
   - Replace `sk_test_` with `sk_live_` in `.env.production`
   - Replace `pk_test_` with `pk_live_` in `.env.production`
2. Run `npm run setup:stripe` in production mode to create real products
3. Update price IDs with real `price_XXXXX` values from Stripe dashboard
4. Configure production webhook at `https://taxbridge.vercel.app/api/stripe/webhook`
5. Update `STRIPE_WEBHOOK_SECRET` with real `whsec_` value
6. Test complete payment flow with real Stripe checkout

**Blocking**: YES ❌ - Cannot accept payments until fixed

---

### 2. 💰 **PAYMENT FLOW END-TO-END TEST**
**Status**: ⏳ PENDING (Blocked by Stripe configuration)

#### Test Scenarios:
- [ ] Guest user → Calculator → "Upgrade to Pro" → Checkout → Payment Success → Dashboard Access
- [ ] Stripe webhook fires on successful payment
- [ ] User subscription is created in database
- [ ] User receives confirmation email
- [ ] User can access Pro features after payment
- [ ] Subscription shows in Stripe dashboard
- [ ] Failed payment handling works correctly
- [ ] Webhook retry mechanism works

**Dependencies**: Stripe production mode must be configured first

---

### 3. 🧮 **CALCULATOR ACCURACY TEST**
**Status**: ⏳ PENDING

#### Test Cases:
| Scenario | Income (USD) | Tax Year | Expected CA Tax | Expected US Tax | Status |
|----------|-------------|----------|-----------------|-----------------|---------|
| H-1B SWE | $150,000 | 2024 | ~$45,000 | ~$28,000 | ⏳ |
| TN Worker | $120,000 | 2024 | ~$35,000 | ~$22,000 | ⏳ |
| RSU Income | $200,000 | 2024 | ~$65,000 | ~$42,000 | ⏳ |
| High Earner | $400,000 | 2024 | ~$150,000 | ~$110,000 | ⏳ |

**Test Method**: Compare against IRS/CRA published tax tables for 2024

---

### 4. 📱 **MOBILE RESPONSIVENESS**
**Status**: ⏳ PENDING

#### Devices to Test:
- [ ] iPhone 14 Pro (iOS 17) - Safari
- [ ] iPhone 15 (iOS 18) - Safari
- [ ] Samsung Galaxy S24 - Chrome
- [ ] iPad Pro - Safari
- [ ] Android tablet - Chrome

#### Critical Features:
- [ ] Calculator inputs work on mobile keyboard
- [ ] Touch targets minimum 44x44px (WCAG 2.1 AA)
- [ ] No horizontal scroll on any page
- [ ] Forms submit correctly
- [ ] Stripe checkout works on mobile
- [ ] Navigation menu works
- [ ] Dashboard charts render properly

---

### 5. 🎭 **E2E TESTS WITH PLAYWRIGHT**
**Status**: ⏳ PENDING

```bash
npm run test:e2e
```

#### Test Suites:
- [ ] `test:e2e:chrome` - Chromium tests
- [ ] `test:e2e:firefox` - Firefox tests
- [ ] `test:e2e:safari` - WebKit tests
- [ ] `test:e2e:edge` - Edge tests
- [ ] `test:e2e:mobile` - Mobile Chrome + Safari

---

## 🛠️ SECONDARY CHECKS (Should Pass)

### 6. ⚡ **PERFORMANCE**
**Status**: ⏳ PENDING

- [ ] Lighthouse score > 90 for Performance
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

**Test Command**:
```bash
npm run build
npm start
# Then run Lighthouse in Chrome DevTools
```

---

### 7. ♿ **ACCESSIBILITY (WCAG 2.1 AA)**
**Status**: ⏳ PENDING

- [ ] Lighthouse Accessibility score > 90
- [ ] All interactive elements have ARIA labels
- [ ] Forms have proper labels and error messages
- [ ] Color contrast meets AA standards (4.5:1)
- [ ] Keyboard navigation works throughout site
- [ ] Screen reader testing passes

---

### 8. 🔒 **SECURITY**
**Status**: ⏳ PENDING

- [ ] HTTPS enforced on all pages
- [ ] Stripe webhook signature validation working
- [ ] No API keys exposed in client-side code
- [ ] CORS configured correctly
- [ ] Rate limiting on API routes
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF protection on forms

---

### 9. 🌐 **CROSS-BROWSER COMPATIBILITY**
**Status**: ⏳ PENDING

- [ ] Chrome 120+ - Windows/Mac
- [ ] Firefox 120+ - Windows/Mac
- [ ] Safari 17+ - macOS/iOS
- [ ] Edge 120+ - Windows
- [ ] Mobile Safari iOS 15+
- [ ] Mobile Chrome Android 12+

---

### 10. 📊 **ANALYTICS & TRACKING**
**Status**: 🔴 FAILED

#### Issues:
- ❌ Google Ads conversion tracking not configured (placeholder ID)
- ❌ Meta Pixel not configured (placeholder ID)
- ⏳ PostHog integration status unknown

#### Fix Required:
1. Replace `NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX` with real Google Ads conversion ID
2. Replace `NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXXXX` with real Meta Pixel ID
3. Verify PostHog events fire correctly
4. Test conversion tracking with Google Tag Assistant

---

## 🚨 BLOCKERS SUMMARY

### ❌ CRITICAL - MUST FIX BEFORE REVENUE
1. **Stripe Production Mode** - Cannot accept real payments
2. **Stripe Price IDs** - Checkout will fail with placeholder IDs
3. **Stripe Webhook** - Subscriptions won't activate without webhook
4. **Google Ads Tracking** - Cannot measure ROI/conversions
5. **Meta Pixel** - Cannot run retargeting ads

### ⚠️ HIGH PRIORITY - FIX ASAP
6. Payment flow end-to-end test
7. Calculator accuracy validation
8. Mobile responsiveness verification

### 📝 MEDIUM PRIORITY - Nice to Have
9. E2E test suite passing
10. Performance optimization
11. Accessibility audit

---

## 📞 ASSIGNMENT

**Primary Owner**: CTO (Michael Guo)
**Secondary Reviewer**: Lead Engineer (TBD)
**Due Date**: 2026-03-20 EOD (48 hours)

---

## ✅ SIGN-OFF CRITERIA

This QA gate is **PASSED** when:
- [x] All 5 CRITICAL blockers resolved
- [x] Payment flow works end-to-end with real Stripe
- [x] Calculator accuracy validated against IRS/CRA tables
- [x] Mobile responsiveness tested on 3+ devices
- [x] E2E tests passing on Chrome/Firefox/Safari

**Current Status**: 🔴 **FAILED** - 5 critical blockers identified

---

## 📝 NOTES

- This checklist must be completed BEFORE moving Stripe to production
- All placeholder environment variables MUST be replaced
- Test with real Stripe checkout in production mode before going live
- Revenue activation is blocked until sign-off complete
