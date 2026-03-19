# Revenue Dashboard - Executive Summary

**Dashboard:** [/admin/revenue](https://taxbridge.vercel.app/admin/revenue)
**Status:** ✅ LIVE - Pulling Real Stripe Data
**Last Updated:** March 19, 2026

---

## What You're Looking At

This dashboard shows **REAL revenue numbers** from Stripe API, updated in real-time. No mock data, no estimates—just facts.

---

## Key Metrics (Top Row)

### 💰 MRR (Monthly Recurring Revenue)
**What it means:** Total predictable revenue per month
**Why it matters:** This is your monthly income baseline
**How it's calculated:** Sum of all active subscriptions (annual plans divided by 12)

**Example:**
- 10 customers @ $49/year = $40.83/month
- **Current MRR:** Check dashboard

**Target:** $10,000 MRR = profitable, $50,000 MRR = sustainable growth

---

### 📊 ARR (Annual Recurring Revenue)
**What it means:** MRR × 12
**Why it matters:** How investors value your company (ARR × 5-10 = valuation)

**Target:** $100,000 ARR = seed round viable, $1M ARR = Series A ready

---

### 👥 Active Subscriptions
**What it means:** Number of paying customers right now
**Why it matters:** Direct correlation to revenue

**Breakdown:**
- Pro Plan ($49/year): X customers
- Enterprise Plan ($299/year): Y customers

---

### 📉 Churn Rate
**What it means:** % of customers who canceled this month
**Why it matters:** High churn = leaky bucket, can't grow

**Healthy:** <5% monthly
**Warning:** 5-10%
**Critical:** >10%

**If churn is high:** Check cancellation survey responses in `/admin/customer-success`

---

## Health Metrics (Second Row)

### 💎 LTV (Lifetime Value)
**What it means:** Total revenue from an average customer over their lifetime
**Formula:** (Avg monthly revenue per user) × (Average customer lifetime in months)

**Example:**
- Customer pays $4/month, stays 20 months → LTV = $80

**Target:** LTV > 3× CAC (customer acquisition cost)

---

### 💸 CAC (Customer Acquisition Cost)
**What it means:** Cost to acquire one paying customer
**Formula:** Marketing spend ÷ New customers

**Current Status:** ⚠️ PLACEHOLDER ($500 total spend / new customers)
**Action Required:** Track real marketing spend (Google Ads, Product Hunt, etc.)

**Healthy:** CAC < $50 for our pricing
**Warning:** CAC > $100

---

### 🎯 LTV:CAC Ratio
**What it means:** Return on investment for customer acquisition
**Interpretation:**
- **< 1:** Losing money on every customer (STOP MARKETING)
- **1-3:** Breaking even (IMPROVE EFFICIENCY)
- **> 3:** Healthy unit economics (SCALE UP)
- **> 5:** Excellent profitability (POUR GAS ON THE FIRE)

**Target:** >3

---

## Revenue Breakdown

### By Plan
- **Pro Plan:** $4.08/month per customer
- **Enterprise Plan:** $24.92/month per customer

**Strategy:** Focus on enterprise sales for 6× higher revenue per customer

---

### By Channel
Shows which marketing channels are driving paying customers:

1. **Organic / SEO** - Free traffic from Google
   - **Target:** 60-70% of revenue (highest ROI)

2. **Product Hunt** - Launch spike traffic
   - **Expected:** 5-10% of revenue (one-time boost)

3. **Google Ads** - Paid search campaigns
   - **Target:** 10-15% if ROI-positive

4. **Referral** - Word-of-mouth growth
   - **Target:** 5-10% (viral growth indicator)

5. **Direct** - Type in URL directly
   - **Baseline:** 5-10%

**Action:** Double down on channels with best conversion rate

---

## Conversion Funnel

Shows where you're losing customers in the journey:

```
Landing Page (1000 visitors)
    ↓ 65% complete
Calculator Started (650)
    ↓ 69% complete
Calculator Completed (450)
    ↓ 84% complete
Signup Completed (380)
    ↓ 70% view pricing
Pricing Page Viewed (266)
    ↓ 43% start checkout
Checkout Started (114)
    ↓ 70% pay
Payment Completed (80)
```

**Overall Conversion:** ~8% (landing page → paid customer)

**Biggest Drop-Off:** Usually pricing page or checkout
**Fix:** A/B test pricing, add trust badges, offer money-back guarantee

---

## How to Use This Dashboard

### Daily Check (30 seconds)
1. **MRR trending up?** ✅ Good
2. **Churn rate < 5%?** ✅ Healthy
3. **New customers > churned customers?** ✅ Growing

### Weekly Deep Dive (5 minutes)
1. Check **Revenue by Channel** - which channels are working?
2. Check **Conversion Funnel** - where are we losing customers?
3. Check **LTV:CAC ratio** - are we profitable per customer?

### Monthly Strategy (15 minutes)
1. Review **MRR growth rate** - are we hitting 15%+ monthly growth?
2. Analyze **channel mix** - should we shift marketing budget?
3. Interview **churned customers** - why did they leave?

---

## Quick Decision Framework

### If MRR is FLAT:
1. Check churn rate - are we losing as many as we gain?
2. Check new customers - have signups slowed?
3. **Action:** Increase marketing spend OR reduce churn

### If CHURN is HIGH (>5%):
1. Read cancellation survey responses
2. Interview recent churned customers
3. **Common reasons:** Price too high, didn't see value, feature missing
4. **Fix:** Add missing features, improve onboarding, offer discount

### If CAC is HIGH (>$100):
1. Check which channels have high CAC
2. **Action:** Pause expensive channels, double down on cheap channels
3. **Focus:** SEO/Organic (free) > Referral (cheap) > Paid Ads (expensive)

### If LTV is LOW (<$100):
1. **Cause:** High churn OR low prices
2. **Fix:** Reduce churn (better product, onboarding) OR raise prices

---

## Current Status (As of March 19, 2026)

### ✅ What's Working
- ✅ Dashboard pulls REAL Stripe data (no mock data)
- ✅ All core metrics tracked (MRR, ARR, churn, LTV, CAC)
- ✅ Channel attribution working
- ✅ Conversion funnel tracked

### ⚠️ Known Issues
- ⚠️ **CAC is placeholder** - Not tracking real marketing spend yet
  - **Impact:** Can't calculate true LTV:CAC ratio
  - **Fix:** Integrate Google Ads API (1-2 days work)
  - **Deadline:** Sprint 15

- ⚠️ **Total customer count** - Fixed pagination bug (was showing max 100)
  - **Status:** ✅ FIXED in this sprint

### 🎯 Next Steps
1. **Immediate:** Use dashboard to track daily revenue
2. **This week:** Set up Google Ads API for real CAC tracking
3. **This month:** Add email alerts for churn spikes, MRR drops

---

## Technical Details (For Engineering Team)

**API Endpoint:** `/api/analytics/revenue`
**Response Time:** 2-5 seconds (Stripe API calls)
**Rate Limit:** 10 requests/minute
**Error Handling:** Logged to Sentry, graceful fallbacks

**Data Sources:**
- Stripe API: MRR, ARR, active subscriptions
- Internal DB: Churn, growth rate, channel attribution

**Full Technical Docs:** See `REVENUE_METRICS_SPECIFICATION.md`

---

## FAQs

**Q: Why doesn't MRR match Stripe dashboard exactly?**
A: Small differences (<$5) are due to rounding. Large differences indicate a bug—report immediately.

**Q: Can I trust these numbers for investor updates?**
A: Yes, as long as CAC is updated with real marketing spend. MRR and churn are accurate.

**Q: How often should I check this dashboard?**
A: Daily MRR check (30 sec), weekly deep dive (5 min), monthly strategy review (15 min)

**Q: What's a "good" MRR for our stage?**
A: $0-1K = early, $1K-10K = traction, $10K-50K = product-market fit, $50K+ = scale mode

**Q: When should I raise prices?**
A: When LTV:CAC > 5 and churn < 3%. Current price may be too LOW if these metrics are great.

---

## Emergency Playbook

### 🚨 MRR Drops >20% Week-Over-Week
1. **Check Stripe dashboard** - Is there a billing issue?
2. **Check churn rate** - Did many customers cancel at once?
3. **Email all churned customers** - Offer win-back discount
4. **Pause marketing spend** - Don't acquire more if we can't retain

### 🚨 Churn Spikes Above 10%
1. **Read all cancellation surveys from last 7 days**
2. **Call top 5 churned customers** - Deep interview
3. **Emergency product fix** - If there's a common complaint
4. **Offer win-back campaign** - 50% off next month

### 🚨 Zero New Customers for 7+ Days
1. **Check website uptime** - Is the site down?
2. **Check payment processing** - Is Stripe working?
3. **Check SEO** - Did Google ranking drop?
4. **Emergency marketing push** - Product Hunt, Reddit, ads

---

**Bottom Line:** This dashboard tells you if the business is healthy (growing MRR, low churn, good LTV:CAC) or dying (flat MRR, high churn, negative unit economics). Check it daily.

---

**Dashboard Link:** [taxbridge.vercel.app/admin/revenue](https://taxbridge.vercel.app/admin/revenue)
**Support:** File issue in GitHub or ping #engineering Slack
