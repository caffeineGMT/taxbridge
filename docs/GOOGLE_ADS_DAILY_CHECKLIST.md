# Google Ads Campaign Management - Quick Start Guide

**🔴 STATUS: CAMPAIGNS NOT RUNNING** (as of March 19, 2026)

This is your **2-minute daily monitoring guide** for when campaigns ARE active.

---

## Current Status

### ❌ Pre-Launch (NOT Running)

**Blockers:**
- [ ] Placeholder tracking ID (`AW-XXXXXXXXXX`) needs replacement
- [ ] Google Ads account not created
- [ ] $500/month budget not approved
- [ ] Strategic decision pending (SEO vs Paid Ads)

**Strategic Recommendation:** HOLD activation until SEO validates 5%+ conversion rate + $79 pricing

---

## When Campaigns ARE Active

### Daily Health Check (2 minutes)

**Morning Check (9 AM PT):**
```
✓ Spend so far today: ~$5-6
✓ Clicks today: 3-5
✓ CTR: >4%
✓ Any conversions yet? (email captures)
```

**Evening Check (6 PM PT):**
```
✓ Total spend today: ~$13-15 (target: $16.67/day)
✓ Total clicks: 5-8
✓ Conversions today: 0-1 email captures
✓ CPA today: <$100
```

**How to Check:**
1. Open Google Ads: https://ads.google.com
2. View Dashboard → Today's Performance
3. Log daily spend: `npm run track-ads-spend 16.50`

---

### Weekly Optimization (15 minutes, every Monday)

**1. Export Performance Data**
   - Google Ads → Reports → Search Terms
   - Download last 7 days

**2. Identify & Pause Losers**
   - CTR < 2% → Pause keyword
   - CPA > $150 → Pause keyword
   - 0 conversions after 50 clicks → Pause

**3. Boost Winners**
   - CTR > 6% → Increase bid +20%
   - CPA < $80 → Increase budget
   - Conversion rate > 10% → Expand to similar keywords

**4. Add Negative Keywords**
   - Find irrelevant search terms
   - Add 5-10 negative keywords
   - Common negatives: "free", "jobs", "salary", "turbotax"

**5. Update PostHog Dashboard**
   - Check conversion funnel drop-off
   - Verify ROAS trending toward 100%+

---

## Budget Tracker

**Target:** $500/month = $16.67/day

| Date | Spend | Clicks | CTR | Email Captures | CPA | Notes |
|------|-------|--------|-----|----------------|-----|-------|
| Mar 20 | - | - | - | - | - | Not running |
| Mar 21 | - | - | - | - | - | Not running |
| Mar 22 | - | - | - | - | - | Not running |

**How to Update:**
1. Check Google Ads daily spend
2. Run: `npm run track-ads-spend <spend> <date>`
3. Fill in table above

---

## Red Flag Alerts

### 🚨 PAUSE CAMPAIGN IMMEDIATELY IF:

- ❌ **CPC > $8** → Bids too high, budget will deplete in hours
- ❌ **50+ clicks, 0 conversions** → Tracking broken or wrong audience
- ❌ **Daily spend > $25** → Budget overrun, losing money fast
- ❌ **CTR < 1%** → Ad copy irrelevant, wasting impressions

### ⚠️  OPTIMIZE WITHIN 24 HOURS IF:

- ⚠️  **CPA > $120** → Approaching unsustainable CAC
- ⚠️  **CTR 2-4%** → Below target, test new headlines
- ⚠️  **Budget depletes by 3 PM** → Spread bids more evenly

---

## Top Keywords to Watch

| Keyword | Target CPC | Min CTR | Action if Below |
|---------|-----------|---------|-----------------|
| h1b rsu tax calculator | $4.50 | 5% | Rewrite headline, add savings benefit |
| canada us dual tax filing | $3.80 | 4% | Add negative keywords (turbotax, etc) |
| cross border tax software | $4.20 | 4% | Test urgency copy ("2026 deadline") |

---

## Quick Actions

### Pause a Keyword
1. Google Ads → Keywords → Select keyword
2. Status → Paused
3. Note reason in spreadsheet

### Add Negative Keyword
1. Google Ads → Keywords → Negative keywords
2. Click "+ Add"
3. Enter keyword (e.g., "free tax software")

### Increase Bid
1. Google Ads → Keywords → Select keyword
2. Edit max CPC → Increase by $0.50
3. Save

### Check ROI in PostHog
1. PostHog → Dashboards → "Google Ads Performance"
2. View ROAS metric (target: >100%)

---

## Campaign Activation Checklist

**When Ready to Launch:**

- [ ] **Step 1:** Create Google Ads account (30 min)
- [ ] **Step 2:** Replace `NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX` with real ID
- [ ] **Step 3:** Set up billing ($500/month budget)
- [ ] **Step 4:** Create campaigns (2 hours) - follow `/docs/GOOGLE_ADS_CAMPAIGN_SETUP.md`
- [ ] **Step 5:** Test conversion tracking (15 min)
- [ ] **Step 6:** Launch campaigns
- [ ] **Step 7:** Monitor first 10 clicks closely

**Estimated Setup Time:** 3-4 hours total

---

## ROI Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| CPC | < $5 | - | Not running |
| CTR | > 4% | - | Not running |
| CPA (email) | < $100 | - | Not running |
| CAC (paid) | < $500 | - | Not running |
| ROAS | > 100% | - | Not running |

**Break-Even Calculation:**
- $500 spend ÷ $79 pricing = 6.3 paid customers needed for break-even
- At 0.135% conversion rate: Need 4,667 clicks (requires $0.11 CPC - unrealistic)
- **Reality:** Will be negative ROI for first 3-6 months until LTV kicks in

---

## Support Resources

**📖 Full Documentation:**
- Campaign Setup: `/docs/GOOGLE_ADS_CAMPAIGN_SETUP.md`
- Status Report: `/docs/GOOGLE_ADS_CAMPAIGN_STATUS_2026-03-19.md`
- PostHog Dashboard: `/docs/POSTHOG_GOOGLE_ADS_ROI_DASHBOARD.md`

**🛠️ Tools:**
- Track Spend: `npm run track-ads-spend <amount>`
- Google Ads: https://ads.google.com
- PostHog: https://app.posthog.com

**📞 Support:**
- Google Ads Support: 1-866-246-6453
- Email: michael@taxbridgecpa.com

---

## Strategic Decision: SEO vs Paid Ads

**Current Recommendation (March 19, 2026): HOLD**

**Why?**
- Paid Ads ROI: **-98.7%** (projected)
- SEO ROI: **INFINITE** ($0 CAC, compounds monthly)
- SEO projected revenue: $588-$2,940 MRR by Month 3

**Revisit Paid Ads When:**
1. ✅ SEO traffic reaches 100+ visits/day
2. ✅ Organic conversion rate validated at 5%+
3. ✅ Pricing increased to $99-149/year
4. ✅ LTV calculated (need 3-6 months retention data)

**Timeline:** Re-evaluate in Month 3-4 (June 2026)

---

**Last Updated:** March 19, 2026
**Next Review:** March 26, 2026 OR upon strategic go-live decision
**Campaign Manager:** Michael Guo
