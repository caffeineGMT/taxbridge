# Free Tier Optimization Experiment - Setup & Monitoring Guide

**Duration:** 14 days
**Goal:** Determine optimal free tier configuration to maximize free-to-paid conversion
**Date Created:** 2026-03-19

---

## 🎯 Experiment Design

### Problem Statement
Current free tier (10 RSU entries) has unclear conversion impact. Is the limit:
- Too restrictive? (Users can't test thoroughly → no upgrade)
- Too generous? (Users get enough value for free → no urgency)
- Optimal? (Sweet spot between value and scarcity)

### Hypothesis
A **more restrictive limit (5 entries)** will create urgency and increase conversions, OR an **unlimited tier with feature gating** will remove friction while driving premium upgrades.

### Variants

#### Variant A: Limited 5
- **Max RSU Entries:** 5
- **Gated Features:** PDF, AI, CSV, Multi-year, Support
- **Urgency Message:** "⚠️ Limited to 5 RSU entries—upgrade for unlimited access"
- **Expected Impact:** High urgency → fast conversions, but may reduce signups

#### Variant B: Limited 10 (BASELINE)
- **Max RSU Entries:** 10
- **Gated Features:** PDF, AI, CSV, Multi-year, Support
- **Urgency Message:** "⏱️ 10 free entries—upgrade anytime for unlimited"
- **Expected Impact:** Current production baseline - control group

#### Variant C: Unlimited Gated
- **Max RSU Entries:** Unlimited
- **Gated Features:** PDF, AI, CSV, Multi-year, Support
- **Urgency Message:** "💡 Try unlimited entries—upgrade for PDF export & AI advisor"
- **Expected Impact:** No friction → higher engagement, feature gating drives upgrades

---

## 🛠️ Technical Implementation

### 1. Variant Assignment

**File:** `hooks/use-conversion-experiments.ts`

```typescript
// User assigned to one of three variants on first visit
const freeTier = getVariantAssignment<FreeTierVariant>(
  'experiment_free_tier_limit',
  ['limited_5', 'limited_10', 'unlimited_gated']
);
```

**Assignment Logic:**
- Equal 33.3% split across 3 variants
- Persistent via `localStorage` (same variant for duration of experiment)
- Randomized using `Math.random()`

### 2. Limit Enforcement

**File:** `app/api/rsu/route.ts`

```typescript
// Dynamic enforcement based on variant
const freeTierVariant = request.headers.get('x-free-tier-variant');
const limitConfig = getFreeTierLimit(freeTierVariant);

if (userProfile.subscription_tier === 'free' && hasExceededLimit(existingEntries.length, limitConfig)) {
  return NextResponse.json({
    error: 'Free tier limit reached',
    upgradeRequired: true,
    message: getUpgradeMessage(limitConfig),
  }, { status: 403 });
}
```

**Enforcement Points:**
- POST `/api/rsu` - Blocks new RSU entries when limit reached
- Variant read from `x-free-tier-variant` header
- Returns variant-specific upgrade message

### 3. Feature Gating

**File:** `lib/free-tier-limits.ts`

```typescript
export function isFeatureGated(
  feature: 'pdfExport' | 'aiAdvisor' | 'csvImport' | 'multiYear' | 'prioritySupport',
  limitConfig: FreeTierLimitConfig
): boolean {
  return !limitConfig.gatedFeatures[feature];
}
```

**Gated Features (All Variants):**
- PDF Export
- AI Tax Advisor
- CSV Import
- Multi-year Forecasting
- Priority Support

### 4. Analytics Tracking

**File:** `app/api/analytics/conversion-experiments/route.ts`

**Tracked Events:**
- `exposure` - User views pricing page with assigned variant
- `conversion` - User completes signup/checkout/payment

**Metrics Stored:**
```typescript
{
  exposures: number,      // Page views
  signups: number,        // Email sign-ups
  checkouts: number,      // Checkout started
  paid: number,           // Payment completed
  conversion_rate: number // (paid / exposures) * 100
}
```

---

## 📊 Monitoring Dashboard

### Access
**URL:** `https://taxbridge.vercel.app/admin/free-tier-experiment`

### Key Metrics

#### 1. Total Exposures
- **Goal:** 300+ total (100 per variant)
- **Check:** Daily
- **Alert:** If <50 total by Day 3

#### 2. Conversion Rate by Variant
- **Goal:** Clear winner with >15% lift
- **Check:** Daily
- **Alert:** If all variants within 2% (no clear winner)

#### 3. Statistical Validity
- **Goal:** 100+ exposures per variant
- **Check:** Day 7, Day 14
- **Alert:** If <100 per variant by Day 10

#### 4. Traffic Distribution
- **Goal:** 33.3% ± 5% per variant
- **Check:** Daily
- **Alert:** If any variant >40% or <25%

### Dashboard Features
- **Live Data:** Auto-refreshes every 30 seconds
- **Winner Indicator:** Highlights variant with highest conversion
- **Progress Bars:** Visual comparison of conversion rates
- **Raw Data Table:** All variant combinations with metrics

---

## 🗓️ Experiment Timeline

### Pre-Launch (Day -1)
- [ ] Verify dashboard accessible: `/admin/free-tier-experiment`
- [ ] Test all 3 variants manually:
  - [ ] Clear localStorage
  - [ ] Visit `/pricing` → assigned variant A, B, or C
  - [ ] Create 5/10/unlimited RSU entries
  - [ ] Verify limit enforced correctly
- [ ] Check PostHog: Event `page_viewed` with `free_tier_variant` property
- [ ] Set experiment start date

### Week 1: Launch & Stabilize

**Day 1: Launch**
- [ ] Announce internally: "Free tier experiment live"
- [ ] Drive traffic to pricing page (newsletter, ads, social)
- [ ] Monitor dashboard: Check for errors, verify tracking
- [ ] Goal: 50+ exposures by EOD

**Day 2-3: Early Signals**
- [ ] Check traffic split: Should be ~33/33/33
- [ ] Verify limits enforcing correctly (check error logs)
- [ ] Goal: 100+ total exposures by Day 3

**Day 4-7: Data Collection**
- [ ] Daily dashboard check (5 min)
- [ ] Watch for early winner (>10% conversion gap)
- [ ] DO NOT STOP EARLY - need full 14 days for validity
- [ ] Goal: 150+ total exposures by Day 7

### Week 2: Analyze & Decide

**Day 8-10: Mid-Point Check**
- [ ] Statistical validity check: 100+ per variant?
- [ ] If YES → winner emerging?
- [ ] If NO → extend to 21 days or increase traffic

**Day 11-13: Final Data Collection**
- [ ] Monitor daily
- [ ] Prepare rollout plan for winner
- [ ] Draft communication about changes

**Day 14: DECISION DAY**
- [ ] Export final dashboard data
- [ ] Calculate statistical significance (z-test)
- [ ] Declare winner
- [ ] Roll out winning variant to 100% of users
- [ ] Document learnings in executive summary

---

## 📈 Success Criteria

### Primary Metric: Conversion Rate
**Formula:** `(Paid Subscriptions / Exposures) × 100`

**Baseline (Variant B - 10 entries):** ~3.0%
**Target (Winning Variant):** ≥3.45% (+15% lift)

### Secondary Metrics

#### Time to Upgrade
- **Baseline:** 7 days average
- **Goal:** <5 days for winning variant

#### Engagement Rate
- **Metric:** Sessions per user (first 7 days)
- **Baseline:** 2.5 sessions
- **Goal:** >3 sessions (more engaged users)

#### Calculator Completion Rate
- **Metric:** % of signups who complete calculator
- **Baseline:** 80%
- **Goal:** ≥80% (don't sacrifice completion for conversion)

---

## ⚠️ Common Issues & Fixes

### Issue 1: Unequal Traffic Split
**Symptom:** One variant has >40% of exposures
**Root Cause:** localStorage assignment bug
**Fix:**
```bash
# Clear localStorage for test accounts
localStorage.removeItem('experiment_free_tier_limit');

# Verify random assignment
console.log(Math.random()); // Should be uniform 0-1
```

### Issue 2: Low Sample Size
**Symptom:** <300 total exposures by Day 10
**Root Causes:**
- Low traffic to pricing page
- Users not completing signup funnel

**Fix:**
- Send email blast to existing users
- Increase paid ad spend
- Add CTA on homepage
- Extend test to 21 days

### Issue 3: All Variants Perform Poorly
**Symptom:** All conversion rates <2%
**Root Cause:** Problem is pricing, not free tier limit
**Fix:**
- Keep baseline (10 entries)
- Run pricing experiment instead ($29 vs $49 vs $79)

### Issue 4: No Clear Winner
**Symptom:** Variants within 2% of each other
**Root Cause:** Free tier limit has minimal impact
**Fix:**
- Keep baseline (10 entries)
- Focus optimization on: pricing, messaging, onboarding

### Issue 5: Variant C (Unlimited) Gets Abused
**Symptom:** Users creating 100+ RSU entries on free tier
**Root Cause:** No absolute limit on unlimited variant
**Fix:**
- Add soft cap: 50 entries max (still "unlimited" for normal use)
- Track abuse rate in dashboard
- If >5% of users abuse, declare variant C invalid

---

## 📊 Data Export & Analysis

### Export Raw Data

**Method 1: Dashboard**
1. Visit `/admin/free-tier-experiment`
2. Scroll to "Raw Experiment Data" table
3. Copy table to Google Sheets

**Method 2: API**
```bash
curl https://taxbridge.vercel.app/api/analytics/conversion-experiments \
  | jq '.experiments' > experiment_data.json
```

### Statistical Significance Test

**Use:** [Z-Test Calculator](https://www.calculator.net/z-test-calculator.html)

**Input:**
- Population 1: Baseline (Variant B)
- Population 2: Test variant (A or C)
- Sample size: Exposures
- Successes: Paid conversions
- Confidence: 95%

**Result:** If p-value < 0.05 → statistically significant difference

---

## 🎓 Post-Experiment Actions

### If Variant A (5 entries) Wins
1. Update `lib/free-tier-limits.ts`:
   ```typescript
   const DEFAULT_FREE_TIER: FreeTierVariant = 'limited_5';
   ```
2. Update pricing page copy: "5 free RSU entries"
3. Monitor churn rate for 30 days (ensure users aren't frustrated)

### If Variant B (10 entries) Wins
1. No code changes needed (already baseline)
2. Document: "10 entries confirmed optimal"
3. Focus on other conversion levers (pricing, messaging)

### If Variant C (Unlimited) Wins
1. Update `lib/free-tier-limits.ts`:
   ```typescript
   const DEFAULT_FREE_TIER: FreeTierVariant = 'unlimited_gated';
   ```
2. Add soft cap (50 entries max to prevent abuse)
3. Enhance feature gating messaging
4. Monitor free tier abuse rate

---

## 📞 Support & Questions

**Experiment Owner:** Michael Guo (CEO)
**Dashboard:** `/admin/free-tier-experiment`
**PostHog:** [Link to PostHog funnel]
**Slack:** #product-experiments

**Key Files:**
- Variant config: `hooks/use-conversion-experiments.ts`
- Limit enforcement: `app/api/rsu/route.ts`
- Feature gating: `lib/free-tier-limits.ts`
- Dashboard: `app/admin/free-tier-experiment/page.tsx`
- Analytics API: `app/api/analytics/conversion-experiments/route.ts`

---

## ✅ Daily Checklist (For Experiment Owner)

**Time Required:** 5 minutes/day

- [ ] Open `/admin/free-tier-experiment`
- [ ] Check total exposures (goal: +20-30/day)
- [ ] Verify traffic split (33/33/33 ±5%)
- [ ] Note leading variant and conversion %
- [ ] Check for errors in Sentry
- [ ] Update team in Slack (weekly)

---

**Last Updated:** 2026-03-19
**Status:** ✅ Ready to launch
