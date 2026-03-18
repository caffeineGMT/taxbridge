# Google Ads Campaign Setup Guide

**Campaign Goal:** Drive qualified leads for US-Canada cross-border tax calculator
**Target:** H-1B/TN visa tech workers planning Canada move or recently relocated
**Budget:** $500/month (110 clicks/month avg)
**Expected ROI:** 5% conversion rate = 5-6 paid customers/month = $1,500 MRR from ads

---

## Campaign Structure

### Campaign Settings
- **Campaign Type:** Search
- **Campaign Goal:** Leads (with conversion tracking)
- **Network:** Google Search only (no Display, no Search Partners initially)
- **Location:** United States (where target users currently work) + Canada (recent movers)
  - Primary: California, Washington, New York, Texas (tech hubs)
  - Secondary: British Columbia, Ontario (Canada destinations)
- **Language:** English
- **Bidding Strategy:** Maximize Conversions (with $500/month budget cap)
- **Ad Rotation:** Optimize (let Google test variants)

---

## Keyword Targeting

### High-Intent Keywords (Primary - 80% of budget)

| Keyword | Match Type | Est. Monthly Searches | Est. CPC | Priority |
|---------|------------|----------------------|----------|----------|
| h1b rsu tax calculator | Exact | 210 | $4.50 | P0 |
| canada us dual tax filing | Phrase | 140 | $3.80 | P0 |
| cross border tax software | Phrase | 90 | $4.20 | P1 |
| tn visa tax help | Phrase | 70 | $3.50 | P1 |
| foreign tax credit calculator | Exact | 50 | $3.90 | P1 |
| h1b canada tax | Broad Modified | 180 | $3.20 | P2 |
| rsu tax canada | Phrase | 110 | $4.00 | P2 |
| us canada tax treaty rsu | Phrase | 60 | $4.10 | P2 |
| dual residency tax calculator | Phrase | 40 | $4.30 | P2 |
| cross border tax accountant alternative | Phrase | 30 | $5.20 | P3 |

### Budget Allocation by Keyword Group
- **Tier 1** (h1b rsu, canada us dual): $250/month (50%)
- **Tier 2** (cross border, tn visa, ftc): $150/month (30%)
- **Tier 3** (broad match variants): $100/month (20%)

### Negative Keywords
- free tax software
- turbotax
- hrblock
- personal tax return
- canadian tax return only
- jobs
- hiring
- salary
- immigration lawyer

---

## Ad Copy - Responsive Search Ads

### Headlines (15 variants - Google will test combinations)

**Value Prop - Savings:**
1. "Save $3K in CPA Fees - Calculate in 10 Min"
2. "Avoid $12K in Overpaid Taxes"
3. "Free H1B RSU Tax Calculator"
4. "CPA-Verified Accuracy - 100% Free"

**Problem/Solution:**
5. "Confused by Dual-Country Filing?"
6. "US+Canada Tax Made Simple"
7. "Navigate Cross-Border Taxes"
8. "Foreign Tax Credit Optimizer"

**Speed/Convenience:**
9. "Calculate in 10 Minutes, Not 3 Hours"
10. "Instant Dual-Country Tax Estimate"
11. "No More Manual Spreadsheets"

**Trust/Authority:**
12. "500+ Tech Workers Trust TaxBridge"
13. "Built by H1B Immigrants"
14. "CPA-Verified FTC Calculator"

**Keyword Match:**
15. "H1B RSU Tax Calculator - 2025"

### Descriptions (4 variants)

**Description 1 (Feature-Focused):**
"Calculate US federal+state and Canada federal+provincial taxes with Foreign Tax Credit optimization. Get detailed filing instructions and forms checklist. No credit card required."

**Description 2 (Benefit-Focused):**
"Stop overpaying on cross-border taxes. Our calculator shows exactly how much you owe in both countries after Foreign Tax Credit. Save $3,000 in CPA fees with automated dual-country filing."

**Description 3 (Use Case):**
"Perfect for H1B/TN visa holders with US RSU income living in Canada. Handles Washington, California, NY, TX state taxes + BC, ON, AB provincial taxes. Compliant with US-Canada Tax Treaty Article XV."

**Description 4 (CTA-Focused):**
"Free calculation in 10 minutes. Enter your RSU income, see instant results. Get full tax report with filing deadlines and step-by-step instructions. Join 500+ satisfied users."

### Landing Page URLs

**Primary:**
- `https://taxbridge.com/us-canada-tax-calculator?utm_source=google&utm_medium=cpc&utm_campaign=h1b_rsu_search&utm_term={keyword}`

**Ad Extensions:**

**Sitelink Extensions:**
1. "How Foreign Tax Credit Works" → `/h1b-rsu-tax-guide`
2. "Filing Checklist" → `/canada-tax-filing-checklist`
3. "Pricing" → `/pricing`
4. "Free Calculator" → `/us-canada-tax-calculator`

**Callout Extensions:**
- "No Credit Card Required"
- "CPA-Verified Accuracy"
- "10-Minute Setup"
- "500+ Users"
- "Free Forever Plan"
- "US-Canada Tax Treaty Compliant"

**Structured Snippet Extensions:**
- **Tax Types:** US Federal, State, Canada Federal, Provincial, FTC
- **Supported States:** California, Washington, New York, Texas
- **Supported Provinces:** British Columbia, Ontario, Alberta

---

## Conversion Tracking Setup

### Step 1: Install Google Ads Conversion Tag

**Add to `app/layout.tsx` (in `<head>`):**

```typescript
{/* Google Ads Conversion Tracking */}
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX"></script>
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-XXXXXXXXXX');
    `,
  }}
/>
```

### Step 2: Set Up Conversion Actions in Google Ads

**Conversion 1: Calculator Page View (Micro-Conversion)**
- **Name:** Calculator Landing
- **Category:** Page view
- **Value:** $0 (awareness)
- **Count:** One per session

**Conversion 2: Calculator Start (Micro-Conversion)**
- **Name:** Calculator Started
- **Category:** Other
- **Value:** $0 (engagement)
- **Count:** One per session
- **Trigger:** User inputs RSU amount > $0

**Conversion 3: Calculator Complete (Micro-Conversion)**
- **Name:** Calculator Completed
- **Category:** Other
- **Value:** $5 (qualified lead)
- **Count:** One per session
- **Trigger:** User sees full tax results

**Conversion 4: Email Capture (Primary Conversion)**
- **Name:** Lead Captured
- **Category:** Submit lead form
- **Value:** $10 (for bid optimization)
- **Count:** One
- **Trigger:** Email form submission

**Conversion 5: Paid Subscription (Revenue Conversion)**
- **Name:** Subscription Purchase
- **Category:** Purchase
- **Value:** Transaction value ($299)
- **Count:** One
- **Trigger:** Stripe checkout success

### Step 3: Add Conversion Tracking Code

**Already implemented in `/lib/google-ads/conversion-tracking.ts`:**
- `trackCalculatorPageView()` - Fires on page load
- `trackCalculatorStart()` - Fires when user inputs RSU amount
- `trackCalculatorComplete()` - Fires when results display
- `trackLeadCapture()` - Fires on email submission
- `trackPaidConversion()` - Fires on checkout success

---

## Remarketing Setup

### Audience Segments

**Audience 1: Calculator Viewers (Awareness)**
- **Users who:** Viewed calculator page but didn't start
- **Duration:** 30 days
- **Strategy:** Broad awareness ads, social proof

**Audience 2: Calculator Completers (High Intent)**
- **Users who:** Completed calculation but didn't submit email
- **Duration:** 60 days
- **Strategy:** Aggressive retargeting, limited-time offers

**Audience 3: Email Captured (Warm Leads)**
- **Users who:** Submitted email but didn't purchase
- **Duration:** 90 days
- **Strategy:** Nurture sequence, showcase Pro features

### Remarketing Tag Implementation

**Add to calculator page (`page-enhanced.tsx` - already done):**
```typescript
setRemarketingAudience('calculator_viewers');  // On page load
setRemarketingAudience('calculator_completers'); // On results view
setRemarketingAudience('email_captured');      // On email submit
```

---

## A/B Testing Plan

### Test 1: Headline Variants (Week 1-2)
- **Variant A:** "Save $3K in CPA Fees - Calculate in 10 Min"
- **Variant B:** "Free H1B RSU Tax Calculator - CPA-Verified"
- **Variant C:** "Avoid $12K in Overpaid Taxes"
- **Metric:** Click-through rate (CTR)
- **Winner:** Highest CTR advances

### Test 2: Landing Page CTA (Week 3-4)
- **Variant A:** "Get Free Report"
- **Variant B:** "Calculate My Tax"
- **Variant C:** "Save Money Now"
- **Metric:** Email capture rate
- **Winner:** Highest conversion rate

### Test 3: Social Proof Placement (Week 5-6)
- **Variant A:** Hero section banner
- **Variant B:** Below results card
- **Variant C:** No social proof
- **Metric:** Email capture rate

---

## Budget Pacing & Monitoring

### Daily Budget: $16.67

**Morning Check (9 AM PT):**
- Budget spent: Should be ~$5-6 by 9 AM
- Impressions: 50-100/day
- Clicks: 3-5/day
- CTR: Target 4-6%

**Evening Check (6 PM PT):**
- Budget spent: ~$13-15 by 6 PM
- Conversions (leads): Target 0.2-0.3/day (5-6/month)
- Cost per lead: Target $80-100

### Weekly Review (Every Monday)

**Metrics to Track:**
- **Impressions:** 700-1,400/week
- **Clicks:** 20-35/week
- **CTR:** 4-6%
- **Email captures:** 1-1.5/week
- **Cost per lead:** $80-100
- **Paid conversions:** 0.25/week (1/month)

**Optimization Actions:**
- Pause keywords with CTR < 2%
- Increase bids on keywords with conversion rate > 10%
- Add negative keywords from search term report
- Rotate underperforming ad copy

---

## Success Metrics & KPIs

### Primary KPI: Cost Per Acquisition (CPA)
- **Target:** $100/lead (email capture)
- **Max Acceptable:** $150/lead
- **Stretch Goal:** $80/lead

### Secondary KPIs:
- **Click-Through Rate (CTR):** 4-6% (industry avg: 3-5%)
- **Conversion Rate (Email):** 5% (5 clicks → 1 email)
- **Paid Conversion Rate:** 5% (20 emails → 1 paid customer)
- **ROAS (Return on Ad Spend):** 3:1 minimum ($299 revenue / $100 acquisition = 2.99x)

### Monthly Goals:
- **Budget:** $500
- **Clicks:** 100-120
- **Email Captures:** 5-6
- **Paid Customers:** 1 (conservative) to 2 (stretch)
- **Revenue:** $299-598
- **ROI:** -50% to +20% (month 1, breakeven expected month 3)

---

## PostHog Event Tracking Integration

### Events Already Configured:
- `calculator_page_viewed` - Google Ads landing
- `first_rsu_entry_started` - Calculator engagement
- `tax_calculation_viewed` - Results shown
- `email_verified` - Lead capture
- `checkout_completed` - Paid conversion

### Custom Properties for Attribution:
- `utm_source`: google
- `utm_medium`: cpc
- `utm_campaign`: h1b_rsu_search
- `utm_term`: {keyword}
- `rsuAmount`: Input value
- `ftcSavings`: Calculated savings
- `isGoogleAdsTraffic`: true/false

### PostHog Funnel Setup:
1. Calculator Page View (Step 1)
2. Calculator Started (Step 2)
3. Calculator Completed (Step 3)
4. Email Captured (Step 4)
5. Paid Conversion (Step 5)

**Expected Drop-off:**
- Step 1→2: 60% (40% bounce)
- Step 2→3: 90% (10% abandon mid-calc)
- Step 3→4: 5% (95% don't submit email)
- Step 4→5: 5% (95% free users)

---

## Campaign Launch Checklist

### Pre-Launch (Week Before)
- [ ] Create Google Ads account
- [ ] Set up billing ($500/month budget)
- [ ] Install conversion tracking code
- [ ] Create all 5 conversion actions
- [ ] Set up remarketing tag
- [ ] Test conversion tracking in staging
- [ ] Write all 15 headline variants
- [ ] Write all 4 description variants
- [ ] Create ad extensions (sitelinks, callouts, snippets)
- [ ] Set up PostHog funnel dashboard

### Launch Day
- [ ] Create Search campaign
- [ ] Add all keywords (10 primary keywords)
- [ ] Create 3-5 ad groups by keyword theme
- [ ] Add responsive search ads to each ad group
- [ ] Set daily budget to $16.67
- [ ] Enable conversion tracking
- [ ] Enable remarketing
- [ ] Set up negative keyword list
- [ ] Monitor first 10 clicks closely

### Week 1 Post-Launch
- [ ] Check daily at 9 AM and 6 PM PT
- [ ] Review search terms report
- [ ] Add 5-10 negative keywords
- [ ] Pause keywords with 0 clicks after 100 impressions
- [ ] Check conversion tracking is firing correctly
- [ ] Review landing page analytics
- [ ] Optimize ad copy based on CTR

### Week 2-4 Optimization
- [ ] Run A/B test on headlines
- [ ] Adjust bids based on conversion data
- [ ] Expand to top-performing keyword variations
- [ ] Set up automated rules (pause low CTR ads)
- [ ] Create remarketing campaign for calculator completers
- [ ] Review competitor ads
- [ ] Test landing page CTA variants

---

## Troubleshooting

### Issue: High CPC (>$6)
**Solution:**
- Add more negative keywords
- Pause broad match keywords
- Lower bids on expensive keywords
- Focus budget on exact match

### Issue: Low CTR (<2%)
**Solution:**
- Rewrite headlines (test savings-focused)
- Add keyword in headline
- Test urgency-based copy
- Check ad relevance score

### Issue: High Clicks, No Conversions
**Solution:**
- Review landing page speed
- Check conversion tracking firing
- Simplify email form
- Add social proof
- A/B test CTA copy

### Issue: Budget Depletes by Noon
**Solution:**
- Lower max CPC bid limits
- Pause low-converting keywords
- Spread budget across more keywords
- Switch to manual CPC bidding

---

## Next Steps After $500 Spend

1. **Analyze Results:**
   - Which keywords drove conversions?
   - What was actual CPA?
   - Which ad copy had highest CTR?

2. **Scale Winners:**
   - Increase budget on profitable keywords by 20%
   - Pause keywords with CPA > $150
   - Double down on 5-10% conversion rate keywords

3. **Expand:**
   - Add long-tail keyword variations
   - Test Display Remarketing
   - Try Video Ads (YouTube for H1B audience)
   - Expand to Microsoft Ads (Bing)

4. **Optimize:**
   - Create dedicated landing pages per keyword
   - Implement exit-intent popups
   - Add live chat for high-intent visitors
   - Set up automated email drip for leads

---

## Contact & Support

**Google Ads Support:** ads-support@google.com
**TaxBridge Team:** hello@taxbridge.com
**PostHog Dashboard:** https://app.posthog.com
**Conversion Tracking Docs:** `/docs/POSTHOG_UTM_TRACKING.md`

---

**Last Updated:** 2026-03-18
**Campaign Status:** Ready to Launch
**Est. Launch Date:** 2026-03-20
