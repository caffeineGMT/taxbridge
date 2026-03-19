# Conversion Optimization Experiments

## Overview

This A/B testing system runs **3 simultaneous experiments** on the pricing page to achieve a **20%+ lift in free→paid conversion rate**.

**Target Deadline:** 1 week (March 26, 2026)

## Experiments

### 1. Pricing Headline Test
**Goal:** Find the most compelling value proposition

**Variants:**
- **Control:** "Simple, Transparent Pricing"
- **ROI-Focused:** "Pay $49 to Save $2,500+ on Taxes"
- **Pain-Point:** "Stop Overpaying Taxes on Your RSUs"

**Hypothesis:** ROI-focused messaging (quantified savings) will convert better than generic transparency messaging.

---

### 2. Free Tier Limit Test
**Goal:** Test scarcity vs abundance

**Variants:**
- **Limited (5 calcs):** "5 calculations/year" + urgency message
- **Unlimited:** "Unlimited calculations"

**Hypothesis:** Limited free tier creates urgency and drives faster upgrades.

---

### 3. Social Proof Placement Test
**Goal:** Find optimal placement for testimonials/trust signals

**Variants:**
- **Above Fold:** Compact horizontal bar before hero
- **Below Pricing:** Full testimonials section after pricing cards
- **Sidebar:** Sticky sidebar with testimonials + trust badges

**Hypothesis:** Above-fold social proof builds trust earlier in the funnel.

---

## How It Works

### Assignment Algorithm
- **Equal distribution:** Users are randomly assigned to variants with equal probability (33.3% each for 3-variant tests, 50/50 for 2-variant tests)
- **Persistent assignment:** Variant assignment is stored in `localStorage` and persists across sessions
- **Independent experiments:** Each experiment runs independently, creating a factorial design (3 × 2 × 3 = 18 possible combinations)

### Tracking
1. **Exposure:** Tracked when user views pricing page
2. **Signup:** Tracked when user clicks "Get Started Free"
3. **Checkout:** Tracked when user clicks "Start 14-Day Free Trial" (Pro plan)
4. **Paid:** Tracked when user completes Stripe checkout (webhook)

### Data Storage
- **Client-side:** Variant assignments stored in `localStorage`
- **Analytics:** Events sent to PostHog for funnel analysis
- **API:** In-memory metrics tracked at `/api/analytics/conversion-experiments`

---

## Monitoring

### Dashboard
**URL:** `/admin/conversion-experiments`

**Metrics Displayed:**
- Exposures per variant
- Conversions per variant (signup, checkout, paid)
- Conversion rate (paid / exposures)
- Lift vs control
- Combined variant performance (factorial analysis)

### Statistical Significance
- **Minimum sample size:** 200-500 exposures per variant
- **Confidence threshold:** 95%
- **Expected timeline:** 7-14 days at current traffic (~50-100 pricing page views/day)

---

## Implementation Files

### Hooks
- `hooks/use-conversion-experiments.ts` - Main experiment logic
- `hooks/use-pricing-experiment.ts` - Existing pricing A/B test

### Components
- `components/SocialProofSection.tsx` - Dynamic social proof component
- `app/pricing/page.tsx` - Pricing page with integrated experiments

### API
- `app/api/analytics/conversion-experiments/route.ts` - Experiment metrics API

### Dashboard
- `app/admin/conversion-experiments/page.tsx` - Real-time experiment dashboard

---

## Usage

### For Developers

**1. Run experiments locally:**
```bash
npm run dev
# Visit http://localhost:3000/pricing
# Refresh multiple times to see different variants
```

**2. View dashboard:**
```bash
# Visit http://localhost:3000/admin/conversion-experiments
```

**3. Clear variant assignment (for testing):**
```javascript
// In browser console:
localStorage.removeItem('experiment_pricing_headline');
localStorage.removeItem('experiment_free_tier_limit');
localStorage.removeItem('experiment_social_proof_placement');
location.reload();
```

### For Analysts

**1. Monitor daily:**
- Check `/admin/conversion-experiments` dashboard
- Look for winning variants reaching 95% confidence
- Watch for outliers or unexpected behavior

**2. Track in PostHog:**
```
Event: pricing_page_viewed
Properties:
  - headline_variant: control | roi_focused | pain_point
  - free_tier_variant: limited_5 | unlimited
  - social_proof_variant: above_fold | below_pricing | sidebar
  - experiment_session: combined variant key
```

**3. Analyze funnel:**
```
Pricing Page View → Tier Selected → Checkout Started → Subscription Activated
```

---

## Expected Results

### Success Criteria
- **Primary:** ≥20% lift in conversion rate vs control baseline
- **Secondary:** Statistical significance (p < 0.05) within 14 days

### Baseline Metrics (Estimated)
- Pricing page views: ~50-100/day
- Current conversion rate: ~2-5% (free → paid)
- Target conversion rate: ≥2.4-6% (20% lift)

### Predicted Winners (Hypothesis)
1. **Headline:** ROI-focused (+25% lift)
2. **Free Tier:** Limited 5 calcs (+15% lift)
3. **Social Proof:** Above fold (+10% lift)
4. **Combined lift:** ~30-40% (compounding effects)

---

## Rollout Plan

### Phase 1: Testing (Days 1-7)
- ✅ All 3 experiments live on pricing page
- Monitor dashboard daily
- Collect minimum 200 exposures per variant

### Phase 2: Analysis (Days 7-8)
- Calculate statistical significance
- Identify winning variants
- Document lift percentages

### Phase 3: Rollout (Days 9-10)
- Update hooks to show winning variants to 100% of users
- Remove losing variants
- Measure overall conversion lift

### Phase 4: Iteration (Days 11+)
- Design next round of experiments
- Test new hypotheses (pricing tiers, CTAs, etc.)
- Continuous optimization

---

## Code Examples

### Track Experiment Exposure
```typescript
import { useConversionExperiments } from '@/hooks/use-conversion-experiments';

const experiments = useConversionExperiments();

useEffect(() => {
  experiments.trackExperimentExposure();
}, []);
```

### Track Conversion
```typescript
// When user completes signup
experiments.trackConversion('signup');

// When user starts checkout
experiments.trackConversion('checkout');

// When user completes payment (in webhook)
experiments.trackConversion('paid');
```

### Get Current Variants
```typescript
const {
  headline,        // { variant, title, subtitle }
  freeTier,        // { variant, calculationsAllowed, label }
  socialProof,     // { variant, layout, showTestimonials, ... }
} = useConversionExperiments();
```

---

## Troubleshooting

### No data showing in dashboard
- Check that pricing page is receiving traffic
- Verify PostHog is initialized (`NEXT_PUBLIC_POSTHOG_KEY` set)
- Check browser console for API errors

### Variants not changing
- Clear localStorage (see "Clear variant assignment" above)
- Verify hooks are imported correctly
- Check that experiments hook is not loading infinitely

### Unbalanced traffic
- This is expected in early stages (random distribution)
- Should even out after 100+ exposures
- Can manually rebalance by adjusting weights in `getVariantAssignment()`

---

## Next Steps

1. **Launch experiments:** Deploy to production ✅
2. **Monitor daily:** Check dashboard for 7-14 days
3. **Analyze results:** Calculate lift and statistical significance
4. **Roll out winners:** Update code to use winning variants
5. **Iterate:** Design next round of experiments

**Target:** Achieve 20%+ conversion lift by March 26, 2026

---

## Questions?

Contact: michael@taxbridge.com
