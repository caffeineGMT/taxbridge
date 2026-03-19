# Conversion Rate Baseline Measurement - Quick Start Guide

## Purpose
Establish baseline conversion rates for the last 30 days before optimization work begins.

This script answers 4 critical questions:
1. **Landing page → Calculator start rate** - What % of visitors engage with the calculator?
2. **Calculator completion rate** - What % who start actually finish?
3. **Signup conversion rate** - What % of completions lead to account creation?
4. **Payment conversion rate** - What % of signups become paid customers?

---

## Prerequisites

### 1. PostHog Configuration
You need two values from your PostHog account:

**A. PostHog API Key**
- Go to: https://app.posthog.com/project/settings
- Copy the "Project API Key" (starts with `phc_`)

**B. PostHog Project ID**
- Look at your PostHog URL: `https://app.posthog.com/project/<PROJECT_ID>`
- The number after `/project/` is your Project ID (e.g., `12345`)

**C. Add to .env.local**
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_actual_43_character_key_here
POSTHOG_PROJECT_ID=12345
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Running the Script

### Quick Run
```bash
npx tsx scripts/pull-conversion-baseline.ts
```

### What It Does
1. Connects to PostHog API
2. Pulls last 30 days of event data:
   - `landing_page_viewed`
   - `calculator_page_viewed`
   - `roi_calculator_viewed`
   - `tax_calculation_viewed`
   - `signup_completed`
   - `checkout_started`
   - `subscription_activated`
3. Calculates conversion rates
4. Compares to industry benchmarks
5. Generates detailed report

---

## Output

### Console Output
You'll see:
```
═══════════════════════════════════════════════════════════════════
  CONVERSION RATE BASELINE - LAST 30 DAYS
═══════════════════════════════════════════════════════════════════

1️⃣  LANDING PAGE → CALCULATOR START RATE
   Landing Page Views: 1,247
   Calculator Starts:  823
   Conversion Rate:    66.00%

2️⃣  CALCULATOR COMPLETION RATE
   Calculator Starts:      823
   Calculator Completions: 612
   Completion Rate:        74.36%

3️⃣  SIGNUP CONVERSION RATE
   Calculator Completions: 612
   Signups Completed:      178
   Signup Rate:            29.08%

4️⃣  PAYMENT CONVERSION RATE
   Signups Completed:      178
   Payments Completed:     12
   Payment Rate:           6.74%

📊 OVERALL FUNNEL PERFORMANCE
   Total Landing Views:    1,247
   Total Paid Customers:   12
   Overall Conversion:     0.96%
```

### Files Created
1. **docs/CONVERSION_BASELINE_2026-03-19.md** - Human-readable report with analysis
2. **docs/CONVERSION_BASELINE_2026-03-19.json** - Machine-readable data for tracking

---

## Interpreting Results

### Conversion Rate Benchmarks (SaaS Industry)

| Metric | Good | Excellent | Your Goal |
|--------|------|-----------|-----------|
| Landing → Calculator | 65%+ | 80%+ | Get visitors to engage |
| Calculator Completion | 70%+ | 85%+ | Reduce form friction |
| Signup Rate | 20%+ | 35%+ | Show value clearly |
| Payment Rate | 5%+ | 10%+ | Prove ROI worth price |
| **Overall** | **3%+** | **5%+** | **Landing → Paid** |

### Status Indicators
- 🟢 **EXCELLENT** - Above excellent benchmark
- 🟡 **GOOD** - Above target, below excellent
- 🔴 **NEEDS WORK** - Below target benchmark

---

## Common Issues & Fixes

### Issue: "PostHog API key not configured"
**Fix:**
1. Check `.env.local` exists in project root
2. Verify `NEXT_PUBLIC_POSTHOG_KEY` is set and real (not placeholder)
3. Restart the script

### Issue: "PostHog Project ID not configured"
**Fix:**
1. Get Project ID from PostHog URL
2. Add `POSTHOG_PROJECT_ID=12345` to `.env.local`
3. Restart the script

### Issue: "PostHog API error: 401"
**Fix:**
- Your API key is invalid or expired
- Generate a new key at: https://app.posthog.com/project/settings
- Update `.env.local` with new key

### Issue: "PostHog API error: 403"
**Fix:**
- Your API key doesn't have permission to access this project
- Verify you're using the correct Project ID
- Check your PostHog account has access to the project

### Issue: All event counts are 0
**Possible Causes:**
1. **No traffic yet** - PostHog is configured but site hasn't had visitors
2. **Events not firing** - Run `npx tsx scripts/verify-posthog-funnel-tracking.ts` to check
3. **Wrong date range** - Script looks at last 30 days, your data might be older
4. **Project ID mismatch** - You're querying the wrong PostHog project

**Fix:**
- Check PostHog dashboard: https://app.posthog.com
- Go to "Events" tab and verify events are appearing
- If no events, check browser console for PostHog errors
- Verify `posthog.__loaded` is `true` in browser console

---

## What to Do With Results

### If Conversion Rates Are Good (All 🟢)
1. **Focus on traffic** - Your funnel converts well, scale visitor acquisition
2. **A/B test refinements** - Small improvements can still boost revenue
3. **Measure weekly** - Track trends over time

### If Conversion Rates Need Work (Any 🔴)
1. **Prioritize by drop-off size** - Fix biggest leak first
2. **Run A/B tests** - Test variations of weak points
3. **Measure impact** - Re-run baseline after each change
4. **Iterate** - Move to next biggest drop-off

### Priority Framework
```
High Impact = (Drop-off %) × (Users at that stage) × ($49 AOV)

Example: If 35% drop off between Landing → Calculator with 1,000 visitors:
  Impact = 0.35 × 1,000 × $49 × 4.3% overall rate = $738 potential monthly gain
```

---

## Next Steps After Baseline

### Week 1: Fix Biggest Drop-Off
1. Identify the conversion step with lowest rate (🔴)
2. Research best practices for that specific funnel stage
3. Create 2-3 variations to A/B test
4. Deploy experiments

### Week 2: Measure Impact
1. Let tests run for statistical significance (≥100 conversions per variation)
2. Re-run baseline measurement:
   ```bash
   npx tsx scripts/pull-conversion-baseline.ts
   ```
3. Compare new rates to baseline
4. Calculate revenue impact

### Week 3: Scale What Works
1. Implement winning variation permanently
2. Move to next biggest drop-off
3. Repeat the process

---

## Example Optimization Roadmap

**Scenario:** Your baseline shows:
- Landing → Calculator: 52% (🔴 below 65%)
- Calculator → Signup: 18% (🔴 below 20%)
- Signup → Payment: 7% (🟢 above 5%)

**Action Plan:**
1. **Week 1:** Fix Landing → Calculator
   - Move calculator above fold
   - Add "Calculate in 2 minutes" CTA
   - Remove navigation during flow
   - Target: 52% → 68% (+16 points)

2. **Week 2:** Fix Calculator → Signup
   - Show visual savings chart
   - Add urgency ("Results expire in 24h")
   - Embed signup form (no modal)
   - Target: 18% → 25% (+7 points)

3. **Week 3:** Measure Total Impact
   - Overall conversion: 0.96% → 1.68% (+75%)
   - Monthly revenue: $470 → $823 (+$353)
   - Annual impact: +$4,236

---

## Automation & Monitoring

### Schedule Weekly Measurements
Add to cron or GitHub Actions:
```bash
# Every Monday at 9am
0 9 * * 1 npx tsx scripts/pull-conversion-baseline.ts
```

### Set Up Alerts
In PostHog dashboard:
1. Go to "Insights" → "Funnels"
2. Create funnel matching this script's events
3. Set alert: "Notify if overall conversion drops below X%"

### Track Over Time
Keep all baseline reports:
```bash
docs/
  CONVERSION_BASELINE_2026-03-19.md
  CONVERSION_BASELINE_2026-03-26.md
  CONVERSION_BASELINE_2026-04-02.md
  ...
```

Compare week-over-week to measure optimization impact.

---

## Additional Resources

- **PostHog Funnel Setup Guide:** `docs/POSTHOG_FUNNEL_CONFIGURATION.md`
- **Event Verification Script:** `scripts/verify-posthog-funnel-tracking.ts`
- **PostHog Dashboard:** https://app.posthog.com
- **Previous Analysis:** `docs/CONVERSION_FUNNEL_EXECUTIVE_SUMMARY.md` (mock data)

---

## Support

**Script Issues:**
- Check `.env.local` configuration
- Verify PostHog account access
- Review error messages (they include fix steps)

**PostHog Issues:**
- PostHog Docs: https://posthog.com/docs
- Support: support@posthog.com
- Community: https://posthog.com/slack

**Business Questions:**
- Which conversion rate to optimize first?
- What's a realistic improvement target?
- How to calculate ROI of conversion work?

See the generated report's "Key Findings" section for specific recommendations.

---

**Last Updated:** March 19, 2026
**Script Version:** 1.0
**Author:** Engineering Team
