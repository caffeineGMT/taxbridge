# Stripe Production Setup Guide

## 🎯 Goal
Move TaxBridge from Stripe test mode to production mode to accept real payments.

## ✅ Prerequisites Checklist

Before starting, ensure you have:
- [ ] Stripe account created at https://stripe.com
- [ ] Business details verified in Stripe Dashboard
- [ ] Bank account connected for payouts
- [ ] Tax information submitted to Stripe
- [ ] Production domain deployed (https://taxbridge.app or https://your-domain.vercel.app)

## 📋 Step-by-Step Setup

### Step 1: Get Stripe Production API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. **Toggle to "Production mode"** (toggle in top-right corner)
3. Click "Reveal live key" for both keys
4. Copy the following keys:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`) ⚠️ Keep this secure!

### Step 2: Create Production Environment File

Create a `.env.production` file in the project root:

```bash
# Copy the template
cp .env.production.template .env.production
```

### Step 3: Add Stripe Live Keys to .env.production

Edit `.env.production` and add your live keys:

```bash
# Stripe Production Keys
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE

# App URL (your production domain)
NEXT_PUBLIC_APP_URL=https://taxbridge.app
```

### Step 4: Create Live Products and Price IDs

Run the setup script to create products in Stripe:

```bash
npm run setup:stripe
```

This will:
- Create "TaxBridge Pro" product ($299/year)
- Create "TaxBridge Enterprise" product ($2,000/year)
- Output price IDs that start with `price_...`

**Copy the output** and add to `.env.production`:

```bash
# Stripe Product Price IDs (from script output)
STRIPE_PRO_PRICE_ID=price_1xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_1xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_1xxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Set Up Webhook Endpoint

Webhooks notify your app when payments succeed/fail.

1. Go to https://dashboard.stripe.com/webhooks
2. Click "+ Add endpoint"
3. **Endpoint URL**: `https://your-domain.vercel.app/api/stripe/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. **Copy the webhook signing secret** (starts with `whsec_...`)

Add to `.env.production`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET_HERE
```

### Step 6: Configure Vercel Environment Variables

**Option A: Via Vercel Dashboard** (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable from `.env.production`:
   - Variable name: `STRIPE_SECRET_KEY`
   - Value: `sk_live_...`
   - Environment: **Production** ✅
   - Click "Save"
5. Repeat for all Stripe variables:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRO_PRICE_ID`
   - `STRIPE_ENTERPRISE_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID`
   - `NEXT_PUBLIC_APP_URL`

**Option B: Via Vercel CLI**

```bash
vercel env add STRIPE_SECRET_KEY production
# Paste: sk_live_...

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Paste: pk_live_...

vercel env add STRIPE_WEBHOOK_SECRET production
# Paste: whsec_...

vercel env add STRIPE_PRO_PRICE_ID production
# Paste: price_...

vercel env add STRIPE_ENTERPRISE_PRICE_ID production
# Paste: price_...

vercel env add NEXT_PUBLIC_STRIPE_PRO_PRICE_ID production
# Paste: price_...

vercel env add NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID production
# Paste: price_...

vercel env add NEXT_PUBLIC_APP_URL production
# Paste: https://taxbridge.app
```

### Step 7: Verify Configuration

Run the verification script:

```bash
npm run verify:stripe
```

Should show:
```
✅ All Stripe configuration checks passed!
🚀 Ready for production deployment.
```

If you see warnings or errors, fix them before deploying.

### Step 8: Deploy to Production

Trigger a new deployment:

```bash
# Option A: Git push (automatic deployment)
git add .
git commit -m "Configure Stripe production mode"
git push origin main

# Option B: Manual deployment via CLI
vercel --prod
```

### Step 9: Test Live Payment Flow

**⚠️ IMPORTANT: Use real credit card for testing**

1. Go to https://taxbridge.app/pricing
2. Click "Start 7-Day Free Trial" on Pro plan
3. Use **real credit card** (Stripe test cards won't work in live mode)
4. **Recommended**: Use a $1 test product first
   - Or use your own card and immediately cancel subscription
5. Verify:
   - ✅ Checkout session redirects to Stripe
   - ✅ Payment succeeds
   - ✅ Redirects to `/dashboard?upgrade=success`
   - ✅ User tier updates to "pro"
   - ✅ Webhook event received (check Stripe dashboard → Developers → Webhooks)

### Step 10: Test Webhook Delivery

1. Go to https://dashboard.stripe.com/webhooks
2. Select your webhook endpoint
3. Find recent `checkout.session.completed` event
4. Check status: Should show "Succeeded" ✅
5. If failed, click event → "Resend"

## 🔍 Verification Checklist

After setup, verify:

- [ ] Production keys are in Vercel environment variables
- [ ] Price IDs match between Stripe dashboard and environment
- [ ] Webhook endpoint shows "Succeeded" status
- [ ] Test payment completes successfully
- [ ] User subscription tier updates in database
- [ ] Email confirmations sent (if configured)
- [ ] Dashboard shows subscription status
- [ ] Pricing page shows correct live price IDs

## 🚨 Troubleshooting

### Error: "No such price: price_1..."

**Cause**: Price ID doesn't exist in live mode (might be test mode ID)

**Fix**:
1. Run `npm run setup:stripe` with live keys
2. Update environment variables with new live price IDs
3. Redeploy

### Error: "Webhook signature verification failed"

**Cause**: Wrong webhook secret or endpoint URL

**Fix**:
1. Check webhook secret in Vercel matches Stripe dashboard
2. Verify endpoint URL is exactly: `https://your-domain.vercel.app/api/stripe/webhook`
3. Redeploy after updating

### Checkout redirects but payment doesn't complete

**Cause**: Webhook not receiving events

**Fix**:
1. Check Stripe dashboard → Developers → Webhooks
2. Verify events are selected: `checkout.session.completed`
3. Test webhook delivery manually
4. Check Vercel function logs for errors

### Users can't subscribe (checkout fails)

**Cause**: Using test keys in production

**Fix**:
1. Verify keys start with `sk_live_` and `pk_live_`
2. Run `npm run verify:stripe`
3. Update Vercel environment variables
4. Redeploy

## 📊 Post-Launch Monitoring

After going live:

1. **Stripe Dashboard**: https://dashboard.stripe.com
   - Monitor payments under "Payments"
   - Check failed payments under "Payments" → Filter: Failed
   - View subscription metrics under "Subscriptions"

2. **Webhook Logs**: https://dashboard.stripe.com/webhooks
   - Ensure all events show "Succeeded"
   - Set up email alerts for failed webhooks

3. **Revenue Tracking**:
   - Connect Stripe to accounting software (QuickBooks, Xero)
   - Enable Stripe Revenue Recognition
   - Set up weekly revenue reports

## 💰 Revenue Expectations

With live payments enabled:

| Plan | Price | Target Customers | MRR Potential |
|------|-------|------------------|---------------|
| Pro | $299/year ($24.92/mo) | H-1B/TN workers | $2,492/month (100 users) |
| Enterprise | $2,000/year ($166.67/mo) | CPAs, accounting firms | $1,667/month (10 clients) |

**First 90 days goal**: 50 Pro + 5 Enterprise = ~$2,100 MRR

## 🎯 Next Steps After Production Launch

1. Set up Stripe Radar for fraud prevention
2. Enable Smart Retries for failed payments
3. Configure dunning emails for failed charges
4. Set up Stripe Tax for automatic sales tax calculation
5. Create customer portal for self-service subscription management

## 📞 Support

If issues arise:
- Stripe Support: https://support.stripe.com
- Check webhook logs: Stripe Dashboard → Developers → Webhooks
- Check Vercel function logs: Vercel Dashboard → Deployments → Functions
