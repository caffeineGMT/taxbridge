# 🚨 STRIPE PRODUCTION MODE ACTIVATION GUIDE

> **REVENUE BLOCKER**: TaxBridge is currently in placeholder mode. This guide will activate live Stripe payments to enable revenue generation.

**Time to complete**: 30 minutes
**Prerequisites**: Stripe account, business verification completed

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Pre-Flight Checklist](#pre-flight-checklist)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Verification & Testing](#verification--testing)
5. [Troubleshooting](#troubleshooting)
6. [Rollback Plan](#rollback-plan)

---

## OVERVIEW

### Current State (Placeholder Mode)
```bash
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE  # ← NOT REAL
```

### Target State (Production Mode)
```bash
STRIPE_SECRET_KEY=sk_live_51A...  # ← REAL LIVE KEY
STRIPE_PRO_PRICE_ID=price_1A...   # ← REAL PRICE IDs
```

### What This Enables
- ✅ Accept real credit card payments
- ✅ Process subscriptions ($29/mo Pro, $199/mo Enterprise)
- ✅ Receive webhook notifications for payment events
- ✅ Track revenue in Stripe Dashboard
- ✅ Enable customer self-service billing portal

---

## PRE-FLIGHT CHECKLIST

Before starting, ensure you have:

### Stripe Account Setup
- [ ] Stripe account created at https://stripe.com
- [ ] Business details verified in Stripe Dashboard
- [ ] Bank account connected for payouts (Settings → Business → Bank accounts)
- [ ] Tax information submitted (Settings → Tax)
- [ ] Email notifications enabled (Settings → Email notifications)

### Production Environment
- [ ] Domain deployed and accessible at `https://taxbridge.app`
- [ ] Vercel account access (https://vercel.com/dashboard)
- [ ] GitHub repository pushed to `main` branch
- [ ] Database deployed and accessible

### Required Access
- [ ] Stripe Dashboard login credentials
- [ ] Vercel Dashboard login credentials
- [ ] Local development environment set up

---

## STEP-BY-STEP SETUP

### STEP 1: Get Stripe Production API Keys

**Location**: https://dashboard.stripe.com/apikeys

1. **Switch to LIVE MODE**
   - Look for the toggle in the top-right corner of Stripe Dashboard
   - It should say "Production" or show a green dot
   - If it says "Test" with an orange dot, click it to switch

2. **Reveal Live Keys**
   - Click "Reveal live key token" for the Secret key
   - Copy both keys:
     - **Publishable key** (starts with `pk_live_...`)
     - **Secret key** (starts with `sk_live_...`)

3. **Save Keys Securely**
   - Store in password manager (1Password, LastPass, etc.)
   - ⚠️ **NEVER commit these to git**
   - ⚠️ **NEVER share these keys publicly**

**Screenshot location**: Look for "API keys" in left sidebar → Developers section

---

### STEP 2: Create Live Products & Price IDs

**Why**: Stripe needs product definitions before you can charge customers.

#### Option A: Automated Setup (Recommended)

1. **Add live keys to local environment**
   ```bash
   # Create .env.local file (not committed to git)
   cat > .env.local << EOF
   STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_HERE
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_KEY_HERE
   EOF
   ```

2. **Run the automated setup script**
   ```bash
   npm run setup:stripe
   ```

3. **Expected output**:
   ```
   🚀 Setting up TaxBridge subscription products...

   Creating Pro Monthly product...
   ✓ Pro product created: prod_xxxxxxxxxxxxx
   ✓ Pro monthly price created: price_xxxxxxxxxxxxx

   Creating Enterprise Monthly product...
   ✓ Enterprise product created: prod_xxxxxxxxxxxxx
   ✓ Enterprise monthly price created: price_xxxxxxxxxxxxx

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ SUCCESS! Add these to your .env.production file:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   STRIPE_PRO_PRICE_ID=price_1AbC123XyZ...
   STRIPE_ENTERPRISE_PRICE_ID=price_1DeF456XyZ...
   NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1AbC123XyZ...
   NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_1DeF456XyZ...
   ```

4. **Copy the price IDs** - you'll need them in Step 4

#### Option B: Manual Setup (Fallback)

If the script fails, create products manually:

1. Go to https://dashboard.stripe.com/products
2. Click "+ Add product"

**For Pro Plan:**
- Name: `TaxBridge Pro`
- Description: `Unlimited RSU entries, FTC optimizer, multi-year dashboard, PDF exports, and priority support`
- Pricing model: `Recurring`
- Price: `$29.00`
- Billing period: `Monthly`
- Click "Save product"
- Copy the Price ID (starts with `price_...`)

**For Enterprise Plan:**
- Name: `TaxBridge Enterprise`
- Description: `All Pro features plus API access, client management, white-label reports, and dedicated support`
- Pricing model: `Recurring`
- Price: `$199.00`
- Billing period: `Monthly`
- Click "Save product"
- Copy the Price ID (starts with `price_...`)

---

### STEP 3: Configure Webhook Endpoint

**Why**: Webhooks notify your app when payments succeed/fail, subscriptions renew, etc.

**Location**: https://dashboard.stripe.com/webhooks

1. **Click "+ Add endpoint"**

2. **Endpoint URL**:
   ```
   https://taxbridge.app/api/stripe/webhook
   ```
   ⚠️ **Critical**: Must be EXACTLY this URL (no trailing slash)

3. **Description** (optional):
   ```
   TaxBridge Production Webhook
   ```

4. **Events to listen for** - Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Click "Add endpoint"**

6. **Copy the Signing Secret**
   - After creating, click on the webhook endpoint
   - Click "Reveal" next to "Signing secret"
   - Copy the secret (starts with `whsec_...`)
   - Save it securely - you'll need it in Step 4

**Webhook Status**: Should show "Enabled" with a green checkmark

---

### STEP 4: Configure Vercel Environment Variables

**Why**: Vercel needs these keys to process payments in production.

**Location**: https://vercel.com/dashboard → Select project → Settings → Environment Variables

#### Variables to Add

For each variable below:
1. Click "Add" or "Add Variable"
2. Enter the **Name** and **Value**
3. Select **Production** environment only
4. Click "Save"

| Variable Name | Value | Example |
|---------------|-------|---------|
| `STRIPE_SECRET_KEY` | From Step 1 | `sk_live_51A...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From Step 1 | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | From Step 3 | `whsec_...` |
| `STRIPE_PRO_PRICE_ID` | From Step 2 | `price_1A...` |
| `STRIPE_ENTERPRISE_PRICE_ID` | From Step 2 | `price_1A...` |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | From Step 2 | `price_1A...` |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | From Step 2 | `price_1A...` |

**Quick Check**: Verify all 7 variables are added and show "Production" tag

---

### STEP 5: Trigger Production Deployment

**Why**: Environment variables only apply to new deployments.

#### Option A: Git Push (Recommended)

```bash
# Add a commit to trigger deployment
git commit --allow-empty -m "Trigger deployment for Stripe production mode"
git push origin main
```

#### Option B: Vercel Dashboard

1. Go to https://vercel.com/dashboard → Select project → Deployments
2. Click "Redeploy" on the latest deployment
3. Select "Use existing Build Cache" → Click "Redeploy"

**Monitor Deployment**:
- Wait for deployment to complete (~2-3 minutes)
- Check for green "Ready" status
- Click "Visit" to view live site

---

## VERIFICATION & TESTING

### STEP 6: Run Verification Script

**Purpose**: Catch configuration errors before going live.

```bash
# Locally (to verify .env.production)
npm run verify:stripe

# Expected output:
✅ All Stripe configuration checks passed!
🚀 Ready for production deployment.
```

**Common Issues**:
- ❌ Using test keys (`sk_test_`) instead of live keys (`sk_live_`)
- ❌ Price ID mismatch between server and client variables
- ❌ Webhook secret missing or invalid

---

### STEP 7: Test Live Payment ($0.01 Test)

**⚠️ CRITICAL**: This uses a REAL credit card and REAL money.

#### Recommended: $0.01 Test Transaction

1. **Create a test product** (temporary):
   - Go to Stripe Dashboard → Products → Add product
   - Name: "Test Payment"
   - Price: $0.01 (one-time payment)
   - Copy the price ID

2. **Modify checkout flow temporarily** (or use Stripe Dashboard)
   - Go to https://dashboard.stripe.com/test/payment-links
   - Create a payment link with the $0.01 product
   - Complete checkout with your own card
   - Immediately refund the $0.01 in Stripe Dashboard

#### Alternative: Full Flow Test

1. Go to https://taxbridge.app/pricing
2. Click "Start Pro Plan" on the $29/month plan
3. Use your own credit card to complete checkout
4. Verify:
   - ✅ Checkout session opens
   - ✅ Payment completes
   - ✅ Redirects to `/dashboard?upgrade=success`
   - ✅ Dashboard shows "Pro" tier
5. Immediately cancel subscription:
   - Go to https://taxbridge.app/settings/billing
   - Click "Cancel Subscription"
   - Confirm cancellation

---

### STEP 8: Verify Webhook Delivery

**Location**: https://dashboard.stripe.com/webhooks

1. Click on your webhook endpoint (`/api/stripe/webhook`)
2. View recent events
3. Find the `checkout.session.completed` event from your test
4. Verify status shows **"Succeeded"** with green checkmark

**If webhook failed**:
1. Click the event → "Resend"
2. Check Vercel function logs:
   - Vercel Dashboard → Deployments → Latest → Functions
   - Look for `/api/stripe/webhook` logs
3. Check for error messages
4. Fix issues (see Troubleshooting section)

---

### STEP 9: Verify Database Update

**Purpose**: Ensure webhooks are updating user subscriptions.

```bash
# Check your database (SQLite example)
sqlite3 data/taxbridge.db "SELECT id, email, subscription_tier, subscription_status FROM user_profiles WHERE subscription_tier != 'free' ORDER BY updated_at DESC LIMIT 5;"
```

**Expected output**:
```
1|your-email@example.com|pro|active
```

**If no records**: Webhook isn't processing. Check Step 8 again.

---

## TROUBLESHOOTING

### Issue: "No such price: price_1..."

**Cause**: Price ID doesn't exist in live mode (you may be using a test mode ID)

**Fix**:
1. Verify you're in Live Mode in Stripe Dashboard
2. Go to Products → Copy the live price IDs
3. Update Vercel environment variables
4. Redeploy

---

### Issue: "Invalid API Key"

**Cause**: Wrong API key or test key in production

**Fix**:
1. Verify Vercel environment variable `STRIPE_SECRET_KEY` starts with `sk_live_`
2. If it starts with `sk_test_`, replace with live key from Step 1
3. Redeploy

---

### Issue: "Webhook signature verification failed"

**Cause**: Wrong webhook secret or endpoint URL

**Fix**:
1. Verify webhook URL is exactly: `https://taxbridge.app/api/stripe/webhook`
2. Verify `STRIPE_WEBHOOK_SECRET` in Vercel matches the one in Stripe Dashboard
3. Check webhook secret is for the CORRECT endpoint (Stripe allows multiple)
4. Redeploy after fixing

---

### Issue: Payment succeeds but user tier doesn't update

**Cause**: Webhook not receiving events or database not updating

**Fix**:
1. Check webhook logs in Stripe Dashboard (should show "Succeeded")
2. Check Vercel function logs for errors
3. Verify database connection string is correct
4. Manually trigger webhook resend from Stripe Dashboard

---

### Issue: Checkout page shows "Error loading checkout"

**Cause**: Invalid price ID or publishable key

**Fix**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in Vercel
3. Verify `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` exists in Stripe Dashboard
4. Clear browser cache and retry

---

## ROLLBACK PLAN

If something goes wrong and you need to revert:

### Immediate Rollback (Stop Revenue Loss)

1. **Disable webhook endpoint**:
   - Go to https://dashboard.stripe.com/webhooks
   - Click your webhook → "..." → Disable

2. **Prevent new subscriptions**:
   - Option A: Archive products in Stripe Dashboard
   - Option B: Add maintenance banner to pricing page

3. **Preserve existing subscriptions**:
   - Do NOT cancel existing subscriptions
   - They will continue to bill normally

### Investigation Mode

1. **Check Vercel logs**:
   ```bash
   vercel logs [deployment-url]
   ```

2. **Check Stripe events**:
   - Dashboard → Developers → Events
   - Filter by failed events

3. **Check database**:
   ```bash
   # Verify subscription records
   SELECT * FROM user_profiles WHERE subscription_status = 'active';
   ```

### Full Revert to Test Mode (Nuclear Option)

⚠️ **Only use if production is completely broken**

1. Switch Vercel environment variables back to test keys
2. Redeploy
3. Notify customers via email
4. Fix issues in staging
5. Re-run this guide from Step 1

---

## POST-ACTIVATION CHECKLIST

After successful activation:

- [ ] Test payment completed successfully
- [ ] Webhook events showing "Succeeded" in Stripe Dashboard
- [ ] User tier updated in database
- [ ] Dashboard shows subscription status correctly
- [ ] Billing portal accessible at `/settings/billing`
- [ ] Cancellation flow works (test → cancel immediately)
- [ ] Email notifications sent (if configured)
- [ ] Revenue appears in Stripe Dashboard
- [ ] MRR/ARR tracking enabled in Stripe Dashboard
- [ ] Customer portal enabled (Settings → Billing → Customer portal)

---

## MONITORING & MAINTENANCE

### Daily Checks (First Week)

1. **Stripe Dashboard** (5 min):
   - Check "Payments" for new subscriptions
   - Check "Failed payments" (should be 0)
   - Check webhook delivery (all should be "Succeeded")

2. **Vercel Logs** (2 min):
   - Check `/api/stripe/webhook` for errors
   - Check `/api/stripe/create-checkout` for errors

3. **Database** (2 min):
   ```bash
   # Count active subscriptions
   SELECT COUNT(*) FROM user_profiles WHERE subscription_status = 'active';
   ```

### Weekly Checks (Ongoing)

- Review revenue metrics in Stripe Dashboard
- Check for failed payments and follow up
- Review webhook failure rate (should be <1%)
- Monitor customer churn rate

### Set Up Alerts

1. **Stripe Email Notifications**:
   - Settings → Email notifications → Enable "Failed payments"
   - Enable "Disputed payments"

2. **Vercel Alerts**:
   - Settings → Alerts → Enable "Failed function invocations"

---

## SUPPORT RESOURCES

### Stripe Resources
- **Dashboard**: https://dashboard.stripe.com
- **Documentation**: https://stripe.com/docs
- **Support**: https://support.stripe.com
- **Status Page**: https://status.stripe.com

### Internal Resources
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/yourusername/cross-border-tax
- **Deployment Logs**: Vercel Dashboard → Deployments → Functions

### Emergency Contacts
- Stripe Support: support@stripe.com
- Vercel Support: support@vercel.com

---

## APPENDIX: Files Modified

This setup involves the following files:

### Environment Configuration
- `.env.production` - Production environment variables (NOT committed)
- Vercel Environment Variables - Production API keys

### Stripe API Integration
- `/lib/stripe.ts` - Stripe client initialization
- `/lib/stripe/index.ts` - Stripe configuration constants
- `/app/api/stripe/webhook/route.ts` - Webhook event handler
- `/app/api/stripe/create-checkout/route.ts` - Checkout session creation
- `/app/api/stripe/billing-portal/route.ts` - Customer portal access

### Database Schema
- `/lib/db/schema.sql` - User profiles with subscription fields
- `/lib/db/migrations/` - Database migration files

### Verification Scripts
- `/scripts/setup-stripe-products.ts` - Automated product creation
- `/scripts/verify-stripe-production.ts` - Configuration validation

---

## ESTIMATED TIMELINE

| Task | Time | Cumulative |
|------|------|------------|
| Pre-flight checklist verification | 5 min | 5 min |
| Get Stripe API keys (Step 1) | 2 min | 7 min |
| Create products & prices (Step 2) | 5 min | 12 min |
| Configure webhook endpoint (Step 3) | 3 min | 15 min |
| Add Vercel environment variables (Step 4) | 5 min | 20 min |
| Trigger deployment (Step 5) | 3 min | 23 min |
| Run verification script (Step 6) | 2 min | 25 min |
| Test live payment (Step 7) | 5 min | 30 min |
| Verify webhook & database (Steps 8-9) | 3 min | 33 min |

**Total: ~30 minutes** (as promised)

---

## SUCCESS CRITERIA

You've successfully activated Stripe production mode when:

✅ Verification script passes all checks
✅ Test payment completes successfully
✅ Webhook shows "Succeeded" in Stripe Dashboard
✅ User tier updates in database
✅ Dashboard displays subscription correctly
✅ Revenue appears in Stripe Dashboard

**You are now accepting real payments and generating revenue!** 🎉

---

**Last Updated**: 2026-03-19
**Version**: 1.0
**Maintained By**: Engineering Team
