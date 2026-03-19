# Conversion Funnel Diagnosis - 2026-03-19

## Executive Summary

**Data Source:** ⚠️ MOCK DATA - PostHog API not configured
**Total Visitors:** 1,000
**Paid Conversions:** 43
**Overall Conversion Rate:** 4.30%

## Funnel Breakdown

| Step | Users | Conversion Rate | Drop-off Rate | Status |
|------|-------|-----------------|---------------|--------|
| Landing Page | 1,000 | 100.0% | 0.0% | 🟢 |
| Calculator Viewed | 650 | 65.0% | 35.0% | 🔴 |
| Calculator Completed | 520 | 52.0% | 13.0% | 🟠 |
| Signup Clicked | 260 | 26.0% | 26.0% | 🔴 |
| Signup Completed | 220 | 22.0% | 4.0% | 🟢 |
| Pricing Page | 154 | 15.4% | 6.6% | 🟢 |
| Checkout Started | 62 | 6.2% | 9.2% | 🟢 |
| Payment Success | 43 | 4.3% | 1.9% | 🟢 |

## P0 Biggest Drop-Off Point

**Step:** Calculator Viewed
**Drop-off Rate:** 35.0%
**Priority:** P0

### Recommended Actions

1. 🚨 CRITICAL: 35% of visitors leave without viewing calculator
2. 🎯 Move calculator higher on homepage (reduce scroll depth)
3. 🎯 Add "Try Calculator" CTA in hero section
4. 🎯 Remove navigation distractions (sticky header with "Calculate Now")
5. 🎯 Add exit-intent popup: "Wait! Calculate your savings before you go"

## Quick Wins (High Impact, Low Effort)

1. ⚡ Move calculator to top of landing page (2hr implementation)
2. ⚡ Add "Save Your Calculation" button on results page (4hr implementation)
3. ⚡ Embed signup form on results page (no modal) (6hr implementation)


## Tracking Issues

- ❌ PostHog API key not set in .env.local (still using placeholder)

**Action Required:** Fix PostHog configuration before optimizing conversion funnel.


## Next Steps


1. Fix PostHog configuration (see tracking issues above)
2. Verify events are firing in PostHog dashboard
3. Re-run this script to get real data
4. Implement top 3 quick wins


## How to Get Real PostHog Data

Currently using mock data. To pull real data:

1. **Get Personal API Key:**
   - Go to PostHog dashboard → Settings → Personal API Keys
   - Create new key with read access to insights

2. **Add to .env.local:**
   ```bash
   POSTHOG_PERSONAL_API_KEY=phx_your_personal_api_key_here
   ```

3. **Re-run this script:**
   ```bash
   npx tsx scripts/diagnose-conversion-funnel.ts
   ```

---

**Generated:** 2026-03-19T13:49:03.982Z
**Script:** `scripts/diagnose-conversion-funnel.ts`
