# 🚨 Stripe Production Activation - File Reference

> **Quick reference for all files that use Stripe configuration**

---

## 🔑 ENVIRONMENT VARIABLES

### Required in Production (.env.production / Vercel)

| Variable | Format | Example | Source |
|----------|--------|---------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | `sk_live_51AbC...` | Stripe Dashboard → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | `pk_live_...` | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | `whsec_...` | Stripe Dashboard → Webhooks |
| `STRIPE_PRO_PRICE_ID` | `price_...` | `price_1A...` | Created by setup script |
| `STRIPE_ENTERPRISE_PRICE_ID` | `price_...` | `price_1B...` | Created by setup script |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | `price_...` | `price_1A...` | Same as STRIPE_PRO_PRICE_ID |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | `price_...` | `price_1B...` | Same as STRIPE_ENTERPRISE_PRICE_ID |

---

## 📁 FILES USING STRIPE CONFIGURATION

### Core Stripe Integration

#### `/lib/stripe.ts`
**Purpose**: Main Stripe client initialization
**Uses**:
- `STRIPE_SECRET_KEY` - Server-side Stripe instance
- `STRIPE_PRO_PRICE_ID` - Pro plan price reference
- `STRIPE_ENTERPRISE_PRICE_ID` - Enterprise plan price reference

**Action Required**: None (reads from env vars)

---

#### `/lib/stripe/index.ts`
**Purpose**: Stripe client initialization (alternative)
**Uses**:
- `STRIPE_SECRET_KEY`

**Action Required**: None (reads from env vars)

---

### API Routes (Backend)

#### `/app/api/stripe/webhook/route.ts`
**Purpose**: Processes Stripe webhook events (payments, subscriptions, cancellations)
**Uses**:
- `STRIPE_WEBHOOK_SECRET` - Validates webhook signatures
- Database updates for subscription status

**Action Required**:
- ✅ Webhook must be configured in Stripe Dashboard
- ✅ URL: `https://taxbridge.app/api/stripe/webhook`

**Critical Events Handled**:
- `checkout.session.completed` - Payment successful
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_failed` - Payment failed

---

#### `/app/api/stripe/create-checkout/route.ts`
**Purpose**: Creates Stripe checkout sessions for new subscriptions
**Uses**:
- `STRIPE_SECRET_KEY` - Creates checkout sessions
- `STRIPE_PRO_PRICE_ID` - Pro plan checkout
- `STRIPE_ENTERPRISE_PRICE_ID` - Enterprise plan checkout

**Action Required**: None (reads price IDs from env)

---

#### `/app/api/stripe/billing-portal/route.ts`
**Purpose**: Creates Stripe customer portal sessions for subscription management
**Uses**:
- `STRIPE_SECRET_KEY` - Creates portal sessions

**Action Required**:
- ✅ Enable customer portal in Stripe Dashboard
- Settings → Billing → Customer portal → Activate

---

#### `/app/api/stripe/create-portal-session/route.ts`
**Purpose**: Alternative customer portal session creation
**Uses**: Same as billing-portal

---

#### `/app/api/stripe/pause-subscription/route.ts`
**Purpose**: Pauses active subscriptions
**Uses**:
- `STRIPE_SECRET_KEY` - Pauses subscriptions

---

### Frontend Components

#### `/app/pricing/page.tsx`
**Purpose**: Pricing page displaying plan options
**Uses**:
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` - Pro plan button
- `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` - Enterprise plan button

**Action Required**: Verify price IDs are updated when visiting `/pricing`

---

#### `/app/settings/billing/page.tsx`
**Purpose**: User billing management page
**Uses**:
- Stripe customer portal link
- Displays current subscription status

---

#### `/components/billing/ManageSubscriptionButton.tsx`
**Purpose**: Button to open billing portal
**Uses**:
- Calls `/api/stripe/billing-portal`

---

### Tracking & Analytics

#### `/lib/stripe/affiliate-tracking.ts`
**Purpose**: Tracks affiliate referrals in checkout
**Uses**:
- Stripe session metadata
- Reads referral codes from checkout

---

#### `/lib/stripe/referral-tracking.ts`
**Purpose**: Tracks user-to-user referrals
**Uses**:
- Stripe session metadata
- Applies referral discounts

---

### Revenue Analytics

#### `/app/api/analytics/stripe-metrics/route.ts`
**Purpose**: Fetches revenue metrics from Stripe
**Uses**:
- `STRIPE_SECRET_KEY` - Queries Stripe API for revenue data

---

#### `/app/dashboard/revenue-analytics/page.tsx`
**Purpose**: Admin dashboard for revenue tracking
**Uses**:
- Calls Stripe metrics API

---

#### `/app/admin/revenue/page.tsx`
**Purpose**: Admin revenue overview
**Uses**:
- Stripe revenue data

---

## 🛠️ SETUP SCRIPTS

### `/scripts/setup-stripe-products.ts`
**Purpose**: Creates Stripe products and price IDs
**Usage**: `npm run setup:stripe`

**What it does**:
1. Creates "TaxBridge Pro" product ($29/month)
2. Creates "TaxBridge Enterprise" product ($199/month)
3. Outputs price IDs to add to `.env.production`

**When to run**:
- ✅ When switching from test → live mode
- ✅ After getting live Stripe API keys

---

### `/scripts/verify-stripe-production.ts`
**Purpose**: Validates Stripe environment variables
**Usage**: `npm run verify:stripe`

**Checks**:
- ✅ API keys exist and are live mode (`sk_live_`, `pk_live_`)
- ✅ Webhook secret configured
- ✅ Price IDs exist and match
- ✅ App URL configured

---

### `/scripts/verify-stripe-live.ts`
**Purpose**: Advanced verification with live API testing
**Usage**: `npm run verify:stripe:live`

**Checks**:
- ✅ Everything from `verify:stripe`
- ✅ Connects to Stripe API to verify keys work
- ✅ Verifies price IDs exist in Stripe
- ✅ Checks price amounts ($29 and $199)
- ✅ Verifies webhook endpoint is configured

---

## 🔍 VERIFICATION CHECKLIST

After configuring Stripe production mode:

### Environment Variables
- [ ] `STRIPE_SECRET_KEY` starts with `sk_live_`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_live_`
- [ ] `STRIPE_WEBHOOK_SECRET` starts with `whsec_`
- [ ] All 4 price ID variables configured and matching

### Stripe Dashboard
- [ ] Products created: "TaxBridge Pro" and "TaxBridge Enterprise"
- [ ] Prices set: $29/month and $199/month
- [ ] Webhook endpoint created: `https://taxbridge.app/api/stripe/webhook`
- [ ] Webhook events selected (6 events - see webhook route)
- [ ] Customer portal activated

### Vercel Configuration
- [ ] All 7 Stripe env vars added to Production environment
- [ ] Deployment triggered after adding env vars
- [ ] Build succeeded with no errors

### Testing
- [ ] `npm run verify:stripe:live` passes all checks
- [ ] Test payment completes successfully
- [ ] Webhook shows "Succeeded" in Stripe Dashboard
- [ ] User subscription tier updates in database
- [ ] Customer portal accessible at `/settings/billing`

---

## 🚨 COMMON ISSUES

### Issue: "No such price: price_..."
**Cause**: Price ID doesn't exist in live mode
**Fix**: Run `npm run setup:stripe` with live keys

### Issue: "Invalid API Key"
**Cause**: Using test key in production
**Fix**: Replace `sk_test_` with `sk_live_` key

### Issue: "Webhook signature verification failed"
**Cause**: Wrong webhook secret or URL
**Fix**:
1. Verify webhook URL is exactly `https://taxbridge.app/api/stripe/webhook`
2. Copy webhook secret from correct endpoint in Stripe Dashboard
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel
4. Redeploy

### Issue: Payment succeeds but tier doesn't update
**Cause**: Webhook not processing
**Fix**:
1. Check webhook logs in Stripe Dashboard
2. Check Vercel function logs for errors
3. Manually resend webhook event

---

## 📊 REVENUE IMPACT

### Before (Placeholder Mode)
- **MRR**: $0
- **Subscriptions**: 0
- **Status**: 🔴 Cannot accept payments

### After (Production Mode)
- **MRR Potential**: $29/user (Pro), $199/user (Enterprise)
- **Subscriptions**: Unlimited
- **Status**: 🟢 Accepting real payments

---

## 🔗 QUICK LINKS

- **Stripe Dashboard**: https://dashboard.stripe.com
- **API Keys**: https://dashboard.stripe.com/apikeys
- **Webhooks**: https://dashboard.stripe.com/webhooks
- **Products**: https://dashboard.stripe.com/products
- **Customer Portal Settings**: https://dashboard.stripe.com/settings/billing/portal
- **Vercel Environment Variables**: https://vercel.com/dashboard → Project → Settings → Environment Variables

---

## 📞 SUPPORT

If you encounter issues:

1. Run `npm run verify:stripe:live` for detailed diagnostics
2. Check Stripe Dashboard → Developers → Events for errors
3. Check Vercel Dashboard → Deployments → Functions for logs
4. Refer to `/docs/STRIPE_PRODUCTION_SETUP.md` for step-by-step guide

---

**Last Updated**: 2026-03-19
**Status**: Ready for production activation
