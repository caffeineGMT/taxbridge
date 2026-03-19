# CRO Test Quick Start Guide

## Setup (5 minutes)

### 1. PostHog Feature Flag
1. Go to PostHog → Feature Flags
2. Create new flag: `landing-cro-march-2026`
3. Type: **Multivariate**
4. Variants:
   - `control` - 25%
   - `variant-1` - 25%
   - `variant-2` - 25%
   - `variant-3` - 25%
5. Release conditions: **100% of users**
6. Save and enable

### 2. Verify Tracking
```bash
# 1. Start dev server
npm run dev

# 2. Visit test page
open http://localhost:3000/cro-test

# 3. Check browser console for PostHog events:
# - "landing_page_viewed" should fire on page load
# - "upgrade_button_clicked" should fire on CTA click
```

### 3. Deploy to Production
```bash
# Build and deploy
npm run build
git add -A
git commit -m "[P2-MEDIUM] Landing Page CRO Test - A/B test headlines and CTAs"
git push origin main
```

## Daily Monitoring (2 minutes)

### Run Monitoring Script
```bash
npm run monitor:cro
```

**Look for:**
- ✅ All variants getting ~25% of traffic
- ✅ Progress toward 1,000 visitors/variant
- ✅ CTR differences between variants
- ✅ Statistical significance indicator

### PostHog Dashboard
1. Go to PostHog → Insights
2. Create funnel:
   - Step 1: `landing_page_viewed` (filter: experiment = "cro-test-march-2026")
   - Step 2: `upgrade_button_clicked`
   - Breakdown by: `variant`

## Results Interpretation

### Scenario A: Clear Winner (Target!)
```
Variant 3: 16.5% CTR  🏆
Control:   12.0% CTR
Lift: +37.5% (p < 0.05) ✅
```
**Action:** Implement Variant 3 on main landing page

### Scenario B: Marginal Winner
```
Variant 2: 13.2% CTR
Control:   12.0% CTR
Lift: +10% (p = 0.08)
```
**Action:** Extend test 1 more week or increase traffic

### Scenario C: No Winner
```
All variants within 5% of each other
```
**Action:** Design new test with more differentiated variants

## Quick Commands

```bash
# Monitor test progress
npm run monitor:cro

# Check PostHog events in real-time
# Go to: PostHog → Live events → Filter by "cro-test-march-2026"

# Deploy changes
npm run build
git push origin main
```

## Test Variants Reference

| Variant | Headline | CTA | Color |
|---------|----------|-----|-------|
| Control | Save $5K+ on RSU Taxes | Calculate Now | Green |
| Variant 1 | Save $5K+ on RSU Taxes | See My Savings | Green |
| Variant 2 | H1B Workers: Stop Overpaying Taxes | Calculate Now | Orange |
| Variant 3 | H1B Workers: Stop Overpaying Taxes | See My Savings | Orange |

## Troubleshooting

### Issue: Variants not splitting evenly
**Check:** PostHog feature flag rollout percentage
**Fix:** Ensure all 4 variants are set to 25% each

### Issue: No events in PostHog
**Check:** `NEXT_PUBLIC_POSTHOG_KEY` environment variable
**Fix:** Add PostHog key to `.env.production`

### Issue: Low traffic
**Solution:** Increase paid ad spend or extend test duration

## Contact
- Questions: Michael Guo (CEO)
- Full documentation: `/docs/CRO_TEST_MARCH_2026.md`
