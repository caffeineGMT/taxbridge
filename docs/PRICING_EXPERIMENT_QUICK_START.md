# Pricing Experiment - Quick Start Guide

**Goal**: Get pricing experiment live in 30 minutes
**Test**: $49 vs $79 vs $99/year (3-way A/B/C test)
**Duration**: 2-4 weeks, minimum 100 conversions

---

## ⚡ 5-Step Quick Start

### Step 1: Run Stripe Setup (5 min)

Create Stripe price products for all variants:

```bash
cd /Users/michaelguo/hivemind-projects/cross-border-tax
npx ts-node scripts/setup-pricing-experiment.ts
```

**Output**: You'll get 3 price IDs like:
```
price_1XXXXXXXX - $79/year (Variant B)
price_1YYYYYYYY - $99/year (Variant C)
price_1ZZZZZZZZ - $19/month
```

**Copy these IDs** - you'll need them in Step 2.

---

### Step 2: Update Environment Variables (3 min)

Add to `.env.local` and `.env.production`:

```bash
# Variant A: $49/year (EXISTING - don't change)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1ProAnnual49

# Variant B: $79/year (NEW)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79=price_1XXXXXXXX

# Variant C: $99/year (NEW)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_99=price_1YYYYYYYY

# Monthly option: $19/month (NEW)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY=price_1ZZZZZZZZ
```

**Replace** `price_1XXXXXXXX`, etc. with actual IDs from Step 1.

**For production deployment**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all 4 variables above
3. Click "Save"

---

### Step 3: Deploy to Production (5 min)

Build and deploy:

```bash
npm run build

# If build succeeds:
git add -A
git commit -m "[P2-MEDIUM] Pricing Experiment - $49 vs $79 vs $99/year test LIVE"
git push origin main
```

Vercel will auto-deploy in ~2 minutes.

---

### Step 4: Verify Experiment is Live (10 min)

**Test all 3 variants**:

1. Go to: https://taxbridgecpa.com/pricing
2. Open browser console (F12)
3. Clear storage: `localStorage.clear()`
4. Refresh page
5. Check variant: `localStorage.getItem('pricing_experiment_variant')`
   - Should return: `"annual_49"` or `"annual_79"` or `"annual_99"`
6. Repeat steps 3-5 **five times** to see all 3 variants

**Test checkout**:

1. Force $79 variant: `localStorage.setItem('pricing_experiment_variant', 'annual_79')`
2. Refresh page
3. Click "Upgrade to Pro" button
4. Should redirect to Stripe checkout with "$79.00/year"
5. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
6. Complete checkout
7. Verify subscription created in Stripe dashboard

**Test PostHog tracking**:

1. Go to PostHog dashboard: https://app.posthog.com
2. Click "Live Events" in sidebar
3. Visit `/pricing` page on your site
4. Should see events appear:
   - `pricing_experiment_exposed`
   - `pricing_page_viewed`
5. Check event properties include: `variant`, `annualPrice`, `experiment_name`

---

### Step 5: Set Up Monitoring (7 min)

**Daily dashboard**:

1. Bookmark: https://taxbridgecpa.com/dashboard/pricing-analytics
2. Check this **every morning at 9 AM** for:
   - Total conversions (target: 100+)
   - Revenue by variant
   - Leading variant
   - Sample size progress

**Create tracking spreadsheet** (optional but recommended):

| Date | Total Conv | $49 Conv | $49 Rev | $79 Conv | $79 Rev | $99 Conv | $99 Rev | Notes |
|------|-----------|----------|---------|----------|---------|----------|---------|-------|
| Day 1 | 3 | 2 | $98 | 1 | $79 | 0 | $0 | Launch day |
| Day 2 | 8 | 4 | $196 | 3 | $237 | 1 | $99 | ... |

---

## ✅ Launch Checklist

Before marking experiment as "LIVE":

- [ ] Stripe setup script ran successfully
- [ ] 4 price IDs added to `.env.local` and `.env.production`
- [ ] Vercel environment variables updated
- [ ] Build passes with `npm run build`
- [ ] Deployed to production (GitHub push)
- [ ] All 3 variants appear on `/pricing` page (tested via localStorage)
- [ ] Checkout works for $49, $79, $99 (tested with Stripe test card)
- [ ] PostHog events firing (verified in Live Events)
- [ ] Analytics dashboard showing initial data
- [ ] Team notified experiment is LIVE

**When all checked**: Experiment is LIVE ✅

---

## 📅 Timeline

### Week 1 (Days 1-7): Data Collection
- Monitor daily at 9 AM
- Target: 30-50 conversions by end of week
- Watch for bugs: Any variant with 0 conversions = red flag

### Week 2 (Days 8-14): Decision Point
- Target: 100+ conversions
- Pull final metrics
- Calculate statistical significance
- Make decision: Which variant wins?

### Week 3-4 (Optional Extension)
- Only if <100 conversions after Week 2
- OR results tied (all within 15% revenue)
- Maximum test duration: 28 days

---

## 🎯 Success Metrics

**Primary Metric**: Total revenue per variant
- $49: (conversions × $49)
- $79: (conversions × $79)
- $99: (conversions × $99)
- **Winner = highest total revenue**

**Secondary Metrics**:
- Conversion rate by variant
- Product Hunt cohort vs organic users
- Monthly vs annual preference

**Minimum Sample Size**: 100 total conversions
**Statistical Significance**: Winner has >20% revenue advantage + p < 0.05

---

## 🚨 Red Flags (Check Daily)

| Red Flag | Symptom | Action |
|----------|---------|--------|
| **Zero conversions on one variant** | $99 has 0 conversions after 48 hours | Check Stripe price ID, test checkout manually, investigate bug |
| **Traffic imbalance** | $49 gets 60%, $79 gets 30%, $99 gets 10% | Check randomization logic in `use-pricing-experiment.ts` |
| **Conversion rate crash** | Went from 3% to 0.5% overnight | Check Stripe checkout, review Sentry errors, check recent deployments |
| **No PostHog events** | Dashboard shows 0 events | Check PostHog API key, verify events in browser console |

---

## 📊 Decision Framework (After 2-4 Weeks)

### Scenario 1: $49 Wins
- **Revenue**: $49 has highest total revenue AND highest conversions
- **Action**: Keep $49 as standard pricing, remove experiment code
- **Messaging**: Promote "Launch Special - 50% OFF" urgency

### Scenario 2: $79 Wins
- **Revenue**: $79 has highest total revenue (balanced CR + price)
- **Action**: Switch to $79 as standard, use $49 for promos only
- **Messaging**: Emphasize value: "$79/year = $6.58/month"

### Scenario 3: $99 Wins
- **Revenue**: $99 has highest total revenue despite lower CR
- **Action**: Implement tiered pricing:
  - Starter: $49/year
  - Standard: $79/year ⭐ Recommended
  - Premium: $99/year
- **Messaging**: Position $79 as best value, $99 as premium

### Scenario 4: Tied (All Within 15%)
- **Revenue**: All variants within 15% of each other
- **Action**: Extend test 1-2 weeks OR implement tiered pricing
- **Messaging**: Analyze Product Hunt cohort separately for insights

---

## 🆘 Emergency Contacts

**If something breaks during experiment**:

1. **Check**: `/dashboard/pricing-analytics` for anomalies
2. **Review**: Sentry dashboard for errors
3. **Test**: Stripe checkout manually
4. **Rollback**: `git revert HEAD` if needed
5. **Document**: What broke, when, how you fixed it

**Resources**:
- Full guide: `docs/PRICING_EXPERIMENT_EXECUTION_GUIDE.md`
- Implementation: `docs/PRICING_EXPERIMENT_3WAY_IMPLEMENTATION.md`
- Code: `hooks/use-pricing-experiment.ts`, `app/pricing/page.tsx`
- Dashboard: `/dashboard/pricing-analytics`
- API: `/api/analytics/pricing-experiment`

---

**Total setup time**: 30 minutes
**Next check-in**: Daily at 9 AM
**Decision point**: Day 14 (or when 100+ conversions reached)

**Let's maximize revenue. Launch the experiment!** 🚀
