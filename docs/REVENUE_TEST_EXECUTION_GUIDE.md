# REVENUE TEST EXECUTION GUIDE

**Task:** [P1-HIGH] Execute REAL Revenue Test - Complete End-to-End Payment Flow

**SUCCESS CRITERIA:** First $1 of revenue captured (even if refunded immediately)

---

## Prerequisites Checklist

Before running the revenue test, ensure ALL of the following are complete:

### ✅ 1. Stripe Production Keys Activated

- [ ] `STRIPE_SECRET_KEY` starts with `sk_live_` (NOT `sk_test_`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_live_` (NOT `pk_test_`)
- [ ] Price IDs are production prices (NOT placeholders)
- [ ] Webhook secret is configured: `STRIPE_WEBHOOK_SECRET`
- [ ] Stripe webhook endpoint is live: `https://taxbridge.vercel.app/api/stripe/webhook`

**Verification:**
```bash
npm run verify:stripe:mode
```

Expected output: `✅ Stripe is in LIVE MODE`

---

### ✅ 2. Clerk Production Keys Activated

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with `pk_live_` (NOT `pk_test_`)
- [ ] `CLERK_SECRET_KEY` starts with `sk_live_` (NOT `sk_test_`)
- [ ] Clerk webhook secret is configured: `CLERK_WEBHOOK_SECRET`

**Verification:**
```bash
npm run verify:clerk
```

Expected output: `✅ Clerk is in LIVE MODE`

---

### ✅ 3. Production Site Accessible

- [ ] Production site is UP: https://taxbridge.vercel.app
- [ ] Calculator page loads: https://taxbridge.vercel.app/us-canada-tax-calculator
- [ ] Pricing page loads: https://taxbridge.vercel.app/pricing
- [ ] Signup page loads: https://taxbridge.vercel.app/sign-up

**Verification:**
```bash
npm run verify:production
```

Expected output: `✅ All critical pages return HTTP 200`

---

### ✅ 4. Test Credit Card Ready

Use Stripe test card (works in production test mode):
- **Card Number:** 4242 4242 4242 4242
- **Expiry:** 12/34 (any future date)
- **CVC:** 123 (any 3 digits)
- **ZIP:** 12345 (any 5 digits)

---

### ✅ 5. Stripe Dashboard Access

- [ ] Can login to: https://dashboard.stripe.com
- [ ] Can view Payments section
- [ ] Can create refunds

---

## How to Execute the Revenue Test

### Option 1: Automated Test (Recommended)

Run the comprehensive automated test script:

```bash
# Set Stripe secret key for API access
export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY

# Run the full revenue test
npm run revenue:test
```

**What it does:**
1. ✅ Completes calculator with $150,000 RSU input
2. ✅ Signs up with unique email (revenue-test-{timestamp}@example.com)
3. ✅ Navigates to pricing page and clicks subscribe
4. ✅ Fills Stripe checkout with test card (4242...)
5. ✅ Verifies payment in Stripe dashboard (via API)
6. ✅ Checks user upgraded to Pro status
7. ✅ Refunds payment immediately (via API)
8. ✅ Verifies user downgraded to Free tier
9. ✅ Captures screenshots at each step
10. ✅ Generates comprehensive report

**Duration:** ~2-3 minutes

**Evidence Generated:**
- `docs/REVENUE_TEST_REPORT.md` - Full markdown report
- `docs/revenue-test-evidence.json` - Structured JSON data
- `docs/screenshots/revenue-test-*/` - Screenshots of each step

---

### Option 2: Manual Test (If Automated Fails)

If the automated test encounters issues, follow these manual steps:

#### Step 1: Complete Calculator
1. Go to: https://taxbridge.vercel.app/us-canada-tax-calculator
2. Enter RSU income: **$150,000**
3. Select US State: **Washington (WA)**
4. Select Canadian Province: **British Columbia (BC)**
5. ✅ Verify results are displayed
6. 📸 Take screenshot: `calculator-results.png`

#### Step 2: Sign Up
1. Go to: https://taxbridge.vercel.app/sign-up
2. Enter email: `manual-revenue-test-{timestamp}@example.com`
3. Enter password: `TestPassword123!`
4. Click "Sign up"
5. ✅ Verify account created (may need email verification)
6. 📸 Take screenshot: `signup-complete.png`

#### Step 3: Checkout with Test Card
1. Go to: https://taxbridge.vercel.app/pricing
2. Click "Subscribe" on **Pro Plan**
3. Fill Stripe checkout form:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
4. Click "Pay" / "Subscribe"
5. ✅ Verify payment success page appears
6. 📸 Take screenshot: `payment-success.png`

#### Step 4: Verify Payment in Stripe Dashboard
1. Login to: https://dashboard.stripe.com
2. Go to: **Payments** section
3. Find the payment (should be at top, most recent)
4. ✅ Verify amount matches Pro plan price ($79/year)
5. ✅ Verify status = "Succeeded"
6. 📸 Take screenshot: `stripe-payment.png` ← **REQUIRED EVIDENCE**

#### Step 5: Verify Pro Status in App
1. Go to: https://taxbridge.vercel.app/dashboard
2. Check for Pro badge/indicator
3. ✅ Verify user is on Pro plan
4. 📸 Take screenshot: `user-pro-status.png` ← **REQUIRED EVIDENCE**

#### Step 6: Refund Payment
1. In Stripe Dashboard, find the payment
2. Click "Refund"
3. Enter full amount
4. Reason: "Requested by customer"
5. Click "Refund payment"
6. ✅ Verify refund status = "Succeeded"
7. 📸 Take screenshot: `stripe-refund.png`

#### Step 7: Verify Downgrade to Free
1. Wait 10-30 seconds (for webhook to process)
2. Refresh: https://taxbridge.vercel.app/dashboard
3. Check for Free tier indicator
4. ✅ Verify user is back on Free plan
5. 📸 Take screenshot: `user-free-status.png`

---

## Evidence Requirements

At minimum, you MUST capture:

### Required Screenshots (2)
1. **Stripe Payment** - Shows payment succeeded in Stripe dashboard
2. **User Pro Status** - Shows user upgraded to Pro in app

### Optional Screenshots (Recommended)
3. Calculator results
4. Signup complete
5. Payment success page
6. Stripe refund confirmation
7. User Free tier status (after refund)

---

## Success Criteria

✅ **REVENUE TEST PASSES IF:**
- At least $1 appears in Stripe dashboard as a "Succeeded" payment
- Payment can be refunded successfully
- User's subscription status changes from Free → Pro → Free

❌ **REVENUE TEST FAILS IF:**
- No payment appears in Stripe dashboard
- Payment fails or gets stuck in "Processing"
- Refund cannot be issued
- User never upgrades to Pro

---

## Troubleshooting

### Issue: Clerk signup fails (500 error)
**Cause:** Clerk keys are still in test mode or placeholders
**Fix:** Replace Clerk keys in Vercel with production keys from https://dashboard.clerk.com

### Issue: Payment redirects to sign-in instead of checkout
**Cause:** User is not logged in
**Fix:** Complete signup first (Step 2), then retry checkout (Step 3)

### Issue: Stripe checkout shows test mode banner
**Cause:** Stripe publishable key is still `pk_test_`
**Fix:** Replace with `pk_live_` key in Vercel environment variables

### Issue: Payment succeeds but user stays on Free tier
**Cause:** Webhook not processing or subscription logic broken
**Fix:** Check Stripe webhook logs, verify webhook secret is correct

### Issue: Refund fails with "Payment not found"
**Cause:** Payment is still processing or failed
**Fix:** Wait 30 seconds, refresh Stripe dashboard, try again

---

## After the Test

### If Test PASSES ✅

1. **Document the win:**
   ```bash
   git add docs/REVENUE_TEST_REPORT.md docs/screenshots/
   git commit -m "[P1-HIGH] Revenue Test PASSED - First $1 Captured"
   git push origin main
   ```

2. **Update task status:**
   - Mark task as COMPLETE with evidence links

3. **Next steps:**
   - ✅ Activate Product Hunt launch
   - ✅ Enable paid advertising
   - ✅ Set up daily revenue monitoring
   - ✅ Monitor first real customer payment

### If Test FAILS ❌

1. **Capture all evidence:**
   - Save all screenshots
   - Export Stripe webhook logs
   - Record exact error messages

2. **Create bug report:**
   ```bash
   git add docs/REVENUE_TEST_FAILURE_REPORT.md docs/screenshots/
   git commit -m "[P1-HIGH] Revenue Test FAILED - Investigate Payment Flow"
   git push origin main
   ```

3. **Debug priority order:**
   - P0: Stripe API keys (verify live mode)
   - P0: Clerk auth (verify production keys)
   - P0: Webhook endpoint (verify reachable)
   - P1: Payment flow logic
   - P1: Subscription upgrade logic

---

## Timeline

- **Stripe Key Activation:** 2 hours (CTO priority)
- **Revenue Test Execution:** 5-10 minutes
- **Evidence Collection:** 5 minutes
- **Total:** ~2.5 hours

---

## Contact

**Questions?** Contact:
- **CTO:** Michael Guo
- **Stripe Support:** https://support.stripe.com

---

**Last Updated:** 2026-03-19
**Script Location:** `scripts/execute-revenue-test.ts`
**Quick Start:** `npm run revenue:test`
