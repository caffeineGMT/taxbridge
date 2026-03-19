# STRIPE PRODUCTION TESTING GUIDE

## Overview

**PURPOSE:** Test live Stripe checkout flow with real card, verify webhooks work, then refund to avoid charges.

**TIMELINE:** 30 minutes
**PREREQUISITES:** Stripe live mode activated, price IDs created, webhook configured
**OUTCOME:** Confidence that production payments work end-to-end

---

## ⚠️ CRITICAL SAFETY RULES

1. **USE TEST CARD ONLY:** `4242 4242 4242 4242` (will NOT charge real money in test environment)
2. **REFUND IMMEDIATELY:** After successful test, refund within 5 minutes
3. **MONITOR WEBHOOKS:** Verify every webhook event is received
4. **ONE TEST TRANSACTION:** Do NOT create multiple test subscriptions

---

## TESTING CHECKLIST

### Phase 1: Pre-Test Verification (5 min)

- [ ] **Verify Vercel env vars are set:**
  ```bash
  # Check Vercel dashboard → Settings → Environment Variables
  STRIPE_SECRET_KEY=sk_live_... (LIVE, not test)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (LIVE, not test)
  STRIPE_WEBHOOK_SECRET=whsec_... (from webhook endpoint setup)
  STRIPE_BASIC_PRICE_ID=price_... (from setup script)
  STRIPE_PRO_PRICE_ID=price_... (from setup script)
  ```

- [ ] **Verify webhook endpoint exists:**
  - Go to: https://dashboard.stripe.com/webhooks
  - Confirm endpoint: `https://taxbridgecpa.com/api/stripe/webhook`
  - Status: **Active** (green checkmark)
  - Events listening: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

- [ ] **Open Stripe Dashboard in separate tabs:**
  - Tab 1: https://dashboard.stripe.com/payments (monitor payments)
  - Tab 2: https://dashboard.stripe.com/webhooks (monitor webhook events)
  - Tab 3: https://dashboard.stripe.com/customers (verify customer creation)

---

### Phase 2: Execute Test Checkout (10 min)

#### Step 1: Start Checkout Flow

1. Go to: **https://taxbridgecpa.com/pricing**
2. Click: **"Subscribe to Pro Plan - $79/year"** (or Basic $49/year)
3. Verify redirect to Stripe Checkout page
4. **STOP** if checkout page shows test mode banner (means env vars not updated)

#### Step 2: Fill Payment Details

**Use Stripe test card (safe to use):**

| Field | Value |
|-------|-------|
| Card number | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g., `12/28`) |
| CVC | Any 3 digits (e.g., `123`) |
| ZIP code | Any 5 digits (e.g., `12345`) |
| Email | Your real email (for receipt) |
| Name | Test User |

5. Click **"Subscribe"**
6. Wait for redirect back to TaxBridge (should show success page)

#### Step 3: Verify Success Response

- [ ] Redirected to: `https://taxbridgecpa.com/dashboard` or `/subscription-success`
- [ ] Success message displayed: "Welcome to TaxBridge Pro!"
- [ ] No error messages in browser console (open DevTools → Console)

---

### Phase 3: Verify Backend Processing (10 min)

#### Webhook Verification

1. **Open Stripe Dashboard → Webhooks**
2. Click on your webhook endpoint
3. Check **"Recent events"** section
4. Verify these events were received (within last 2 minutes):

   - [ ] `checkout.session.completed` (Status: 200 OK)
   - [ ] `customer.subscription.created` (Status: 200 OK)
   - [ ] `invoice.payment_succeeded` (Status: 200 OK)

5. **If any event shows 4xx or 5xx error:**
   - Click event → View details
   - Check response body for error message
   - Debug webhook endpoint code at `/api/stripe/webhook/route.ts`

#### Database Verification

6. **Check user subscription was created:**
   ```bash
   # SSH into production database or check admin dashboard
   SELECT * FROM user_profiles WHERE clerk_user_id = 'user_XXX' ORDER BY created_at DESC LIMIT 1;
   # Verify:
   # - subscription_tier = 'pro'
   # - subscription_status = 'active'
   # - stripe_customer_id = 'cus_...'
   # - stripe_subscription_id = 'sub_...'
   ```

7. **Check Stripe Dashboard → Customers:**
   - Verify new customer created
   - Name: Test User
   - Email: your test email
   - Subscription: Pro Annual ($79/year)
   - Status: **Active**

#### Payment Verification

8. **Check Stripe Dashboard → Payments:**
   - Verify payment logged
   - Amount: $79.00 USD (or $49 for Basic)
   - Status: **Succeeded**
   - Description: "Subscription creation"

---

### Phase 4: Test Refund (5 min)

⚠️ **DO THIS IMMEDIATELY** to avoid charges

1. Go to: **Stripe Dashboard → Payments**
2. Click on the test payment (should be first in list)
3. Click **"Refund"** button (top right)
4. Select: **"Full refund"** ($79.00)
5. Reason: "Test transaction"
6. Click **"Refund payment"**

#### Verify Refund Webhook

7. Go to: **Stripe Dashboard → Webhooks → Recent events**
8. Verify these events received:
   - [ ] `charge.refunded` (Status: 200 OK)
   - [ ] `customer.subscription.deleted` (if subscription cancelled)

9. **Check payment status updated:**
   - Stripe Dashboard → Payments → Click refunded payment
   - Status: **Refunded**
   - Refunded amount: $79.00

#### Verify Database Updated

10. **Check subscription status changed:**
    ```bash
    SELECT subscription_status FROM user_profiles WHERE clerk_user_id = 'user_XXX';
    # Should be: 'canceled' or 'past_due' (depending on webhook handling)
    ```

---

## ✅ SUCCESS CRITERIA

All checkboxes must be ✅ before marking production LIVE:

- [ ] Checkout page loaded without "test mode" banner
- [ ] Payment succeeded with test card 4242...
- [ ] User redirected to success page
- [ ] 3 webhook events received (checkout.session.completed, subscription.created, invoice.payment_succeeded)
- [ ] All webhook events returned 200 OK
- [ ] Customer created in Stripe Dashboard
- [ ] Subscription created with status "Active"
- [ ] Payment logged in Stripe ($79 or $49)
- [ ] Database record created (subscription_tier='pro', status='active')
- [ ] Refund processed successfully
- [ ] Refund webhook received (charge.refunded)
- [ ] Subscription cancelled in database

**IF ALL ✅:** Production payments are LIVE and ready for real customers! 🎉

---

## 🔥 TROUBLESHOOTING

### Issue: Checkout shows "test mode" banner

**Cause:** Vercel env vars not updated or cached
**Fix:**
1. Verify Vercel env vars: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
2. Redeploy: `vercel --prod` or push to GitHub
3. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue: Webhook event returns 401 Unauthorized

**Cause:** Webhook secret mismatch
**Fix:**
1. Go to Stripe Dashboard → Webhooks → Click endpoint
2. Click "Signing secret" → Reveal
3. Copy `whsec_...` value
4. Update Vercel: `STRIPE_WEBHOOK_SECRET=whsec_...`
5. Redeploy

### Issue: Webhook event returns 500 Internal Server Error

**Cause:** Code error in webhook handler
**Fix:**
1. Click webhook event → View request/response
2. Check response body for error stack trace
3. Check Sentry or server logs for full error
4. Common issues:
   - Database connection failed
   - Missing env var (ANTHROPIC_API_KEY, etc.)
   - Prisma schema mismatch
5. Fix code, redeploy, retry webhook (click "Resend" in Stripe)

### Issue: Payment succeeded but database not updated

**Cause:** Webhook not received or failed silently
**Fix:**
1. Check webhook events in Stripe Dashboard
2. If event shows 200 OK but DB not updated:
   - Check webhook handler code logic
   - Verify `switch (event.type)` handles `checkout.session.completed`
   - Check DB connection is active
3. If event not received at all:
   - Verify webhook endpoint URL is correct
   - Check firewall/network not blocking Stripe IPs
   - Test webhook with Stripe CLI: `stripe trigger checkout.session.completed`

### Issue: Card declined (real card, not test card)

**Cause:** Using real card in production
**Fix:**
1. **FOR TESTING:** Use test card `4242 4242 4242 4242` ONLY
2. **FOR REAL CUSTOMERS:** Their real cards should work if:
   - Sufficient funds
   - Not flagged by bank
   - 3D Secure enabled if required

---

## 📊 POST-TEST MONITORING

After successful test + refund, monitor production for 24 hours:

### Metrics to Watch

1. **Stripe Dashboard:**
   - New customers created
   - Successful payments
   - Failed payments (should be 0%)
   - Disputed payments (should be 0%)

2. **Webhook Health:**
   - All events returning 200 OK
   - Webhook latency <2 seconds
   - No 4xx or 5xx errors

3. **Database Consistency:**
   - `subscription_status` matches Stripe
   - No orphan records (customer in Stripe but not in DB)
   - Timestamps accurate

4. **User Experience:**
   - Checkout page loads <3 seconds
   - No JavaScript errors in browser console
   - Success page shows immediately after payment

---

## 🎯 NEXT STEPS AFTER SUCCESSFUL TEST

1. **Announce production readiness:**
   - Update Product Hunt launch plan
   - Enable marketing campaigns (Google Ads, SEO)
   - Send email to waitlist: "We're live!"

2. **Monitor first real customer:**
   - Watch Stripe Dashboard for first real payment
   - Manually verify their subscription activated
   - Send welcome email with onboarding guide

3. **Set up revenue alerts:**
   - Stripe email notifications: failed payments, disputes
   - Sentry alerts: webhook errors, API failures
   - Daily revenue report: MRR, churn rate, LTV

4. **Revenue tracking:**
   - First $100: Validate product-market fit
   - First $1,000: Expand marketing spend
   - First $10,000: Hire support team

---

## 📝 TEST RESULTS LOG

**Date:** _____________
**Tester:** _____________
**Environment:** Production (https://taxbridgecpa.com)

| Step | Status | Notes |
|------|--------|-------|
| Checkout loaded | ✅ / ❌ | |
| Payment succeeded | ✅ / ❌ | |
| Webhook received | ✅ / ❌ | |
| DB updated | ✅ / ❌ | |
| Refund successful | ✅ / ❌ | |

**Overall Result:** PASS / FAIL

**Issues Found:** _____________

**Action Items:** _____________

---

**READY TO GO LIVE?**

✅ All tests passed → **Payments are LIVE! Start marketing! 🚀**
❌ Any test failed → **Debug issues before enabling marketing.**
