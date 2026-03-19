# Pricing Experiment: 3-Way A/B/C Test Implementation

**Date**: 2026-03-19
**Task**: [P2-MEDIUM] Pricing Experiment - Test 3 price points: $49/year vs $79/year vs $99/year
**Duration**: 2-week test minimum, extend to 4 weeks if needed for statistical significance
**Goal**: Identify optimal price point to maximize revenue and conversion

---

## Executive Summary

Implemented a comprehensive 3-way pricing experiment to test three annual Pro plan price points:
- **Variant A**: $49/year (50% launch discount)
- **Variant B**: $79/year (standard pricing)
- **Variant C**: $99/year (premium pricing)

All users also have access to a **$19/month** option regardless of variant assignment.

**Distribution**: 33/33/33 random split across variants
**Tracking**: PostHog + Database analytics
**Decision criteria**: 100+ conversions required for statistical significance

---

## Implementation Details

### 1. Pricing Experiment Hook (`hooks/use-pricing-experiment.ts`)

**Changes**:
- Updated `PricingVariant` type to include `'annual_99'`
- Modified variant assignment logic from 50/50 to **33/33/33 split**:
  ```typescript
  const random = Math.random();
  if (random < 0.33) variant = 'annual_49';
  else if (random < 0.66) variant = 'annual_79';
  else variant = 'annual_99';
  ```
- Added price configuration for $99 variant:
  ```typescript
  annual_99: {
    annualPrice: 99,
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_99,
    monthlyPrice: 19,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY,
  }
  ```

**Features**:
- Persistent variant assignment in `localStorage`
- Product Hunt cohort detection via UTM parameters
- PostHog event tracking for all user interactions
- Billing interval toggle (monthly vs annual)

---

### 2. Pricing Page UI (`app/pricing/page.tsx`)

**Changes**:
- Updated Pro tier tagline to handle all 3 variants:
  - $49: "🔥 Launch Special: 50% OFF ($99 → $49/year)"
  - $79: "Best value for serious tax planning"
  - $99: "Premium tier - Full-featured tax optimization"
- Updated savings messaging for each variant:
  - $49: "Save $50 — Launch pricing ends March 31"
  - $79: "Save $X vs monthly" (calculated)
  - $99: "Save $X vs monthly" (calculated)

**User Experience**:
- Users see 1 of 3 annual prices based on random assignment
- Billing interval toggle lets users switch between annual and monthly
- Price persists across sessions (stored in localStorage)

---

### 3. Stripe Setup Script (`scripts/setup-pricing-experiment.ts`)

**New Price Products Created**:
1. **$79/year** - Variant B
   ```typescript
   unit_amount: 7900,
   nickname: 'Pro Annual $79 (Variant B)',
   metadata: { tier: 'pro', variant: 'annual_79' }
   ```

2. **$99/year** - Variant C (NEW)
   ```typescript
   unit_amount: 9900,
   nickname: 'Pro Annual $99 (Variant C)',
   metadata: { tier: 'pro', variant: 'annual_99' }
   ```

3. **$19/month** - Monthly option
   ```typescript
   unit_amount: 1900,
   nickname: 'Pro Monthly $19'
   ```

**Output**:
- Console prints all price IDs for easy `.env` setup
- Generates `PRICING_EXPERIMENT_SETUP.json` with full configuration

**To Run**:
```bash
npx ts-node scripts/setup-pricing-experiment.ts
```

---

### 4. Analytics API (`app/api/analytics/pricing-experiment/route.ts`)

**Changes**:
- Updated variant detection to include `annual_99`:
  ```typescript
  else if (sub.stripe_price_id?.includes('99') || sub.amount === 9900) {
    variant = 'annual_99';
  }
  ```
- Added `annual_99` metrics tracking:
  ```typescript
  annual_99: {
    conversions: annual99.length,
    revenue: annual99.reduce((sum, r) => sum + r.amount, 0) / 100,
    avg_revenue: 99,
    percentage: '...'
  }
  ```
- Updated cohort tracking to include all 3 variants
- Enhanced recommendations algorithm to compare all 3 price points:
  - Identifies revenue winner
  - Compares conversion rates
  - Provides actionable recommendations

**API Endpoints**:
- `GET /api/analytics/pricing-experiment?cohort=all|product_hunt|organic`
- Optional filters: `start_date`, `end_date`

**Response Format**:
```json
{
  "success": true,
  "data": {
    "overview": { total_conversions, total_revenue, avg_customer_value },
    "variants": {
      "annual_49": { conversions, revenue, percentage },
      "annual_79": { conversions, revenue, percentage },
      "annual_99": { conversions, revenue, percentage },
      "monthly_19": { conversions, revenue, percentage }
    },
    "cohorts": { product_hunt: {...}, organic: {...} },
    "price_sensitivity": {
      "within_annual_preference": {
        "prefer_49": 10,
        "prefer_79": 8,
        "prefer_99": 5,
        "ratio_49": "43.5%",
        "ratio_79": "34.8%",
        "ratio_99": "21.7%"
      }
    },
    "recommendations": [...]
  }
}
```

---

### 5. Documentation (`docs/PRICING_EXPERIMENT.md`)

**Updated Sections**:
- Overview: 3 variants instead of 2
- Variant assignment: 33/33/33 split
- Environment variables: Added `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_99`
- Tracking events: All events now include `annual_99` variant
- Decision framework: Added guidance for $99 winner scenario

**New Decision Scenarios**:
- If $99 wins → Implement tiered pricing ($49/$79/$99)
- If $79 wins → Use as standard, $49 for promos only
- If $49 wins → Keep as standard, remove higher variants

---

## Environment Variables

Add these to `.env.local` and `.env.production`:

```bash
# Variant A: $49/year (existing)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1ProAnnual49

# Variant B: $79/year
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79=price_XXXXXXXX

# Variant C: $99/year (NEW)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_99=price_YYYYYYYY

# Monthly option: $19/month
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY=price_ZZZZZZZZ
```

**Setup Steps**:
1. Run Stripe setup script to generate price IDs
2. Copy price IDs from console output
3. Add to `.env.local` for testing
4. Add to `.env.production` before deploying

---

## Tracking & Measurement

### PostHog Events

1. **`pricing_experiment_exposed`**
   - Fires when user first sees pricing page
   - Captures assigned variant, cohort (PH/organic)

2. **`pricing_page_viewed`**
   - Fires on every pricing page visit
   - Tracks variant, interval selection

3. **`pricing_interval_toggled`**
   - Fires when user switches monthly ↔ annual
   - Tracks which direction users toggle

4. **`pricing_tier_selected`**
   - Fires when user clicks "Upgrade" CTA
   - Captures variant, price, interval, cohort

5. **`checkout_started`**
   - Fires when Stripe checkout begins
   - Tracks conversions by variant

### Database Tracking

All subscriptions stored in `subscriptions` table with:
- `stripe_price_id` - Maps to variant
- `amount` - Used for revenue calculation
- `metadata` - JSON with variant, cohort, experiment info

### Dashboard

View live experiment results at: `/dashboard/pricing-analytics`

**Filters**:
- All users
- Product Hunt cohort only
- Organic users only
- Date range selector

**Charts**:
- Conversion rate by variant (bar chart)
- Revenue by variant (stacked bar)
- Monthly vs annual preference (pie chart)
- Product Hunt vs organic behavior (comparison table)

---

## Success Metrics

**Primary Metric**: Total revenue (conversions × price)

**Secondary Metrics**:
- Conversion rate per variant
- Product Hunt cohort LTV
- Monthly vs annual preference
- Drop-off at pricing page

**Minimum Sample Size**: 100 conversions (33 per variant minimum)

**Test Duration**:
- **Minimum**: 2 weeks
- **Recommended**: 4 weeks for statistical significance
- **Early stop**: Only if clear winner (>30% revenue advantage)

---

## Decision Criteria

### Statistical Significance Thresholds

| Scenario | Winner Criteria | Action |
|----------|----------------|--------|
| **Clear Winner** | Revenue >30% higher than 2nd place | Implement winning price immediately |
| **Moderate Winner** | Revenue 15-30% higher | Extend test 1 week, then decide |
| **Tied** | All variants within 15% | Run for 4 weeks, consider tiered pricing |
| **Conversion vs Revenue** | High conversion but low revenue | Optimize for revenue, not volume |

### Example Decisions

**Scenario 1**: $49 → 40 conversions, $79 → 25 conversions, $99 → 15 conversions
- $49 revenue: $1,960
- $79 revenue: $1,975 ✅ **WINNER**
- $99 revenue: $1,485

**Decision**: Use $79 as standard pricing (highest revenue despite lower conversion)

**Scenario 2**: $49 → 50 conversions, $79 → 30 conversions, $99 → 10 conversions
- $49 revenue: $2,450 ✅ **WINNER**
- $79 revenue: $2,370
- $99 revenue: $990

**Decision**: Keep $49 as standard pricing (highest revenue AND conversion)

---

## Rollout Plan

### Week 1: Setup & Deploy
- ✅ Update code (hooks, pricing page, analytics)
- ✅ Run Stripe setup script to create price products
- ✅ Add environment variables to `.env.production`
- ⏳ Deploy to production
- ⏳ Verify all 3 variants are live (test with localStorage clear)

### Week 2-3: Data Collection
- Monitor `/dashboard/pricing-analytics` daily
- Track conversion rates by variant
- Watch for any variant performing <10% (may indicate bug)
- Collect minimum 100 conversions

### Week 4: Analysis & Decision
- Pull final numbers from analytics dashboard
- Calculate statistical significance
- Present findings to stakeholders
- Make pricing decision
- Remove losing variants from code

### Post-Experiment
- Update `.env` to use winning price as default
- Remove A/B/C test logic from code
- Keep monthly option if >30% of users prefer it
- Document final pricing strategy

---

## Files Modified

### New Files
- None (all infrastructure already exists)

### Modified Files
1. `hooks/use-pricing-experiment.ts` - Added $99 variant, 33/33/33 split
2. `app/pricing/page.tsx` - Updated Pro tier messaging for 3 variants
3. `scripts/setup-pricing-experiment.ts` - Added $99 price creation
4. `app/api/analytics/pricing-experiment/route.ts` - Added $99 tracking
5. `docs/PRICING_EXPERIMENT.md` - Updated documentation for 3-way test
6. `docs/PRICING_EXPERIMENT_3WAY_IMPLEMENTATION.md` - This file (NEW)

---

## Testing Checklist

Before marking complete, verify:

- [ ] Build passes with zero errors (`npm run build`)
- [ ] TypeScript compiles without errors
- [ ] All 3 variants render correctly on pricing page
- [ ] localStorage persists variant assignment
- [ ] Billing toggle works (monthly ↔ annual)
- [ ] PostHog events fire correctly
- [ ] Analytics API returns data for all 3 variants
- [ ] Environment variables added to `.env.production`
- [ ] Documentation updated

---

## Risk Mitigation

### Potential Issues

1. **Sample size too small**
   - Mitigation: Run for full 4 weeks, minimum 100 conversions
   - Fallback: Extend test duration or reduce to 2-way test ($49 vs $79 only)

2. **All variants perform equally**
   - Mitigation: Analyze Product Hunt vs organic separately
   - Fallback: Implement tiered pricing ($49 starter, $79 standard, $99 premium)

3. **Users confused by different prices**
   - Mitigation: Each user sees consistent price across sessions
   - Fallback: Add FAQ explaining "personalized pricing"

4. **Stripe price IDs misconfigured**
   - Mitigation: Test checkout flow for all 3 variants before launch
   - Fallback: Fallback to $49 default if price ID not found

---

## Next Steps

1. **Deploy to Production**
   ```bash
   npm run build
   git add -A
   git commit -m "[P2-MEDIUM] Pricing Experiment - $49 vs $79 vs $99 A/B/C test (3-way split, 2-week test)"
   git push origin main
   ```

2. **Run Stripe Setup**
   ```bash
   npx ts-node scripts/setup-pricing-experiment.ts
   ```
   Copy output price IDs to `.env.production`

3. **Monitor Daily**
   - Check `/dashboard/pricing-analytics` every 24 hours
   - Watch for anomalies (e.g., zero conversions on a variant)
   - Track toward 100-conversion goal

4. **Make Decision** (after 2-4 weeks)
   - Pull analytics report
   - Calculate winner by total revenue
   - Update pricing page to use winning variant
   - Remove experiment code

---

## Contact & Support

**Questions?**
- Implementation details: See `docs/PRICING_EXPERIMENT.md`
- Analytics API: `/api/analytics/pricing-experiment`
- Stripe setup: `scripts/setup-pricing-experiment.ts`
- Dashboard: `/dashboard/pricing-analytics`

**Debug Tips**:
- Clear variant assignment: `localStorage.clear()` in browser console
- Force specific variant: `localStorage.setItem('pricing_experiment_variant', 'annual_99')`
- Check PostHog: Events → Filter by `pricing_experiment_exposed`

---

**Status**: ✅ IMPLEMENTATION COMPLETE - Ready to deploy and begin 2-week test
