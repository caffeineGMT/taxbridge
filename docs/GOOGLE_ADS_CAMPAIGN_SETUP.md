# Google Ads Campaign Setup Guide - High-Intent Keyword Targeting

**Status:** Ready for Launch
**Budget:** $50/day ($1,500/month)
**Target CPA:** $20
**Keywords:** H1B RSU tax calculator, TN visa stock tax, cross border tax tool
**Conversion Tracking:** PostHog + Google Ads

---

## Executive Summary

This document provides the complete setup guide for launching 3 high-intent Google Ads search campaigns targeting cross-border tax users.

### Campaign Overview

| Campaign | Keywords | Daily Budget | Target CPA | Expected Conversions/Month |
|----------|----------|--------------|------------|----------------------------|
| H1B RSU Tax Calculator | 4 keywords | $25/day | $20 | 15-20 signups |
| TN Visa Stock Tax | 4 keywords | $15/day | $20 | 10-12 signups |
| Cross Border Tax Tool | 4 keywords | $10/day | $20 | 6-8 signups |
| **Total** | **12 keywords** | **$50/day** | **$20** | **31-40 signups/month** |

### Expected Performance

- **Monthly Spend:** $1,500
- **Projected Signups:** 31-40 (at $20 CPA)
- **Conversion Rate Target:** 3-5%
- **CTR Target:** 5%+
- **Quality Score Target:** 7+

---

## Phase 1: Google Ads Account Setup (30 minutes)

### Step 1: Create Google Ads Account

1. Go to [ads.google.com](https://ads.google.com)
2. Click "Start Now"
3. Sign in with Google account
4. Select "Expert Mode" (not Smart campaign)
5. Skip campaign creation wizard for now

### Step 2: Add Billing Information

1. Navigate to Tools & Settings → Billing
2. Add credit card or bank account
3. Set billing threshold: $500
4. Enable automatic payments
5. Verify billing is active

---

## Phase 2: Conversion Tracking Setup (45 minutes)

### Create 5 Conversion Actions

Navigate to **Tools & Settings → Measurement → Conversions**, create these actions:

1. **Calculator Page View** - Category: Page view, Value: $0, Window: 7 days
2. **Calculator Started** - Category: Other, Value: $0, Window: 7 days
3. **Calculator Completed** - Category: Other, Value: $5, Window: 30 days
4. **Signup Completed** - Category: Lead form, Value: $10, Window: 30 days ✓ PRIMARY
5. **Subscription Purchase** - Category: Purchase, Value: Transaction-specific, Window: 90 days ✓ REVENUE

Update `.env.local` with your conversion IDs and labels.

---

## Phase 3: Launch Campaigns (60 minutes)

### Campaign 1: H1B RSU Tax Calculator
- Budget: $25/day
- Target CPA: $20
- Keywords: "H1B RSU tax calculator" (exact + phrase), "H1B stock options tax" (phrase)
- Ad Headlines: "Free H1B RSU Tax Calculator", "Calculate Your RSU Tax Savings", etc.
- Final URL: `https://taxbridgecpa.com/us-canada-tax-calculator?utm_source=google&utm_medium=cpc&utm_campaign=h1b_rsu_search`

### Campaign 2: TN Visa Stock Tax
- Budget: $15/day
- Target CPA: $20
- Keywords: "TN visa stock tax" (exact + phrase), "TN visa RSU taxation" (phrase)
- Ad Headlines: "TN Visa Stock Tax Calculator", "Free RSU Tax Tool for TN Visa", etc.
- Final URL: `...utm_campaign=tn_visa_search`

### Campaign 3: Cross Border Tax Tool
- Budget: $10/day
- Target CPA: $20
- Keywords: "cross border tax tool" (exact), "US Canada tax calculator" (phrase)
- Ad Headlines: "Free Cross-Border Tax Tool", "US-Canada Tax Calculator", etc.
- Final URL: `...utm_campaign=cross_border_search`

**Full campaign details:** See `config/google-ads-campaign.json`

---

## Phase 4: Monitoring (Daily)

Run budget monitor:
```bash
npm run track-ads-spend
```

Checks:
- Daily spend vs $50 budget (alert if >$60)
- CPA vs $20 target (alert if >$40)
- Conversion rate vs 3% (alert if <1%)
- Zero conversions after 50+ clicks (pause campaign)

**Dashboard:** `/admin/google-ads-dashboard`

---

## Success Metrics

### Week 1 Targets
- Spend: $350-400
- Conversions: 2-5
- CPA: $50-80 (improves over time)
- CTR: 3-5%

### Month 1 Targets
- Spend: $1,500
- Conversions: 31-40 signups
- CPA: $20-25
- Conversion Rate: 3%+
- CTR: 5%+
- Quality Score: 7+

---

## Quick Commands

```bash
npm run track-ads-spend          # Daily budget monitor
npm run revenue:report            # Monthly performance report
```

**Campaign Dashboard:** `/admin/google-ads-dashboard`
**PostHog Funnel:** `/admin/posthog-funnel`
**Full Config:** `config/google-ads-campaign.json`
