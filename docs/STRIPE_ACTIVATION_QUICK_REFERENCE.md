# Stripe Production Activation - Quick Reference

**Status:** 🔴 CRITICAL - Blocking all revenue
**Time to Fix:** 2-4 hours
**Last Updated:** March 19, 2026

---

## 🎯 Goal

Replace placeholder Stripe keys with real production keys to enable revenue.

---

## 📋 Quick Checklist

- [ ] Step 1: Login to Stripe dashboard (5 min)
- [ ] Step 2: Get production API keys (5 min)
- [ ] Step 3: Create webhook endpoint (15 min)
- [ ] Step 4: Create production price ID (15 min)
- [ ] Step 5: Update Vercel env vars (30 min)
- [ ] Step 6: Test payment flow (30 min)
- [ ] Step 7: Verify revenue tracking (15 min)
- [ ] Step 8: Document with screenshots (15 min)

**Total:** ~2 hours

---

## 📖 Step-by-Step Guide

### Step 1: Login to Stripe Dashboard (5 min)

1. Go to: https://dashboard.stripe.com
2. Login with your Stripe account
3. **IMPORTANT:** Switch to "Live Mode" (toggle in top-right corner)
   - Test mode = gray
   - Live mode = blue/purple

**Screenshot Required:** Dashboard showing "Live Mode" indicator

---

### Step 2: Get Production API Keys (5 min)

1. Click: **Developers** (left sidebar)
2. Click: **API Keys** (sub-menu)
3. Ensure "Live Mode" is selected (top-right)
4. Copy two keys:
   - **Secret key:** `sk_live_51...` (click "Reveal test key" button)
   - **Publishable key:** `pk_live_51...`

**⚠️ WARNING:** Keep secret key private. Never commit to git.

**Screenshot Required:** API Keys page showing live mode keys (redact secret key)

---

### Step 3: Create Webhook Endpoint (15 min)

1. Click: **Developers** → **Webhooks** (left sidebar)
2. Click: **+ Add endpoint** button
3. Enter:
   - **Endpoint URL:** `https://taxbridge.vercel.app/api/webhooks/stripe`
   - **Description:** "TaxBridge Production Webhook"
4. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click: **Add endpoint**
6. Copy: **Signing secret** (starts with `whsec_...`)

**Screenshot Required:** Webhook endpoint page showing all selected events

---

### Step 4: Create Production Price ID (15 min)

1. Click: **Products** (left sidebar)
2. Click: **+ Add product** (or find existing "TaxBridge Annual")
3. Enter:
   - **Name:** TaxBridge Annual Plan
   - **Description:** US-Canada cross-border tax calculator - annual subscription
4. Click: **+ Add another price**
5. Enter:
   - **Price:** $79.00
   - **Billing period:** Yearly
   - **Currency:** USD
6. Click: **Save product**
7. Copy: **Price ID** (starts with `price_...`)

**Screenshot Required:** Product page showing $79/year price

---

### Step 5: Update Vercel Environment Variables (30 min)

**⚠️ IMPORTANT:** Update in **Vercel dashboard**, NOT `.env.production` file.

1. Go to: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
2. For each variable below:
   - Click: **Edit** (pencil icon)
   - Paste: New value
   - Click: **Save**

**Variables to update:**

```bash
# From Step 2 (API Keys)
STRIPE_SECRET_KEY=sk_live_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...

# From Step 3 (Webhook)
STRIPE_WEBHOOK_SECRET=whsec_...

# From Step 4 (Price ID)
STRIPE_BASIC_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_... (same as above)

# If you have Pro plan:
STRIPE_PRO_PRICE_ID=price_... (create another price)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_... (same as above)
```

3. Click: **Redeploy** to apply changes (Deployments → ... → Redeploy)

**Screenshot Required:** Vercel env vars page showing updated Stripe keys (redact values)

---

### Step 6: Test Payment Flow (30 min)

**Use a REAL credit card** (you will be charged $79).

1. Visit: https://taxbridge.vercel.app/pricing
2. Click: **Upgrade to Annual** button
3. Fill in Stripe checkout form:
   - **Email:** your-email@example.com
   - **Card number:** 4242 4242 4242 4242 (test) OR real card
   - **Expiry:** Any future date
   - **CVC:** Any 3 digits
   - **ZIP:** Any 5 digits
4. Click: **Subscribe**
5. Wait for redirect to success page

**Verify in Stripe Dashboard:**

1. Go to: **Customers** (left sidebar)
2. You should see: New customer with your email
3. Click: Customer name
4. Verify: Active subscription for $79/year

**Screenshot Required:**
- Stripe checkout page
- Success page after payment
- Stripe dashboard showing new customer

---

### Step 7: Verify Revenue Tracking (15 min)

Run the automated verification script:

```bash
cd /Users/michaelguo/hivemind-projects/cross-border-tax
npm run verify:stripe:revenue
```

**Expected output:**

```
╔═══════════════════════════════════════════════════════╗
║           STRIPE REVENUE REALITY CHECK               ║
╚═══════════════════════════════════════════════════════╝

📊 MODE: LIVE
📅 Generated: 2026-03-19...

═══ KEY METRICS ═══
💰 MRR (Monthly Recurring Revenue): $6.58
💵 Total Revenue (All-Time): $79.00
👥 Total Customers: 1
✅ Active Subscriptions: 1
```

**Screenshot Required:** Terminal output showing revenue > $0

---

### Step 8: Document with Screenshots (15 min)

1. Save all screenshots to: `docs/screenshots/stripe-activation-YYYYMMDD/`
2. Create verification report:

```bash
touch docs/STRIPE_ACTIVATION_COMPLETE_YYYYMMDD.md
```

3. Add to report:
   - Screenshots
   - Date/time of activation
   - First customer email
   - Revenue metrics
   - Any issues encountered

4. Commit:

```bash
git add -A
git commit -m "[P0-CRITICAL] Stripe Production Activated - Revenue Unblocked + Verification Evidence"
git push origin main
```

---

## ✅ Success Criteria

You're done when ALL these are true:

- [x] Stripe dashboard shows "Live Mode"
- [x] API keys start with `sk_live_` and `pk_live_`
- [x] Webhook endpoint exists at `/api/webhooks/stripe`
- [x] Price ID exists for $79/year plan
- [x] Vercel env vars updated with production keys
- [x] Test payment completed successfully
- [x] Stripe dashboard shows ≥1 customer
- [x] `npm run verify:stripe:revenue` shows MRR > $0
- [x] Screenshots saved to docs/
- [x] Verification report committed to git

---

## 🚨 Common Issues

### Issue: Webhook endpoint fails verification

**Cause:** App not deployed yet, or webhook secret wrong

**Fix:**
1. Ensure app is deployed to Vercel
2. Test webhook manually: `curl https://taxbridge.vercel.app/api/webhooks/stripe`
3. Re-copy webhook signing secret from Stripe dashboard

### Issue: Payment succeeds but MRR still $0

**Cause:** Webhook events not firing, or subscription not yearly

**Fix:**
1. Check Stripe dashboard: **Developers** → **Webhooks** → Click endpoint → **Events**
2. Verify events are being sent
3. Check Vercel logs for webhook processing errors

### Issue: Can't find price ID

**Cause:** Looking at test mode instead of live mode

**Fix:**
1. Switch to "Live Mode" in Stripe dashboard (top-right toggle)
2. Re-navigate to Products
3. Click on TaxBridge Annual product
4. Copy price ID (starts with `price_...`)

---

## 📚 Related Docs

- **Full Revenue Report:** `docs/revenue-report-20260319.md`
- **Executive Summary:** `docs/REVENUE_REPORT_EXECUTIVE_SUMMARY.md`
- **Stripe Setup (Detailed):** `docs/STRIPE_PRODUCTION_SETUP.md`

---

**Owner:** Michael Guo (CEO)
**Urgency:** 🔴 P0-CRITICAL
**Blocks:** $1M revenue target
**Next Step:** Run `npm run verify:stripe:revenue` to verify
