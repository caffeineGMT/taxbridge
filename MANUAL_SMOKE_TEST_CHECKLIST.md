# Manual Smoke Test Checklist
## TaxBridge Production - Post-Deployment Verification

**Run this checklist AFTER fixing the deployment and verifying with `./scripts/verify-production.sh`**

**Tester:** ___________________
**Date:** ___________________
**Production URL:** https://taxbridge.vercel.app

---

## Prerequisites

- [ ] Automated verification script passed (`./scripts/verify-production.sh`)
- [ ] Test Stripe account with test cards available
- [ ] PostHog analytics dashboard access
- [ ] Test email account for signup flow
- [ ] Browser DevTools open for console error monitoring

---

## Test 1: Calculator Accuracy ✅❌

**Goal:** Verify tax calculations are mathematically correct for various scenarios

### Scenario A: Basic H-1B Worker
- [ ] Navigate to calculator (homepage or /dashboard)
- [ ] Input data:
  - Filing Status: Single
  - US State: California
  - Canadian Province: Ontario
  - US W-2 Income: $150,000
  - RSU Vesting Value: $50,000
  - Vesting Date: 2025-06-15
  - Employer: Meta
- [ ] Click "Calculate Tax"
- [ ] Verify results appear without errors
- [ ] Check calculations match expected:
  - US Federal Tax: ~$37,000-$42,000
  - California State Tax: ~$7,000-$10,000
  - Canada Federal Tax: ~$40,000-$45,000
  - Ontario Provincial Tax: ~$10,000-$12,000
  - Foreign Tax Credit: ~$40,000-$50,000
  - Total Tax Liability: Reasonable (not negative, not 3x income)
- [ ] Verify FTC eliminates most double taxation
- [ ] Screenshot results for documentation

**Notes:**
___________________________________________________________________
___________________________________________________________________

### Scenario B: Edge Case - Zero RSU Income
- [ ] Clear calculator
- [ ] Input only W-2 income ($100,000), RSU = $0
- [ ] Verify calculation completes without errors
- [ ] Verify no division-by-zero errors in console

**Notes:**
___________________________________________________________________

### Scenario C: High Earner - Multiple RSU Vestings
- [ ] Input W-2: $200,000, RSU: $150,000
- [ ] Add multiple vesting events (if supported)
- [ ] Verify marginal tax brackets calculated correctly
- [ ] Check AMT (Alternative Minimum Tax) if applicable

**Notes:**
___________________________________________________________________

**Test 1 Result:** ✅ PASS / ❌ FAIL
**Blocker Issues:** _______________________________________________

---

## Test 2: User Signup Flow (Clerk Authentication) ✅❌

**Goal:** Verify new users can create accounts and access protected routes

### Email Signup
- [ ] Click "Sign Up" or "Get Started"
- [ ] Verify redirected to /sign-up (Clerk hosted or embedded)
- [ ] Enter test email: `test+taxbridge$(date +%s)@example.com`
- [ ] Enter password (meet requirements)
- [ ] Complete email verification (check inbox)
- [ ] Verify redirected to /onboarding or /dashboard after verification
- [ ] Check no console errors during flow
- [ ] Verify user session persists (refresh page, still logged in)

**Notes:**
___________________________________________________________________

### Social Login (if enabled)
- [ ] Test Google OAuth login
- [ ] Test GitHub OAuth login
- [ ] Verify account created and redirected properly

**Notes:**
___________________________________________________________________

### Logout/Login Cycle
- [ ] Logout from user menu
- [ ] Verify redirected to homepage
- [ ] Click "Sign In"
- [ ] Login with same credentials
- [ ] Verify access to dashboard

**Notes:**
___________________________________________________________________

**Test 2 Result:** ✅ PASS / ❌ FAIL
**Blocker Issues:** _______________________________________________

---

## Test 3: Stripe Checkout Flow ✅❌

**Goal:** Verify users can purchase Pro/Enterprise subscriptions

### Prerequisites:
**Stripe Test Cards:**
- Success: `4242 4242 4242 4242` (Visa)
- Decline: `4000 0000 0000 0002` (Generic decline)
- 3D Secure: `4000 0025 0000 3155` (Requires authentication)

### Pro Plan Purchase
- [ ] Navigate to /pricing page
- [ ] Click "Upgrade to Pro" or equivalent CTA
- [ ] Verify redirected to Stripe Checkout
- [ ] Verify correct plan details:
  - Plan Name: Pro Annual
  - Price: $299/year (or correct amount)
  - Product description accurate
- [ ] Enter test card: 4242 4242 4242 4242
- [ ] Enter test data:
  - Email: test-stripe@taxbridge.app
  - Card details: 12/28, 123, 12345
- [ ] Click "Subscribe" or "Pay"
- [ ] Verify successful redirect to /dashboard or success page
- [ ] Check webhook received (Stripe Dashboard → Developers → Webhooks → Events)
- [ ] Verify user account upgraded (Pro badge, features unlocked)
- [ ] Check PostHog event: `subscription_activated`

**Notes:**
___________________________________________________________________

### Failed Payment Handling
- [ ] Repeat checkout flow with decline card: `4000 0000 0000 0002`
- [ ] Verify error message shown
- [ ] Verify user NOT upgraded
- [ ] Verify no partial charge created

**Notes:**
___________________________________________________________________

### 3D Secure Authentication
- [ ] Repeat checkout with 3DS card: `4000 0025 0000 3155`
- [ ] Complete 3D Secure challenge popup
- [ ] Verify payment succeeds after authentication
- [ ] Verify user upgraded

**Notes:**
___________________________________________________________________

**Test 3 Result:** ✅ PASS / ❌ FAIL
**Blocker Issues:** _______________________________________________

---

## Test 4: Refund Process ✅❌

**Goal:** Verify refunds can be processed and user access downgraded

### Stripe Dashboard Refund
- [ ] Login to Stripe Dashboard
- [ ] Navigate to Payments → All payments
- [ ] Find test payment from Test 3
- [ ] Click payment → "Refund payment"
- [ ] Process full refund
- [ ] Verify refund webhook received in app logs
- [ ] Check user account downgraded (Pro → Free)
- [ ] Verify features locked again
- [ ] Check PostHog event: `subscription_cancelled`

**Notes:**
___________________________________________________________________

### Cancellation Survey Email (if configured)
- [ ] Check if cancellation survey email sent
- [ ] Verify email delivered to test account
- [ ] Verify survey link works
- [ ] Submit survey response

**Notes:**
___________________________________________________________________

**Test 4 Result:** ✅ PASS / ❌ FAIL
**Blocker Issues:** _______________________________________________

---

## Test 5: Analytics Tracking (PostHog) ✅❌

**Goal:** Verify all critical user events are tracked in PostHog

### Event Tracking Verification
- [ ] Open PostHog dashboard: https://app.posthog.com
- [ ] Navigate to Events → Live Events
- [ ] Perform actions and verify events fire:

**Homepage Events:**
- [ ] Page view: `$pageview` with path: `/`
- [ ] CTA click: `cta_clicked` (Get Started button)

**Calculator Events:**
- [ ] Calculator started: `calculator_started`
- [ ] Form field interactions: `calculator_field_changed`
- [ ] Calculation submitted: `tax_calculation_completed`
- [ ] Results viewed: `tax_calculation_viewed`

**Signup Events:**
- [ ] Signup started: `signup_started`
- [ ] Signup completed: `signup_completed`
- [ ] Email verified: `email_verified`
- [ ] Onboarding completed: `onboarding_completed`

**Payment Events:**
- [ ] Checkout started: `checkout_started`
- [ ] Checkout completed: `checkout_completed`
- [ ] Subscription activated: `subscription_activated`
- [ ] Subscription cancelled: `subscription_cancelled`

**Funnel Analysis:**
- [ ] Navigate to PostHog → Funnels
- [ ] Create conversion funnel:
  1. `$pageview` (/)
  2. `calculator_started`
  3. `signup_started`
  4. `checkout_started`
  5. `subscription_activated`
- [ ] Verify conversion rates calculated
- [ ] Check drop-off points

**Notes:**
___________________________________________________________________

**Test 5 Result:** ✅ PASS / ❌ FAIL
**Blocker Issues:** _______________________________________________

---

## Test 6: Error Handling & Edge Cases ✅❌

### Input Validation
- [ ] Enter negative income in calculator → Verify error message
- [ ] Enter income > $10M → Verify calculation works or shows reasonable error
- [ ] Leave required fields empty → Verify inline validation errors
- [ ] Enter special characters in numeric fields → Verify sanitized

**Notes:**
___________________________________________________________________

### Network Failures
- [ ] Open DevTools → Network tab
- [ ] Throttle to "Slow 3G"
- [ ] Submit calculator form
- [ ] Verify loading state shown
- [ ] Verify timeout handling (no infinite spinner)

**Notes:**
___________________________________________________________________

### Browser Compatibility
- [ ] Test in Safari (Mac/iOS)
- [ ] Test in Chrome (Desktop)
- [ ] Test in Firefox (Desktop)
- [ ] Test in Edge (Desktop)
- [ ] Verify no rendering bugs
- [ ] Verify calculator works in all browsers

**Notes:**
___________________________________________________________________

**Test 6 Result:** ✅ PASS / ❌ FAIL
**Blocker Issues:** _______________________________________________

---

## Test 7: Mobile Responsiveness ✅❌

### iPhone Testing (Safari)
- [ ] Open https://taxbridge.vercel.app on iPhone
- [ ] Verify homepage renders correctly (no horizontal scroll)
- [ ] Test navigation menu (hamburger menu if mobile)
- [ ] Test calculator form (inputs visible, tappable)
- [ ] Verify submit button accessible (not cut off)
- [ ] Test signup flow on mobile
- [ ] Verify Stripe checkout mobile-friendly

**Notes:**
___________________________________________________________________

### Android Testing (Chrome)
- [ ] Repeat iPhone tests on Android device
- [ ] Verify keyboard doesn't obscure inputs
- [ ] Test landscape orientation

**Notes:**
___________________________________________________________________

**Test 7 Result:** ✅ PASS / ❌ FAIL
**Blocker Issues:** _______________________________________________

---

## Test 8: SEO & Performance ✅❌

### Lighthouse Audit
- [ ] Open Chrome DevTools → Lighthouse
- [ ] Run audit (Mobile, Production)
- [ ] Record scores:
  - Performance: _____/100
  - Accessibility: _____/100
  - Best Practices: _____/100
  - SEO: _____/100
- [ ] Verify Performance > 70
- [ ] Verify Accessibility > 90
- [ ] Verify SEO > 90

**Notes:**
___________________________________________________________________

### Meta Tags Validation
- [ ] View page source
- [ ] Verify Open Graph tags present:
  - `og:title` = "TaxBridge - US-Canada Cross-Border Tax Calculator..."
  - `og:description` = mentions H-1B/TN
  - `og:image` = valid image URL
- [ ] Verify Twitter Card tags
- [ ] Test social sharing preview: https://cards-dev.twitter.com/validator

**Notes:**
___________________________________________________________________

**Test 8 Result:** ✅ PASS / ❌ FAIL
**Blocker Issues:** _______________________________________________

---

## Final Summary

**Total Tests:** 8
**Passed:** _____
**Failed:** _____
**Blockers:** _____

**Overall Status:** ✅ READY TO LAUNCH / ❌ BLOCKERS REMAIN / ⚠️ MINOR ISSUES

### Critical Blockers (Must Fix Before Launch):
1. ___________________________________________________________________
2. ___________________________________________________________________
3. ___________________________________________________________________

### Medium Issues (Fix in Sprint 1):
1. ___________________________________________________________________
2. ___________________________________________________________________

### Nice-to-Have Improvements:
1. ___________________________________________________________________
2. ___________________________________________________________________

---

## Sign-Off

**Tested By:** _____________________
**Date:** _____________________
**Approved for Production:** YES / NO
**Next Steps:** ___________________________________________________________________

---

## Appendix: Test Data Reference

### Test User Accounts
- Email: `test+taxbridge@example.com`
- Password: `TestTaxBridge2026!`

### Stripe Test Cards
- **Success:** 4242 4242 4242 4242 (Visa)
- **Decline:** 4000 0000 0000 0002
- **3D Secure:** 4000 0025 0000 3155
- **Insufficient Funds:** 4000 0000 0000 9995

### Sample Tax Scenarios
**Scenario 1: Software Engineer at Meta**
- Filing: Single
- US State: Washington (no state tax)
- Canada: British Columbia
- W-2: $180,000
- RSU: $80,000
- Expected US Federal: ~$45,000
- Expected CA Federal: ~$50,000
- Expected FTC: ~$45,000

**Scenario 2: Senior Engineer at Amazon**
- Filing: Married Filing Jointly
- US State: California
- Canada: Ontario
- W-2: $220,000
- RSU: $120,000
- Expected total tax: ~$95,000-$110,000 (after FTC)

**Scenario 3: Edge Case - Low Income TN Worker**
- Filing: Single
- US State: Texas
- Canada: Alberta
- W-2: $60,000
- RSU: $10,000
- Verify no negative FTC, reasonable tax liability
