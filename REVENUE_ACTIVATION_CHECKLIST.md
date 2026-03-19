# 🚀 REVENUE ACTIVATION QUICK CHECKLIST

> **TL;DR**: Stripe is in TEST MODE. Follow this 30-minute checklist to activate production payments.

## ⚡️ FAST PATH (30 minutes)

### ✅ PRE-FLIGHT
- [ ] Stripe account verified (business details complete)
- [ ] Access to Stripe Dashboard (https://dashboard.stripe.com)
- [ ] Access to Vercel Dashboard (https://vercel.com/dashboard)

---

### 🔐 STEP 1: Get API Keys (5 min)

**Stripe Dashboard** → **Developers** → **API keys**

1. Toggle to **PRODUCTION MODE** (top-right, should show green dot)
2. Reveal and copy:
   ```
   Secret key: sk_live_51...
   Publishable key: pk_live_...
   ```
3. Save in password manager (**DO NOT commit to git**)

---

### 💰 STEP 2: Create Products (5 min)

**Local terminal**:
```bash
# Add live keys to .env.local
cat > .env.local << EOF
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_KEY
EOF

# Run automated setup
npm run setup:stripe
```

**Copy these from output**:
```
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx
```

---

### 🎣 STEP 3: Configure Webhook (5 min)

**Stripe Dashboard** → **Developers** → **Webhooks** → **Add endpoint**

```
Endpoint URL: https://taxbridge.app/api/stripe/webhook

Events to send:
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_succeeded
✅ invoice.payment_failed
```

**Copy webhook secret**:
```
whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

### ☁️ STEP 4: Update Vercel (10 min)

**Vercel Dashboard** → **Project** → **Settings** → **Environment Variables**

Add **7 variables** (Production only):

| Variable | Value | Source |
|----------|-------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Step 1 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Step 1 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Step 3 |
| `STRIPE_PRO_PRICE_ID` | `price_...` | Step 2 |
| `STRIPE_ENTERPRISE_PRICE_ID` | `price_...` | Step 2 |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | `price_...` | Step 2 (same as above) |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | `price_...` | Step 2 (same as above) |

---

### 🚀 STEP 5: Deploy (5 min)

```bash
git commit --allow-empty -m "Activate Stripe production mode"
git push origin main
```

Wait for Vercel deployment (~2-3 minutes)

---

## ✅ VERIFICATION (15 minutes)

### Test 1: Run Verification Script
```bash
npm run verify:revenue
```

**Expected**: `🎉 VERDICT: READY FOR REVENUE`

---

### Test 2: Live Payment Test
1. Go to https://taxbridge.app/pricing
2. Click "Start Pro Plan"
3. Use **test card**: `4242 4242 4242 4242`
4. Complete checkout
5. Verify:
   - ✅ Checkout succeeds
   - ✅ Redirects to dashboard
   - ✅ Shows "Pro" tier
6. **Cancel immediately** (Settings → Billing → Cancel)

---

### Test 3: Webhook Verification
**Stripe Dashboard** → **Webhooks** → Click endpoint → Recent events

Find `checkout.session.completed` from test:
- Status should show **"Succeeded"** ✅

---

### Test 4: Database Check
```bash
sqlite3 data/taxbridge.db "SELECT email, subscription_tier FROM user_profiles WHERE subscription_tier = 'pro';"
```

**Expected**: Your test email with `pro` tier

---

## 🎉 SUCCESS CRITERIA

✅ Verification script passes
✅ Test payment succeeds
✅ Webhook shows "Succeeded"
✅ Database shows subscription

**When all ✅ → READY FOR REVENUE!**

---

## 🚨 TROUBLESHOOTING

### Issue: "No such price: price_xxx"
**Fix**: Price ID doesn't exist in live mode
1. Check Stripe Dashboard → Products
2. Copy correct live price ID
3. Update Vercel environment variables

### Issue: "Invalid API Key"
**Fix**: Using test key in production
1. Verify Vercel env var starts with `sk_live_`
2. If `sk_test_`, replace with live key
3. Redeploy

### Issue: "Webhook signature verification failed"
**Fix**: Wrong webhook secret
1. Verify webhook URL: `https://taxbridge.app/api/stripe/webhook`
2. Copy correct signing secret from Stripe Dashboard
3. Update Vercel `STRIPE_WEBHOOK_SECRET`

---

## 📁 DETAILED DOCS

- **Full guide**: `docs/STRIPE_PRODUCTION_SETUP.md` (comprehensive walkthrough)
- **Verification report**: `REVENUE_VERIFICATION_GATE_REPORT.md` (technical details)

---

## ⏱️ TIMELINE

| Task | Duration |
|------|----------|
| Pre-flight checks | 2 min |
| Get API keys | 5 min |
| Create products | 5 min |
| Configure webhook | 5 min |
| Update Vercel | 10 min |
| Deploy | 5 min |
| Verification | 15 min |
| **TOTAL** | **47 min** |

---

**Last Updated**: March 19, 2026
**Status**: ⏸️ PENDING ACTIVATION
