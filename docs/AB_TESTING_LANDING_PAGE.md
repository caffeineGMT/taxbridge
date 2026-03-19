# Landing Page Conversion Optimization A/B Testing

## Overview

This document describes the comprehensive A/B testing infrastructure for landing page conversion optimization targeting a **5%+ lift** in calculator → signup conversion.

## Active Experiments

### Experiment 1: Headline Variations

**Hypothesis:** More specific, benefit-driven headlines convert better than generic "simplify" messaging

**Test Name:** `landing-headline-test`

**Variants (33/33/34 split):**

1. **Control** - "Simplify Your Cross-Border Tax Filing"
   - Subheadline: Generic explanation of product

2. **Pain-Focused** - "Paying Double Tax on Your RSUs?"
   - Subheadline: "$2,500+ lost annually to incorrect Foreign Tax Credits"
   - **Hypothesis:** Pain-driven messaging creates urgency

3. **Outcome-Focused** - "Save $2,500+ on Cross-Border Taxes"
   - Subheadline: Emphasizes savings and confidence
   - **Hypothesis:** Positive framing with specific dollar amount drives action

**Success Metric:** Click-through rate on primary CTA button

---

### Experiment 2: CTA Button Copy & Color

**Hypothesis:** Value-oriented CTAs with contrasting colors outperform generic "Get Started" buttons

**Test Name:** `landing-cta-test`

**Variants (25/25/25/25 split):**

1. **Control** - "Get Started" (Emerald green)
   - No subtext
   - Standard brand color

2. **Urgency** - "Calculate Your Savings Now" (Orange)
   - Subtext: "⏱️ Free for limited time"
   - **Hypothesis:** Urgency + temporal scarcity drives immediate action

3. **Value-Prop** - "Save $2,500+ on Taxes →" (Gradient emerald-to-blue)
   - Subtext: "Free calculator • No credit card required"
   - **Hypothesis:** Specific value + friction reduction increases conversions

4. **Social-Proof** - "Join 1,247 Users" (Blue)
   - Subtext: "⭐ 4.8/5 from H-1B workers at FAANG"
   - **Hypothesis:** Social validation reduces perceived risk

**Success Metric:** Conversion rate from landing page to /dashboard

---

### Experiment 3: Trust Signals Placement

**Hypothesis:** Displaying social proof early (above hero) reduces bounce rate and increases engagement

**Test Name:** `landing-trust-signals-test`

**Variants (33/33/34 split):**

1. **Control** - Trust signals below CTA buttons
   - User count + security badges displayed after hero
   - Standard layout

2. **Social-Proof-Top** - Trust signals in sticky banner above hero
   - Visible immediately on page load
   - Includes user count, company logos, security badges
   - **Hypothesis:** Early trust-building prevents immediate bounce

3. **Badges-Inline** - Trust signals integrated with features
   - 3-column grid with metrics as cards
   - User count, security, CPA-reviewed as feature tiles
   - **Hypothesis:** Inline integration increases perceived value

**Success Metric:** Bounce rate + time on page

---

## PostHog Feature Flag Configuration

### Required Feature Flags

Create these feature flags in PostHog dashboard:

1. **landing-headline-test**
   - Type: Multivariate
   - Variants: `control`, `pain-focused`, `outcome-focused`
   - Rollout: 100% of users
   - Distribution: 33% / 33% / 34%

2. **landing-cta-test**
   - Type: Multivariate
   - Variants: `control`, `urgency`, `value-prop`, `social-proof`
   - Rollout: 100% of users
   - Distribution: 25% / 25% / 25% / 25%

3. **landing-trust-signals-test**
   - Type: Multivariate
   - Variants: `control`, `social-proof-top`, `badges-inline`
   - Rollout: 100% of users
   - Distribution: 33% / 33% / 34%

### Fallback Behavior

If PostHog is unavailable, experiments fall back to client-side weighted randomization with the same distribution.

---

## Tracking Events

### Automatic Event Tracking

All experiments automatically track:

- **Variant Exposure** - When user sees a variant
  - Event: `page_viewed`
  - Properties: `experiment`, `variant`, `exposureTracked: true`

- **CTA Clicks** - When user clicks primary button
  - Event: `signup_button_clicked`
  - Properties: `destination`, `ctaVariant`, `ctaText`, `funnelStep`, `funnelStepNumber`

### Conversion Funnel

The complete funnel tracked:

1. **Landing Page Viewed**
   - Funnel Step: 1
   - Events: All 3 experiment variants tracked

2. **CTA Click**
   - Funnel Step: 2
   - Track which variant combination led to click

3. **Dashboard Load** (`/dashboard`)
   - Funnel Step: 3
   - Measures signup completion

4. **Calculator Completion**
   - Funnel Step: 4
   - User completes first RSU calculation

5. **Pricing Page View** (`/pricing`)
   - Funnel Step: 5
   - User explores paid options

6. **Checkout Started**
   - Funnel Step: 6
   - User initiates Stripe checkout

7. **Subscription Activated**
   - Funnel Step: 7
   - Revenue conversion complete

---

## Analysis & Reporting

### PostHog Insights

Create these insights in PostHog:

1. **Headline Test Performance**
   ```
   Funnel:
   - landing_page_viewed (filter: headlineVariant)
   - signup_button_clicked
   - page_viewed (page: /dashboard)

   Breakdown: headlineVariant
   ```

2. **CTA Test Performance**
   ```
   Funnel:
   - landing_page_viewed
   - signup_button_clicked (filter: ctaVariant)
   - page_viewed (page: /dashboard)

   Breakdown: ctaVariant
   ```

3. **Trust Signals Impact on Bounce**
   ```
   Metric: Bounce Rate
   Filter: trustSignalsVariant
   Breakdown: trustSignalsLayout
   ```

4. **Combined Variant Performance**
   ```
   Funnel:
   - landing_page_viewed
   - signup_button_clicked
   - checkout_started

   Breakdown: headlineVariant, ctaVariant, trustSignalsVariant
   ```

### Success Criteria

**Primary Goal:** 5%+ lift in calculator → signup conversion

**Secondary Goals:**
- Reduce bounce rate by 10%+
- Increase time on page by 15%+
- Improve CTA click-through rate by 8%+

**Statistical Significance:**
- Minimum sample size: 1,000 visitors per variant
- Confidence level: 95%
- Expected runtime: 2-4 weeks

---

## Implementation Details

### File Structure

```
hooks/
  use-landing-page-tests.ts   # Main A/B test hook
  use-ab-test.ts              # Generic A/B test framework

components/
  TrustSignals.tsx            # Dynamic trust signal component

app/
  page.tsx                    # Landing page with experiments
  metadata.ts                 # SEO metadata
```

### Code Usage

```tsx
import { useLandingPageTests } from '@/hooks/use-landing-page-tests';

export default function Home() {
  const {
    headline,         // { variant, headline, subheadline, trackHeadlineViewed }
    cta,             // { variant, primaryText, primaryColor, subtext, trackCTAClick }
    trustSignals,    // { variant, layout, showUserCount, trackTrustSignalViewed }
    isLoading,
    trackLandingPageViewed,
    trackCTAClick,
  } = useLandingPageTests();

  useEffect(() => {
    if (!isLoading) {
      trackLandingPageViewed();
    }
  }, [isLoading]);

  return (
    <h1>{headline.headline}</h1>
    <Button onClick={() => trackCTAClick('/dashboard')}>
      {cta.primaryText}
    </Button>
  );
}
```

---

## Rollout Plan

### Phase 1: Launch (Week 1)
- ✅ Deploy experiments to production
- ✅ Verify PostHog tracking working
- ✅ Confirm all variants rendering correctly
- Monitor for errors/issues

### Phase 2: Data Collection (Weeks 2-4)
- Collect minimum 1,000 visitors per variant
- Monitor conversion rates daily
- Watch for anomalies in data

### Phase 3: Analysis (Week 5)
- Calculate statistical significance
- Identify winning variants
- Document learnings

### Phase 4: Winner Implementation (Week 6)
- Remove losing variants
- Set winner to 100% traffic
- Archive experiment documentation
- Plan next round of tests

---

## Monitoring

### Daily Checks

1. **PostHog Events Dashboard**
   - Confirm events firing for all variants
   - Check for missing/malformed data

2. **Variant Distribution**
   - Verify 33/33/34 and 25/25/25/25 splits maintained
   - Watch for skew from PostHog flag changes

3. **Conversion Funnel**
   - Track progression through steps
   - Identify drop-off points

### Weekly Review

1. **Intermediate Results**
   - Calculate conversion rates per variant
   - Assess progress toward significance

2. **Qualitative Feedback**
   - Review user recordings (PostHog session replay)
   - Check support tickets for confusion

---

## Troubleshooting

### Events Not Tracking

1. Check PostHog initialization in `lib/analytics/posthog.ts`
2. Verify `NEXT_PUBLIC_POSTHOG_KEY` in environment variables
3. Check browser console for PostHog errors
4. Confirm `posthog.__loaded` is true before tracking

### Variants Not Changing

1. Clear browser cookies/localStorage
2. Verify feature flags created in PostHog
3. Check flag rollout percentage (should be 100%)
4. Test in incognito/private browsing mode

### Incorrect Variant Distribution

1. Verify flag configuration matches documentation
2. Check PostHog insights for actual distribution
3. Allow 24-48h for distribution to stabilize

---

## Next Experiments (After Current Round)

Based on results, consider:

1. **Pricing Page Layout Test** (already implemented in `use-pricing-page-test.ts`)
2. **Feature Benefits Copy Test** (testimonial placement, feature descriptions)
3. **Calculator Onboarding Flow Test** (guided wizard vs. free-form)
4. **Social Proof Variants Test** (specific companies vs. generic "FAANG", ratings vs. user count)

---

## Contact

Questions about experiments? Check:
- PostHog dashboard: https://app.posthog.com
- Code implementation: `/hooks/use-landing-page-tests.ts`
- Analytics: `/lib/analytics/posthog.ts`
