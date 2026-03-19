# Pricing Experiment - Implementation Guide

## Overview

**Experiment**: A/B test for optimal Pro plan pricing
**Variants**:
- Variant A: $49/year (launch special, 50% off $99)
- Variant B: $79/year (standard pricing)
- Bonus: $19/month option for all users

**Tracking**:
- Conversion rate by variant
- Revenue per variant
- Product Hunt cohort behavior
- Annual vs monthly preference

---

## Setup Instructions

### 1. Create Stripe Price Products

Run the setup script to create new price IDs in Stripe:

```bash
npx ts-node scripts/setup-pricing-experiment.ts
```

This will create:
- `price_XXXXXXXX` - $79/year Pro plan (Variant B)
- `price_XXXXXXXX` - $19/month Pro plan

### 2. Add Environment Variables

Add to `.env.local` and `.env.production`:

```bash
# Existing $49/year price (Variant A)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1ProAnnual49

# New $79/year price (Variant B)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79=price_XXXXXXXX

# New $19/month price
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY=price_XXXXXXXX
```

Replace `price_XXXXXXXX` with actual IDs from setup script output.

### 3. Deploy to Production

```bash
npm run build
git add -A
git commit -m "[P1-HIGH] Pricing Experiment - $49 vs $79 A/B test + $19/month option"
git push origin main
```

GitHub → Vercel will auto-deploy.

---

## How It Works

### Variant Assignment

- **50/50 split**: Users randomly assigned to $49 or $79 variant
- **Persisted**: Assignment stored in localStorage for consistency
- **Cohort tagging**: Product Hunt users tagged automatically via UTM params

### User Flow

1. User visits `/pricing`
2. System checks `localStorage` for existing variant assignment
3. If new user: randomly assign variant A or B (50/50 split)
4. Show billing interval toggle (Monthly / Annual)
5. Display pricing based on:
   - Assigned variant (affects annual price only)
   - Selected interval (annual or monthly)
6. Track all interactions to PostHog

### Tracking Events

```typescript
// Page view
pricing_page_viewed {
  variant: 'annual_49' | 'annual_79',
  is_product_hunt_user: boolean,
  user_cohort: 'product_hunt' | 'organic'
}

// Interval toggle
pricing_interval_toggled {
  variant: 'annual_49' | 'annual_79',
  from: 'monthly' | 'annual',
  to: 'monthly' | 'annual'
}

// Tier selected
pricing_tier_selected {
  variant: 'annual_49' | 'annual_79',
  interval: 'monthly' | 'annual',
  price: 49 | 79 | 19,
  priceId: 'price_XXX',
  is_product_hunt_user: boolean
}

// Checkout started
checkout_started {
  plan: 'pro',
  variant: 'annual_49' | 'annual_79',
  price: number
}
```

---

## Analytics Dashboard

View live results at: `/dashboard/pricing-analytics`

**Metrics shown**:
- Total conversions & revenue
- Variant performance (conversions, revenue, percentage)
- Price sensitivity analysis (annual vs monthly preference)
- Cohort analysis (Product Hunt vs organic)
- Data-driven recommendations

**Filters**:
- All users
- Product Hunt cohort only
- Organic users only

---

## Product Hunt Cohort Tracking

Users are automatically tagged as "Product Hunt" cohort if they arrive via:
- `?utm_source=producthunt`
- `?utm_campaign=producthunt`
- `?ref=producthunt` or `?ref=ph`

**Special handling**:
- PH users see "🚀 Product Hunt Special: 20% OFF with code HUNT20" badge
- PH cohort isolated in analytics for separate analysis
- Can compare PH vs organic price sensitivity

---

## Statistical Significance

**Minimum sample size**: 100 conversions per variant
**Recommended duration**: 2-4 weeks
**Success criteria**:
- Clear winner (>20% revenue difference), OR
- Significant conversion difference (>30%)

**Current status**: Check `/dashboard/pricing-analytics` for live metrics

---

## API Endpoints

### `/api/analytics/pricing-experiment`

**Query params**:
- `cohort`: `all`, `product_hunt`, `organic`
- `start_date`: ISO date (optional)
- `end_date`: ISO date (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": { ... },
    "variants": { ... },
    "cohorts": { ... },
    "price_sensitivity": { ... },
    "recommendations": [ ... ]
  }
}
```

---

## Decision Framework

After collecting sufficient data (100+ conversions), decide:

### If $49 wins (higher conversion + revenue):
- Keep $49 as standard Pro pricing
- Consider removing $79 variant
- Promote "Launch Special" scarcity

### If $79 wins (higher revenue despite lower conversion):
- Transition to $79 as standard pricing
- Use $49 as limited-time promotions only
- Emphasize value to justify higher price

### If monthly $19 wins (>40% of conversions):
- Make monthly plan default option
- Downplay annual billing
- Adjust messaging to monthly value prop

### If Product Hunt cohort behaves differently:
- Create PH-specific landing page with optimal pricing
- Use cohort insights for future launches
- Adjust launch strategy based on price sensitivity

---

## Files Modified

### New Files
- `hooks/use-pricing-experiment.ts` - A/B test logic & variant assignment
- `components/BillingIntervalToggle.tsx` - Monthly/annual toggle UI
- `app/api/analytics/pricing-experiment/route.ts` - Analytics API
- `app/dashboard/pricing-analytics/page.tsx` - Analytics dashboard
- `scripts/setup-pricing-experiment.ts` - Stripe product creation

### Modified Files
- `app/pricing/page.tsx` - Integrated experiment hook, added toggle
- `.env.production` - Added new price ID variables (manual step)

---

## Troubleshooting

### Variant not persisting across sessions
- Check localStorage: `localStorage.getItem('pricing_experiment_variant')`
- Clear cache: `localStorage.clear()` to reset assignment

### Wrong price ID sent to Stripe
- Verify env vars are set correctly
- Check `/api/stripe/create-checkout` receives correct `priceId`

### Analytics showing zero data
- Ensure database has `subscriptions` table with `metadata` column
- Check PostHog events are firing (PostHog dashboard)
- Verify API endpoint returns valid JSON

### Product Hunt cohort not detected
- Check URL has `?utm_source=producthunt` param
- Verify localStorage: `localStorage.getItem('user_cohort')`
- UTM params must be present on first page visit

---

## Next Steps

1. ✅ Deploy experiment to production
2. ⏳ Run experiment for 2-4 weeks
3. 📊 Monitor `/dashboard/pricing-analytics` weekly
4. 🎯 Make pricing decision when 100+ conversions reached
5. 📢 Announce final pricing & remove losing variant

---

## Questions?

- Implementation: Check this doc
- Results: `/dashboard/pricing-analytics`
- Stripe setup: `scripts/setup-pricing-experiment.ts`
- Code: `hooks/use-pricing-experiment.ts`
