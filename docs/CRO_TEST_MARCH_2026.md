# Landing Page CRO Test - March 2026

## Executive Summary

**Test Type:** 2x2 Factorial A/B Test
**Duration:** 2 weeks (March 19 - April 2, 2026)
**Target:** 1,000+ visitors per variant (4,000 total)
**Primary Metric:** CTA Click-Through Rate (CTR)
**Success Criteria:** 15%+ lift over control

## Test Variants

### Headlines (2 variants)
- **Headline A:** "Save $5K+ on RSU Taxes" *(Savings-focused)*
- **Headline B:** "H1B Workers: Stop Overpaying Taxes" *(Problem-focused)*

### CTAs (2 variants)
- **CTA A:** "Calculate Now" *(Action-oriented)*
- **CTA B:** "See My Savings" *(Benefit-oriented)*

### Combinations (4 total variants)

| Variant | Headline | CTA | Description |
|---------|----------|-----|-------------|
| **Control** | Headline A | CTA A | Savings amount + Action CTA |
| **Variant 1** | Headline A | CTA B | Savings amount + Benefit CTA |
| **Variant 2** | Headline B | CTA A | Problem-focused + Action CTA |
| **Variant 3** | Headline B | CTA B | Problem-focused + Benefit CTA |

## Hypothesis

### Primary Hypothesis
Problem-focused messaging ("Stop Overpaying") will outperform savings-focused messaging because it creates stronger emotional resonance and urgency.

### Secondary Hypothesis
Benefit-oriented CTAs ("See My Savings") will outperform action-oriented CTAs ("Calculate Now") because they reinforce the value proposition.

### Interaction Hypothesis
The combination of **Headline B + CTA B** (Variant 3) will be the winning variant, achieving a 15%+ lift in CTR over control.

## Test Implementation

### 1. Code Files

**Hook:** `hooks/use-cro-test-march-2026.ts`
- Manages variant assignment (25% split per variant)
- Tracks page views and CTA clicks
- Integrates with PostHog for analytics

**Landing Page:** `app/(marketing)/cro-test/page.tsx`
- Clean, focused landing page running ONLY this test
- No other experiments to avoid traffic dilution
- Mobile-optimized, accessible design

**Monitoring Script:** `scripts/monitor-cro-test.ts`
- Real-time progress tracking
- Statistical significance calculations
- Automated winner detection

### 2. PostHog Setup

**Feature Flag:** `landing-cro-march-2026`
- Type: Multivariate
- Variants: `control`, `variant-1`, `variant-2`, `variant-3`
- Distribution: 25% / 25% / 25% / 25%

**Events Tracked:**
1. `landing_page_viewed` - Page load with variant exposure
2. `upgrade_button_clicked` - CTA click (primary metric)
3. `signup_completed` - Secondary conversion metric

**Event Properties:**
```json
{
  "experiment": "cro-test-march-2026",
  "variant": "control|variant-1|variant-2|variant-3",
  "headlineType": "savings-amount|problem-focused",
  "ctaType": "action-oriented|benefit-oriented",
  "headline": "actual headline text",
  "primaryCTA": "actual CTA text"
}
```

### 3. Traffic Routing

**Option A: Direct Traffic** (Recommended)
- Send paid traffic directly to `/cro-test`
- Cleanest data, no cross-contamination

**Option B: Main Landing Page**
- Replace `app/page.tsx` with CRO test version
- Affects all organic traffic
- Higher traffic volume, faster results

## Monitoring & Analysis

### Daily Monitoring

Run the monitoring script:
```bash
npm run monitor:cro
# or
npx tsx scripts/monitor-cro-test.ts
```

**Monitor:**
- ✅ Visitor distribution (should be ~25% per variant)
- ✅ Progress toward 1,000 visitors/variant
- ✅ CTR differences emerging
- ✅ Statistical significance (p < 0.05)

### PostHog Dashboard

Create custom dashboard with:
1. **Funnel:** Landing → CTA Click → Signup (by variant)
2. **Trend:** Daily visitors per variant
3. **Trend:** CTR per variant over time
4. **Retention:** Variant → 7-day retention

### Statistical Significance

**Z-test for proportions** (built into monitoring script):
- Minimum sample: 1,000 visitors per variant
- Confidence level: 95% (p < 0.05)
- Minimum detectable effect: 15% relative lift

**Early stopping criteria:**
- ✅ Winner achieves 95% confidence AND 15%+ lift
- ✅ All 4 variants reach 1,000 visitors
- ✅ 14 days elapsed

## Expected Results

### Projected Outcomes

**Scenario 1: Variant 3 Wins** (60% probability)
- Headline B + CTA B = "H1B Workers: Stop Overpaying Taxes" + "See My Savings"
- Expected lift: 18-25% over control
- Action: Implement winner on main landing page

**Scenario 2: Variant 2 Wins** (25% probability)
- Headline B + CTA A = "H1B Workers: Stop Overpaying Taxes" + "Calculate Now"
- Expected lift: 12-18% over control
- Insight: Problem-focused headline is key, CTA less important

**Scenario 3: No Clear Winner** (15% probability)
- Variants within 5% of each other
- Action: Extend test to 3 weeks or redesign variants

### Impact Analysis

**If 15% CTR lift achieved:**
- Current baseline CTR: ~12% (estimated)
- New CTR with winner: ~13.8%
- Monthly visitors: 10,000
- Monthly CTA clicks: 1,200 → 1,380 (+180)
- Assuming 40% signup rate: +72 signups/month
- Assuming 10% paid conversion: +7.2 paid users/month
- At $49/month: **+$353 MRR** from this test alone

**Annualized impact:** $4,236/year additional revenue

## Implementation Plan

### Phase 1: Setup (Day 1 - March 19)
- ✅ Code deployed to production
- ✅ PostHog feature flag configured
- ✅ Analytics tracking verified
- ✅ Monitoring script tested

### Phase 2: Traffic Ramp (Day 2-3)
- Direct paid traffic to `/cro-test` route
- Monitor for even distribution
- Verify tracking events fire correctly

### Phase 3: Active Testing (Day 4-14)
- Daily monitoring via script
- Check for statistical significance every 3 days
- Document qualitative user feedback

### Phase 4: Analysis (Day 15)
- Final statistical analysis
- Identify winning variant
- Document learnings for future tests

### Phase 5: Implementation (Day 16-17)
- Deploy winner to main landing page (`app/page.tsx`)
- Remove losing variants
- Archive test results in `/docs`

## Risk Mitigation

### Traffic Distribution Issues
**Risk:** Variants don't split evenly (e.g., 40/20/20/20)
**Mitigation:** Check PostHog feature flag rollout percentage, ensure proper client-side fallback

### Low Traffic Volume
**Risk:** <4,000 visitors in 2 weeks
**Mitigation:**
- Extend test to 3 weeks
- Increase paid ad spend
- Consider lowering target to 750 visitors/variant

### No Statistical Significance
**Risk:** Variants perform similarly, no clear winner
**Mitigation:**
- Test may still provide directional insights
- Implement variant with highest absolute CTR
- Design more differentiated variants for next test

### Technical Issues
**Risk:** PostHog tracking breaks, losing data
**Mitigation:**
- Verify tracking in development before launch
- Set up Sentry alerts for PostHog errors
- Daily manual spot-checks

## Post-Test Actions

### If Variant Wins (>15% lift, p < 0.05)
1. ✅ Implement winner on main landing page
2. ✅ Update all marketing materials with winning copy
3. ✅ Run follow-up test on subheadline variants
4. ✅ Document learnings in `/docs/CRO_LEARNINGS.md`

### If No Clear Winner
1. ✅ Analyze qualitative factors (bounce rate, time on page)
2. ✅ Consider extending test 1 more week
3. ✅ Design new test with more differentiated variants
4. ✅ Implement highest-performing variant as interim solution

### If Unexpected Results
1. ✅ Audit tracking implementation
2. ✅ Segment by traffic source (paid vs organic)
3. ✅ Check for mobile vs desktop differences
4. ✅ Review session recordings for UX issues

## Success Metrics

### Primary
- ✅ CTA Click-Through Rate (CTR): **15%+ lift**

### Secondary
- ✅ Scroll depth: 75%+ scroll to CTA
- ✅ Time on page: 30+ seconds average
- ✅ Bounce rate: <60%
- ✅ Signup conversion: 5%+ of CTA clicks

### Tertiary
- ✅ Mobile vs desktop performance
- ✅ Traffic source impact (paid vs organic)
- ✅ Day-of-week patterns

## Contact & Resources

**Test Owner:** Michael Guo (CEO)
**Implementation:** Engineering Team
**Analysis:** PostHog + custom monitoring script

**Files:**
- Hook: `/hooks/use-cro-test-march-2026.ts`
- Landing page: `/app/(marketing)/cro-test/page.tsx`
- Monitor: `/scripts/monitor-cro-test.ts`
- Documentation: `/docs/CRO_TEST_MARCH_2026.md`

**PostHog:**
- Feature flag: `landing-cro-march-2026`
- Dashboard: TaxBridge > CRO Test March 2026

---

**Last Updated:** March 19, 2026
**Status:** Active - Day 1 of 14
