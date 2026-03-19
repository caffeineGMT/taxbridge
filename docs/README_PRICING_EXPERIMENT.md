# Pricing Experiment - Complete Setup & Execution

**Status:** ✅ READY TO LAUNCH
**Test:** $49 vs $79 vs $99/year (3-way A/B/C test)
**Duration:** 2-4 weeks
**Target:** 100+ conversions, >20% revenue margin for winner

---

## Quick Links

- **Quick Start:** `docs/PRICING_EXPERIMENT_QUICK_START.md` (30-min setup)
- **Full Guide:** `docs/PRICING_EXPERIMENT.md` (comprehensive docs)
- **Execution Plan:** `docs/PRICING_EXPERIMENT_EXECUTION_GUIDE.md` (day-by-day)
- **Results Template:** `docs/PRICING_EXPERIMENT_RESULTS_TEMPLATE.md` (analysis)
- **PostHog Setup:** `docs/POSTHOG_AB_TEST_SETUP.md` (analytics config)

**Dashboards:**
- Analytics: `/dashboard/pricing-analytics`
- PostHog: https://app.posthog.com
- Stripe: https://dashboard.stripe.com/subscriptions

---

## 30-Second Overview

This experiment tests 3 annual Pro plan prices to maximize revenue:
- **$49/year** - Launch special (50% off $99)
- **$79/year** - Standard pricing
- **$99/year** - Premium pricing
- **$19/month** - Available to all (bonus test)

**How it works:**
1. Users randomly assigned to $49, $79, or $99 (33/33/34 split)
2. Assignment persisted in localStorage (consistent experience)
3. PostHog tracks all interactions: page views, clicks, conversions
4. Database stores conversion data for revenue analysis
5. After 100+ conversions, analyze results and pick winner

**Decision criteria:** Highest total revenue (conversions × price), not just conversion rate

---

## Setup (30 minutes)

### Step 1: Create Stripe Prices (5 min)

```bash
npm run pricing:setup
```

This creates:
- `price_XXXXXXXX` - $79/year Pro plan
- `price_YYYYYYYY` - $99/year Pro plan
- `price_ZZZZZZZZ` - $19/month Pro plan

**Copy the price IDs** from output.

### Step 2: Add Environment Variables (3 min)

Add to `.env.local`:

```bash
# Existing $49/year (Variant A)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1ProAnnual49

# New $79/year (Variant B)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79=price_XXXXXXXX

# New $99/year (Variant C)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_99=price_YYYYYYYY

# New $19/month
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY=price_ZZZZZZZZ
```

**Also add to** `.env.production` and Vercel dashboard.

### Step 3: Deploy (5 min)

```bash
npm run build
git add -A
git commit -m "[P2-MEDIUM] Pricing Experiment - $49 vs $79 vs $99/year LIVE"
git push origin main
```

### Step 4: Verify (10 min)

1. Go to: https://taxbridgecpa.com/pricing
2. Open console: `localStorage.clear()` → refresh page
3. Check: `localStorage.getItem('pricing_experiment_variant')`
   - Should return: `"annual_49"`, `"annual_79"`, or `"annual_99"`
4. Repeat 5x to see all variants
5. Test checkout: Click "Upgrade" → Should redirect to Stripe
6. PostHog: Check "Live Events" for `pricing_experiment_exposed`

**If all pass:** Experiment is LIVE ✅

### Step 5: Monitor Daily (7 min/day)

```bash
npm run pricing:monitor
```

Generates daily report:
- Conversions by variant
- Revenue by variant
- Progress toward 100-conversion goal
- Recommendations (continue / extend / decide)

---

## Files & Code

### New Files (Created for Experiment)

1. **`hooks/use-pricing-experiment.ts`**
   - Variant assignment logic (33/33/34 split)
   - PostHog event tracking
   - Product Hunt cohort detection
   - Billing interval toggle

2. **`components/BillingIntervalToggle.tsx`**
   - Monthly / Annual toggle UI
   - Tracks interval preference

3. **`app/dashboard/pricing-analytics/page.tsx`**
   - Real-time analytics dashboard
   - Shows conversions, revenue, recommendations

4. **`app/api/analytics/pricing-experiment/route.ts`**
   - API endpoint for fetching metrics
   - Supports cohort filtering (all / PH / organic)

5. **`scripts/setup-pricing-experiment.ts`**
   - Creates Stripe price products
   - Outputs price IDs for `.env`

6. **`scripts/monitor-pricing-experiment.ts`**
   - Daily monitoring script
   - Generates formatted reports

### Modified Files

1. **`app/pricing/page.tsx`**
   - Integrated experiment hook
   - Dynamic pricing based on variant
   - PostHog tracking on all interactions

2. **`package.json`**
   - Added `pricing:setup` script
   - Added `pricing:monitor` script

### Documentation

1. **`docs/PRICING_EXPERIMENT.md`**
   - Comprehensive implementation guide
   - How it works, tracking, decision framework

2. **`docs/PRICING_EXPERIMENT_3WAY_IMPLEMENTATION.md`**
   - Technical implementation details
   - Code changes, rollout plan

3. **`docs/PRICING_EXPERIMENT_QUICK_START.md`**
   - 30-minute quick start guide
   - Get experiment live fast

4. **`docs/PRICING_EXPERIMENT_EXECUTION_GUIDE.md`**
   - Day-by-day execution plan
   - What to do each day of the 2-4 week test

5. **`docs/PRICING_EXPERIMENT_RESULTS_TEMPLATE.md`**
   - Results analysis template
   - Decision matrix, implementation plan

6. **`docs/README_PRICING_EXPERIMENT.md`**
   - This file - complete overview

---

## How It Works

### User Flow

1. **User visits `/pricing`**
   - System checks localStorage for existing variant
   - If new: randomly assign variant (33% A, 33% B, 34% C)
   - Persist assignment in localStorage

2. **User sees pricing**
   - Pro plan shows either $49, $79, or $99 annual price
   - Monthly $19 option available to all
   - Billing interval toggle (Annual / Monthly)

3. **User selects tier & clicks "Upgrade"**
   - PostHog event: `pricing_tier_selected`
   - Redirects to Stripe checkout with variant-specific price ID

4. **User completes checkout**
   - PostHog event: `checkout_completed`
   - Subscription stored in database with variant metadata

### Tracking

**PostHog Events:**
- `pricing_experiment_exposed` - First exposure to experiment
- `pricing_page_viewed` - Page view with variant info
- `pricing_interval_toggled` - Monthly ↔ Annual toggle
- `pricing_tier_selected` - Upgrade button clicked
- `checkout_started` - Stripe checkout initiated
- `checkout_completed` - Payment successful

**Database:**
- `subscriptions` table stores:
  - `stripe_price_id` - Maps to variant
  - `amount` - Revenue calculation
  - `metadata` - JSON with variant, cohort, experiment info

**Analytics Dashboard:**
- Real-time conversions by variant
- Revenue by variant
- Product Hunt vs organic performance
- Recommendations

---

## Decision Making

### After 100+ Conversions

**Calculate winner by total revenue:**

| Variant | Price | Conversions | Revenue | Winner? |
|---------|-------|-------------|---------|---------|
| $49 | $49 | 50 | $2,450 | ❌ |
| $79 | $79 | 35 | $2,765 | ✅ |
| $99 | $99 | 20 | $1,980 | ❌ |

**Winner: $79** (highest revenue despite mid-tier conversions)

### Decision Framework

**If $49 wins (highest revenue + conversions):**
- Keep $49 as standard
- Remove experiment code
- Use $49 for all marketing

**If $79 wins (balanced):**
- Switch to $79 standard
- Use $49 for limited promos
- Update messaging: "$6.58/month"

**If $99 wins (revenue over volume):**
- Implement tiered pricing:
  - Starter: $49
  - Standard: $79 ⭐
  - Premium: $99
- Differentiate features by tier

**If tied (all within 15%):**
- Extend test 1-2 weeks
- OR implement tiered pricing
- OR default to $79 (safe middle ground)

---

## Daily Workflow

### Every Morning (9 AM) - 5 minutes

1. Run: `npm run pricing:monitor`
2. Review output:
   - Total conversions (goal: 100+)
   - Revenue by variant
   - Leading variant
   - Any red flags (0 conversions on a variant)
3. Log in tracking spreadsheet
4. Watch 1-2 session recordings in PostHog

### Weekly Review (Day 7, 14) - 30 minutes

1. Pull detailed metrics from `/dashboard/pricing-analytics`
2. Calculate:
   - Conversion rate by variant
   - Statistical significance
   - Product Hunt vs organic performance
3. Document insights
4. Assess if ready to decide or need to extend

---

## Red Flags (Investigate Immediately)

| Red Flag | Action |
|----------|--------|
| **One variant has 0 conversions after 48 hours** | Check Stripe price ID, test checkout manually |
| **Traffic imbalance (>40% to one variant)** | Check randomization logic in code |
| **Conversion rate crash (>50% drop)** | Check Stripe, review Sentry errors, check deployments |
| **No PostHog events** | Verify API key, check browser console for errors |

---

## FAQs

**Q: Can I stop the test early if one variant is clearly winning?**
A: No. Wait for minimum 100 conversions and 14 days. Early stopping introduces bias.

**Q: What if we don't reach 100 conversions after 4 weeks?**
A: Make directional decision with available data. Note results are not statistically significant.

**Q: Should we optimize for conversion rate or revenue?**
A: **Always optimize for total revenue.** 50 conversions at $49 ($2,450) < 35 conversions at $79 ($2,765).

**Q: Can we run other pricing tests simultaneously?**
A: Not recommended. One pricing test at a time to avoid interaction effects.

**Q: What if Product Hunt users behave differently?**
A: Analyze PH cohort separately. Consider creating PH-specific pricing page.

---

## Troubleshooting

### Events not showing in PostHog

```bash
# Browser console
posthog.__loaded // Should be true
posthog.capture('test_event', { test: true });

# Check network tab for POST to app.posthog.com/e/
```

### Variants not randomizing

```bash
# Browser console
localStorage.clear();
window.location.reload();
localStorage.getItem('pricing_experiment_variant'); // Should change on refresh
```

### Checkout broken for one variant

```bash
# Test manually
localStorage.setItem('pricing_experiment_variant', 'annual_99');
window.location.reload();
# Click "Upgrade" button
# Should redirect to Stripe with $99.00 amount
```

---

## Post-Experiment Cleanup

### When experiment concludes:

1. **Archive experiment code:**
   ```bash
   mkdir -p archive/pricing-experiment-2026-q1
   mv hooks/use-pricing-experiment.ts archive/pricing-experiment-2026-q1/
   mv components/BillingIntervalToggle.tsx archive/pricing-experiment-2026-q1/
   ```

2. **Update pricing page:**
   - Remove experiment hook
   - Hardcode winning price
   - Simplify code

3. **Update environment variables:**
   - Remove unused price IDs
   - Keep only winning variant

4. **Document results:**
   - Fill out `PRICING_EXPERIMENT_RESULTS_TEMPLATE.md`
   - Add to `docs/PRICING_EXPERIMENT_RESULTS_2026_Q1.md`

5. **Communicate:**
   - Email team with results
   - Update stakeholders
   - Share lessons learned

---

## Resources

### Code
- Experiment hook: `hooks/use-pricing-experiment.ts`
- Pricing page: `app/pricing/page.tsx`
- Analytics API: `app/api/analytics/pricing-experiment/route.ts`
- Dashboard: `app/dashboard/pricing-analytics/page.tsx`

### Scripts
- Setup: `npm run pricing:setup`
- Monitor: `npm run pricing:monitor`

### Dashboards
- Analytics: `/dashboard/pricing-analytics`
- PostHog: https://app.posthog.com
- Stripe: https://dashboard.stripe.com/subscriptions

### Documentation
- Quick Start: `docs/PRICING_EXPERIMENT_QUICK_START.md`
- Full Guide: `docs/PRICING_EXPERIMENT.md`
- Execution: `docs/PRICING_EXPERIMENT_EXECUTION_GUIDE.md`
- Results: `docs/PRICING_EXPERIMENT_RESULTS_TEMPLATE.md`

---

## Timeline

| Milestone | Duration | Description |
|-----------|----------|-------------|
| **Setup** | 30 min | Create Stripe prices, add env vars, deploy |
| **Week 1** | 7 days | Data collection, daily monitoring |
| **Week 2** | 7 days | Continue collection, reach 100+ conversions |
| **Analysis** | 1 day | Pull metrics, calculate winner |
| **Implementation** | 2-3 days | Update code, deploy winning price |
| **Monitoring** | 7 days | Post-change validation |

**Total:** ~3 weeks from start to finish

---

## Success Criteria

**Experiment is successful if:**
- ✅ Reached 100+ conversions
- ✅ Statistical significance (p < 0.05)
- ✅ Clear winner (>20% revenue advantage)
- ✅ No technical issues or bugs
- ✅ Cohort analysis provides insights

**Experiment needs extension if:**
- ⏳ <100 conversions after 2 weeks
- ⏳ Results tied (all within 15% revenue)
- ⏳ Low traffic volume

**Experiment failed if:**
- ❌ Technical bugs invalidated results
- ❌ <50 conversions after 4 weeks
- ❌ External factors skewed data (site outage, major news)

---

## Contact

**Questions during experiment:**
- Implementation: See docs above
- Technical issues: Check Sentry dashboard
- Revenue analysis: `/dashboard/pricing-analytics`

**Emergency:**
- Rollback: `git revert HEAD`
- Hotfix: Fix → `npm run build` → push to GitHub
- Kill experiment: Remove experiment code, deploy

---

**Status:** ✅ READY TO LAUNCH

**Next step:** Run `npm run pricing:setup` to create Stripe prices, then follow Quick Start guide.

**Let's maximize revenue! 🚀**
