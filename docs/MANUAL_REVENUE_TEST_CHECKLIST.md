# 📋 MANUAL REVENUE TEST CHECKLIST

**Date**: _______________
**Tester**: _______________
**Environment**: Production (https://taxbridge.app)
**Stripe Mode**: Live
**Test Objective**: Verify end-to-end payment flow works correctly

---

## ⚠️ PREREQUISITES (Check Before Starting)

- [ ] Stripe is configured in **LIVE MODE** (not test mode)
- [ ] Vercel environment variables are set with **live keys** (sk_live_*, pk_live_*)
- [ ] Webhook endpoint is registered at https://taxbridge.app/api/stripe/webhook
- [ ] Have access to Stripe dashboard (https://dashboard.stripe.com)
- [ ] Have a test user account on TaxBridge (or can create one)
- [ ] Have Stripe test card: **4242 4242 4242 4242**

---

## 🧪 TEST 1: COMPLETE CALCULATOR

**Time**: 2 minutes

### Steps:
1. [ ] Go to https://taxbridge.app
2. [ ] Fill in calculator form with test data:
   - US Income: $150,000
   - Canada Work Days: 60
   - Total Work Days: 250
   - RSU Vesting Value: $50,000
   - US Tax Rate: 22%
   - Canada Tax Rate: 26%
3. [ ] Click "Calculate Tax Liability"
4. [ ] Verify calculation results are displayed
5. [ ] Verify "Upgrade to Pro" button is visible

### Pass Criteria:
- [ ] Calculator completes without errors
- [ ] Results show US tax, Canada tax, and FTC
- [ ] "Upgrade to Pro" CTA is visible and enabled

### Notes/Issues:
```
_____________________________________________________________________________
_____________________________________________________________________________
```

---

## 🧪 TEST 2: NAVIGATE TO PRICING PAGE

**Time**: 1 minute

### Steps:
1. [ ] Click "Upgrade to Pro" button from calculator results
   OR navigate to https://taxbridge.app/pricing
2. [ ] Wait for pricing page to load

### Pass Criteria:
- [ ] Pricing page loads successfully (no 404/500 errors)
- [ ] Three tiers are visible: Free, Pro, Enterprise
- [ ] Pro tier shows "$49/year" pricing
- [ ] Pro tier has "Recommended" or star badge
- [ ] Social proof banner shows user count (e.g., "500+ H-1B professionals")
- [ ] Countdown timer is visible

### Notes/Issues:
```
_____________________________________________________________________________
_____________________________________________________________________________
```

---

## 🧪 TEST 3: CLICK "UPGRADE TO PRO"

**Time**: 1 minute

### Steps:
1. [ ] Locate Pro tier card (middle column, highlighted)
2. [ ] Click button: "Start 14-Day Free Trial" or "Upgrade to Pro"
3. [ ] Wait for redirect

### Pass Criteria:
- [ ] If **not signed in**: Redirects to `/sign-up` or `/sign-in`
- [ ] If **signed in**: Shows loading spinner briefly, then redirects to Stripe

### Notes/Issues:
```
_____________________________________________________________________________
_____________________________________________________________________________
```

---

## 🧪 TEST 4: SIGN UP (If Not Authenticated)

**Time**: 2 minutes (skip if already logged in)

### Steps:
1. [ ] Fill in sign-up form:
   - Email: `test+revenue_{timestamp}@taxbridge.com`
   - Password: `TestPassword123!`
2. [ ] Click "Sign Up"
3. [ ] Complete any email verification if required
4. [ ] Return to pricing page after sign-up
5. [ ] Click "Upgrade to Pro" again

### Pass Criteria:
- [ ] Account created successfully
- [ ] Redirected back to app after sign-up
- [ ] Can click "Upgrade to Pro" without authentication errors

### Notes/Issues:
```
_____________________________________________________________________________
_____________________________________________________________________________
```

---

## 🧪 TEST 5: COMPLETE STRIPE CHECKOUT

**Time**: 3 minutes

### Steps:
1. [ ] Verify redirect to Stripe checkout page
   - URL should be: `https://checkout.stripe.com/c/pay/cs_...`
2. [ ] Verify checkout page shows:
   - [ ] Product: "TaxBridge Pro" or similar
   - [ ] Price: $49.00 USD
   - [ ] Billing: Annual subscription
3. [ ] Fill in payment details:
   - **Card Number**: 4242 4242 4242 4242
   - **Expiry**: 12/30 (any future date)
   - **CVC**: 123 (any 3 digits)
   - **ZIP**: 10001 (any 5 digits)
   - **Name**: Test User
4. [ ] **OPTIONAL**: Apply promo code "LAUNCH2026" (should show 20% discount)
5. [ ] Click "Subscribe" button
6. [ ] Wait for processing (may take 5-10 seconds)

### Pass Criteria:
- [ ] Stripe checkout loads without errors
- [ ] Card form accepts test card number
- [ ] "Subscribe" button is enabled and clickable
- [ ] Processing completes without errors
- [ ] Redirects back to TaxBridge app

### ⚠️ IMPORTANT NOTES:
- Test card **4242 4242 4242 4242** will NOT charge real money
- Stripe will create a test subscription that must be canceled after testing
- If checkout fails, check Stripe dashboard for error messages

### Notes/Issues:
```
_____________________________________________________________________________
_____________________________________________________________________________
```

---

## 🧪 TEST 6: VERIFY REDIRECT TO DASHBOARD

**Time**: 1 minute

### Steps:
1. [ ] After Stripe checkout completes, verify redirect
2. [ ] Check URL: Should be `/dashboard?upgrade=success`
3. [ ] Check for success notification:
   - [ ] Toast/banner: "Subscription activated!" or similar
   - [ ] Green checkmark or success icon

### Pass Criteria:
- [ ] Redirected to dashboard (not stuck on Stripe page)
- [ ] Success message is displayed
- [ ] No error messages

### Notes/Issues:
```
_____________________________________________________________________________
_____________________________________________________________________________
```

---

## 🧪 TEST 7: VERIFY PRO FEATURES IN DASHBOARD

**Time**: 2 minutes

### Steps:
1. [ ] Check dashboard header/navigation:
   - [ ] "Pro" badge or tier indicator is visible
2. [ ] Navigate to dashboard sections:
   - [ ] Multi-Year Dashboard: `/dashboard/multi-year` (Pro feature)
   - [ ] Import RSUs: `/dashboard/import` (Pro feature)
   - [ ] PDF Export: Try exporting a tax report (Pro feature)
3. [ ] Verify no "Upgrade to Pro" prompts on Pro features
4. [ ] Check user profile/settings:
   - [ ] Subscription tier shows "Pro"
   - [ ] Subscription status shows "Active"

### Pass Criteria:
- [ ] Dashboard shows "Pro" tier/badge
- [ ] All Pro features are accessible (no upgrade prompts)
- [ ] No errors when accessing Pro features
- [ ] User profile confirms "Pro" tier

### Notes/Issues:
```
_____________________________________________________________________________
_____________________________________________________________________________
```

---

## 🧪 TEST 8: VERIFY CHARGE IN STRIPE DASHBOARD

**Time**: 2 minutes

### Steps:
1. [ ] Go to https://dashboard.stripe.com/payments
2. [ ] Find the most recent payment (top of list)
3. [ ] Verify payment details:
   - [ ] Amount: $49.00 USD (or $39.20 if promo code used)
   - [ ] Status: **Succeeded** ✅
   - [ ] Customer: Email matches test user
   - [ ] Product: TaxBridge Pro (or price ID)
4. [ ] Click on payment to view details
5. [ ] Verify metadata:
   - [ ] `user_id`: (should be a number)
   - [ ] `tier`: "pro"

### Pass Criteria:
- [ ] Payment appears in Stripe dashboard
- [ ] Payment status is "Succeeded"
- [ ] Amount is correct ($49 or discounted amount)
- [ ] Metadata includes user_id and tier

### Notes/Issues:
```
_____________________________________________________________________________
_____________________________________________________________________________
```

---

## 🧪 TEST 9: VERIFY WEBHOOK DELIVERY

**Time**: 2 minutes

### Steps:
1. [ ] Go to https://dashboard.stripe.com/webhooks
2. [ ] Click on the webhook endpoint: `https://taxbridge.app/api/stripe/webhook`
3. [ ] Find the most recent event (should be `checkout.session.completed`)
4. [ ] Click on the event to view details
5. [ ] Verify:
   - [ ] Status: **Succeeded** ✅ (green checkmark)
   - [ ] Response Code: 200
   - [ ] Event Type: `checkout.session.completed`
6. [ ] Check event payload:
   - [ ] Contains `metadata.user_id`
   - [ ] Contains `metadata.tier = "pro"`

### Pass Criteria:
- [ ] Webhook event shows "Succeeded" status
- [ ] Response code is 200 (no errors)
- [ ] Event payload contains expected metadata

### ⚠️ IF WEBHOOK FAILED:
- [ ] Check error message in Stripe dashboard
- [ ] Verify webhook secret is correct in Vercel env vars
- [ ] Check TaxBridge server logs for errors
- [ ] Retry webhook delivery from Stripe dashboard

### Notes/Issues:
```
_____________________________________________________________________________
_____________________________________________________________________________
```

---

## 🧪 TEST 10: VERIFY DATABASE UPDATE

**Time**: 2 minutes

### Steps:
1. [ ] SSH into server OR access database locally
2. [ ] Run query:
   ```bash
   sqlite3 data/taxbridge.db "SELECT id, email, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id FROM user_profiles WHERE subscription_tier = 'pro' ORDER BY updated_at DESC LIMIT 1;"
   ```
3. [ ] Verify output matches test user:
   - [ ] `email`: Test user email
   - [ ] `subscription_tier`: "pro"
   - [ ] `subscription_status`: "active"
   - [ ] `stripe_customer_id`: cus_xxxxx (Stripe customer ID)
   - [ ] `stripe_subscription_id`: sub_xxxxx (Stripe subscription ID)

### Pass Criteria:
- [ ] Database row exists for test user
- [ ] `subscription_tier = "pro"`
- [ ] `subscription_status = "active"`
- [ ] Stripe IDs are populated (not NULL)

### Notes/Issues:
```
_____________________________________________________________________________
_____________________________________________________________________________
```

---

## 🧪 TEST 11: VERIFY ANALYTICS TRACKING (Optional)

**Time**: 2 minutes

### Steps:
1. [ ] Go to https://app.posthog.com (if configured)
2. [ ] Navigate to: Events → Live
3. [ ] Find recent events (last 5 minutes)
4. [ ] Verify events were tracked:
   - [ ] `pricing_page_viewed`
   - [ ] `pricing_tier_selected` (plan: "pro")
   - [ ] `checkout_started` (plan: "pro")
   - [ ] `upgraded_to_pro` (tier: "pro")
5. [ ] Check event metadata:
   - [ ] User ID matches test user
   - [ ] Funnel step numbers are sequential

### Pass Criteria:
- [ ] All 4 events appear in PostHog
- [ ] Events have correct properties
- [ ] Timestamps are sequential

### ⚠️ Skip this test if PostHog is not configured

### Notes/Issues:
```
_____________________________________________________________________________
_____________________________________________________________________________
```

---

## 🧪 TEST 12: CANCEL TEST SUBSCRIPTION

**Time**: 2 minutes

### ⚠️ CRITICAL: DO NOT SKIP THIS STEP

### Steps:
1. [ ] Go to https://dashboard.stripe.com/subscriptions
2. [ ] Find the test subscription (should be at top of list)
3. [ ] Click on subscription to open details
4. [ ] Click "Cancel subscription" button
5. [ ] Select cancellation reason: "Test/Demo" or "Other"
6. [ ] Confirm cancellation
7. [ ] Verify subscription status changes to "Canceled"

### Pass Criteria:
- [ ] Subscription is canceled successfully
- [ ] Status shows "Canceled" or "Ended"
- [ ] No future charges will occur

### ⚠️ WHY THIS IS CRITICAL:
Forgetting to cancel will result in recurring charges!

### Notes/Issues:
```
_____________________________________________________________________________
_____________________________________________________________________________
```

---

## 📊 OVERALL TEST RESULTS

### Summary:
- **Tests Passed**: ___ / 12
- **Tests Failed**: ___ / 12
- **Tests Skipped**: ___ / 12

### Critical Issues Found:
```
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________
```

### Non-Critical Issues:
```
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________
```

### Recommendations:
```
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________
```

---

## ✅ FINAL VERDICT

- [ ] ✅ **PASS** - All critical tests passed, revenue flow works correctly
- [ ] ⚠️ **CONDITIONAL PASS** - Minor issues found, but revenue flow functional
- [ ] ❌ **FAIL** - Critical issues found, revenue flow broken

### Tester Signature:
```
Name: _________________________________  Date: _______________

Signature: _____________________________
```

### Approver Signature (CTO/CEO):
```
Name: _________________________________  Date: _______________

Signature: _____________________________
```

---

## 📁 ATTACHMENTS

Attach the following for audit trail:
- [ ] Screenshots of successful payment in Stripe dashboard
- [ ] Screenshot of webhook "Succeeded" status
- [ ] Screenshot of dashboard showing "Pro" tier
- [ ] Database query output showing subscription_tier = 'pro'
- [ ] Any error logs or failure screenshots

---

**Document Version**: 1.0
**Last Updated**: March 19, 2026
**Related Documents**:
- `E2E_REVENUE_TEST_REPORT.md` - Automated test report
- `REVENUE_VERIFICATION_GATE_REPORT.md` - Stripe setup guide
- `tests/revenue-flow.spec.ts` - Automated E2E test
