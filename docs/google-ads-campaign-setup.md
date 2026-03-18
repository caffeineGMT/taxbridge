# TaxBridge Google Ads Campaign Setup Guide

**Campaign Launch Date:** March 18, 2026
**Daily Budget:** $50/day ($1,500/month)
**Target CPA:** $50 (cost per signup)
**LTV:CAC Target:** >3.0x

---

## Table of Contents
1. [Account Setup](#account-setup)
2. [Conversion Tracking](#conversion-tracking)
3. [Campaign Structure](#campaign-structure)
4. [Keyword Research](#keyword-research)
5. [Ad Copy Variations](#ad-copy-variations)
6. [Landing Page Mapping](#landing-page-mapping)
7. [Bidding Strategy](#bidding-strategy)
8. [Remarketing Setup](#remarketing-setup)
9. [Analytics & Measurement](#analytics--measurement)
10. [Success Metrics](#success-metrics)

---

## Account Setup

### 1. Create Google Ads Account
- **URL:** https://ads.google.com
- **Link Domain:** taxbridge.app
- **Account Name:** TaxBridge - Cross-Border Tax Software
- **Time Zone:** Pacific Time (PT)
- **Currency:** USD

### 2. Link Google Analytics 4
- Connect GA4 property to Google Ads account
- Import conversions from GA4 to Google Ads
- Enable auto-tagging for UTM parameters

### 3. Install Conversion Tracking
Conversion tracking is already implemented in `/app/layout.tsx`:

```javascript
// Google Ads ID (replace with actual ID)
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX

// Conversion Labels (set in Google Ads UI)
NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL=xxx
NEXT_PUBLIC_GOOGLE_ADS_PRO_LABEL=xxx
NEXT_PUBLIC_GOOGLE_ADS_ENTERPRISE_LABEL=xxx
NEXT_PUBLIC_GOOGLE_ADS_CALCULATOR_LABEL=xxx
```

**Action Items:**
1. Create Google Ads account and get conversion ID
2. Set up 4 conversion actions in Google Ads UI:
   - **Signup** (Primary conversion, CPA target: $50)
   - **Pro Subscription** (Value: $299)
   - **Enterprise Demo Request** (High-intent lead)
   - **Calculator Use** (Micro-conversion)
3. Copy conversion labels to `.env.local`

---

## Conversion Tracking

### Conversion Events

| Event | Action | Value | Attribution | Tracking Code |
|-------|--------|-------|-------------|---------------|
| **Signup** | User completes registration | $0 | Primary conversion | `trackSignup()` in `/lib/analytics/google-ads.ts` |
| **Pro Subscription** | User subscribes to Pro plan | $299 | Purchase | `trackProSubscription()` |
| **Enterprise Demo** | Lead form submission | $0 | Lead generation | `trackEnterpriseDemoRequest()` |
| **Calculator Use** | User inputs data in calculator | $0 | Engagement | `trackCalculatorUse()` |

### Implementation Checklist
- [x] Install gtag.js in layout.tsx
- [x] Create tracking functions in `/lib/analytics/google-ads.ts`
- [ ] Test conversion tracking with Google Tag Assistant
- [ ] Verify conversions appear in Google Ads dashboard
- [ ] Set up conversion value rules (e.g., Pro subscription = $299)

---

## Campaign Structure

### Campaign Hierarchy

```
TaxBridge - Search Campaign
├── Ad Group 1: Calculator Intent
│   ├── Keywords: calculator, estimate, compute (15 keywords)
│   ├── Landing Page: /lp/calculator
│   └── Ad Variations: 3
├── Ad Group 2: Education Intent
│   ├── Keywords: guide, treaty, rules (10 keywords)
│   ├── Landing Page: /lp/guide
│   └── Ad Variations: 3
└── Ad Group 3: Software Intent
    ├── Keywords: software, tool, platform (10 keywords)
    ├── Landing Page: /lp/software
    └── Ad Variations: 3
```

---

## Keyword Research

### Target Keywords (35 total)

#### **Ad Group 1: Calculator Intent** (15 keywords)
High-intent users looking for immediate tax calculation.

| Keyword | Monthly Searches | CPC | Match Type | Priority |
|---------|-----------------|-----|------------|----------|
| h1b rsu tax calculator | 590 | $3.20 | Exact, Phrase | High |
| cross border tax calculator | 410 | $4.50 | Exact, Phrase | High |
| canada us tax calculator | 380 | $3.80 | Exact, Phrase | High |
| rsu tax estimator | 290 | $2.90 | Exact, Phrase | Medium |
| dual country tax calculator | 180 | $2.50 | Exact, Phrase | Medium |
| foreign tax credit calculator | 730 | $3.90 | Exact, Phrase | High |
| tn visa tax calculator | 220 | $2.30 | Exact, Phrase | Medium |
| stock compensation tax calculator | 350 | $4.20 | Phrase | Medium |
| expat tax calculator canada | 410 | $3.60 | Phrase | Medium |
| canada rsu tax | 160 | $2.80 | Phrase | Low |
| h1b canada tax | 140 | $2.40 | Phrase | Low |
| meta rsu tax calculator | 95 | $2.10 | Exact | Low |
| amazon rsu tax canada | 87 | $2.20 | Exact | Low |
| google rsu tax calculator | 92 | $2.15 | Exact | Low |
| microsoft rsu tax | 68 | $1.90 | Exact | Low |

**Ad Group CPA Target:** $45 (lower than average due to high intent)

---

#### **Ad Group 2: Education Intent** (10 keywords)
Users researching tax treaty rules and regulations.

| Keyword | Monthly Searches | CPC | Match Type | Priority |
|---------|-----------------|-----|------------|----------|
| canada us tax treaty article xv | 320 | $2.80 | Exact, Phrase | High |
| foreign tax credit canada | 510 | $3.40 | Phrase | High |
| h1b rsu tax guide | 280 | $2.60 | Exact, Phrase | Medium |
| cross border tax rules | 240 | $3.10 | Phrase | Medium |
| tn visa tax canada | 280 | $2.10 | Phrase | Medium |
| rsu taxation canada | 190 | $2.70 | Phrase | Medium |
| us canada tax treaty | 450 | $3.20 | Phrase | Medium |
| double taxation canada | 310 | $2.90 | Phrase | Medium |
| ftc canada us | 120 | $2.30 | Exact | Low |
| article 15 tax treaty | 95 | $2.50 | Exact | Low |

**Ad Group CPA Target:** $55 (higher than calculator intent, educational users convert slower)

---

#### **Ad Group 3: Software Intent** (10 keywords)
Users actively seeking a software solution.

| Keyword | Monthly Searches | CPC | Match Type | Priority |
|---------|-----------------|-----|------------|----------|
| cross border tax software | 410 | $4.50 | Exact, Phrase | High |
| expat tax software canada | 360 | $4.20 | Phrase | High |
| dual country tax software | 180 | $3.80 | Exact, Phrase | Medium |
| rsu tracking software | 220 | $3.50 | Phrase | Medium |
| canada us tax platform | 140 | $3.90 | Exact | Medium |
| h1b tax software | 190 | $3.60 | Phrase | Medium |
| foreign tax credit software | 160 | $4.10 | Phrase | Medium |
| cross border tax tool | 130 | $3.40 | Phrase | Low |
| international tax software | 520 | $4.80 | Phrase | Low |
| tax compliance software | 680 | $5.20 | Phrase | Low |

**Ad Group CPA Target:** $50 (balanced intent)

---

### Negative Keywords
Exclude irrelevant traffic to improve quality score and reduce wasted spend.

**Negative Keyword List:**
- free tax software
- turbotax
- h&r block
- tax preparation services
- bookkeeping
- cpa services
- accounting jobs
- tax attorney
- tax fraud
- illegal
- offshore
- evasion

---

## Ad Copy Variations

### **Ad Group 1: Calculator Intent**

#### Variation A - Direct Value Prop
```
Headline 1: H-1B RSU Tax Calculator | Free
Headline 2: Calculate US-Canada Tax in 60 Seconds
Headline 3: Foreign Tax Credit Optimizer
Description 1: Instant dual-country tax estimate. Built for H-1B/TN visa holders with US RSUs living in Canada.
Description 2: Track vestings, calculate FTC, get CPA-reviewed checklists. Free calculator. Pro: $299/year.
Final URL: https://taxbridge.app/lp/calculator?utm_source=google&utm_medium=cpc&utm_campaign=calculator&utm_content=variant_a
```

#### Variation B - Problem-Solution
```
Headline 1: Avoid RSU Double Taxation
Headline 2: Free Cross-Border Tax Calculator
Headline 3: Meta • Amazon • Google • Microsoft
Description 1: Calculate your exact Foreign Tax Credit under Article XV. No more overpaying on RSU income.
Description 2: Trusted by 500+ tech workers. Automated FTC optimization. Start free, upgrade for $299/year.
Final URL: https://taxbridge.app/lp/calculator?utm_source=google&utm_medium=cpc&utm_campaign=calculator&utm_content=variant_b
```

#### Variation C - Urgency + Social Proof
```
Headline 1: RSU Tax Calculator - Used by 500+ Tech Workers
Headline 2: Don't Overpay on Cross-Border Tax
Headline 3: Instant FTC Calculation
Description 1: Get your accurate US-Canada tax estimate now. Article XV treaty compliance built-in.
Description 2: Free calculator, unlimited tracking with Pro ($299/year). 4.8★ rating from tech workers.
Final URL: https://taxbridge.app/lp/calculator?utm_source=google&utm_medium=cpc&utm_campaign=calculator&utm_content=variant_c
```

---

### **Ad Group 2: Education Intent**

#### Variation A - Educational
```
Headline 1: US-Canada Tax Treaty Guide | Article XV
Headline 2: Free Guide: H-1B RSU Taxation
Headline 3: Foreign Tax Credit Explained
Description 1: Complete guide to avoiding double taxation on US stock compensation. Real examples, CPA-reviewed.
Description 2: Learn Article XV rules, required forms (W-2, 1040, T1, FBAR, 8938). Free download.
Final URL: https://taxbridge.app/lp/guide?utm_source=google&utm_medium=cpc&utm_campaign=education&utm_content=variant_a
```

#### Variation B - Problem-Focused
```
Headline 1: Confused by Cross-Border RSU Tax?
Headline 2: Free Article XV Guide for H-1B Workers
Headline 3: Eliminate Double Taxation
Description 1: Step-by-step guide to claiming Foreign Tax Credit. Includes real $100K RSU example.
Description 2: Understand treaty rules, filing requirements, and deadlines. CPA-reviewed content.
Final URL: https://taxbridge.app/lp/guide?utm_source=google&utm_medium=cpc&utm_campaign=education&utm_content=variant_b
```

#### Variation C - Authority
```
Headline 1: Tax Treaty Article XV - Complete Guide
Headline 2: CPA-Reviewed Cross-Border Tax Education
Headline 3: For H-1B/TN Visa Tech Workers
Description 1: Master Foreign Tax Credit rules. Free guide with real examples from Meta, Google, Amazon workers.
Description 2: All required forms, deadlines, and optimization strategies. Trusted by 500+ users.
Final URL: https://taxbridge.app/lp/guide?utm_source=google&utm_medium=cpc&utm_campaign=education&utm_content=variant_c
```

---

### **Ad Group 3: Software Intent**

#### Variation A - Feature-Focused
```
Headline 1: TaxBridge - Cross-Border Tax Software
Headline 2: Automate H-1B RSU Tax Filing
Headline 3: $299/Year | CPA-Reviewed Platform
Description 1: Complete tax platform for US-Canada filers. RSU tracking, FTC calculation, forms checklist.
Description 2: Multi-year reports, PDF export, deadline alerts. Free trial, no credit card required.
Final URL: https://taxbridge.app/lp/software?utm_source=google&utm_medium=cpc&utm_campaign=software&utm_content=variant_a
```

#### Variation B - Competitive
```
Headline 1: Better Than Generic Tax Software
Headline 2: Built for Cross-Border Tech Workers
Headline 3: Try Free | Upgrade $299/Year
Description 1: TaxBridge vs CPA: Same FTC accuracy, 5x cheaper. Purpose-built for H-1B/TN visa holders.
Description 2: Unlimited RSU tracking, Article XV optimization, multi-year reports. 500+ active users.
Final URL: https://taxbridge.app/lp/software?utm_source=google&utm_medium=cpc&utm_campaign=software&utm_content=variant_b
```

#### Variation C - ROI-Focused
```
Headline 1: Save $900+ vs Hiring a CPA
Headline 2: Cross-Border Tax Software - $299/Year
Headline 3: Automated FTC Calculation
Description 1: Get CPA-level tax calculations for a fraction of the cost. ROI 3x+ for Pro users.
Description 2: Track unlimited RSUs, generate tax reports, avoid double taxation. Start free today.
Final URL: https://taxbridge.app/lp/software?utm_source=google&utm_medium=cpc&utm_campaign=software&utm_content=variant_c
```

---

## Landing Page Mapping

| Ad Group | Landing Page | Intent | Key Elements | A/B Test Variant |
|----------|--------------|--------|--------------|------------------|
| Calculator Intent | `/lp/calculator` | High intent, immediate action | RSU input form, instant results | A: Immediate calculator<br>B: Email gate before calculator |
| Education Intent | `/lp/guide` | Research, learning | Article XV explainer, forms checklist, email gate | Single variant (email gate) |
| Software Intent | `/lp/software` | Solution evaluation | Feature comparison, testimonials, pricing | Single variant |

### A/B Testing Strategy (Calculator Page)

**Variant A:** `/lp/calculator` (default)
- Shows calculator immediately
- Higher bounce rate expected
- Better for users who want quick estimate
- **Hypothesis:** Lower conversion rate but higher engagement

**Variant B:** `/lp/calculator?variant=B`
- Requires email before showing calculator
- Captures leads early
- Risk of higher bounce rate
- **Hypothesis:** Higher conversion rate, better lead quality

**Test Duration:** 2 weeks (minimum 100 conversions per variant)
**Success Metric:** Conversion rate to Pro subscription (not just signup)

---

## Bidding Strategy

### Phase 1: Learning Phase (Weeks 1-2)
- **Strategy:** Manual CPC bidding
- **Starting Bid:** $2.50 average
- **Daily Budget:** $50/day
- **Goal:** Gather 30+ conversions per ad group
- **Adjustments:** Increase bids on high-performing keywords, decrease on low performers

### Phase 2: Optimization (Weeks 3-4)
- **Strategy:** Maximize Conversions with Target CPA
- **Target CPA:** $50 per signup
- **Daily Budget:** $50/day (maintain)
- **Goal:** Stabilize conversion rate at 15%+

### Phase 3: Scale (Month 2+)
- **Strategy:** Target CPA bidding
- **Target CPA:** $45 (optimized)
- **Daily Budget:** Scale to $75-100/day if LTV:CAC > 3.0x
- **Goal:** 50+ signups/month, 15 Pro conversions/month

### Bid Adjustments

| Dimension | Adjustment | Rationale |
|-----------|-----------|-----------|
| Mobile | -20% | Lower conversion rate on mobile forms |
| Desktop | +10% | Higher conversion rate, better UX |
| 6pm-10pm PT | +15% | Peak traffic from tech workers after work |
| Weekends | 0% | Maintain baseline |
| California | +20% | High density of H-1B workers |
| Washington | +15% | Amazon/Microsoft concentration |
| British Columbia | +25% | Target audience (Canada residence) |
| Ontario | +20% | Toronto tech hub |

---

## Remarketing Setup

### Meta Pixel Implementation
Meta Pixel is already installed in `/app/layout.tsx` for retargeting on Facebook/Instagram.

### Custom Audiences

#### Audience 1: Calculator Users (No Signup)
- **Definition:** Visited `/lp/calculator`, used calculator, did NOT sign up
- **Size Estimate:** ~60% of calculator traffic
- **Retargeting Message:** "Come back to save your RSU calculations. Create free account."
- **Ad Creative:** Testimonial-based ads highlighting ease of use
- **Budget:** $15/day
- **Duration:** 30 days

#### Audience 2: Signups (No Pro Subscription)
- **Definition:** Completed signup, did NOT subscribe to Pro
- **Size Estimate:** ~85% of signups
- **Retargeting Message:** "Unlock unlimited RSU tracking. Upgrade to Pro for $299/year."
- **Ad Creative:** Feature comparison, ROI calculator
- **Budget:** $20/day
- **Duration:** 90 days

#### Audience 3: All Website Visitors (Warm Audience)
- **Definition:** Visited any page on taxbridge.app
- **Size Estimate:** All traffic
- **Retargeting Message:** General awareness, educational content
- **Ad Creative:** Article XV guide, calculator demos
- **Budget:** $10/day
- **Duration:** 30 days

### Retargeting Campaign Structure

```
TaxBridge - Retargeting Campaign
├── Facebook/Instagram Ads
│   ├── Audience 1: Calculator users (no signup)
│   ├── Audience 2: Signups (no Pro)
│   └── Audience 3: All visitors
└── Google Display Network (future)
    └── Similar audiences based on converters
```

**Total Retargeting Budget:** $45/day ($1,350/month)
**Combined Budget:** $95/day ($2,850/month total)

---

## Analytics & Measurement

### Google Analytics 4 Setup

#### Custom Events
Already implemented in `/lib/analytics/google-ads.ts` and `/lib/analytics/meta-pixel.ts`:

1. **signup** - User creates account
2. **pro_subscription** - User subscribes to Pro ($299)
3. **enterprise_demo_request** - High-intent lead
4. **calculator_use** - Micro-conversion
5. **view_landing_page** - Landing page views by type

#### Conversion Funnels

**Funnel 1: Calculator → Signup → Pro**
```
Ad Click → /lp/calculator → Calculator Use → Signup → Pro Subscription
100%       80%              50%              15%       10%
```

**Expected Conversion Rates:**
- Ad click → Calculator use: 80% (high intent)
- Calculator use → Signup: 15%
- Signup → Pro subscription: 10%
- **Overall: Ad click → Pro subscription: 1.2%**

**Funnel 2: Guide → Signup → Pro**
```
Ad Click → /lp/guide → Email Capture → Signup → Pro Subscription
100%       70%         40%              20%       10%
```

**Expected Conversion Rates:**
- Ad click → Email capture: 40%
- Email capture → Signup: 20%
- Signup → Pro subscription: 10%
- **Overall: Ad click → Pro subscription: 0.8%**

**Funnel 3: Software → Signup → Pro**
```
Ad Click → /lp/software → Signup → Pro Subscription
100%       85%             18%       12%
```

**Expected Conversion Rates:**
- Ad click → Signup: 18%
- Signup → Pro subscription: 12%
- **Overall: Ad click → Pro subscription: 2.16%**

### Key Metrics Dashboard

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Daily Ad Spend | $50 | TBD | — |
| Daily Clicks | 20 | TBD | — |
| Average CPC | $2.50 | TBD | — |
| Click-Through Rate (CTR) | 5% | TBD | — |
| Landing Page Conversion Rate | 15% | TBD | — |
| Cost Per Signup | $50 | TBD | — |
| Signups per Day | 3 | TBD | — |
| Signups per Month | 90 | TBD | — |
| Pro Conversion Rate | 10% | TBD | — |
| Pro Subscriptions per Month | 9 | TBD | — |
| Monthly Recurring Revenue (MRR) | $2,691 | TBD | — |
| Customer Lifetime Value (LTV) | $299 | TBD | — |
| Customer Acquisition Cost (CAC) | $83 | TBD | — |
| LTV:CAC Ratio | 3.6x | TBD | ✅ |

---

## Success Metrics

### Month 1 Goals (March 2026)
- **Ad Spend:** $1,500
- **Clicks:** 600
- **Signups:** 90 (15% conversion)
- **Pro Subscriptions:** 9 (10% of signups)
- **MRR:** $2,691 ($299 × 9)
- **CAC:** $83 ($1,500 / 18 total conversions)
- **LTV:CAC:** 3.6x

### Month 3 Goals (May 2026)
- **Daily Budget:** $75/day
- **Monthly Ad Spend:** $2,250
- **Signups:** 135
- **Pro Subscriptions:** 14
- **MRR:** $4,186
- **CAC:** $75 (optimized)
- **LTV:CAC:** 4.0x

### Month 6 Goals (August 2026)
- **Daily Budget:** $100/day
- **Monthly Ad Spend:** $3,000
- **Signups:** 180
- **Pro Subscriptions:** 20
- **Cumulative MRR:** $15,000+
- **CAC:** $70 (further optimized)
- **LTV:CAC:** 4.3x

---

## Campaign Launch Checklist

### Pre-Launch (Complete Before Going Live)
- [ ] Google Ads account created
- [ ] Domain taxbridge.app verified
- [ ] Billing information added
- [ ] Conversion tracking installed and tested
- [ ] Google Analytics 4 linked
- [ ] Meta Pixel installed and tested
- [ ] Landing pages live and tested
- [ ] A/B test variants configured
- [ ] UTM parameters set up
- [ ] Negative keywords list added

### Week 1 (Launch Week)
- [ ] Create Campaign 1: Calculator Intent
- [ ] Create Campaign 2: Education Intent
- [ ] Create Campaign 3: Software Intent
- [ ] Set daily budget to $50
- [ ] Set manual CPC bids ($2.50 avg)
- [ ] Enable conversion tracking
- [ ] Set up automated rules (pause low-quality keywords)
- [ ] Daily monitoring of spend and conversions

### Week 2-4 (Optimization)
- [ ] Review search term reports
- [ ] Add negative keywords
- [ ] Adjust bids based on performance
- [ ] Pause underperforming ads
- [ ] Scale winning ad variations
- [ ] Test new ad copy
- [ ] Optimize landing pages based on heatmaps
- [ ] Switch to Target CPA bidding

### Month 2+ (Scale)
- [ ] Increase budget if LTV:CAC > 3.0x
- [ ] Launch retargeting campaigns
- [ ] Expand keyword list
- [ ] Test new ad groups
- [ ] Create lookalike audiences
- [ ] Implement automated bidding strategies

---

## Contact Information

**Campaign Manager:** [Your Name]
**Google Ads Account ID:** [To be assigned]
**Tracking Installed:** March 18, 2026
**Campaign Launch:** March 18, 2026

---

## Appendix

### Useful Links
- **Google Ads Dashboard:** https://ads.google.com
- **Google Analytics 4:** https://analytics.google.com
- **Google Keyword Planner:** https://ads.google.com/aw/keywordplanner
- **Meta Ads Manager:** https://business.facebook.com/adsmanager
- **Conversion Tracking Guide:** https://support.google.com/google-ads/answer/1722054

### Environment Variables
Add to `.env.local`:
```bash
# Google Ads
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL=xxx
NEXT_PUBLIC_GOOGLE_ADS_PRO_LABEL=xxx
NEXT_PUBLIC_GOOGLE_ADS_ENTERPRISE_LABEL=xxx
NEXT_PUBLIC_GOOGLE_ADS_CALCULATOR_LABEL=xxx

# Meta Pixel
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXXXX
```

---

**Document Version:** 1.0
**Last Updated:** March 18, 2026
**Status:** Ready for Launch
