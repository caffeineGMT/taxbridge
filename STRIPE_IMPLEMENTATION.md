# Stripe Subscription Implementation

Complete Stripe Checkout & webhook-driven subscription management for TaxBridge MVP.

## Overview

This implementation adds a production-ready, 3-tier subscription system (Free/Pro/Enterprise) with:
- Stripe Checkout integration for seamless payment flow
- Webhook-driven subscription lifecycle management
- Feature-gated paywall system
- Automatic upgrade/downgrade handling
- Complete user subscription tracking

## Architecture

```
User Action → Stripe Checkout → Payment → Webhook → Database Update → Access Control
```

## Files Created

### Core Stripe Infrastructure

1. **`/lib/stripe.ts`**
   - Stripe SDK initialization with API key
   - Configuration constants (price IDs, redirect URLs)
   - Server-side only (uses `STRIPE_SECRET_KEY`)

2. **`/lib/paywall.ts`**
   - Feature gating logic for all tiers
   - Helper functions: `canAddRSU()`, `canExportPDF()`, `canAccessAPI()`
   - Feature limits matrix (Free: 1 RSU, Pro: unlimited, Enterprise: all features)

### API Routes

3. **`/app/api/stripe/create-checkout/route.ts`**
   - POST endpoint to create Stripe Checkout sessions
   - Input: `{ priceId, tier, userId }`
   - Returns: `{ url }` (redirect to Stripe Checkout)
   - Attaches user metadata to session for webhook processing

4. **`/app/api/stripe/webhook/route.ts`**
   - Webhook handler for Stripe events
   - Verifies webhook signature (`STRIPE_WEBHOOK_SECRET`)
   - Handles events:
     - `checkout.session.completed` → Upgrade user to paid tier
     - `customer.subscription.updated` → Update subscription status
     - `customer.subscription.deleted` → Downgrade to free tier
     - `invoice.payment_failed` → Mark as past_due
   - Updates `user_profiles` table with subscription data

5. **`/app/api/user/route.ts`**
   - GET: Fetch user profile with subscription info
   - PATCH: Update user profile fields
   - Auto-creates default user (MVP single-user mode)

### UI Components

6. **`/app/pricing/page.tsx`**
   - Pricing table with 3 tiers
   - Feature comparison matrix
   - "Upgrade" button → triggers checkout flow
   - FAQ section
   - Responsive design with gradient styling

7. **`/components/UpgradeModal.tsx`**
   - Modal shown when free users hit limits
   - Displays current usage vs. limit
   - Pro plan benefits list
   - CTA to pricing page
   - Dismissible with "Maybe Later" option

### Enhanced Components

8. **`/components/export-button.tsx`** (Updated)
   - Checks user subscription tier on mount
   - Shows lock icon for free users
   - Triggers upgrade modal instead of export if not Pro/Enterprise
   - Button text: "Upgrade to Export" vs. "Export PDF"

9. **`/components/rsu/rsu-entry-form.tsx`** (Updated)
   - Intercepts 403 errors from `/api/rsu` POST
   - Shows `UpgradeModal` when subscription limit reached
   - Prevents form submission for free users at limit

10. **`/app/api/rsu/route.ts`** (Updated)
    - Checks subscription tier before creating RSU entry
    - Returns 403 with `upgradeRequired: true` if limit exceeded
    - Auto-creates user profile if missing

### Database Schema Updates

11. **`/lib/db/schema.sql`** (Updated)
    - Added columns to `user_profiles`:
      ```sql
      clerk_user_id TEXT UNIQUE,
      subscription_tier TEXT DEFAULT 'free',
      stripe_customer_id TEXT UNIQUE,
      stripe_subscription_id TEXT,
      subscription_status TEXT,
      subscription_current_period_end TEXT
      ```

12. **`/lib/db/init.ts`** (Updated)
    - Added `user_profiles` table with subscription fields
    - Auto-creates table on first app startup

13. **`/scripts/migrate-subscription-schema.ts`**
    - Migration script to add subscription columns to existing databases
    - Run with: `npm run db:migrate:subscription`
    - Checks if migration already applied (idempotent)

## Environment Variables

Added to `.env.local`:

```bash
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Product Price IDs (set after creating products in Stripe Dashboard)
STRIPE_PRO_PRICE_ID=price_1ProAnnual
STRIPE_ENTERPRISE_PRICE_ID=price_1EntAnnual
```

## Stripe Dashboard Setup

### 1. Create Products

**Pro Plan:**
- Name: TaxBridge Pro
- Price: $299/year
- Recurring: Annual
- Metadata: `tier=pro`
- Copy the Price ID → `STRIPE_PRO_PRICE_ID`

**Enterprise Plan:**
- Name: TaxBridge Enterprise
- Price: $2,000/year
- Recurring: Annual
- Metadata: `tier=enterprise`
- Copy the Price ID → `STRIPE_ENTERPRISE_PRICE_ID`

### 2. Create Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Listen to events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### 3. Test Webhook Locally

Use Stripe CLI for local development:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Subscription Tiers

### Free (Default)
- **Limit:** 1 RSU entry
- **Features:** View tax calculation, forms checklist, USD/CAD conversion
- **Support:** Email only
- **Price:** $0

### Pro ($299/year)
- **Limit:** Unlimited RSU entries
- **Features:** Everything in Free + FTC optimizer, PDF export, priority support
- **Target:** Individual professionals with multiple vestings
- **Price:** $299/year (~$25/month)

### Enterprise ($2,000/year)
- **Limit:** Unlimited everything
- **Features:** Pro + API access, bulk CSV upload, CPA dashboard, white-label reports
- **Target:** Accounting firms managing multiple clients
- **Price:** $2,000/year (~$167/month)

## User Flow

### Upgrade Flow

1. Free user tries to add 2nd RSU entry
2. API returns 403 with `upgradeRequired: true`
3. `UpgradeModal` appears with Pro benefits
4. User clicks "Upgrade to Pro"
5. Redirects to `/pricing`
6. Clicks "Upgrade to Pro" button
7. Creates Stripe Checkout session
8. Redirects to Stripe Checkout
9. User completes payment
10. Stripe sends `checkout.session.completed` webhook
11. Webhook updates `user_profiles.subscription_tier = 'pro'`
12. Redirects to `/dashboard?upgrade=success`
13. User can now add unlimited RSU entries

### Downgrade Flow (Cancellation)

1. User cancels subscription in Stripe Customer Portal
2. Stripe sends `customer.subscription.deleted` webhook
3. Webhook updates `user_profiles.subscription_tier = 'free'`
4. User immediately loses access to Pro features
5. Existing data remains intact
6. User restricted to 1 RSU entry going forward

## Testing Checklist

### Local Development Testing

- [ ] Free user with 0 RSU entries can add 1 entry
- [ ] Free user with 1 RSU entry sees `UpgradeModal` on 2nd attempt
- [ ] Clicking "Upgrade" redirects to pricing page
- [ ] Pricing page loads with 3 tiers displayed correctly
- [ ] Clicking "Upgrade to Pro" creates Stripe Checkout session
- [ ] Checkout session redirects to Stripe hosted page
- [ ] Test card: `4242 4242 4242 4242`, exp: future, CVC: any 3 digits
- [ ] Successful payment redirects to `/dashboard?upgrade=success`
- [ ] Webhook received and user upgraded to Pro in database
- [ ] Pro user can add unlimited RSU entries
- [ ] Free user sees lock icon on "Export PDF" button
- [ ] Pro user sees download icon and can export PDF
- [ ] Free user clicking export shows upgrade modal

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Auth: 4000 0025 0000 3155
```

### Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
```

## Production Deployment

### 1. Update Environment Variables

Replace test keys with live keys in production `.env`:

```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... # from production webhook endpoint
```

### 2. Create Production Webhook

- URL: `https://taxbridge.com/api/stripe/webhook`
- Events: Same as test mode
- Get signing secret → update `.env`

### 3. Update Price IDs

Use production price IDs:

```bash
STRIPE_PRO_PRICE_ID=price_LIVE_Pro...
STRIPE_ENTERPRISE_PRICE_ID=price_LIVE_Ent...
```

### 4. Test in Production

1. Make a real $299 payment (then refund)
2. Verify webhook received
3. Check database updated
4. Test feature access
5. Test cancellation flow

## Security Considerations

✅ **Webhook Signature Verification:** All webhooks verify signature using `stripe.webhooks.constructEvent()`

✅ **Server-Side Validation:** Subscription checks happen server-side in API routes

✅ **No Client-Side Bypass:** Feature gates controlled by database, not frontend state

✅ **Secret Key Protection:** `STRIPE_SECRET_KEY` only used server-side, never exposed to client

✅ **Metadata Validation:** User ID in webhook metadata validated against database

## Monitoring & Observability

### Key Metrics to Track

1. **Conversion Rate:** Free → Pro upgrades
2. **Churn Rate:** Pro cancellations
3. **MRR (Monthly Recurring Revenue):** From Stripe Dashboard
4. **Failed Payments:** Monitor `invoice.payment_failed` events
5. **Webhook Failures:** Check Stripe Dashboard → Webhooks → Logs

### Error Handling

All webhook events logged to console:
```typescript
console.log(`✓ User ${userId} upgraded to ${tier} tier`);
console.log(`✓ Subscription ${subscriptionId} canceled, user downgraded to free`);
```

Monitor these logs in production for subscription events.

## Future Enhancements

### Phase 2 Features

- [ ] Stripe Customer Portal integration (self-service subscription management)
- [ ] Annual vs. Monthly billing toggle
- [ ] Promo codes / coupon support
- [ ] Team/multi-user subscriptions
- [ ] Usage-based billing (per RSU entry for Enterprise)
- [ ] Trial periods (14-day free trial for Pro)
- [ ] Email notifications on upgrade/downgrade
- [ ] Subscription analytics dashboard

### Phase 3 Features

- [ ] Revenue analytics (MRR, ARR, LTV)
- [ ] Dunning management (retry failed payments)
- [ ] Referral program (give 1 month free, get 1 month free)
- [ ] Enterprise custom pricing
- [ ] White-label subscriptions for CPA firms

## Troubleshooting

### Webhook Not Received

1. Check Stripe Dashboard → Webhooks → Logs
2. Verify signing secret matches `.env`
3. Ensure endpoint URL is publicly accessible
4. Check server logs for 400/500 errors

### User Not Upgraded After Payment

1. Check Stripe Dashboard → Payments → find payment
2. Click payment → View webhook events
3. Check if `checkout.session.completed` was sent
4. Verify webhook handler logged success
5. Query database: `SELECT * FROM user_profiles WHERE stripe_customer_id = 'cus_xxx'`

### Free User Still Has Access to Pro Features

1. Check `user_profiles.subscription_tier` in database
2. Verify API routes call `canAddRSU()` or `canExportPDF()`
3. Clear browser cache / hard refresh
4. Check if user signed in with different account

## Revenue Model

### Pricing Strategy

- **Free Tier:** Lead generation, prove value with 1 RSU entry
- **Pro Tier ($299/year):** Sweet spot for individual tech workers (typical H-1B has 4-8 RSU vestings/year)
- **Enterprise Tier ($2,000/year):** Target accounting firms with 10+ clients

### Target Metrics

- **$1M ARR Goal:**
  - 3,350 Pro subscribers ($299 × 3,350 = $1,001,650)
  - OR 500 Enterprise subscribers ($2,000 × 500 = $1,000,000)
  - OR 2,000 Pro + 200 Enterprise = $998,000

- **Expected Conversion Rate:** 5-10% Free → Pro
- **Churn Target:** <5% annual

## Support

For Stripe integration issues:
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe API Docs: https://stripe.com/docs/api
- Test Mode: Use test keys, no real charges

---

**Implementation Status:** ✅ Complete

**Last Updated:** 2024-03-18

**Author:** TaxBridge Engineering Team
