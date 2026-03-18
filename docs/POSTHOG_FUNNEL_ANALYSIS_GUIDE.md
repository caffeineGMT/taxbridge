# PostHog Funnel Analysis Guide - TaxBridge

This guide walks through setting up and analyzing conversion funnels in PostHog to identify drop-off points and optimize the Product Hunt launch.

---

## Quick Start

### 1. Access PostHog Dashboard

1. Go to [app.posthog.com](https://app.posthog.com) (or your self-hosted instance)
2. Sign in with TaxBridge workspace credentials
3. Navigate to **Insights → Funnels**

### 2. Create Primary Conversion Funnel

**Goal:** Track visitors from Product Hunt through to paid subscription

**Steps:**
1. Click **+ New Insight** → Select **Funnel**
2. Name it: "Product Hunt Launch Funnel"
3. Add funnel steps (in order):

#### Step 1: Landing Page View
- **Event:** `page_viewed`
- **Filters:**
  - `properties.page` = `/` OR `/pricing`
  - `properties.utm_source` = `producthunt`

#### Step 2: Pricing Page View
- **Event:** `pricing_page_viewed`
- **Filters:**
  - `properties.utm_source` = `producthunt`

#### Step 3: Checkout Started
- **Event:** `checkout_started`
- **Filters:**
  - `properties.utm_source` = `producthunt`

#### Step 4: Subscription Created
- **Event:** `subscription_activated`
- **Filters:**
  - `properties.utm_source` = `producthunt`
  - `properties.plan` IN (`pro`, `enterprise`)

4. **Date Range:** Set to "Last 7 days" or custom launch date range
5. **Conversion Window:** 7 days (users have a week to convert)
6. Click **Save & View**

---

## Interpreting Results

### Healthy Funnel Benchmarks (SaaS Industry)

| Step | Conversion Rate | Drop-off Rate |
|------|-----------------|---------------|
| Landing → Pricing | 40-60% | 40-60% |
| Pricing → Checkout | 5-15% | 85-95% |
| Checkout → Paid | 70-85% | 15-30% |
| **Overall (Landing → Paid)** | **2-5%** | **95-98%** |

### Red Flags 🚨

#### High Drop-off: Landing → Pricing (>70%)
**Symptoms:**
- Users leave homepage without exploring further
- Low pricing page views despite high traffic

**Possible Causes:**
- Homepage doesn't communicate value clearly
- Slow page load times
- Bad mobile UX
- Wrong audience (traffic not qualified)

**Action Items:**
- A/B test hero section copy
- Add "Calculate My Savings" CTA on homepage
- Optimize page load speed (< 2 seconds)
- Review Product Hunt post targeting

#### High Drop-off: Pricing → Checkout (>50%)
**Symptoms:**
- Users view pricing but don't start checkout
- Low conversion despite high pricing page traffic

**Possible Causes:**
- Pricing too high or unclear value
- Lack of trust signals (no testimonials, badges)
- Confusing tier differences
- No urgency (no limited-time discount)

**Action Items:**
- Add social proof (testimonials with savings amounts)
- Display trust badges (SOC 2, CPA-reviewed)
- Highlight "Most Popular" tier
- Add countdown timer for HUNT20 discount
- Include FAQ section addressing objections

#### High Drop-off: Checkout → Paid (>30%)
**Symptoms:**
- Users start checkout but don't complete payment
- High Stripe checkout abandonment

**Possible Causes:**
- Stripe form errors or payment failures
- Checkout page too slow
- Required fields too complex
- No guest checkout option
- Hidden fees or unexpected charges

**Action Items:**
- Review Stripe error logs for failed payments
- Simplify checkout form (fewer required fields)
- Add progress indicator ("Step 2 of 3")
- Display security badges on checkout page
- Enable Google Pay / Apple Pay

---

## Advanced Funnels

### Funnel 2: Free → Paid Conversion (7-Day Window)

**Purpose:** Track how many free users upgrade within first week

**Steps:**
1. `signup_completed` (any source)
2. `first_rsu_entry_completed`
3. `ftc_optimizer_used`
4. `pricing_page_viewed`
5. `subscription_activated`

**Insights:**
- Which features drive upgrades (FTC optimizer = activation point?)
- Time to conversion (how long from signup to paid?)
- Feature adoption sequence (do users try calculator first?)

### Funnel 3: Onboarding Completion

**Purpose:** Identify where users drop off during onboarding

**Steps:**
1. `signup_completed`
2. `onboarding_started`
3. `onboarding_step_completed` (step 1: Employer selection)
4. `onboarding_step_completed` (step 2: Province/State)
5. `onboarding_step_completed` (step 3: RSU vesting schedule)
6. `onboarding_completed`

**Insights:**
- Which onboarding step has highest abandonment?
- Do users skip onboarding entirely?
- Does completing onboarding → higher paid conversion?

### Funnel 4: Email Drip → Paid Conversion

**Purpose:** Measure email campaign effectiveness

**Steps:**
1. `email_link_clicked` (drip_day14)
2. `pricing_page_viewed` (within 24 hours)
3. `checkout_started`
4. `subscription_activated`

**Insights:**
- Email open → paid conversion rate
- Best-performing email (Day 3 vs Day 7 vs Day 14)
- Optimal send time (morning vs evening)

---

## Exporting Data

### CSV Export for Analysis

1. Open saved funnel
2. Click **Export** (top right)
3. Choose format:
   - **CSV** - Raw event data for Excel/Sheets analysis
   - **PNG** - Visual funnel chart for presentations
   - **JSON** - Structured data for custom scripts

### Share with Team

1. Click **Share** button
2. Options:
   - **Link** - Shareable URL (anyone with link can view)
   - **Email** - Send to specific team members
   - **Embed** - Iframe for internal dashboards
   - **Slack** - Post to #growth channel

---

## Segmentation & Filters

### Compare Cohorts

**Question:** Do users from Reddit convert better than Product Hunt?

**Steps:**
1. Open funnel
2. Click **Breakdown** tab
3. Select breakdown property: `properties.utm_source`
4. Compare conversion rates:
   - `producthunt` → _[X]_%
   - `reddit` → _[Y]_%
   - `hackernews` → _[Z]_%

### Filter by User Properties

**Question:** Do Canadian users convert better than US users?

**Steps:**
1. Add filter to funnel
2. Select property: `properties.province` (for Canada) or `properties.state` (for US)
3. Compare conversion rates by location

### Time-based Analysis

**Question:** Does conversion improve over time as we optimize?

**Steps:**
1. Set date range to "Last 30 days"
2. Group by: **Day** (not cumulative)
3. View trend line of daily conversion rates
4. Identify spikes (what changed on those days?)

---

## A/B Testing in PostHog

### Feature Flags Setup

#### Test 1: Social Proof Banner

1. **Create Feature Flag:**
   - Name: `pricing-social-proof-test`
   - Rollout: 50% (randomly assign)
   - Variants:
     - `control` (no banner)
     - `variant_a` (testimonial banner)
     - `variant_b` (trust badges)

2. **Track Exposure:**
```typescript
import { getFeatureFlag, trackExperiment } from '@/lib/analytics/posthog';

const variant = getFeatureFlag('pricing-social-proof-test');
trackExperiment('pricing-social-proof-test', variant, {
  page: '/pricing',
  utm_source: 'producthunt',
});
```

3. **Analyze Results:**
   - Navigate to **Experiments** → `pricing-social-proof-test`
   - View conversion rates by variant
   - Check statistical significance (>95% confidence)
   - Roll out winner to 100%

#### Test 2: CTA Copy

**Variants:**
- Control: "Start 7-Day Free Trial"
- Variant A: "Calculate My Savings (Free)"
- Variant B: "See How Much I Can Save"

**Setup:**
```typescript
const ctaVariant = getFeatureFlag('pricing-cta-test');

const ctaText = {
  'control': 'Start 7-Day Free Trial',
  'variant_a': 'Calculate My Savings (Free)',
  'variant_b': 'See How Much I Can Save',
}[ctaVariant] || 'Start 7-Day Free Trial';
```

**Measure:** Click-through rate on CTA button

---

## Automated Alerts

### Set Up Conversion Alerts

**Goal:** Get notified when conversion rate drops below threshold

**Steps:**
1. Open saved funnel
2. Click **Alerts** tab
3. Configure:
   - **Metric:** Overall conversion rate (Landing → Paid)
   - **Condition:** Falls below 1.5%
   - **Frequency:** Check daily
   - **Notification:** Email + Slack #alerts channel
4. Save alert

**Use Cases:**
- Payment processor downtime (Stripe API failures)
- Broken checkout flow (deployment bug)
- Traffic quality drop (wrong audience)

---

## Integration with Database

### Cross-reference PostHog with SQLite

**Query: Get user IDs who reached pricing but didn't convert**

```typescript
// 1. Get user IDs from PostHog funnel who reached Step 2 but not Step 4
// Export CSV of user IDs

// 2. Query SQLite for those users
const db = getDatabase();
const stuckUsers = db.prepare(`
  SELECT
    id,
    email,
    first_name,
    created_at,
    subscription_tier
  FROM user_profiles
  WHERE id IN (?, ?, ?, ...) -- Insert PostHog user IDs
    AND subscription_tier = 'free'
  ORDER BY created_at DESC
`).all();

// 3. Send targeted email with 20% discount
```

---

## Best Practices

### DO ✅
- **Track consistently** - Use same event names everywhere
- **Add UTM parameters** - Always tag traffic sources
- **Set conversion windows** - Give users time (7 days is standard)
- **Segment by cohort** - Compare different traffic sources
- **Monitor daily** - Check funnels every morning during launch
- **Document changes** - Note when you make product changes
- **A/B test incrementally** - Test one thing at a time

### DON'T ❌
- **Mix event types** - Don't combine `page_viewed` and custom events
- **Change event schemas** - Breaking changes invalidate historical data
- **Ignore mobile users** - 40% of traffic is mobile
- **Optimize too early** - Need 100+ conversions for statistical significance
- **Test everything** - Focus on biggest drop-off points first
- **Skip attribution** - Always tag traffic with UTM params

---

## Common Issues & Fixes

### Issue: "Funnel shows 0% conversion"

**Causes:**
- Events not firing (check browser console)
- PostHog not initialized (check `posthog.__loaded`)
- Filters too restrictive (no users match)
- Date range too narrow

**Fix:**
```typescript
// Test in browser console
console.log(posthog.__loaded); // Should be true
posthog.capture('test_event', { test: true }); // Should appear in PostHog
```

### Issue: "Conversion rate seems too high/low"

**Causes:**
- Development traffic not filtered out
- Bots counted as users
- Conversion window too short/long
- Duplicate events from page refreshes

**Fix:**
```typescript
// Filter out internal traffic
if (process.env.NODE_ENV !== 'production') {
  return; // Don't track in development
}

// Filter out bots
if (navigator.userAgent.includes('bot')) {
  return;
}
```

### Issue: "Can't export funnel data"

**Causes:**
- Browser ad blocker (PostHog blocked)
- Insufficient permissions (view-only access)
- Large dataset (>10K rows)

**Fix:**
- Disable ad blocker for PostHog domain
- Request admin access from team owner
- Apply date filter to reduce dataset size

---

## Resources

**PostHog Documentation:**
- Funnels Guide: https://posthog.com/docs/user-guides/funnels
- Feature Flags: https://posthog.com/docs/user-guides/feature-flags
- A/B Testing: https://posthog.com/docs/user-guides/experimentation

**TaxBridge Analytics Files:**
- `lib/analytics/posthog.ts` - Event tracking functions
- `components/PostHogProvider.tsx` - Client initialization
- `app/pricing/page.tsx` - Pricing page instrumentation

**Support:**
- Internal Slack: #analytics
- PostHog Community: https://posthog.com/community

---

## Action Items Checklist

**Immediate (Day 1):**
- [ ] Create "Product Hunt Launch Funnel" in PostHog
- [ ] Set up conversion rate alert (<1.5%)
- [ ] Export first 24 hours of data to CSV
- [ ] Identify #1 drop-off point

**Week 1:**
- [ ] Create 3 additional funnels (Free→Paid, Onboarding, Email→Paid)
- [ ] Set up A/B tests for top 2 drop-off points
- [ ] Segment funnel by traffic source (PH vs Reddit vs HN)
- [ ] Share weekly funnel report with team

**Ongoing:**
- [ ] Review funnel daily during launch week
- [ ] Update retrospective doc with findings
- [ ] Optimize winning variant to 100%
- [ ] Document lessons learned

---

**Last Updated:** March 18, 2026
**Owner:** Growth / Analytics Team
**Review Cadence:** Weekly during launch, monthly thereafter
