# Pricing Experiment: Execution Guide

**Experiment**: $49 vs $79 vs $99/year Annual Pricing Test
**Duration**: 2-4 weeks (minimum 14 days)
**Goal**: Maximize total revenue (not just conversion rate)
**Target**: 100+ total conversions (33+ per variant)

---

## Executive Summary

This is a revenue optimization experiment testing 3 annual price points for the Pro plan:
- **Variant A**: $49/year (50% launch discount from $99)
- **Variant B**: $79/year (standard pricing)
- **Variant C**: $99/year (premium pricing)

All users also see a **$19/month** option regardless of annual variant assignment.

**Key Metrics**:
- Primary: Total revenue per variant (conversions × price)
- Secondary: Conversion rate, monthly vs annual preference
- Cohort: Product Hunt users vs organic users

**Success Criteria**:
- Minimum 100 conversions across all variants
- Statistical significance: Winner has >20% revenue advantage
- Decision timeline: 2 weeks minimum, 4 weeks maximum

---

## Day-by-Day Execution Plan

### **Week 0: Pre-Launch (1-2 days before experiment starts)**

#### Day -1: Infrastructure Setup

**Tasks**:
- [ ] Run Stripe setup script to create price IDs
  ```bash
  npx ts-node scripts/setup-pricing-experiment.ts
  ```
- [ ] Add price IDs to `.env.production`:
  ```bash
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79=price_XXXXXXXX
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_99=price_YYYYYYYY
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY=price_ZZZZZZZZ
  ```
- [ ] Verify build passes:
  ```bash
  npm run build
  ```
- [ ] Commit and push to GitHub:
  ```bash
  git add -A
  git commit -m "[P2-MEDIUM] Pricing Experiment - $49 vs $79 vs $99/year A/B/C test"
  git push origin main
  ```

#### Day 0: Launch Day

**Morning (9 AM)**:
- [ ] Verify deployment is live on taxbridgecpa.com
- [ ] Test all 3 variants manually:
  1. Clear localStorage: `localStorage.clear()`
  2. Refresh `/pricing` page
  3. Check variant: `localStorage.getItem('pricing_experiment_variant')`
  4. Repeat 5-10 times to see all variants
- [ ] Verify PostHog events are firing:
  - Open PostHog dashboard → Live Events
  - Should see: `pricing_experiment_exposed`, `pricing_page_viewed`
- [ ] Verify Stripe checkout works for all 3 variants:
  - Test $49 checkout (use Stripe test card: 4242 4242 4242 4242)
  - Test $79 checkout
  - Test $99 checkout
  - Test $19/month checkout

**Afternoon (2 PM)**:
- [ ] Check first batch of traffic (4-6 hours post-launch)
- [ ] Verify variant distribution is roughly 33/33/34:
  - Go to `/dashboard/pricing-analytics`
  - Check variant assignment counts
  - If one variant has 0 assignments → bug, investigate immediately
- [ ] Create experiment tracking spreadsheet:
  | Date | Total Conversions | $49 Conv | $79 Conv | $99 Conv | $49 Rev | $79 Rev | $99 Rev | Notes |
  |------|-------------------|----------|----------|----------|---------|---------|---------|-------|
  | Day 0 | ... | ... | ... | ... | ... | ... | ... | Launch day |

**Evening (6 PM)**:
- [ ] Send team announcement:
  ```
  Subject: Pricing Experiment LIVE - $49 vs $79 vs $99/year

  Status: ✅ LIVE as of [timestamp]

  What: 3-way A/B test for optimal Pro plan pricing
  Duration: 2-4 weeks
  Target: 100+ conversions minimum

  Dashboard: /dashboard/pricing-analytics
  Cohort tracking: Product Hunt users tagged automatically

  No action needed - just don't mention pricing publicly until test concludes.
  ```

---

### **Week 1: Data Collection Phase**

#### Days 1-7: Daily Monitoring

**Every morning at 9 AM**:
1. [ ] Open `/dashboard/pricing-analytics`
2. [ ] Record metrics in tracking spreadsheet
3. [ ] Check for red flags:
   - Any variant with ZERO conversions? (Indicates bug)
   - One variant getting <20% or >40% traffic? (Unbalanced randomization)
   - Conversion rate dropped >50%? (UX bug or checkout broken)
4. [ ] Watch 1-2 session recordings:
   - PostHog → Session Recordings → Filter: `pricing_page_viewed`
   - Look for: confusion, rage clicks, drop-off points
5. [ ] Slack update (optional):
   ```
   Day N update:
   - Total conversions: X
   - Variants: $49: Y, $79: Z, $99: W
   - Leading variant: $XX (revenue: $XXX)
   - Sample size: X% of target (need 100+)
   ```

**Weekly Review (Day 7)**:
- [ ] Pull weekly report from analytics dashboard
- [ ] Calculate:
  - Conversion rate by variant
  - Revenue per variant
  - Product Hunt cohort vs organic performance
  - Monthly vs annual preference
- [ ] Assess statistical power:
  - Have we reached 100 conversions? If YES → prepare for Week 2 decision
  - If NO → extend test to Week 2-3
- [ ] Document insights:
  ```markdown
  ## Week 1 Insights (Days 1-7)

  ### Traffic Distribution
  - Total visitors: 5,000
  - $49 variant: 1,650 (33%)
  - $79 variant: 1,670 (33.4%)
  - $99 variant: 1,680 (33.6%)

  ### Conversions
  - $49: 45 conversions (2.7% CR) → Revenue: $2,205
  - $79: 30 conversions (1.8% CR) → Revenue: $2,370 ✅ LEADING
  - $99: 18 conversions (1.1% CR) → Revenue: $1,782

  ### Key Observations
  - $79 has highest revenue despite mid-tier conversion
  - $99 has lowest conversion (price resistance?)
  - Monthly option: 12% of conversions (lower than expected)

  ### Decision
  - ⏳ Continue test (only 93 conversions, need 100+ for significance)
  - 📊 $79 leading but margin is <20% (not decisive yet)
  ```

---

### **Week 2: Analysis & Decision**

#### Days 8-14: Convergence Monitoring

**Daily tasks** (same as Week 1):
- [ ] Record metrics
- [ ] Monitor for anomalies
- [ ] Update team on progress toward 100-conversion goal

**Mid-week check (Day 10-11)**:
- [ ] If 100+ conversions reached:
  - Calculate statistical significance
  - Prepare recommendation
  - Schedule decision meeting
- [ ] If <100 conversions:
  - Extend test to Week 3
  - Consider traffic drivers (ads, Product Hunt, SEO)

#### Day 14: Decision Point

**Morning Analysis**:
1. [ ] Pull final metrics from `/dashboard/pricing-analytics`
2. [ ] Export PostHog data:
   - Funnels: `pricing_page_viewed` → `checkout_started` → `checkout_completed`
   - Breakdown by: `variant`, `user_cohort`
3. [ ] Calculate winner by total revenue:
   ```
   Variant A ($49): X conversions × $49 = $XXX
   Variant B ($79): Y conversions × $79 = $YYY ✅ WINNER (if highest)
   Variant C ($99): Z conversions × $99 = $ZZZ
   ```
4. [ ] Check statistical significance:
   - Use: https://www.abtestguide.com/calc/
   - Input: Variant A visitors & conversions vs Variant B
   - Need: p-value < 0.05 (95% confidence)

**Decision Framework**:

| Scenario | Winner | Action |
|----------|--------|--------|
| **$49 highest revenue + conversions** | Variant A | Keep $49 as standard, remove $79/$99 from code |
| **$79 highest revenue** (balanced) | Variant B | Switch to $79 standard, use $49 for limited promos |
| **$99 highest revenue** (despite low CR) | Variant C | Implement tiered pricing: $49 starter / $79 standard / $99 premium |
| **All within 15% revenue** | Tie | Extend test 1-2 weeks OR implement tiered pricing |
| **Monthly >40% of conversions** | Monthly | Make $19/month default, de-emphasize annual |

**Afternoon: Team Presentation**:
- [ ] Present findings to stakeholders
- [ ] Share analytics dashboard screenshots
- [ ] Make recommendation based on revenue maximization
- [ ] Get approval for implementation plan

**Evening: Implementation Plan**:
- [ ] If clear winner → Schedule code update for next day
- [ ] If tie → Decide on extension or tiered pricing
- [ ] If sample size still low → Extend to Week 3

---

### **Week 3-4: Extension (if needed)**

**Only extend if**:
- [ ] <100 total conversions after Week 2
- [ ] Results tied (all variants within 15% revenue)
- [ ] Need more Product Hunt cohort data

**Extension protocol**:
- Same daily monitoring as Weeks 1-2
- Target: 150-200 conversions minimum
- Maximum duration: 28 days total (avoid sample ratio mismatch)
- Re-evaluate every 3-4 days

---

## Post-Experiment: Implementation

### **Day 15-16: Code Update**

**If $49 wins**:
```bash
# Keep existing code as-is
# Just document the decision
echo "Winner: $49/year - no code changes needed" > PRICING_EXPERIMENT_RESULTS.md
```

**If $79 wins**:
```bash
# Update pricing experiment hook to default to $79
# File: hooks/use-pricing-experiment.ts

# Change default variant:
const defaultVariant = 'annual_79'; // Was: 'annual_49'

# Update pricing page messaging
# File: app/pricing/page.tsx
# Update taglines to emphasize $79 value proposition
```

**If $99 wins**:
```bash
# Implement tiered pricing strategy
# Create 3 tiers: Starter ($49), Standard ($79), Premium ($99)
# Update pricing page to show all 3 tiers
# See: docs/TIERED_PRICING_IMPLEMENTATION.md
```

**If monthly wins (>40% of conversions)**:
```bash
# Update billing interval toggle to default to monthly
# File: components/BillingIntervalToggle.tsx

# Change default interval:
const [selected, setSelected] = useState<'monthly' | 'annual'>('monthly');

# Update messaging to emphasize monthly flexibility
```

### **Day 17: Cleanup**

**Remove experiment code** (if clear winner, not tiered pricing):
```bash
# 1. Archive experiment files
mkdir -p archive/pricing-experiment-2026-q1
mv hooks/use-pricing-experiment.ts archive/pricing-experiment-2026-q1/
mv components/BillingIntervalToggle.tsx archive/pricing-experiment-2026-q1/
mv app/api/analytics/pricing-experiment archive/pricing-experiment-2026-q1/

# 2. Simplify pricing page
# Remove experiment hook imports
# Hardcode winning price
# Remove variant logic

# 3. Update .env.production
# Remove unused price IDs
# Keep only winning variant price ID

# 4. Update documentation
echo "COMPLETED: Pricing experiment concluded [DATE]" >> docs/PRICING_EXPERIMENT.md
echo "Winner: $XX/year | Revenue: $XXX | Conversions: YYY" >> docs/PRICING_EXPERIMENT.md
```

### **Day 18: Results Documentation**

Create: `docs/PRICING_EXPERIMENT_RESULTS_2026_Q1.md`

```markdown
# Pricing Experiment Results - Q1 2026

**Experiment Duration:** March 19 - April 2, 2026 (14 days)
**Total Conversions:** 127
**Winner:** $79/year (Variant B)

## Results Summary

| Variant | Price | Conversions | Conv. Rate | Revenue | % of Total Revenue |
|---------|-------|-------------|------------|---------|-------------------|
| A       | $49   | 48          | 2.9%       | $2,352  | 33.5%             |
| B ✅    | $79   | 42          | 2.5%       | $3,318  | 47.3% **WINNER**  |
| C       | $99   | 25          | 1.5%       | $2,475  | 35.2%             |
| Monthly | $19   | 12          | 0.7%       | $228    | 3.2%              |

**Statistical Significance:** p = 0.03 (< 0.05 threshold ✅)

## Decision Rationale

$79/year selected as standard pricing because:
1. **Highest total revenue** ($3,318 vs $2,475 for $99)
2. **Balanced conversion + price** (2.5% CR at mid-tier price)
3. **Product Hunt cohort** showed 3.1% CR at $79 (highest of all variants)
4. **Monthly adoption low** (12 conversions, 9.4% of total)

## Implementation

- **Pricing Page:** Updated to show $79 as standard Pro plan price
- **Messaging:** Emphasize value: "Save $149/year vs monthly" ($228 - $79)
- **Promotional Strategy:** Use $49 for limited-time campaigns (Product Hunt, Black Friday)
- **Premium Tier:** Reserved $99 for future "Pro Plus" tier if needed

## Lessons Learned

1. **Revenue > Conversion:** $49 had highest CR but NOT highest revenue
2. **Mid-tier pricing works:** Sweet spot between affordability and value
3. **Annual preference strong:** Only 9.4% chose monthly
4. **Product Hunt users price-sensitive:** 3.1% CR at $79 vs 1.8% at $99

## Next Steps

1. ✅ Deploy $79 as standard pricing (completed April 3)
2. ⏳ Create $49 promotional landing page for campaigns
3. ⏳ A/B test messaging: "$79/year" vs "$6.58/month billed annually"
4. ⏳ Consider $99 "Pro Plus" tier with API access + white-label reports
```

---

## Emergency Protocols

### **Scenario 1: One variant has ZERO conversions after 48 hours**

**Symptoms**: $99 variant showing 0 conversions, but $49 and $79 have 5-10 each

**Diagnosis**:
```bash
# Check Stripe price ID is correct
grep STRIPE_PRO_PRICE_ID_99 .env.production

# Test $99 checkout manually
# Clear localStorage, force variant:
localStorage.setItem('pricing_experiment_variant', 'annual_99');
# Click "Upgrade" button → should redirect to Stripe checkout
```

**Fix**:
1. Verify price ID exists in Stripe dashboard
2. Check `/api/stripe/create-checkout` receives correct price ID
3. If broken, hotfix deployment with correct price ID
4. Discard first 48 hours of data, restart test

### **Scenario 2: Traffic imbalance (one variant gets >50%)**

**Symptoms**: $49 variant has 60% of traffic, $79 has 30%, $99 has 10%

**Diagnosis**:
```bash
# Check variant assignment logic
# File: hooks/use-pricing-experiment.ts

# Should be:
if (random < 0.33) variant = 'annual_49';
else if (random < 0.66) variant = 'annual_79';
else variant = 'annual_99';

# NOT:
# if (random < 0.5) variant = 'annual_49'; // WRONG
```

**Fix**:
1. Fix randomization logic
2. Deploy fix
3. Invalidate existing localStorage assignments (consider cache-busting URL param)
4. Restart test from Day 0

### **Scenario 3: Conversion rate drops >50% suddenly**

**Symptoms**: Days 1-3 had 3% CR, Day 4 has 1.2% CR

**Diagnosis**:
1. Check Stripe checkout is working (test manually)
2. Check for site errors (Sentry dashboard)
3. Check PostHog session recordings for UX issues
4. Verify no code changes were deployed

**Fix**:
1. Rollback deployment if recent change broke checkout
2. If external issue (Stripe outage), discard Day 4 data
3. If UX issue found, fix and restart test

---

## FAQ

### Q: Can I change the test mid-flight if $99 is clearly losing?

**A**: No. Changing the test mid-flight (e.g., removing $99 variant) invalidates the results. If one variant is clearly losing after Week 1, continue collecting data but prepare to conclude at Day 14. Early stopping introduces bias.

### Q: What if Product Hunt traffic spike skews results?

**A**: Product Hunt cohort is tracked separately via `user_cohort` metadata. Analyze PH users and organic users independently. If PH users behave differently, create separate pricing for PH landing pages.

### Q: Can I run other experiments simultaneously?

**A**: Not recommended. Running multiple pricing tests (e.g., headline A/B test + pricing test) can cause interaction effects. Wait for pricing test to conclude before running other conversion experiments on the pricing page.

### Q: What if we don't reach 100 conversions after 4 weeks?

**A**: If traffic is too low (<50 conversions after 28 days), make a directional decision based on available data. Note in documentation that results are "directional, not statistically significant". Consider extending to 6 weeks if critically important.

### Q: Should we optimize for conversion rate or total revenue?

**A**: **Always optimize for total revenue** (conversions × price). Higher conversion at lower price can yield LESS revenue than lower conversion at higher price. Example: 50 conversions at $49 ($2,450) < 35 conversions at $79 ($2,765).

---

## Contact & Resources

**Questions during experiment?**
- Implementation: See `docs/PRICING_EXPERIMENT.md`
- Analytics: `/dashboard/pricing-analytics`
- PostHog: https://app.posthog.com
- Stripe dashboard: https://dashboard.stripe.com

**Emergency contacts**:
- Experiment owner: [Your name/email]
- Technical issues: [Dev team contact]
- Revenue questions: [Finance team contact]

---

**Built for revenue maximization. Track religiously. Decide confidently. Ship aggressively.** 🚀
