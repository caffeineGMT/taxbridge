# Google Ads Campaign Setup & Optimization Guide

## TaxBridge Google Ads Campaign Launch
**Budget:** $50/day ($1,500/month)
**Target CAC:** < $30
**Target ROAS:** > 300%
**Campaign Start:** TBD (after approval)

---

## Table of Contents
1. [Pre-Launch Checklist](#pre-launch-checklist)
2. [Google Ads Account Setup](#google-ads-account-setup)
3. [Campaign Structure Implementation](#campaign-structure-implementation)
4. [Conversion Tracking Setup](#conversion-tracking-setup)
5. [Landing Page Implementation](#landing-page-implementation)
6. [First Week Monitoring](#first-week-monitoring)
7. [Optimization Schedule](#optimization-schedule)
8. [CAC Monitoring & Alerts](#cac-monitoring--alerts)
9. [Troubleshooting](#troubleshooting)

---

## Pre-Launch Checklist

### ✅ Infrastructure Ready
- [ ] All 3 landing pages deployed (`/lp/h1b-rsu-calculator`, `/lp/tn-visa-stock-tax`, `/lp/cross-border-tax`)
- [ ] UTM tracking library integrated (`lib/utm-tracking.ts`)
- [ ] PostHog conversion tracking active (`lib/google-ads-tracking.ts`)
- [ ] CAC dashboard accessible (`/admin/google-ads-dashboard`)
- [ ] API endpoint for analytics working (`/api/analytics/google-ads`)

### ✅ Content Assets
- [ ] Ad copy finalized (see `marketing/google-ads/ad-copy.md`)
- [ ] Display ad creative designed (300x250, 728x90, 160x600)
- [ ] All headlines/descriptions fit character limits
- [ ] Negative keywords list reviewed

### ✅ Google Ads Account
- [ ] Google Ads account created (business.google.com/adsaccount)
- [ ] Billing method added
- [ ] Daily budget set to $50
- [ ] Conversion tracking installed (gtag.js or Google Tag Manager)
- [ ] Google Ads API access enabled (for programmatic reporting)

### ✅ Analytics Setup
- [ ] PostHog project ID and API key configured
- [ ] Google Analytics 4 (GA4) linked (optional but recommended)
- [ ] Conversion goals defined in PostHog
- [ ] CAC alert thresholds set

---

## Google Ads Account Setup

### Step 1: Create Google Ads Account
1. Go to https://ads.google.com
2. Sign in with business Google account
3. Click "Start Now" to create new campaign
4. Choose "Expert Mode" (NOT Smart Campaign)
5. Select goal: "Website traffic" + "Lead generation"

### Step 2: Set Up Billing
1. Navigate to Tools & Settings → Billing
2. Add payment method (credit card or bank account)
3. Set billing country to United States or Canada
4. Enable automatic payments
5. Set monthly spending limit to $1,500

### Step 3: Install Conversion Tracking
**Option A: Google Tag Manager (Recommended)**
1. Create GTM account at https://tagmanager.google.com
2. Install GTM container code in `app/layout.tsx`:
```tsx
<Script id="gtm-head" strategy="afterInteractive">
  {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXX');`}
</Script>
```

2. Add GTM noscript to `app/layout.tsx` body:
```html
<noscript>
  <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>
```

3. In GTM, create tags for each conversion event:
   - Tag Type: Google Ads Conversion Tracking
   - Conversion ID: AW-XXXXXXXXX (from Google Ads)
   - Conversion Label: (unique per event)
   - Trigger: PostHog event = `calculator_completed`

**Option B: Direct gtag.js (Simpler)**
1. Get your Google Ads tracking ID (AW-XXXXXXXXX)
2. Add to `app/layout.tsx`:
```tsx
<Script src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX" />
<Script id="gtag-init">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-XXXXXXXXX');
  `}
</Script>
```

3. Fire conversion events from `lib/google-ads-tracking.ts` (already implemented)

---

## Campaign Structure Implementation

### Campaign Settings
**Name:** TaxBridge - H1B/TN Cross-Border Tax Calculator
**Type:** Search
**Networks:** Google Search + Search Partners
**Locations:** United States, Canada
**Languages:** English
**Bidding:** Target CPA ($30)
**Daily Budget:** $50

### Ad Group 1: H1B RSU Tax Calculator
**Budget Allocation:** $20/day (40%)

**Keywords:**
| Keyword | Match Type | Max CPC |
|---------|-----------|---------|
| h1b rsu tax calculator | Exact | $12 |
| h1b stock tax calculator | Phrase | $10 |
| h1b equity compensation tax | Phrase | $9 |
| rsu tax calculator h1b | Broad | $8 |

**Responsive Search Ad:**
- Headlines: 15 variations (see `ad-copy.md`)
- Descriptions: 4 variations
- Final URL: `https://taxbridge.pro/lp/h1b-rsu-calculator?utm_source=google&utm_medium=cpc&utm_campaign=h1b-rsu-tax&utm_content=h1b-rsu-ad-group`

**Ad Extensions:**
- Sitelinks: Free Calculator, How It Works, H1B Guide, Pricing
- Callouts: No Signup Required, Instant Estimates, 2026 Tax Year
- Structured Snippets: Visa Types (H1B, TN, L1, O1)

### Ad Group 2: TN Visa Stock Tax
**Budget Allocation:** $18/day (36%)

**Keywords:**
| Keyword | Match Type | Max CPC |
|---------|-----------|---------|
| tn visa stock tax | Exact | $11 |
| tn visa rsu tax | Phrase | $10 |
| tn visa equity compensation | Phrase | $9 |
| canadian tn visa stock options | Broad | $7 |

**Responsive Search Ad:**
- Headlines: 15 variations
- Descriptions: 4 variations
- Final URL: `https://taxbridge.pro/lp/tn-visa-stock-tax?utm_source=google&utm_medium=cpc&utm_campaign=tn-visa-stock-tax&utm_content=tn-stock-ad-group`

### Ad Group 3: Cross-Border Tax Tool
**Budget Allocation:** $12/day (24%)

**Keywords:**
| Keyword | Match Type | Max CPC |
|---------|-----------|---------|
| cross border tax calculator | Exact | $10 |
| us canada tax calculator | Phrase | $9 |
| cross border tax planning | Phrase | $8 |
| dual country tax calculator | Broad | $6 |

**Responsive Search Ad:**
- Headlines: 15 variations
- Descriptions: 4 variations
- Final URL: `https://taxbridge.pro/lp/cross-border-tax?utm_source=google&utm_medium=cpc&utm_campaign=cross-border-tax-tool&utm_content=cross-border-ad-group`

### Negative Keywords (Campaign-Level)
Add these to prevent wasted spend:
```
free tax software
turbotax
h&r block
accountant near me
cpa services
tax preparation services
cheap tax filing
free tax help
irs
tax refund
```

---

## Conversion Tracking Setup

### Conversion Actions in Google Ads

1. **Calculator Completed** (Primary)
   - Action Name: "TaxBridge - Calculator Completion"
   - Value: $5
   - Count: One per click
   - Conversion Window: 30 days
   - View-through window: 7 days

2. **Email Captured**
   - Action Name: "TaxBridge - Email Signup"
   - Value: $10
   - Count: One per click
   - Conversion Window: 30 days

3. **Trial Started**
   - Action Name: "TaxBridge - Trial Started"
   - Value: $49
   - Count: One per click
   - Conversion Window: 30 days

4. **Subscription Created**
   - Action Name: "TaxBridge - Paid Subscription"
   - Value: $299
   - Count: One per click
   - Conversion Window: 90 days

### PostHog Event Mapping

Ensure these PostHog events fire correctly:
```javascript
// Landing page view (auto-tracked via useGoogleAdsTracking hook)
posthog.capture('landing_page_viewed', { utm_campaign, gclid });

// Calculator started
posthog.capture('calculator_form_started', { calculator_type });

// Calculator completed (PRIMARY CONVERSION)
posthog.capture('calculator_completed', {
  conversion_value: 5,
  income, rsuValue, estimatedTax
});

// Email captured
posthog.capture('email_captured', { conversion_value: 10, email });

// Trial started
posthog.capture('trial_started', { conversion_value: 49, userId, planName });

// Subscription created
posthog.capture('subscription_created', { conversion_value: 299, userId, amount });
```

---

## Landing Page Implementation

All landing pages are already created. Verify they're live:

1. **H1B RSU Calculator:** `/lp/h1b-rsu-calculator`
2. **TN Visa Stock Tax:** `/lp/tn-visa-stock-tax`
3. **Cross-Border Tax:** `/lp/cross-border-tax`

### Landing Page Quality Score Checklist
- [ ] Page load time < 3 seconds
- [ ] Mobile-responsive (test on iOS Safari, Android Chrome)
- [ ] Clear H1 headline with target keyword
- [ ] Single, prominent CTA above the fold
- [ ] Social proof (testimonials, user counts)
- [ ] Benefits > features
- [ ] FAQ section addresses objections
- [ ] No navigation header (reduce distractions)
- [ ] Exit-intent popup (optional, can be annoying)

---

## First Week Monitoring

### Daily Checks (Days 1-7)
**Time Required:** 15 minutes/day

1. **Check CAC Dashboard** (`/admin/google-ads-dashboard`)
   - Is CAC trending toward $30 or below?
   - Are any campaigns drastically over/under target?

2. **Review Search Terms Report** (Google Ads → Keywords → Search Terms)
   - Are ads showing for irrelevant queries?
   - Add negative keywords immediately

3. **Monitor Quality Score** (Google Ads → Keywords → Columns → Quality Score)
   - Target: 7+
   - If < 5, ad copy or landing page needs improvement

4. **Check Conversion Rate** (PostHog + Google Ads)
   - Target: > 5% (landing page click → calculator completion)
   - If < 2%, landing page needs optimization

### Week 1 Benchmarks
By end of Week 1, you should have:
- 100+ clicks
- 5-10 conversions (calculator completions)
- CAC data (even if not optimized yet)
- Quality Score stabilized

**DO NOT make major changes in Week 1.** Let the algorithm learn.

---

## Optimization Schedule

### Week 2: Keyword Optimization
**Action:** Pause underperforming keywords

**Criteria to Pause:**
- CTR < 2% after 50 impressions
- CPC > $20 with no conversions
- Quality Score < 4 consistently

**Criteria to Increase Bids:**
- CTR > 6%
- CPC < $12
- Quality Score 8+
- CAC < $25

### Week 3: Ad Copy Testing
**Action:** Launch 3 new ad variations per ad group

**Test Variations:**
1. **Benefit-focused:** "Save $1000s in Double Taxation"
2. **Urgency-focused:** "2026 Tax Deadline Approaching"
3. **Social proof:** "Used by 2000+ H1B Workers"

**Pause ads with:**
- CTR < 3% after 100 impressions
- No conversions after 50 clicks

### Week 4: Bid & Budget Optimization
**Goal:** Hit CAC < $30 consistently

**If CAC < $25:**
- Increase budget by 20% ($50 → $60/day)
- Reallocate to best-performing ad group

**If CAC > $35:**
- Lower bids on expensive keywords by 15%
- Pause ad groups with CAC > $50

**If CAC = $25-30:**
- Hold steady, gather more data

### Month 2: Scale or Pivot
**If ROAS > 300% and CAC < $30:**
- Scale budget to $75-100/day
- Add new keyword variations
- Test display ads on Google Display Network

**If ROAS < 200% or CAC > $40:**
- Pause campaign
- Pivot to organic SEO or content marketing
- Consider Facebook/LinkedIn ads instead

---

## CAC Monitoring & Alerts

### Dashboard Access
**URL:** `/admin/google-ads-dashboard`

### Key Metrics to Watch
| Metric | Target | Alert If |
|--------|--------|----------|
| CAC | < $30 | > $40 |
| ROAS | > 300% | < 200% |
| CTR | > 5% | < 2% |
| Conversion Rate | > 5% | < 2% |
| Quality Score | 8-10 | < 5 |

### Alert Setup (PostHog + Slack/Email)
Create alerts in PostHog:
1. Go to Insights → New Alert
2. Metric: `CAC` (calculated from conversion events)
3. Condition: `> $40`
4. Frequency: Daily
5. Notification: Email or Slack

### Weekly Reporting
Every Monday, review:
1. Total spend last week
2. Total conversions
3. CAC trend (increasing/decreasing?)
4. ROAS trend
5. Best/worst performing keywords
6. Search terms to add as keywords
7. Search terms to add as negative keywords

---

## Troubleshooting

### Problem: High CPC (> $20)
**Causes:**
- Low Quality Score
- Competitive keywords
- Broad match driving irrelevant clicks

**Solutions:**
1. Improve Quality Score (better ad copy, landing page relevance)
2. Switch to Phrase/Exact match only
3. Lower max CPC bids to $12-15
4. Add more negative keywords

### Problem: Low CTR (< 2%)
**Causes:**
- Boring ad copy
- Ads not relevant to search intent
- Weak headlines

**Solutions:**
1. Test new ad variations with stronger hooks
2. Add numbers to headlines ("Save $1000s", "2-Minute Calculator")
3. Include target keyword in headline
4. Test urgency ("2026 Tax Deadline")

### Problem: Low Conversion Rate (< 2%)
**Causes:**
- Landing page doesn't match ad promise
- Slow page load
- Confusing CTA
- Mobile experience broken

**Solutions:**
1. A/B test landing page headlines
2. Optimize page speed (lazy load images, reduce JS)
3. Simplify CTA ("Calculate Now" vs "Get Started")
4. Test on real mobile devices

### Problem: CAC > $40
**Causes:**
- Low conversion rate
- High CPC
- Wrong audience

**Solutions:**
1. Pause expensive keywords
2. Improve landing page conversion rate (priority!)
3. Switch bidding to Manual CPC to control costs
4. Consider pivoting to different keywords

### Problem: No Conversions After 100 Clicks
**Causes:**
- Conversion tracking broken
- Landing page broken
- Wrong audience (not qualified)

**Solutions:**
1. Verify PostHog events are firing (check console logs)
2. Test calculator manually
3. Review search terms - are they relevant?
4. Check landing page on mobile (most traffic is mobile)

---

## Launch Checklist (Final)

**Day Before Launch:**
- [ ] Review all ad copy one final time
- [ ] Test all 3 landing pages on desktop + mobile
- [ ] Verify PostHog conversion events fire correctly
- [ ] Confirm Google Ads conversion tracking installed
- [ ] Set up CAC alert thresholds
- [ ] Schedule Week 1 daily check-ins (15 min/day)

**Launch Day:**
- [ ] Enable all campaigns
- [ ] Verify budget is set to $50/day
- [ ] Verify Target CPA is $30
- [ ] Monitor first 10 clicks manually (check landing page loads, UTM params tracked)
- [ ] Check PostHog for first conversion events

**Day 2:**
- [ ] Review search terms (add negative keywords if needed)
- [ ] Check Quality Score (should start appearing after 24 hours)
- [ ] Verify at least 1 conversion (if not, troubleshoot tracking)

**Week 1 End:**
- [ ] Calculate actual CAC
- [ ] Identify best/worst performing keywords
- [ ] Plan Week 2 optimizations
- [ ] If CAC < $25, consider increasing budget

---

## Success Criteria

**Month 1 Goals:**
- CAC < $30
- ROAS > 300%
- 100+ conversions (calculator completions)
- Quality Score 7+
- CTR > 5%

**If Goals Met:**
- Scale to $75-100/day budget
- Add new keyword variations
- Test display ads
- Launch remarketing campaign

**If Goals Not Met:**
- Pause campaign after 30 days
- Analyze what went wrong (high CPC? low conversion rate?)
- Pivot to organic SEO or content marketing
- Revisit Google Ads in 3-6 months with better landing pages

---

## Resources

- **Google Ads Help:** https://support.google.com/google-ads
- **Keyword Planner:** https://ads.google.com/aw/keywordplanner
- **Google Ads Scripts:** https://developers.google.com/google-ads/scripts (for automation)
- **PostHog Docs:** https://posthog.com/docs
- **Landing Page Best Practices:** https://unbounce.com/landing-page-articles

---

## Contact

**Campaign Manager:** [Name]
**Email:** [Email]
**Slack:** [Channel]
**CAC Dashboard:** https://taxbridge.pro/admin/google-ads-dashboard

---

*Last Updated: March 19, 2026*
