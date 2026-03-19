# Landing Page Headline CRO A/B Test - March 2026

## Experiment Overview

**Status**: LIVE ✅
**Launch Date**: March 19, 2026
**End Date**: April 2, 2026 (2 weeks)
**Test Type**: 3-way A/B test
**Traffic Split**: 33% / 33% / 34%

## Hypothesis

Headlines that clearly communicate **specific value** (dollar savings, speed, or professional tool positioning) will convert better than generic cross-border tax messaging.

## Variants

### Variant A: Savings-Focused
**Headline**: "Save $5K+ on H1B RSU Taxes"
**Subheadline**: "H-1B and TN visa tech workers lose thousands to double taxation every year. Our CPA-verified calculator optimizes Foreign Tax Credits so you keep more of your RSU income."
**Visual Badge**: Shows "$5,000+" savings amount
**Value Proposition**: Direct financial benefit
**Target Audience**: Cost-conscious users who want to maximize tax savings

### Variant B: Professional Tool
**Headline**: "Cross-Border Tax Calculator for Tech Workers"
**Subheadline**: "Accurate US-Canada tax calculations built specifically for H-1B/TN visa holders with RSU compensation. CPA-verified Foreign Tax Credit optimizer included."
**Visual Badge**: None
**Value Proposition**: Professional credibility and accuracy
**Target Audience**: Users seeking a reliable, specialized tool

### Variant C: Speed/Simplicity
**Headline**: "Know Your RSU Tax Bill in 2 Minutes"
**Subheadline**: "Fast, accurate cross-border tax calculations for H-1B/TN workers. Enter your RSU details and get instant Foreign Tax Credit optimization—no tax expertise required."
**Visual Badge**: Shows "2 Min" time commitment
**Value Proposition**: Convenience and ease of use
**Target Audience**: Busy users who value quick solutions

## Success Metrics

### Primary Metric (Conversion Rate)
**Goal**: 15%+ improvement over baseline

**Baseline**: TBD (measure during first 3 days)

**Measurement**: Landing page views → Calculator completion rate

```
Conversion Rate = (Calculator Completions / Landing Page Views) × 100
```

### Secondary Metrics

1. **Signup Rate**
   - Landing page → Sign up completion
   - Measures brand trust and initial commitment

2. **CTA Click Rate**
   - Landing page → Primary CTA button click
   - Measures headline effectiveness in driving action

3. **Time to First Action**
   - Average time from landing to CTA click
   - Lower = more compelling headline

4. **Bounce Rate**
   - Percentage leaving without any interaction
   - Lower = better headline-audience fit

### Revenue Metrics (Optional - if sufficient paid conversions)

1. **Calculator → Paid Conversion**
   - Measures downstream revenue impact

2. **Revenue per Visitor (RPV)**
   - Total revenue / Total visitors
   - Variant with highest RPV wins if conversion rates are similar

## Traffic Requirements

**Minimum per variant**: 1,000 visitors
**Total experiment traffic**: 3,000+ visitors
**Statistical significance**: 95% confidence level
**Expected duration**: 14 days

## How to Monitor Results

### Option 1: PostHog Dashboard (Recommended)

1. **Navigate to PostHog**: https://app.posthog.com
2. **Go to Experiments tab**
3. **Find experiment**: "landing-headline-cro-march-2026"
4. **View metrics**:
   - Variant exposure counts
   - Conversion events by variant
   - Statistical significance indicator

### Option 2: Custom Funnel Analysis

1. **Go to PostHog → Insights → Funnels**
2. **Create funnel**:
   - Step 1: `landing_page_viewed` (with filter: `experimentName = landing-headline-cro-march-2026`)
   - Step 2: `cta_button_clicked`
   - Step 3: `tax_calculation_viewed`
   - Step 4: `signup_completed` (optional)
3. **Breakdown by**: `headlineVariant`
4. **Date range**: March 19 - April 2, 2026

### Option 3: Raw Event Query

Use this PostHog SQL query to pull raw data:

```sql
SELECT
  properties.headlineVariant as variant,
  COUNT(DISTINCT person_id) as unique_visitors,
  COUNT(DISTINCT CASE WHEN event = 'cta_button_clicked' THEN person_id END) as cta_clicks,
  COUNT(DISTINCT CASE WHEN event = 'tax_calculation_viewed' THEN person_id END) as calculator_completions,
  COUNT(DISTINCT CASE WHEN event = 'signup_completed' THEN person_id END) as signups,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN event = 'tax_calculation_viewed' THEN person_id END) / COUNT(DISTINCT person_id), 2) as conversion_rate
FROM events
WHERE
  timestamp >= '2026-03-19'
  AND timestamp <= '2026-04-02'
  AND properties.experimentName = 'landing-headline-cro-march-2026'
GROUP BY properties.headlineVariant
ORDER BY conversion_rate DESC
```

## Expected Results Template

After 2 weeks, fill in this table:

| Metric | Variant A (Savings) | Variant B (Professional) | Variant C (Speed) | Winner |
|--------|---------------------|--------------------------|-------------------|--------|
| **Visitors** | | | | |
| **CTA Clicks** | | | | |
| **CTA Click Rate** | | | | |
| **Calculator Completions** | | | | |
| **Conversion Rate** | | | | |
| **Improvement vs Baseline** | | | | |
| **Statistical Significance** | | | | |

## Decision Framework

### If Variant A (Savings) Wins
**Action**: Update all marketing copy to emphasize dollar savings
- Update homepage permanently to savings-focused headline
- Test even higher savings amounts ($10K+, $15K+) in future tests
- Create landing pages for high-value keywords ("save money H1B taxes")
- Build calculator with savings projection upfront

### If Variant B (Professional) Wins
**Action**: Double down on professional credibility positioning
- Emphasize "CPA-verified" and "built for tech workers" in all copy
- Create professional blog content (technical tax guides)
- Add more trust signals (CPA endorsements, accuracy guarantees)
- Position as the "professional tool" vs consumer apps

### If Variant C (Speed) Wins
**Action**: Optimize for convenience and ease of use
- Reduce calculator steps to hit <2 minute completion time
- Add progress indicators and time estimates throughout
- Market on convenience benefits ("quick", "fast", "simple")
- Build mobile-first experience for on-the-go calculations

## Technical Implementation

### PostHog Feature Flag Setup

1. **Create feature flag** in PostHog dashboard:
   - Name: `landing-headline-cro-march-2026`
   - Type: Multivariate
   - Rollout: 100% of users
   - Variants:
     - `variant-a-savings` (33%)
     - `variant-b-professional` (33%)
     - `variant-c-speed` (34%)

2. **Event tracking**:
   - `landing_page_viewed` (automatic on page load)
   - `cta_button_clicked` (primary CTA click)
   - `tax_calculation_viewed` (calculator completion)
   - `signup_completed` (user registration)

### Code Implementation

Located in:
- `/hooks/use-pain-point-headline-test.ts` - A/B test logic
- `/app/page.tsx` - Landing page with variants

## Quality Checklist

- [x] Feature flag created in PostHog
- [x] 3 variants implemented with equal traffic split
- [x] Event tracking verified for all funnel steps
- [x] Variants use exact headlines from task spec
- [x] Statistical significance calculator ready
- [x] Dashboard monitoring links documented
- [ ] Baseline metrics measured (first 3 days)
- [ ] Weekly check-in scheduled
- [ ] Results analysis template prepared
- [ ] Decision framework documented

## Contact & Support

**Experiment Owner**: CTO
**PostHog Dashboard**: https://app.posthog.com/project/{PROJECT_ID}/experiments
**Slack Channel**: #growth-experiments
**Results Review**: April 3, 2026

## Archive After Experiment

After declaring a winner:
1. Update `app/page.tsx` to use winning variant permanently
2. Remove losing variants from codebase
3. Archive this document to `docs/experiments/archive/`
4. Document learnings in growth playbook
5. Plan next CRO test based on insights
