# REVENUE SMOKE TEST - QUICK REFERENCE CARD

**Print this page and check off items as you complete them**

---

## ⚠️ CURRENT STATUS

```
🔴 BLOCKED - Stripe Not Activated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Cannot execute revenue test until
   Stripe production mode is live
```

**Test Attempted:** March 19, 2026, 15:11 UTC
**Test Result:** ❌ FAILED at prerequisites check
**Reason:** All 5 Stripe environment variables are placeholders

---

## 📋 ACTIVATION CHECKLIST

### Phase 1: Stripe Setup (15 min)

- [ ] **Get Live API Keys** (3 min)
  - Go to: https://dashboard.stripe.com/apikeys
  - Toggle: **Production mode** (top-left)
  - Copy: `pk_live_51...` (publishable key)
  - Copy: `sk_live_51...` (secret key)
  - ✅ Store securely

- [ ] **Create Products** (5 min)
  ```bash
  export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY
  cd /Users/michaelguo/hivemind-projects/cross-border-tax
  npx tsx scripts/activate-stripe-production-annual.ts
  ```
  - ✅ Script completes successfully
  - ✅ Copy price IDs from output:
    - Basic: `price_1...` (for $49/year)
    - Pro: `price_1...` (for $79/year)
    - Enterprise: `prod_1...` (custom)

- [ ] **Create Webhook** (5 min)
  - Go to: https://dashboard.stripe.com/webhooks
  - Click: **"Add endpoint"**
  - URL: `https://taxbridgecpa.com/api/stripe/webhook`
  - Events (select these 7):
    - [x] `checkout.session.completed`
    - [x] `customer.subscription.created`
    - [x] `customer.subscription.updated`
    - [x] `customer.subscription.deleted`
    - [x] `invoice.payment_succeeded`
    - [x] `invoice.payment_failed`
    - [x] `charge.refunded`
  - ✅ Copy webhook secret: `whsec_...`

### Phase 2: Vercel Configuration (10 min)

- [ ] **Update Environment Variables** (8 min)
  - Go to: Vercel Dashboard → Project → Settings → Environment Variables
  - Set scope: **Production only**
  - Add these 9 variables:

  ```
  STRIPE_SECRET_KEY=sk_live_51...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...
  STRIPE_WEBHOOK_SECRET=whsec_...
  STRIPE_BASIC_PRICE_ID=price_1...
  NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_1...
  STRIPE_PRO_PRICE_ID=price_1...
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1...
  STRIPE_ENTERPRISE_PRICE_ID=prod_1...
  NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=prod_1...
  ```

- [ ] **Redeploy Production** (2 min)
  ```bash
  git commit --allow-empty -m "Trigger production redeploy after Stripe activation"
  git push origin main
  ```
  - ✅ Wait for Vercel deployment to complete
  - ✅ Verify deployment succeeded (green checkmark)

### Phase 3: Test Execution (30 min)

- [ ] **Run Revenue Smoke Test**
  ```bash
  npx tsx scripts/end-to-end-revenue-smoke-test.ts
  ```

- [ ] **Step 1: Prerequisites** (Automated)
  - ✅ All environment variables present
  - ✅ Stripe in LIVE mode
  - ✅ Database connection works
  - ✅ Production site accessible

- [ ] **Step 2: Calculator** (Manual)
  - Go to: https://taxbridgecpa.com
  - Complete calculator with realistic values:
    - US Income: $150,000
    - RSU Value: $50,000
    - Filing Status: Single
    - Days in Canada: 180
  - ✅ Results page loads

- [ ] **Step 3: Signup** (Manual)
  - Click "Sign Up"
  - Email: `test+revenue@taxbridgecpa.com` (or your real email)
  - Password: (strong password)
  - ✅ Account created
  - ✅ Redirected to dashboard

- [ ] **Step 4: Checkout** (Manual + Automated)
  - Go to: https://taxbridgecpa.com/pricing
  - Click: "Subscribe to Pro - $79/year"
  - Payment details:
    - Card: `4242 4242 4242 4242`
    - Expiry: `12/28`
    - CVC: `123`
    - ZIP: `12345`
  - ✅ Payment succeeds
  - ✅ Redirected to success page

- [ ] **Step 5: Webhook Verification** (Guided)
  - Open: https://dashboard.stripe.com/webhooks
  - Click your endpoint
  - Verify these events (last 2 min):
    - [x] `checkout.session.completed` (200 OK)
    - [x] `customer.subscription.created` (200 OK)
    - [x] `invoice.payment_succeeded` (200 OK)

- [ ] **Step 6: Access Verification** (Automated)
  - Script checks database
  - ✅ User subscription tier = 'pro'
  - ✅ Subscription status = 'active'
  - ✅ Stripe customer ID saved

- [ ] **Step 7: Refund** (Automated)
  - Script issues full refund via Stripe API
  - ✅ Refund succeeds
  - ✅ Webhook `charge.refunded` received (200 OK)
  - ✅ User subscription status updated

- [ ] **Step 8: Report** (Automated)
  - ✅ Test report generated
  - ✅ All steps passed
  - ✅ Revenue testing complete

---

## ✅ SUCCESS CRITERIA

All checkboxes must be ✅ before marking revenue LIVE:

- [ ] Stripe Dashboard shows "Production mode" (not test)
- [ ] All 9 Vercel environment variables set
- [ ] Checkout page loads without "test mode" banner
- [ ] Test payment succeeds with card 4242...
- [ ] 3 webhooks received (checkout.session.completed, subscription.created, invoice.payment_succeeded)
- [ ] All webhook events returned 200 OK
- [ ] Database updated (tier='pro', status='active')
- [ ] Refund processed successfully
- [ ] Refund webhook received (charge.refunded → 200 OK)

**All ✅ = REVENUE IS LIVE! 🚀**

---

## ⏱️ TIMELINE

| Milestone | Duration | Cumulative |
|-----------|----------|------------|
| Get Stripe keys | 3 min | 3 min |
| Create products | 5 min | 8 min |
| Create webhook | 5 min | 13 min |
| Update Vercel vars | 8 min | 21 min |
| Redeploy production | 2 min | 23 min |
| **✅ UNBLOCKED** | | **23 min** |
| Run test | 30 min | 53 min |
| **✅ COMPLETE** | | **~1 hour** |

---

## 🆘 TROUBLESHOOTING

### Issue: "Missing environment variables" error
**Fix:** Verify Vercel environment variables are set to **Production** scope (not Preview)

### Issue: "Stripe is in TEST mode" error
**Fix:** Ensure keys start with `sk_live_` and `pk_live_` (NOT `sk_test_`, `pk_test_`)

### Issue: Webhook returns 401 Unauthorized
**Fix:** Verify `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard → Webhooks

### Issue: Payment succeeds but database not updated
**Fix:** Check webhook events in Stripe Dashboard - should show 200 OK. If 4xx/5xx, check server logs.

---

## 📁 SUPPORTING DOCUMENTS

- Full Status Report: `docs/REVENUE_SMOKE_TEST_STATUS_REPORT.md`
- Activation Guide: `docs/STRIPE_PRODUCTION_CTO_CHECKLIST.md`
- Testing Guide: `docs/STRIPE_PRODUCTION_TESTING_GUIDE.md`
- Webhook Guide: `docs/STRIPE_WEBHOOK_VERIFICATION.md`

---

## 🎯 NEXT STEPS AFTER SUCCESS

1. **Announce:** Post in team Slack - "Revenue testing complete, payments are LIVE! 🚀"
2. **Monitor:** Watch Stripe Dashboard for first real customer payment
3. **Marketing:** Activate Product Hunt launch (scheduled March 25)
4. **Support:** Set up Stripe email alerts for failed payments/disputes

---

**Printed:** ________________ (Date)
**Executed By:** ________________ (Name)
**Start Time:** ________________
**End Time:** ________________
**Result:** PASS / FAIL

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
