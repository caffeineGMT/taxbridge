# Stripe Production Activation - CTO Deployment Guide

**REVENUE BLOCKER - IMMEDIATE ACTION REQUIRED**

This guide will walk you through activating Stripe live payments in **15 minutes**.

---

## 🎯 Mission: Activate Revenue Generation

**Goal**: Move from test mode → live mode, accept real payments, test checkout flow.

**Time Estimate**: 15-20 minutes

**Risk**: Low (comprehensive testing complete, all infrastructure built)

---

## ✅ Prerequisites (Verify First)

Before starting, ensure:

- [ ] Stripe account fully verified
  - Business details submitted
  - Bank account connected
  - Tax information complete
  - Email verified
- [ ] Domain `taxbridge.app` is live and accessible
- [ ] Vercel project has access to production environment variables
- [ ] You have a real credit card ready for testing (you'll refund it)

---

## 🚀 Activation Steps

### Step 1: Run Production Activation Script (5 min)

```bash
npm run stripe:activate-production
```

This interactive script will:
1. Prompt for your Stripe LIVE API keys
2. Validate your Stripe account
3. Create products ($299 Pro, $2000 Enterprise)
4. Update `.env.production` with configuration

**What you need:**
- Go to https://dashboard.stripe.com/apikeys
- Toggle to **"Production"** mode (top right corner)
- Copy:
  - Secret key: `sk_live_...`
  - Publishable key: `pk_live_...`

**Script prompts:**
```
Enter Stripe LIVE secret key (sk_live_...): [paste key]
Enter Stripe LIVE publishable key (pk_live_...): [paste key]
Enter webhook signing secret (whsec_...) or press Enter to skip: [skip for now]
```

---

### Step 2: Create Webhook Endpoint (3 min)

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. Enter details:
   - **Endpoint URL**: `https://taxbridge.app/api/stripe/webhook`
   - **Events to send**: Select these 6 events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Click **"Add endpoint"**
5. Copy the **Webhook signing secret** (starts with `whsec_...`)

---

### Step 3: Update Vercel Environment Variables (5 min)

#### Option A: Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard
2. Select **TaxBridge** project
3. Go to **Settings → Environment Variables**
4. Add these variables (set environment to **"Production"** only):

```bash
STRIPE_SECRET_KEY=sk_live_[your_key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[your_key]
STRIPE_WEBHOOK_SECRET=whsec_[your_webhook_secret]
STRIPE_PRO_PRICE_ID=price_[from_script_output]
STRIPE_ENTERPRISE_PRICE_ID=price_[from_script_output]
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_[from_script_output]
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_[from_script_output]
NEXT_PUBLIC_APP_URL=https://taxbridge.app
```

**Where to get the price IDs:**
- Check the script output from Step 1
- OR check `.env.production` file
- OR check Stripe Dashboard → Products

#### Option B: Vercel CLI

```bash
vercel env add STRIPE_SECRET_KEY production
# Paste your sk_live_ key when prompted

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Paste your pk_live_ key when prompted

vercel env add STRIPE_WEBHOOK_SECRET production
# Paste your whsec_ secret when prompted

# Add price IDs (get from .env.production or script output)
vercel env add STRIPE_PRO_PRICE_ID production
vercel env add STRIPE_ENTERPRISE_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_PRO_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID production
vercel env add NEXT_PUBLIC_APP_URL production
```

---

### Step 4: Deploy to Production (2 min)

The deployment workflow is now **GitHub-based staging** with **manual Vercel deployment**.

```bash
# DO NOT commit .env.production with real keys
# Verify it's in .gitignore
git status

# Commit the activation scripts
git add scripts/activate-stripe-production.ts
git add scripts/test-live-payment.ts
git add docs/STRIPE_PRODUCTION_ACTIVATION_CTO.md
git commit -m "REVENUE ACTIVATION: Stripe production mode activated"
git push origin main
```

**Manual Vercel Deployment:**
- Go to Vercel Dashboard → Deployments
- Click **"Redeploy"** on the latest deployment
- Select **"Production"** environment
- Verify environment variables are set
- Deploy

---

### Step 5: Test Live Payment Flow (5 min)

Run the automated test script:

```bash
npm run test:live-payment
```

**What this does:**
1. Creates a checkout session ($299 Pro subscription)
2. Opens payment URL in browser (you complete payment manually)
3. Polls for payment completion
4. Verifies webhook processing
5. Offers to refund the payment

**Test procedure:**
1. Script will output a payment URL
2. Open URL in browser
3. Use your **REAL credit card** (test cards won't work)
4. Complete payment
5. Verify redirect to dashboard
6. Script will confirm payment received
7. Accept refund when prompted

**Expected results:**
- ✅ Payment completes successfully
- ✅ Redirect to `/dashboard?upgrade=success`
- ✅ Webhook shows "Succeeded" in Stripe Dashboard
- ✅ Subscription appears in Stripe → Subscriptions
- ✅ Refund processes successfully

---

## 🔍 Verification Checklist

After testing, verify these in **Stripe Dashboard**:

### Payments Tab
- [ ] Payment of $299.00 appears
- [ ] Status: "Succeeded" (or "Refunded" if you refunded)
- [ ] Customer email matches test email

### Subscriptions Tab
- [ ] Subscription created
- [ ] Status: "Active" (or "Canceled" if you cancelled)
- [ ] Plan: TaxBridge Pro - $299/year

### Webhooks Tab
- [ ] Webhook endpoint shows "Enabled"
- [ ] Recent deliveries show "Succeeded" (HTTP 200)
- [ ] Events processed:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `invoice.payment_succeeded`

---

## 🐛 Troubleshooting

### "No such price: price_..."

**Problem**: Using test mode price ID in production

**Solution**:
1. Verify Vercel environment variables use `price_` IDs from Step 1
2. Check Stripe Dashboard → Products for correct price IDs
3. Update Vercel env vars if needed
4. Redeploy

---

### "Webhook signature verification failed"

**Problem**: Webhook secret doesn't match

**Solution**:
1. Go to Stripe Dashboard → Webhooks
2. Click your webhook endpoint
3. Click "Reveal" under "Signing secret"
4. Copy the `whsec_...` value
5. Update `STRIPE_WEBHOOK_SECRET` in Vercel
6. Redeploy

---

### Checkout redirects to success but nothing happens

**Problem**: Webhook not firing or failing

**Solution**:
1. Check Stripe Dashboard → Webhooks → Your endpoint
2. Look at "Recent deliveries" tab
3. If showing errors, click to see details
4. Common issues:
   - Wrong webhook URL (should be `https://taxbridge.app/api/stripe/webhook`)
   - Missing environment variables on server
   - Database connection issue

---

### Using test keys in production

**Problem**: Keys start with `sk_test_` instead of `sk_live_`

**Solution**:
1. Go to Stripe Dashboard
2. Toggle to **"Production"** mode (top right)
3. Copy production keys
4. Update Vercel environment variables
5. Redeploy

---

## 📊 Success Metrics

You'll know production is working when:

- ✅ Real payment completes ($299 charged to your card)
- ✅ User automatically upgraded to Pro tier in database
- ✅ Revenue appears in Stripe Dashboard
- ✅ Webhook logs show "Succeeded" (HTTP 200)
- ✅ Subscription shows "Active" status
- ✅ No errors in Sentry dashboard
- ✅ Refund processes successfully

---

## 🎯 Post-Activation Actions

### Immediate (After Test)
- [ ] Cancel test subscription or refund payment
- [ ] Verify webhook logs in Stripe Dashboard
- [ ] Check Sentry for any errors during test
- [ ] Update team that payments are live

### Within 24 Hours
- [ ] Set up Stripe Radar (fraud prevention)
- [ ] Enable Smart Retries for failed payments
- [ ] Configure Stripe email receipts
- [ ] Set up revenue alerts (email or Slack)

### Within 1 Week
- [ ] Connect Stripe to accounting software (QuickBooks/Xero)
- [ ] Set up daily revenue reports
- [ ] Launch Google Ads campaign
- [ ] Monitor first real customer payments

---

## 🆘 Emergency Support

**Stripe Issues:**
- Dashboard: https://dashboard.stripe.com
- Support: https://support.stripe.com (24/7)

**Vercel Issues:**
- Dashboard: https://vercel.com/dashboard
- Support: https://vercel.com/support

**Critical Bug:**
- Check Sentry: https://sentry.io
- Check server logs in Vercel → Deployments → Functions

---

## 📖 Additional Documentation

- **Full Setup Guide**: `STRIPE_PRODUCTION_SETUP.md`
- **Quick Start (15min)**: `STRIPE_PRODUCTION_QUICKSTART.md`
- **Technical Details**: `STRIPE_PRODUCTION_SUMMARY.md`
- **Deployment Checklist**: `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- **Live Payment Testing**: `docs/LIVE_PAYMENT_TEST_GUIDE.md`

---

## 💰 Revenue Activation Timeline

| Action | Time | Status |
|--------|------|--------|
| Run activation script | 5 min | ⏳ Pending |
| Create webhook | 3 min | ⏳ Pending |
| Update Vercel env vars | 5 min | ⏳ Pending |
| Deploy to production | 2 min | ⏳ Pending |
| Test live payment | 5 min | ⏳ Pending |
| **TOTAL** | **20 min** | **Ready to activate** |

---

## ✅ Final Checklist

Before declaring "Revenue Activated":

- [ ] Activation script completed successfully
- [ ] Webhook endpoint created and verified
- [ ] All Vercel environment variables set
- [ ] Production deployment complete
- [ ] Live payment test passed
- [ ] Refund test passed
- [ ] Stripe Dashboard shows correct data
- [ ] No errors in Sentry
- [ ] `.env.production` NOT committed to GitHub

---

## 🚀 Ready to Activate Revenue?

**Next command:**

```bash
npm run stripe:activate-production
```

**This is the only blocker to accepting real payments.**

Once complete, TaxBridge will be **REVENUE-READY** 💰

---

**Last Updated**: March 19, 2026
**Status**: ✅ Ready for Production
**Blocker**: None - All infrastructure built
**Risk**: Low - Comprehensive testing complete
**Time to Revenue**: 20 minutes
