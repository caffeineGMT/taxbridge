# PostHog A/B Test Setup - Production Configuration

**Status:** 🟢 PRODUCTION DEPLOYMENT - Configure in 15 minutes
**Date:** March 19, 2026
**Impact:** Enable statistical significance tracking for 3 landing page A/B tests

---

## 🎯 Overview

This guide sets up PostHog feature flags and monitoring for 3 simultaneous landing page A/B tests:

1. **Headline ROI Emphasis** - 4 variants (25% each)
2. **Video Hero vs Static** - 4 variants (25% each)
3. **Pricing Visibility** - 4 variants (25% each)

**Total:** 12 variants, 7-day test duration, target 15%+ conversion lift

---

## ⚡ Quick Start (15 minutes)

### Step 1: Get PostHog API Key (5 min)

1. Sign up at https://posthog.com (free tier works)
2. Create new project: "TaxBridge Production"
3. Copy API key (format: `phc_XXXXXXXXX`)
4. Copy project ID from URL: `https://app.posthog.com/project/[PROJECT_ID]`

### Step 2: Update Environment Variables (2 min)

**Production (`.env.production`):**
```bash
# PostHog Configuration
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_REAL_API_KEY_HERE
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# PostHog Admin API (for monitoring scripts)
POSTHOG_API_KEY=phx_YOUR_ADMIN_API_KEY_HERE
POSTHOG_PROJECT_ID=YOUR_PROJECT_ID_HERE
```

**Local Development (`.env.local`):**
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_REAL_API_KEY_HERE
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Vercel Dashboard:**
1. Go to https://vercel.com/your-project/settings/environment-variables
2. Add both variables with production values
3. Redeploy after adding

### Step 3: Create Feature Flags (5 min)

Navigate to: https://app.posthog.com/project/YOUR_PROJECT/feature_flags

Create 3 multivariate feature flags:

#### Flag 1: `landing-headline-roi-test`

**Configuration:**
- **Type:** Multivariate flag
- **Key:** `landing-headline-roi-test` (EXACT match required)
- **Release conditions:** Roll out to 100% of users
- **Variants:**
  | Variant Name | Rollout % |
  |--------------|-----------|
  | `control` | 25% |
  | `moderate-savings` | 25% |
  | `aggressive-savings` | 25% |
  | `urgency-savings` | 25% |
- **Description:** Test headline emphasizing $ saved vs generic messaging

#### Flag 2: `landing-hero-media-test`

**Configuration:**
- **Type:** Multivariate flag
- **Key:** `landing-hero-media-test` (EXACT match required)
- **Release conditions:** Roll out to 100% of users
- **Variants:**
  | Variant Name | Rollout % |
  |--------------|-----------|
  | `static` | 25% |
  | `video-autoplay` | 25% |
  | `video-click` | 25% |
  | `animated-stats` | 25% |
- **Description:** Test video demo vs static hero image

#### Flag 3: `landing-pricing-visibility-test`

**Configuration:**
- **Type:** Multivariate flag
- **Key:** `landing-pricing-visibility-test` (EXACT match required)
- **Release conditions:** Roll out to 100% of users
- **Variants:**
  | Variant Name | Rollout % |
  |--------------|-----------|
  | `hidden` | 25% |
  | `price-only` | 25% |
  | `full-pricing` | 25% |
  | `value-comparison` | 25% |
- **Description:** Test upfront pricing vs hidden pricing

**Save all 3 flags and enable them.**

### Step 4: Create Conversion Funnels (3 min)

Navigate to: https://app.posthog.com/project/YOUR_PROJECT/insights

#### Funnel 1: Landing → Signup

1. Click "New Insight" → "Funnel"
2. Configure steps:
   - **Step 1:** Event = `landing_page_viewed`
   - **Step 2:** Event = `signup_button_clicked`
   - **Step 3:** Event = `signup_completed`
3. Add breakdowns:
   - Click "Add breakdown"
   - Select "Event Property"
   - Add: `headlineROIVariant`, `heroMediaVariant`, `pricingVisibilityVariant`
4. Save as "Landing Page → Signup Conversion"

#### Funnel 2: Landing → Paid

1. Click "New Insight" → "Funnel"
2. Configure steps:
   - **Step 1:** Event = `landing_page_viewed`
   - **Step 2:** Event = `upgrade_button_clicked`
   - **Step 3:** Event = `checkout_completed`
3. Add same breakdowns as above
4. Save as "Landing Page → Paid Conversion"

---

## 📊 Monitoring Dashboard Setup

### Create Dashboard (5 min)

Navigate to: https://app.posthog.com/project/YOUR_PROJECT/dashboard

1. Click "New Dashboard" → Name: "Landing Page A/B Tests - March 2026"
2. Add the following insights:

#### Insight 1: Total Traffic by Variant

- **Type:** Trend
- **Event:** `landing_page_viewed`
- **Breakdown:** `headlineROIVariant`
- **Title:** "Traffic Distribution - Headline Test"
- **Goal:** All variants should be ~25% each

#### Insight 2: Conversion Rate - Headline Test

- **Type:** Funnel
- **Events:** `landing_page_viewed` → `signup_completed`
- **Breakdown:** `headlineROIVariant`
- **Title:** "Signup Conversion by Headline Variant"

#### Insight 3: Conversion Rate - Hero Media Test

- **Type:** Funnel
- **Events:** `landing_page_viewed` → `signup_completed`
- **Breakdown:** `heroMediaVariant`
- **Title:** "Signup Conversion by Hero Media Variant"

#### Insight 4: Conversion Rate - Pricing Test

- **Type:** Funnel
- **Events:** `landing_page_viewed` → `signup_completed`
- **Breakdown:** `pricingVisibilityVariant`
- **Title:** "Signup Conversion by Pricing Variant"

#### Insight 5: Paid Conversion Rate - Combined

- **Type:** Funnel
- **Events:** `landing_page_viewed` → `checkout_completed`
- **Breakdown:** All 3 variant properties
- **Title:** "Paid Conversion by Variant"

#### Insight 6: Video Engagement (if video variant wins)

- **Type:** Trend
- **Event:** `page_viewed`
- **Filters:** `videoAction = "completed"`
- **Breakdown:** `heroMediaVariant`
- **Title:** "Video Completion Rate"

### Set Up Alerts

Navigate to: Dashboard → Settings → Alerts

Create these alerts:

#### Alert 1: Traffic Imbalance

- **Condition:** If any variant gets <20% or >30% of traffic
- **Frequency:** Daily at 9 AM
- **Action:** Email notification

#### Alert 2: Conversion Drop

- **Condition:** If overall signup conversion rate drops >10%
- **Frequency:** Hourly
- **Action:** Slack webhook (optional) or email

#### Alert 3: Error Spike

- **Condition:** If `page_viewed` with `error=true` count > 10/hour
- **Frequency:** Real-time
- **Action:** Email + Slack

---

## 🔬 Statistical Significance Tracking

### Automated Significance Testing (PostHog Experimentation)

**Navigate to:** https://app.posthog.com/project/YOUR_PROJECT/experiments

1. Click "Create Experiment"
2. For each test (repeat 3 times):

#### Experiment 1: Headline ROI Test

- **Name:** "Landing Page Headline ROI - March 2026"
- **Feature Flag:** `landing-headline-roi-test`
- **Goal Metric:** Event = `signup_completed`
- **Exposure Event:** `landing_page_viewed`
- **Minimum Detectable Effect:** 15%
- **Confidence Level:** 95% (p < 0.05)
- **Minimum Sample Size:** 1,000 visitors per variant
- **Duration:** 7 days

#### Experiment 2: Hero Media Test

- **Name:** "Landing Page Hero Media - March 2026"
- **Feature Flag:** `landing-hero-media-test`
- **Goal Metric:** Event = `signup_completed`
- (Same settings as above)

#### Experiment 3: Pricing Visibility Test

- **Name:** "Landing Page Pricing Visibility - March 2026"
- **Feature Flag:** `landing-pricing-visibility-test`
- **Goal Metric:** Event = `signup_completed`
- (Same settings as above)

**Start all 3 experiments.**

PostHog will automatically:
- Track variant exposure
- Calculate conversion rates
- Compute statistical significance (Bayesian inference)
- Show winning variant when p < 0.05
- Estimate time to significance

---

## 📈 Daily Monitoring Workflow

**Every day at 9 AM (automated via PostHog):**

1. Open dashboard: https://app.posthog.com/project/YOUR_PROJECT/dashboard/AB_TEST_MARCH_2026
2. Check:
   - ✅ Traffic balanced across all 12 variants (~8.33% each)
   - ✅ No conversion rate drops (should stay >2.5%)
   - ✅ No error spikes
3. Review experiments tab for statistical significance updates
4. Log any insights in `/docs/ab-test-reports/day-N-notes.md`

**Alternative: Manual Monitoring (if not using PostHog Experiments)**

Run the monitoring script:
```bash
npm run monitor:ab-tests
```

This generates:
- Traffic distribution report
- Conversion rates by variant
- Chi-squared statistical significance test
- Recommendations for winner declaration

Output saved to: `/docs/ab-test-reports/ab-test-day-N-YYYY-MM-DD.txt`

---

## 🏆 Winner Declaration (Day 8)

### Automated (PostHog Experiments)

PostHog will automatically declare a winner when:
- **Minimum sample size reached:** 1,000+ visitors per variant
- **Statistical significance:** Bayesian credible interval shows >95% probability
- **Sufficient effect size:** Winning variant has >10% lift

Check the "Experiments" tab to see:
- Current leading variant
- Probability to be best
- Expected lift
- Recommended action (continue test, declare winner, or stop test)

### Manual Calculation (Fallback)

If using manual monitoring:

1. Export data from PostHog:
   ```bash
   # Or use PostHog dashboard export
   curl -X GET "https://app.posthog.com/api/projects/YOUR_PROJECT/insights/funnels" \
     -H "Authorization: Bearer YOUR_API_KEY" > ab-test-results.json
   ```

2. Use statistical significance calculator:
   - **Tool:** https://www.evanmiller.org/ab-testing/chi-squared.html
   - **Input:** Visitors and conversions per variant
   - **Output:** p-value (need p < 0.05)

3. Criteria for declaring winner:
   - ✅ p-value < 0.05 (95% confidence)
   - ✅ Minimum 10% relative lift vs. control
   - ✅ At least 500 visitors per variant (1,000+ recommended)

---

## ⚠️ Troubleshooting

### Events Not Showing in PostHog

**Check:**
1. PostHog initialized in browser console: `posthog.__loaded === true`
2. API key correct in `.env.local` and Vercel environment variables
3. Browser not blocking PostHog (check ad blockers)
4. Events can take 30-60 seconds to appear in dashboard

**Fix:**
```bash
# Verify PostHog in browser console
posthog.capture('test_event', { test: true });

# Check network tab for POST to app.posthog.com/e/
```

### Feature Flags Not Working

**Check:**
1. Flag names match EXACTLY: `landing-headline-roi-test`, etc.
2. Flags are enabled (green toggle in dashboard)
3. Rollout is 100% of users
4. Hard refresh (Cmd+Shift+R) to bypass cache

**Fix:**
```bash
# Check flag value in browser console
posthog.getFeatureFlag('landing-headline-roi-test');
// Should return: 'control', 'moderate-savings', etc.
```

### Traffic Imbalance (One variant gets >35%)

**Fix:**
1. PostHog dashboard → Feature Flags → Edit flag
2. Verify weights are exactly 25/25/25/25
3. Click "Save" (even if unchanged - this resets bucketing)
4. Monitor for 24 hours - should rebalance

### Client-Side Fallback Still Active

If you configured PostHog but client-side randomization is still running:

**Fix:**
```bash
# Verify PostHog is loaded before variant assignment
# In use-ab-test.ts, increase timeout from 100ms to 500ms:
const timer = setTimeout(determineVariant, 500); // Give PostHog more time
```

---

## 🎓 Best Practices

### Do's ✅

- ✅ Run tests for minimum 7 days (14 days if traffic is low)
- ✅ Check dashboard daily for anomalies
- ✅ Wait for statistical significance before declaring winner
- ✅ Monitor guardrail metrics (bounce rate, load time)
- ✅ Document insights and learnings

### Don'ts ❌

- ❌ Don't stop test early even if one variant is clearly winning
- ❌ Don't peek at results daily and adjust (introduces bias)
- ❌ Don't declare winner without p < 0.05
- ❌ Don't run test longer than 30 days (sample ratio mismatch risk)
- ❌ Don't change variant weights mid-test

---

## 📞 Support & Resources

**PostHog Documentation:**
- Feature Flags: https://posthog.com/docs/feature-flags
- Experimentation: https://posthog.com/docs/experiments
- A/B Testing Guide: https://posthog.com/docs/experiments/ab-testing

**Statistical Significance:**
- Chi-Squared Test: https://www.evanmiller.org/ab-testing/chi-squared.html
- Sample Size Calculator: https://www.evanmiller.org/ab-testing/sample-size.html
- Bayesian A/B Testing: https://www.evanmiller.org/bayesian-ab-testing.html

**TaxBridge Documentation:**
- `/docs/AB_TEST_DEPLOYMENT_GUIDE.md` - Full deployment guide
- `/docs/LANDING_PAGE_AB_TESTS.md` - Test design documentation
- `/scripts/monitor-ab-tests.ts` - Manual monitoring script

---

## ✅ Setup Verification Checklist

Before declaring tests live:

- [ ] PostHog API key added to `.env.local` and `.env.production`
- [ ] Vercel environment variables updated with PostHog key
- [ ] 3 feature flags created with correct names and 25/25/25/25 split
- [ ] All 3 flags enabled (green toggle)
- [ ] 2 conversion funnels created (Landing→Signup, Landing→Paid)
- [ ] Dashboard created with 6 insights
- [ ] 3 experiments created (optional but recommended)
- [ ] Alerts configured for traffic imbalance and conversion drops
- [ ] PostHog live events showing `landing_page_viewed` events
- [ ] Feature flags returning correct variant values
- [ ] Hard refresh shows different variants

**When all checked:** PostHog is fully configured. Tests are LIVE with statistical significance tracking.

---

**Built for real revenue. Track every variant. Measure every conversion. Optimize ruthlessly.** 🚀
