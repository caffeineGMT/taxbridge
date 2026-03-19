# ✅ STRIPE PRODUCTION ACTIVATION CHECKLIST

**Created:** March 19, 2026
**Status:** 🔴 NOT STARTED - 26/26 placeholders remain
**Timeline:** 2-3 hours
**Impact:** Unblocks $500-$2,000 MRR potential

---

## 🎯 QUICK START (5 minutes)

```bash
# 1. Check current status
npm run verify:env-placeholders

# 2. Launch interactive assistant
npm run activate:stripe

# 3. Follow the guided prompts
```

---

## 📋 MANUAL CHECKLIST

### PHASE 1: Stripe API Keys (15 min) ⬜

- [ ] **1.1** Go to https://dashboard.stripe.com/apikeys
- [ ] **1.2** Toggle to **"Production"** mode (top-right)
- [ ] **1.3** Copy Secret Key: `sk_live_51...`
- [ ] **1.4** Copy Publishable Key: `pk_live_51...`
- [ ] **1.5** Save keys in secure note/password manager

---

### PHASE 2: Create Products & Prices (30 min) ⬜

**Option A - Automated (RECOMMENDED):**

```bash
# Set your live key
export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_HERE

# Run creation script
npm run activate:stripe-production

# Copy output price IDs to clipboard
```

- [ ] **2.1** Run automated script above
- [ ] **2.2** Copy `STRIPE_BASIC_PRICE_ID` from output
- [ ] **2.3** Copy `STRIPE_PRO_PRICE_ID` from output
- [ ] **2.4** Copy `STRIPE_ENTERPRISE_PRICE_ID` from output
- [ ] **2.5** Verify products visible at https://dashboard.stripe.com/products

**Option B - Manual (if script fails):**

- [ ] **2.1** Go to https://dashboard.stripe.com/products
- [ ] **2.2** Create "TaxBridge Basic" product - $49/year
- [ ] **2.3** Create "TaxBridge Pro" product - $79/year
- [ ] **2.4** Create "TaxBridge Enterprise" product - Custom
- [ ] **2.5** Copy all price IDs

---

### PHASE 3: Webhook Setup (30 min) ⬜

- [ ] **3.1** Go to https://dashboard.stripe.com/webhooks
- [ ] **3.2** Click "Add endpoint"
- [ ] **3.3** Endpoint URL: `https://taxbridgecpa.com/api/stripe/webhook`
- [ ] **3.4** Select events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] **3.5** Click "Add endpoint"
- [ ] **3.6** Copy webhook signing secret: `whsec_...`

---

### PHASE 4: Update Vercel (30 min) ⬜

- [ ] **4.1** Go to https://vercel.com/your-team/cross-border-tax/settings/environment-variables
- [ ] **4.2** Add/Update these for **Production** environment:

#### Stripe API Keys:
- [ ] `STRIPE_SECRET_KEY` = sk_live_51...
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_live_51...
- [ ] `STRIPE_WEBHOOK_SECRET` = whsec_...

#### Stripe Price IDs:
- [ ] `STRIPE_BASIC_PRICE_ID` = price_...
- [ ] `NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID` = price_...
- [ ] `STRIPE_PRO_PRICE_ID` = price_...
- [ ] `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` = price_...
- [ ] `STRIPE_ENTERPRISE_PRICE_ID` = prod_...
- [ ] `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` = prod_...

- [ ] **4.3** Verify all variables saved successfully
- [ ] **4.4** Go to Deployments tab
- [ ] **4.5** Click "Redeploy" on latest deployment
- [ ] **4.6** Wait for deployment to complete (~2-3 min)

---

### PHASE 5: Test Payment (30 min) ⬜

**Test Card (WILL NOT CHARGE REAL MONEY):**
- Card: `4242 4242 4242 4242`
- Expiry: `12/28`
- CVC: `123`
- ZIP: `12345`

**Steps:**
- [ ] **5.1** Go to https://taxbridgecpa.com/pricing
- [ ] **5.2** Click "Get Started" on Pro plan
- [ ] **5.3** Enter test card above and complete checkout
- [ ] **5.4** Verify payment in Stripe Dashboard:
  - [ ] Go to https://dashboard.stripe.com/payments
  - [ ] Find $79.00 payment
  - [ ] Status = "Succeeded"
- [ ] **5.5** Verify webhook:
  - [ ] Go to https://dashboard.stripe.com/webhooks
  - [ ] Click your endpoint
  - [ ] See `checkout.session.completed` event
- [ ] **5.6** **REFUND test payment:**
  - [ ] Click payment → "Refund"
  - [ ] Full refund
  - [ ] Verify refund completes

---

### PHASE 6: Verification (10 min) ⬜

```bash
# Run automated verification
npm run verify:env-placeholders

# Expected: All Stripe checks pass (9/9 ✅)
```

- [ ] **6.1** All Stripe env vars show ✅
- [ ] **6.2** No "YOUR_" or "sk_test_" placeholders remain
- [ ] **6.3** Test payment succeeded and refunded
- [ ] **6.4** Webhook events logged correctly

---

## ✅ SUCCESS CRITERIA

After completing all phases, you should have:

- [x] ✅ Stripe Dashboard shows "Production mode" badge
- [x] ✅ 3 products created (Basic, Pro, Enterprise)
- [x] ✅ 9 environment variables updated in Vercel
- [x] ✅ Webhook endpoint configured and verified
- [x] ✅ Test payment of $79 processed and refunded
- [x] ✅ `npm run verify:env-placeholders` shows 9/9 Stripe ✅
- [x] 💰 **REVENUE UNBLOCKED**

---

## 🚨 COMMON ERRORS

### ❌ "Invalid API Key"
**Fix:** Re-copy key from Production mode (not Test mode) in Stripe Dashboard

### ❌ "Price not found"
**Fix:** Run `npm run activate:stripe-production` again with correct live key

### ❌ "Webhook signature verification failed"
**Fix:** Re-copy `whsec_` secret from webhook settings, update Vercel

### ❌ "Vercel deployment failed"
**Fix:** Check deployment logs at https://vercel.com/your-team/cross-border-tax/deployments

---

## 📊 PROGRESS TRACKER

| Phase | Status | Time | Notes |
|-------|--------|------|-------|
| 1. API Keys | ⬜ Not Started | 15 min | |
| 2. Products | ⬜ Not Started | 30 min | |
| 3. Webhook | ⬜ Not Started | 30 min | |
| 4. Vercel | ⬜ Not Started | 30 min | |
| 5. Test | ⬜ Not Started | 30 min | |
| 6. Verify | ⬜ Not Started | 10 min | |
| **TOTAL** | **⬜ 0/6** | **2h 25m** | |

---

## 🆘 NEED HELP?

**Resources:**
- 📚 Full Guide: `docs/STRIPE_PRODUCTION_ACTIVATION_COMPLETE.md`
- 🔍 Verification: `npm run verify:env-placeholders`
- 🚀 Interactive: `npm run activate:stripe`
- 🧪 Test Payment: `npm run test:live-payment`

**Stripe Support:**
- Dashboard: https://dashboard.stripe.com
- API Logs: https://dashboard.stripe.com/logs
- Docs: https://stripe.com/docs/payments

**Vercel Support:**
- Logs: https://vercel.com/your-team/cross-border-tax/logs
- Env Vars: https://vercel.com/your-team/cross-border-tax/settings/environment-variables

---

**Last Updated:** March 19, 2026
**Estimated Completion:** Add 2-3 hours to current time
**Blocker Since:** Sprint 01 (6 sprints ago)
**Revenue Impact:** $500-$2,000 MRR potential unlocked
