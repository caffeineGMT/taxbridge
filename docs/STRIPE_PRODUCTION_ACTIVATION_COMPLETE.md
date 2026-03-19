# 🔴 STRIPE PRODUCTION ACTIVATION - COMPLETE GUIDE

**STATUS:** 🟥 **100% TEST MODE - ZERO REVENUE CAPABILITY**
**IMPACT:** Revenue blocked for 6+ sprints
**TIMELINE:** 2-3 hours to complete
**PRIORITY:** P0-CRITICAL

---

## ⚠️ CURRENT STATE AUDIT (March 19, 2026)

### 📊 Placeholder Environment Variables: **26 TOTAL**

#### 🔴 CRITICAL REVENUE BLOCKERS (9 Stripe variables)
```bash
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE
STRIPE_BASIC_PRICE_ID=price_YOUR_LIVE_BASIC_PRICE_ID
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_YOUR_LIVE_BASIC_PRICE_ID
STRIPE_PRO_PRICE_ID=price_YOUR_LIVE_PRO_PRICE_ID
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_LIVE_PRO_PRICE_ID
STRIPE_ENTERPRISE_PRICE_ID=prod_YOUR_LIVE_ENTERPRISE_PRODUCT_ID
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=prod_YOUR_LIVE_ENTERPRISE_PRODUCT_ID
```

#### 🟠 HIGH PRIORITY (3 Clerk authentication)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET=whsec_YOUR_CLERK_WEBHOOK_SECRET
```

#### 🟡 MEDIUM PRIORITY (8 analytics/tracking)
```bash
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL=YOUR_SIGNUP_LABEL
NEXT_PUBLIC_GOOGLE_ADS_PRO_LABEL=YOUR_PRO_SUBSCRIPTION_LABEL
NEXT_PUBLIC_GOOGLE_ADS_ENTERPRISE_LABEL=YOUR_ENTERPRISE_LABEL
NEXT_PUBLIC_GOOGLE_ADS_CALCULATOR_LABEL=YOUR_CALCULATOR_LABEL
NEXT_PUBLIC_META_PIXEL_ID=YOUR_15_DIGIT_PIXEL_ID
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_PROJECT_API_KEY
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_SENTRY_KEY@o0000000.ingest.sentry.io/0000000
SENTRY_AUTH_TOKEN=YOUR_SENTRY_AUTH_TOKEN
```

#### ⚪ LOW PRIORITY (6 optional services)
```bash
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_ANTHROPIC_API_KEY_HERE
SENDGRID_API_KEY=SG.YOUR_SENDGRID_API_KEY_HERE
SENDGRID_CANCELLATION_SURVEY_TEMPLATE_ID=d-YOUR_CANCELLATION_SURVEY_TEMPLATE_ID
CRON_SECRET=YOUR_SECURE_RANDOM_STRING_HERE
RESEND_API_KEY=re_placeholder_key
```

---

## 🎯 ACTIVATION PLAN - 3 PHASES

### PHASE 1: STRIPE PRODUCTION (2 hours) - REVENUE UNBLOCKING

**Timeline:** 2 hours
**Impact:** Unblocks ALL revenue
**Confidence:** 99%

#### Step 1: Get Live Stripe Keys (15 min)
1. Go to https://dashboard.stripe.com/apikeys
2. **CRITICAL:** Toggle to "Production" mode (top right)
3. Copy **Restricted Key** (recommended):
   - Click "Create restricted key"
   - Name: "TaxBridge Production"
   - Permissions:
     - Write: Customers, Subscriptions, Checkout Sessions, Prices, Products
     - Read: All
   - Copy key: `sk_live_51...`
4. Copy **Publishable Key**: `pk_live_...`

#### Step 2: Create Live Products & Price IDs (30 min)

**Option A - Automated (RECOMMENDED):**
```bash
# Set your live key in terminal
export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_HERE

# Run activation script
npx tsx scripts/activate-stripe-production-annual.ts

# Script will output all price IDs to copy
```

**Option B - Manual via Stripe Dashboard:**
1. Go to https://dashboard.stripe.com/products
2. Create 3 products:
   - **Basic:** $49/year (5 RSU entries)
   - **Pro:** $79/year (unlimited, priority support)
   - **Enterprise:** Custom pricing (contact sales)
3. Copy price IDs from each product

**Expected Output:**
```bash
STRIPE_BASIC_PRICE_ID=price_1AbCdEfGhIjKlMnO
STRIPE_PRO_PRICE_ID=price_1PqRsTuVwXyZaBcD
STRIPE_ENTERPRISE_PRICE_ID=prod_1EnTeRpRiSeXaMpLe
```

#### Step 3: Setup Webhook Endpoint (30 min)
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. **Endpoint URL:** `https://taxbridgecpa.com/api/stripe/webhook`
4. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. **Copy signing secret:** `whsec_...`

#### Step 4: Update Vercel Environment Variables (30 min)
1. Go to https://vercel.com/your-team/cross-border-tax/settings/environment-variables
2. Add/Update these variables for **Production** environment:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_51XXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51XXXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXX

# Stripe Price IDs (from Step 2 output)
STRIPE_BASIC_PRICE_ID=price_1XXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_1XXXXXXXXXXXXX
STRIPE_PRO_PRICE_ID=price_1XXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1XXXXXXXXXXXXX
STRIPE_ENTERPRISE_PRICE_ID=prod_XXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=prod_XXXXXXXXXXXXX
```

3. **CRITICAL:** Click "Save" on each variable
4. **CRITICAL:** Redeploy: Vercel Dashboard → Deployments → Redeploy latest

#### Step 5: Test End-to-End Payment (30 min)

**Use Stripe Test Card (WILL NOT CHARGE REAL MONEY):**
```
Card number: 4242 4242 4242 4242
Expiry: 12/28 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
```

**Test Flow:**
1. Go to https://taxbridgecpa.com/pricing
2. Click "Get Started" on Pro plan ($79/year)
3. Enter test card details above
4. Complete checkout
5. **Verify in Stripe Dashboard:**
   - Go to https://dashboard.stripe.com/payments
   - Find the $79.00 payment
   - Status should be "Succeeded"
6. **Verify webhook:**
   - Go to https://dashboard.stripe.com/webhooks
   - Click your endpoint
   - Check "Recent events" - should see `checkout.session.completed`
7. **REFUND THE TEST PAYMENT:**
   - Click payment → "Refund" → Full refund
   - Verify refund completes

#### Step 6: Monitor First Real Customer (ongoing)
1. Dashboard: https://dashboard.stripe.com/dashboard
2. Set up alerts:
   - Go to Settings → Notifications
   - Enable: "Failed payments" → Email
   - Enable: "Successful payments" → Email

---

### PHASE 2: CLERK AUTHENTICATION (1 hour) - USER SECURITY

**Timeline:** 1 hour
**Impact:** Secure production authentication
**Confidence:** 95%

#### Step 1: Get Clerk Production Keys (15 min)
1. Go to https://dashboard.clerk.com
2. Select your app
3. Click "API Keys" in sidebar
4. Toggle to **"Production"** mode (top right)
5. Copy keys:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

#### Step 2: Setup Clerk Webhook (30 min)
1. In Clerk Dashboard → "Webhooks"
2. Click "Add endpoint"
3. Endpoint URL: `https://taxbridgecpa.com/api/clerk/webhook`
4. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy signing secret: `whsec_...`

#### Step 3: Update Vercel (15 min)
Add to Vercel production environment:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_live_XXXXXXXXXXXXX
CLERK_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXX
```

---

### PHASE 3: ANALYTICS & TRACKING (2 hours) - OPTIONAL

#### PostHog (30 min)
1. Go to https://app.posthog.com
2. Create project
3. Copy API key: `phc_...`
4. Add to Vercel: `NEXT_PUBLIC_POSTHOG_KEY=phc_XXXXX`

#### Google Ads (45 min)
1. Go to https://ads.google.com
2. Create conversion actions (Signup, Purchase, Calculator)
3. Copy conversion ID: `AW-XXXXXXXXXX`
4. Add to Vercel with labels

#### Sentry (30 min)
1. Go to https://sentry.io
2. Create Next.js project
3. Copy DSN
4. Add to Vercel

#### Other Services (15 min)
- **Meta Pixel:** https://business.facebook.com/events_manager
- **SendGrid:** https://app.sendgrid.com/settings/api_keys
- **Anthropic:** https://console.anthropic.com

---

## ✅ VERIFICATION CHECKLIST

After Phase 1 completion, verify:

```bash
# Run verification script
npm run verify:stripe-production

# Expected output:
# ✅ Stripe Secret Key: LIVE mode (sk_live_)
# ✅ Stripe Publishable Key: LIVE mode (pk_live_)
# ✅ Webhook Secret: Configured (whsec_)
# ✅ Basic Price ID: Real price ID (price_)
# ✅ Pro Price ID: Real price ID (price_)
# ✅ Enterprise Product ID: Real product ID (prod_)
# ✅ Test payment successful: $79.00 charged and refunded
# ✅ Webhook received: checkout.session.completed
#
# 🎉 STRIPE PRODUCTION MODE: ACTIVE
# 💰 REVENUE: UNBLOCKED
```

---

## 🚨 COMMON ERRORS & FIXES

### Error: "Invalid API Key"
**Cause:** Using test key instead of live key
**Fix:** Re-copy key from Production mode in Stripe Dashboard

### Error: "Price not found"
**Cause:** Price ID is placeholder or from test mode
**Fix:** Run `npx tsx scripts/activate-stripe-production-annual.ts` again

### Error: "Webhook signature verification failed"
**Cause:** Wrong webhook secret or endpoint not configured
**Fix:** Re-copy whsec_ secret from Stripe webhook settings

### Error: "Clerk authentication failed"
**Cause:** Using test Clerk keys in production
**Fix:** Toggle Clerk Dashboard to Production mode, re-copy keys

---

## 📊 SUCCESS METRICS

After activation, you should see:

**Within 24 hours:**
- ✅ Stripe Dashboard shows "Live mode" badge
- ✅ Test payment of $79 processed and refunded
- ✅ Webhook events logged in Stripe Dashboard
- ✅ Vercel deployment shows no placeholder warnings

**Within 1 week:**
- 💰 First real customer subscription
- 📈 Revenue dashboard shows $79+ MRR
- 📧 Confirmation emails sent automatically

**Within 1 month:**
- 💰 $500-$2,000 MRR (6-25 customers at $79/year)
- 📊 Conversion funnel tracking in PostHog
- 🎯 Google Ads conversions tracking

---

## 🆘 NEED HELP?

**Quick Debug:**
```bash
# Check current configuration
npm run verify:stripe-production

# Test payment flow end-to-end
npm run test:live-payment

# Check Vercel environment variables
vercel env ls production
```

**Resources:**
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe API Logs: https://dashboard.stripe.com/logs
- Vercel Logs: https://vercel.com/your-team/cross-border-tax/logs
- Support: docs/TROUBLESHOOTING.md

---

## 📅 TIMELINE SUMMARY

| Phase | Time | Priority | Impact |
|-------|------|----------|--------|
| Phase 1: Stripe | 2 hours | P0-CRITICAL | Unblocks revenue |
| Phase 2: Clerk | 1 hour | P1-HIGH | Secures auth |
| Phase 3: Analytics | 2 hours | P2-MEDIUM | Enables tracking |
| **TOTAL** | **5 hours** | | **Revenue LIVE** |

**RECOMMENDED:** Complete Phase 1 TODAY. Phases 2-3 can wait 1-2 days.

---

**Last Updated:** March 19, 2026
**Status:** 🟥 NOT STARTED - 26/26 placeholders remain
**Next Action:** Run `npx tsx scripts/stripe-activation-assistant.ts` for guided setup
