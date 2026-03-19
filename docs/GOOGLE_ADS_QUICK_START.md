# Google Ads Campaign - Quick Start Guide

**⏱️ Time to Launch: 2 hours**
**💰 Budget: $50/day**
**🎯 Target CPA: $20**
**📊 Expected Results: 31-40 signups/month**

---

## ✅ Pre-Launch Checklist (Complete These First)

### 1. Google Ads Account Setup (30 min)
- [ ] Create Google Ads account at [ads.google.com](https://ads.google.com)
- [ ] Add billing information (credit card)
- [ ] Set billing threshold to $500

### 2. Conversion Tracking Setup (45 min)
- [ ] Create 5 conversion actions in Google Ads (see setup guide)
- [ ] Copy conversion IDs from Google Ads
- [ ] Update `.env.local` with actual conversion IDs
- [ ] Deploy to production
- [ ] Test conversion tracking with Google Tag Assistant

### 3. Launch Campaigns (45 min)
- [ ] Import campaign config from `config/google-ads-campaign.json`
- [ ] OR manually create 3 campaigns (H1B RSU, TN Visa, Cross Border)
- [ ] Set budget limits: $25, $15, $10 respectively
- [ ] Enable campaigns

---

## 🚀 Fast Track: Copy-Paste Campaign Setup

### Campaign 1: H1B RSU Tax Calculator

**Settings:**
```
Name: H1B RSU Tax Calculator - High Intent Search
Type: Search
Budget: $25/day
Bidding: Target CPA - $20
Locations: United States, Canada
Networks: Search only
```

**Keywords:**
```
[Exact] "H1B RSU tax calculator" - Max CPC: $12
[Phrase] "H1B RSU tax calculator" - Max CPC: $10
[Phrase] "H1B stock options tax" - Max CPC: $8
[Phrase] "H1B equity compensation tax" - Max CPC: $8
```

**Ad Headlines (top 5):**
```
1. Free H1B RSU Tax Calculator
2. Calculate Your RSU Tax Savings
3. US-Canada Tax Expert Tool
4. Maximize Your RSU Returns
5. H1B Tax Planning Made Easy
```

**Final URL Template:**
```
https://taxbridgecpa.com/us-canada-tax-calculator?utm_source=google&utm_medium=cpc&utm_campaign=h1b_rsu_search&utm_term={keyword}&utm_content={creative}
```

### Campaign 2: TN Visa Stock Tax
- Same settings as Campaign 1
- Budget: $15/day
- Replace "H1B" keywords with "TN visa" variants
- Update campaign name in URL: `utm_campaign=tn_visa_search`

### Campaign 3: Cross Border Tax Tool
- Same settings as Campaign 1
- Budget: $10/day
- Generic cross-border keywords (no visa type)
- Update campaign name in URL: `utm_campaign=cross_border_search`

---

## 📊 Monitoring (Run Daily for First Week)

### Daily Budget Check
```bash
# Run this every morning
npm run track-ads-spend

# View dashboard
open http://localhost:3000/admin/google-ads-dashboard
```

### What to Watch

**🚨 Critical Alerts (Pause Immediately):**
- Daily spend > $60
- 50+ clicks with 0 conversions
- CPA > $40 for 3 days straight

**⚠️ Warning Signs (Optimize):**
- CTR < 2% (improve ad copy)
- Conversion rate < 1% (optimize landing page)
- CPA > $25 (review keywords, add negatives)

---

## 🎯 Week 1 Expectations

| Metric | Target | What It Means |
|--------|--------|---------------|
| **Daily Spend** | $50-60 | Staying on budget |
| **Clicks** | 10-15/day | People are interested |
| **CTR** | 3-5% | Ads are relevant |
| **Conversions** | 2-5 total | Early signals working |
| **CPA** | $50-80 | High at first, will improve |

**Don't panic if:** CPA is high in week 1. Google Ads needs data to optimize.

**DO panic if:** Zero conversions after 100 clicks. Check conversion tracking.

---

## 🔄 Weekly Optimization Routine

### Monday Morning (15 min)
1. Run `npm run track-ads-spend`
2. Review search terms report in Google Ads
3. Add 5-10 negative keywords
4. Pause keywords with CTR < 2%

### Wednesday (10 min)
1. Check PostHog funnel: `/admin/posthog-funnel`
2. Review which campaigns are converting
3. Reallocate budget to winners

### Friday (10 min)
1. Weekly performance review
2. Test new ad headline variants
3. Update landing page if conversion rate < 3%

---

## 💰 Expected ROI

### Month 1
- **Spend:** $1,500
- **Signups:** 31-40
- **Revenue (if 10% convert to Pro):** 3-4 × $299 = $897-$1,196
- **ROI:** Break-even to 20% loss (building pipeline)

### Month 3 (If Scaling)
- **Spend:** $3,000
- **Signups:** 100-120
- **Revenue (if 10% convert):** 10-12 × $299 = $2,990-$3,588
- **ROI:** Break-even to 20% profit

### Month 6 (Optimized)
- **Spend:** $3,000
- **Signups:** 150-180 (lower CPA)
- **Revenue (if 12% convert):** 18-22 × $299 = $5,382-$6,578
- **ROI:** 79-119% profit

---

## 🆘 Troubleshooting

### Problem: No conversions after 50 clicks
**Check:**
1. Is conversion tracking firing? (Google Tag Assistant)
2. Is landing page loading? (test in incognito)
3. Are keywords relevant? (review search terms)

**Fix:**
1. Test conversion tracking end-to-end
2. Add trust signals to landing page
3. Pause irrelevant keywords

### Problem: CPA > $40
**Check:**
1. Which keywords are expensive?
2. Is landing page converting well?
3. Are ads matching search intent?

**Fix:**
1. Pause high-CPA keywords
2. A/B test landing page headline
3. Add negative keywords

### Problem: Daily spend > $60
**Fix:**
1. Lower daily budgets in Google Ads
2. Pause low-performing campaigns
3. Set up spending limit alert

---

## 📚 Resources

### Internal Tools
- **Campaign Dashboard:** `/admin/google-ads-dashboard`
- **PostHog Funnel:** `/admin/posthog-funnel`
- **Campaign Config:** `config/google-ads-campaign.json`
- **Full Setup Guide:** `docs/GOOGLE_ADS_CAMPAIGN_SETUP.md`

### Google Ads Console
- **Main Dashboard:** [ads.google.com](https://ads.google.com)
- **Keyword Planner:** Tools → Keyword Planner
- **Search Terms Report:** Campaigns → Keywords → Search terms
- **Conversions:** Tools → Measurement → Conversions

### Quick Commands
```bash
npm run track-ads-spend         # Daily budget monitor
npm run revenue:report           # Monthly performance
npm run setup:google-ads         # Initial setup helper
```

---

## 🎯 Success Criteria

**Launch if ALL true:**
- ✅ Conversion tracking tested and working
- ✅ PostHog events firing correctly
- ✅ Landing page loads in < 2s
- ✅ Billing set up in Google Ads

**Pause campaigns if ANY true:**
- ❌ Daily spend > $70 for 2 days
- ❌ 100+ clicks with 0 conversions
- ❌ CPA > $60 for 7 days

---

**Status:** 🟢 Ready for Launch (after Google Ads account setup)
**Next Step:** Complete Pre-Launch Checklist above
**Help:** See `docs/GOOGLE_ADS_CAMPAIGN_SETUP.md` for detailed guide
