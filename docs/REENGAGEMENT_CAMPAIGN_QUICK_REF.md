# Re-engagement Campaign - Quick Reference

## Current Status: ⚠️ PRE-LAUNCH

**Built**: ✅ Complete 3-email win-back sequence
**Deployed**: ❌ Database migration not run, zero emails sent
**Data**: ❌ No performance data to analyze yet

---

## Launch Checklist (60 minutes)

### 1. Run Database Migration (5 min)
```bash
npm run db:migrate
# Applies migration 020_reengagement_emails.sql
```

### 2. Verify Tables (2 min)
```bash
sqlite3 ./taxbridge.db "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('email_events', 'calculator_sessions', 'email_conversions');"
# Should output: email_events, calculator_sessions, email_conversions
```

### 3. Test Email Delivery (15 min)
```bash
tsx scripts/test-reengagement-campaign.ts
# Sends test emails to team addresses
```

### 4. Configure Cron Job (5 min)
```bash
# Set CRON_SECRET in Vercel dashboard
# Test manual trigger:
curl https://taxbridgecpa.com/api/cron/reengagement-campaign \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

### 5. Monitor First 24 Hours (Ongoing)
- Check analytics: `/dashboard/analytics/reengagement`
- Verify emails are sending daily
- Monitor deliverability (not landing in spam)

---

## Campaign Structure

| Email | Timing | Subject Line | Strategy | Conversion Target |
|-------|--------|-------------|----------|-------------------|
| **Day 3** | 3 days post-calculation | "How Michael Saved $12,400..." | Social Proof | 4% |
| **Day 7** | 7 days post-calculation | "🎁 20% Off TaxBridge Pro..." | Discount (20% off) | 4-5% |
| **Day 14** | 14 days post-calculation | "⏰ Last Day: Your $9.80..." | Urgency + FOMO | 3-4% |

**Total Expected Conversion**: ~4% (39 conversions per 1,000 calculator users)

---

## Performance Targets

| Metric | Industry Avg | Our Target | Top 10% |
|--------|-------------|------------|---------|
| Open Rate | 22% | **28%** | 42% |
| Click Rate | 3.2% | **6%** | 8.5% |
| Conversion Rate | 1.8% | **4%** | 6% |
| Revenue/Email | $1.20 | **$2.50** | $5.20 |

---

## A/B Testing Roadmap

### Week 1-2: Subject Line Tests

**Day 3**:
- Control: "How Michael Saved $12,400 in Taxes (And You Can Too)"
- **Winner (Expected)**: "{firstName}, you're leaving $ on the table" (+20-25% opens)

**Day 7**:
- Control: "🎁 20% Off TaxBridge Pro (Expires in 48 Hours)"
- **Winner (Expected)**: "{firstName}, claim your $9.80 before midnight" (+22-28% opens)

**Day 14**:
- Control: "⏰ Last Day: Your $9.80 Discount Expires Tonight"
- **Winner (Expected)**: "Final hours: {firstName}, don't miss out" (+18-25% opens)

### Week 3-4: CTA Tests

**Day 3**:
- Control: "See My Full Tax Breakdown →"
- **Winner (Expected)**: "Show Me How to Save $12,400 →" (+22-30% clicks)

**Day 7**:
- Control: "Claim My 20% Discount →"
- **Winner (Expected)**: "Lock In $39.20/Year (48 Hours Only) →" (+18-25% conversions)

**Day 14**:
- Control: "Upgrade Now (Before It's Gone) →"
- **Winner (Expected)**: "Yes, I Want to Save $9.80 →" (+20-28% conversions)

### Week 5-6: Personalization Tests

**Test**: Generic "$8,500" vs User's actual calculated savings
**Expected Lift**: +35-50% conversions (HIGH IMPACT)

---

## Top 5 Optimization Opportunities

1. **Personalize with actual user data** (+35-50% conversions)
   - Use their calculated tax savings instead of generic "$12,400"
   - Add to templates: `{actualTaxSavings}`, `{rsuAmount}`, `{visaType}`

2. **Shorten subject lines** (+15-20% opens)
   - Current: 50-52 characters (truncates on mobile)
   - Target: <40 characters
   - Use variants from `lib/email/reengagement-ab-variants.ts`

3. **Improve CTA copy** (+20-30% clicks)
   - Current: Vague ("See My Full Tax Breakdown")
   - Improved: Specific benefit ("Show Me How to Save $12,400")

4. **Reduce email length** (+10-15% engagement)
   - Current: 950-1,000 lines HTML
   - Target: <500 lines
   - Cut stats grids, reduce feature lists

5. **Auto-apply discount code** (+10-15% conversions)
   - Current: User types `SAVE20` manually
   - Improved: `?code=SAVE20&auto_apply=true` in URL

---

## Revenue Projections (1,000 Calculator Users/Month)

### Scenario 1: Conservative (Industry Average)
```
1,000 emails → 16 conversions (1.6%) → $626 revenue
Revenue per email: $0.63
Annual (12,000 emails): $7,512
```

### Scenario 2: Optimized (Our Targets)
```
1,000 emails → 39 conversions (3.9%) → $1,530 revenue
Revenue per email: $1.53
Annual (12,000 emails): $18,360
```

### Scenario 3: Best Case (Top 10%)
```
1,000 emails → 60 conversions (6%) → $2,352 revenue
Revenue per email: $2.35
Annual (12,000 emails): $28,224
```

**Goal**: Hit Scenario 2 (optimized) within 90 days.

---

## Analytics Dashboard

**URL**: `/dashboard/analytics/reengagement`

**Metrics Shown**:
- Overall campaign performance (open/click/conversion rates)
- Per-email breakdown (Day 3 vs Day 7 vs Day 14)
- Discount code performance
- Cohort analysis (weekly calculator users)
- Follow-up opportunities (clicked but didn't convert)
- Data-driven recommendations

**Check Frequency**: Daily for first 2 weeks, then weekly

---

## Alerts to Monitor

### 🔴 Critical Alerts

**Low Open Rate** (<20% for 3 days):
- Check spam folder placement
- Review subject line quality
- Verify sender reputation

**Zero Conversions** (0 for 5 days, >50 emails sent):
- Test checkout flow (is it broken?)
- Verify discount code works
- Check payment processing

**High Unsubscribe** (>2% for 1 day):
- **PAUSE CAMPAIGN**
- Review email content
- Check targeting (wrong segment?)

### 🟡 Warning Alerts

**Low Click Rate** (<4% for 5 days):
- Test CTA copy variants
- Improve email design
- Add more CTAs (top, mid, bottom)

**Day 14 Underperforming** (<2% conversion):
- Increase urgency in copy
- Test stronger discount (25% vs 20%)
- Add social proof (# of users upgraded)

---

## Quick Commands

### View Analytics
```bash
curl https://taxbridgecpa.com/api/analytics/reengagement | jq
```

### Trigger Campaign Manually
```bash
curl https://taxbridgecpa.com/api/cron/reengagement-campaign \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

### Check Database Metrics
```sql
-- Open psql or sqlite3 ./taxbridge.db

-- Overall performance
SELECT * FROM reengagement_performance;

-- Recent email sends
SELECT event_type, COUNT(*) as sent
FROM email_events
WHERE sent_at > DATE('now', '-7 days')
  AND event_type LIKE 'reengagement%'
GROUP BY event_type;

-- Conversion attribution
SELECT
  ee.event_type,
  COUNT(ec.id) as conversions,
  SUM(ec.revenue_amount) as revenue
FROM email_events ee
LEFT JOIN email_conversions ec ON ee.id = ec.email_event_id
WHERE ee.event_type LIKE 'reengagement%'
GROUP BY ee.event_type;
```

### Test Email Send
```bash
tsx scripts/test-reengagement-campaign.ts
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `docs/REENGAGEMENT_CAMPAIGN_ANALYSIS.md` | Full 400-line analysis, optimization recommendations |
| `lib/email/reengagement-campaign-templates.ts` | 3 email templates (Day 3, 7, 14) |
| `lib/email/reengagement-ab-variants.ts` | A/B test subject line and CTA variants |
| `lib/db/queries/reengagement-campaign.ts` | Database queries for targeting and tracking |
| `lib/db/migrations/020_reengagement_emails.sql` | Database schema |
| `app/api/cron/reengagement-campaign/route.ts` | Cron job endpoint (daily at 10 AM PST) |
| `app/api/analytics/reengagement/route.ts` | Analytics API endpoint |
| `app/dashboard/analytics/reengagement/page.tsx` | Analytics dashboard UI |
| `scripts/test-reengagement-campaign.ts` | Test suite |

---

## Next Steps

1. **This Week**: Run migration, deploy campaign, collect baseline data
2. **Week 2-3**: Implement subject line A/B tests
3. **Week 4-5**: Test CTA variants
4. **Week 6+**: Add personalization, build segmentation

**Estimated Time to Revenue**: ~7 days after launch
**Expected ROI**: 12-30x (depending on optimization)

---

**Questions?**
- Check full analysis: `docs/REENGAGEMENT_CAMPAIGN_ANALYSIS.md`
- View dashboard: `/dashboard/analytics/reengagement`
- Run tests: `tsx scripts/test-reengagement-campaign.ts`
