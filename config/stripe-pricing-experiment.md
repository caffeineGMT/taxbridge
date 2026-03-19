# Stripe Price Configuration for Pricing Experiment

## Overview

This file documents the Stripe price IDs needed for the 3-way pricing experiment ($29/$49/$79).

## Instructions

1. Create these prices in Stripe Dashboard: https://dashboard.stripe.com/test/products
2. Copy the price IDs and update `.env.production` in Vercel
3. Test each variant in checkout before launch

---

## TEST MODE Price IDs (Development)

### Pro Plan - Annual Variants

| Price | Description | Stripe Price ID | Created | Status |
|-------|-------------|----------------|---------|---------|
| **$29/year** | Pro Annual - Competitor Match | `price_XXXXXXXXXXXXX_29_test` | Pending | ⏳ TODO |
| **$49/year** | Pro Annual - Value Tier (DEFAULT) | `price_XXXXXXXXXXXXX_49_test` | Pending | ⏳ TODO |
| **$79/year** | Pro Annual - Premium | `price_XXXXXXXXXXXXX_79_test` | Pending | ⏳ TODO |

### Pro Plan - Monthly Option

| Price | Description | Stripe Price ID | Created | Status |
|-------|-------------|----------------|---------|---------|
| **$19/month** | Pro Monthly (all variants) | `price_XXXXXXXXXXXXX_monthly_test` | Pending | ⏳ TODO |

---

## PRODUCTION (LIVE) Price IDs

### Pro Plan - Annual Variants

| Price | Description | Stripe Price ID | Created | Status |
|-------|-------------|----------------|---------|---------|
| **$29/year** | Pro Annual - Competitor Match | `price_XXXXXXXXXXXXX_29_live` | Pending | ⏳ TODO |
| **$49/year** | Pro Annual - Value Tier (DEFAULT) | `price_XXXXXXXXXXXXX_49_live` | Pending | ⏳ TODO |
| **$79/year** | Pro Annual - Premium | `price_XXXXXXXXXXXXX_79_live` | Pending | ⏳ TODO |

### Pro Plan - Monthly Option

| Price | Description | Stripe Price ID | Created | Status |
|-------|-------------|----------------|---------|---------|
| **$19/month** | Pro Monthly (all variants) | `price_XXXXXXXXXXXXX_monthly_live` | Pending | ⏳ TODO |

---

## Environment Variables Configuration

### .env.local (Development)

```bash
# Pricing Experiment - Test Mode
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_29=price_XXXXXXXXXXXXX_29_test
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXXX_49_test
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79=price_XXXXXXXXXXXXX_79_test
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY=price_XXXXXXXXXXXXX_monthly_test
```

### Vercel Environment Variables (Production)

Navigate to: Vercel Dashboard → Project Settings → Environment Variables

Add these **Production** variables:

```bash
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_29=price_XXXXXXXXXXXXX_29_live
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXXX_49_live
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79=price_XXXXXXXXXXXXX_79_live
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY=price_XXXXXXXXXXXXX_monthly_live
```

**⚠️ Important:** Redeploy Vercel after adding/updating environment variables!

---

## Stripe Dashboard Setup

### Step 1: Create Product (if not exists)

1. Go to: https://dashboard.stripe.com/test/products
2. Click "Add product"
3. Name: **TaxBridge Pro**
4. Description: **US-Canada cross-border tax calculator for H-1B/TN visa holders with RSUs**
5. Click "Save product"

### Step 2: Add Prices

For each price variant, click "+ Add another price" on the product page:

#### $29/year Price

- **Price:** $29.00 USD
- **Billing period:** Yearly
- **Price description:** Pro Annual - Competitor Match ($29/year)
- **Price nickname:** `pro_annual_29`
- **Metadata:**
  - `variant`: `annual_29`
  - `experiment`: `annual_pricing_competitive_test_2026_q1`
  - `positioning`: `competitor_match`

#### $49/year Price (Default)

- **Price:** $49.00 USD
- **Billing period:** Yearly
- **Price description:** Pro Annual - Value Tier ($49/year)
- **Price nickname:** `pro_annual_49`
- **Metadata:**
  - `variant`: `annual_49`
  - `experiment`: `annual_pricing_competitive_test_2026_q1`
  - `positioning`: `value_tier`
  - `default`: `true`

#### $79/year Price

- **Price:** $79.00 USD
- **Billing period:** Yearly
- **Price description:** Pro Annual - Premium ($79/year)
- **Price nickname:** `pro_annual_79`
- **Metadata:**
  - `variant`: `annual_79`
  - `experiment`: `annual_pricing_competitive_test_2026_q1`
  - `positioning`: `premium`

#### $19/month Price (Shared)

- **Price:** $19.00 USD
- **Billing period:** Monthly
- **Price description:** Pro Monthly ($19/month)
- **Price nickname:** `pro_monthly_19`
- **Metadata:**
  - `billing_interval`: `monthly`
  - `shared_across_variants`: `true`

### Step 3: Repeat for Production

Switch to **LIVE mode** in Stripe Dashboard and repeat all steps above.

---

## Verification Checklist

### After Creating Price IDs

- [ ] All 4 TEST price IDs created
- [ ] All 4 LIVE price IDs created
- [ ] Price IDs copied to password manager (backup)
- [ ] `.env.local` updated with TEST price IDs
- [ ] Vercel production variables updated with LIVE price IDs
- [ ] Vercel redeployed after env var changes

### Testing Checkout

- [ ] Clear browser cache and localStorage
- [ ] Visit `/pricing` → assigned to variant
- [ ] Click upgrade → verify correct price shows in checkout
- [ ] Use Stripe test card `4242 4242 4242 4242`
- [ ] Complete checkout → verify subscription created
- [ ] Check Stripe Dashboard → correct price ID attached
- [ ] Repeat for all 3 variants ($29, $49, $79)

---

## Monitoring Revenue by Price ID

### Stripe Dashboard

1. Go to: https://dashboard.stripe.com/subscriptions
2. Filter by price ID to see customers on each variant
3. Monitor MRR by price:
   - Price ID `price_XXXX_29`: $X MRR
   - Price ID `price_XXXX_49`: $Y MRR
   - Price ID `price_XXXX_79`: $Z MRR

### PostHog Revenue Events

```typescript
trackEvent('checkout_completed', {
  plan: 'pro',
  variant: 'annual_49',
  price: 49,
  priceId: 'price_XXXXXXXXXXXXX_49_live',
  revenue: 49,
  currency: 'USD',
  experiment: 'annual_pricing_competitive_test_2026_q1'
});
```

Query in PostHog:
- SUM(revenue) WHERE variant = 'annual_29'
- SUM(revenue) WHERE variant = 'annual_49'
- SUM(revenue) WHERE variant = 'annual_79'

---

## Troubleshooting

### Error: "Price does not exist"

**Cause:** Environment variable has wrong price ID or Stripe is in wrong mode (test vs live)

**Fix:**
1. Check `.env.local` has TEST price IDs
2. Verify Vercel production env has LIVE price IDs
3. Ensure Stripe dashboard is in correct mode
4. Copy price ID directly from Stripe (don't type manually)

### Error: "Invalid price for this product"

**Cause:** Price ID is from different product

**Fix:**
1. Ensure all price IDs are for "TaxBridge Pro" product
2. Don't mix price IDs from different products

### Wrong price shows in checkout

**Cause:** Variant assignment mismatch or env var not deployed

**Fix:**
1. Clear localStorage: `localStorage.clear()`
2. Check variant in DevTools: `localStorage.getItem('pricing_experiment_variant')`
3. Verify Vercel deployed successfully with new env vars
4. Hard refresh browser (Cmd+Shift+R)

---

## Post-Experiment: Archiving Unused Prices

After experiment concludes and winner is chosen:

1. **Winner becomes default:** Update `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` to winning variant
2. **Archive losing variants:** In Stripe Dashboard, click price → "Archive"
   - ⚠️ Don't delete - existing customers may still be on those prices
3. **Update documentation:** Remove losing variants from docs
4. **Clean up env vars:** Remove `_29` and `_79` variants if $49 wins

---

## Notes

- **Price IDs are immutable** - you cannot change the amount after creation
- **Test mode ≠ Live mode** - create prices in both environments separately
- **Metadata is optional** but helps with analytics and tracking
- **Archiving ≠ Deleting** - archived prices still work for existing subscriptions

---

**Status:** ⏳ PENDING - Stripe price IDs need to be created
**Last Updated:** March 19, 2026
**Owner:** Michael Guo
**Next Action:** Create price IDs in Stripe Dashboard
