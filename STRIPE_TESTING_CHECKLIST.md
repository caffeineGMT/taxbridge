# Stripe Integration Testing Checklist

## Pre-Deployment Validation ✅

This checklist validates the end-to-end Stripe payment integration for TaxBridge. Use this before deploying to production.

---

## 🔧 1. Configuration Setup

### Test Mode Setup (Development/Staging)
- [ ] Create Stripe account (test mode)
- [ ] Get test API keys from Stripe Dashboard
- [ ] Update `.env.local` with real Stripe test keys:
  ```bash
  STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXX
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXX
  STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXX
  ```
- [ ] Create products in Stripe Dashboard:
  - [ ] Pro Plan: $299/year annual subscription
  - [ ] Enterprise Plan: $2,000/year annual subscription
- [ ] Update price IDs in `.env.local`:
  ```bash
  STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXX
  STRIPE_ENTERPRISE_PRICE_ID=price_XXXXXXXXXXXX
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXX
  NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_XXXXXXXXXXXX
  ```

### Live Mode Setup (Production)
- [ ] Switch to live mode in Stripe Dashboard
- [ ] Get live API keys
- [ ] Update Vercel environment variables with live keys
- [ ] Create live products (same pricing as test mode)
- [ ] Update live price IDs in Vercel env vars

---

## 🧪 2. Automated Validation

Run the automated validation script:

```bash
npm run validate:stripe
```

**Expected Results:**
- ✅ All configuration checks pass
- ✅ Database schema is correct (31 fields in `user_profiles`)
- ✅ Webhook event handlers are configured
- ✅ Access gates are working
- ✅ Error handling is robust
- ✅ Analytics integration is active

**Pass Threshold:** 95%+ (only acceptable failures are placeholder API keys in local dev)

---

## 💳 3. Checkout Flow Testing

### Test Case 1: Pro Plan Purchase (Logged In User)
- [ ] Navigate to `/pricing` page
- [ ] Click "Start Pro Trial" button
- [ ] Verify Stripe Checkout page loads
- [ ] Verify correct product name: "TaxBridge Pro - Annual"
- [ ] Verify correct price: $299.00
- [ ] Complete test payment using card: `4242 4242 4242 4242`
- [ ] Verify redirect to `/dashboard?upgrade=success`
- [ ] Check database: `subscription_tier` = 'pro'
- [ ] Check database: `stripe_customer_id` is set
- [ ] Check database: `stripe_subscription_id` is set
- [ ] Check database: `subscription_status` = 'active'

### Test Case 2: Enterprise Plan Purchase
- [ ] Click "Contact Sales" button
- [ ] Verify email client opens with correct address
- [ ] (Optional) Complete manual upgrade via Stripe Dashboard

### Test Case 3: Purchase with Referral Code
- [ ] Add `?ref=TEST_PARTNER` to URL
- [ ] Verify referral code is stored in localStorage
- [ ] Complete Pro plan purchase
- [ ] Check database: `referred_by` = 'TEST_PARTNER'
- [ ] Check `affiliate_referrals` table for commission record

### Test Case 4: Free Tier User (Not Logged In)
- [ ] Log out completely
- [ ] Click "Start Pro Trial"
- [ ] Verify redirect to `/sign-up`
- [ ] Complete signup flow
- [ ] Verify checkout session resumes after signup

### Test Case 5: Cancel During Checkout
- [ ] Start checkout flow
- [ ] Click "Back" or close the Stripe Checkout page
- [ ] Verify redirect to `/pricing?upgrade=cancelled`
- [ ] Verify no subscription created in database
- [ ] Verify user remains on 'free' tier

---

## 🔔 4. Webhook Testing

### Setup Webhook Endpoint
1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy webhook signing secret to `.env.local`

### Test Case 1: Successful Subscription Creation
- [ ] Complete a test purchase
- [ ] In Stripe Dashboard → Developers → Webhooks → [Your endpoint]
- [ ] Verify `checkout.session.completed` event was sent
- [ ] Verify response: `200 OK`
- [ ] Check database: user upgraded to paid tier
- [ ] Check `analytics_events` table for 'upgraded_to_pro' event

### Test Case 2: Subscription Updated
- [ ] In Stripe Dashboard, update a subscription (change plan, add trial)
- [ ] Verify `customer.subscription.updated` webhook fires
- [ ] Check database: `subscription_status` updated
- [ ] Check database: `subscription_current_period_end` updated

### Test Case 3: Subscription Canceled
- [ ] In Stripe Dashboard, cancel a subscription
- [ ] Verify `customer.subscription.deleted` webhook fires
- [ ] Check database: `subscription_tier` = 'free'
- [ ] Check database: `subscription_status` = 'canceled'
- [ ] Check `analytics_events` table for 'downgraded_to_free' event

### Test Case 4: Payment Failed
- [ ] Use test card `4000 0000 0000 0341` (payment fails)
- [ ] Create a subscription with this card
- [ ] Verify `invoice.payment_failed` webhook fires
- [ ] Check database: `subscription_status` = 'past_due'

### Test Case 5: Webhook Signature Verification
- [ ] Send a fake webhook request without valid signature
- [ ] Verify response: `400 Bad Request`
- [ ] Verify error message: "Webhook signature verification failed"

---

## 🚪 5. Access Gate Testing

### Test Case 1: Free Tier RSU Limit
- [ ] Create free tier user account
- [ ] Add 10 RSU entries (the limit)
- [ ] Attempt to add 11th RSU entry
- [ ] Verify error response:
  ```json
  {
    "error": "Free tier limit reached",
    "upgradeRequired": true,
    "currentCount": 10,
    "limit": 10
  }
  ```
- [ ] Verify HTTP status: `403 Forbidden`
- [ ] Upgrade to Pro plan
- [ ] Verify 11th RSU entry now succeeds

### Test Case 2: Pro Tier Access
- [ ] Upgrade user to Pro tier
- [ ] Add unlimited RSU entries (test with 50+)
- [ ] Verify no blocking errors
- [ ] Test FTC optimizer access
- [ ] Test PDF export feature
- [ ] Test CSV bulk import feature

### Test Case 3: Enterprise Tier Access
- [ ] Upgrade user to Enterprise tier
- [ ] Test all Pro features work
- [ ] Test multi-client dashboard access (if implemented)
- [ ] Test API access (if implemented)

---

## ⚠️ 6. Error Handling Testing

### Test Case 1: Invalid Price ID
- [ ] Modify checkout request to use invalid `priceId`
- [ ] Verify error response: `500 Internal Server Error`
- [ ] Verify user-friendly error message shown
- [ ] Verify error logged to console

### Test Case 2: Missing User Profile
- [ ] Delete user profile from database
- [ ] Attempt checkout
- [ ] Verify error: `404 User not found`

### Test Case 3: Network Timeout
- [ ] Throttle network to simulate slow connection
- [ ] Start checkout process
- [ ] Verify loading state shows
- [ ] Verify timeout error handled gracefully

### Test Case 4: Stripe API Rate Limit
- [ ] (Advanced) Trigger Stripe rate limit
- [ ] Verify exponential backoff retry logic
- [ ] Verify user sees helpful message

---

## 📊 7. Analytics Validation

### Check Event Tracking
- [ ] Complete Pro upgrade
- [ ] Query analytics_events table:
  ```sql
  SELECT * FROM analytics_events
  WHERE event_name = 'upgraded_to_pro'
  ORDER BY created_at DESC LIMIT 1;
  ```
- [ ] Verify event includes metadata: `tier`, `stripe_customer_id`

### Check Revenue Tracking
- [ ] Query revenue calculation:
  ```sql
  SELECT
    subscription_tier,
    COUNT(*) as subscribers,
    CASE
      WHEN subscription_tier = 'pro' THEN COUNT(*) * 299
      WHEN subscription_tier = 'enterprise' THEN COUNT(*) * 2000
      ELSE 0
    END as annual_revenue
  FROM user_profiles
  WHERE subscription_tier != 'free'
  GROUP BY subscription_tier;
  ```
- [ ] Verify ARR calculation is correct

---

## 🌐 8. End-to-End Production Test

### Pre-Deployment Checklist
- [ ] All automated tests pass (95%+)
- [ ] All manual checkout flows tested
- [ ] All webhook events tested
- [ ] All access gates validated
- [ ] Error handling verified
- [ ] Analytics tracking confirmed

### Production Deployment Steps
1. [ ] Deploy to Vercel with live Stripe keys
2. [ ] Set up production webhook endpoint
3. [ ] Test with real credit card (refund after test)
4. [ ] Monitor Stripe Dashboard for first real transaction
5. [ ] Verify webhook delivery in production
6. [ ] Check production database for correct updates

### Post-Deployment Monitoring
- [ ] Set up Stripe webhook monitoring alerts
- [ ] Monitor failed payments
- [ ] Track subscription churn rate
- [ ] Monitor MRR/ARR growth
- [ ] Set up error tracking (Sentry, etc.)

---

## 🎯 Success Criteria

**The integration is production-ready when:**

✅ **Automated validation:** 95%+ pass rate
✅ **Checkout flow:** All 5 test cases pass
✅ **Webhooks:** All 5 events handled correctly
✅ **Access gates:** All 3 tiers enforce correctly
✅ **Error handling:** All 4 scenarios handled gracefully
✅ **Analytics:** Events tracked and revenue calculated correctly
✅ **Production test:** Real transaction completes successfully

---

## 📞 Support Resources

**Stripe Documentation:**
- [Testing Cards](https://stripe.com/docs/testing#cards)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Checkout Session](https://stripe.com/docs/api/checkout/sessions)

**Common Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Authentication: `4000 0025 0000 3155`
- Payment Fails: `4000 0000 0000 0341`

**TaxBridge Validation Script:**
```bash
npm run validate:stripe
```

**Database Queries:**
```bash
# Check user subscription status
sqlite3 data/taxbridge.db "SELECT id, email, subscription_tier, subscription_status FROM user_profiles;"

# Check recent analytics events
sqlite3 data/taxbridge.db "SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 10;"

# Check affiliate referrals
sqlite3 data/taxbridge.db "SELECT * FROM affiliate_referrals ORDER BY created_at DESC LIMIT 10;"
```

---

## ✅ Testing Sign-Off

**Tester:** ___________________
**Date:** ___________________
**Environment:** [ ] Test Mode [ ] Live Mode
**Pass Rate:** ______%
**Notes:** ___________________

**Status:** [ ] Ready for Production [ ] Needs Fixes
