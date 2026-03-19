# Manual Analytics Data Pull - Quick Guide

**Task:** Get actual traffic numbers for last 30 days
**Time Required:** 15-30 minutes
**Owner:** Michael Guo (CEO/CMO)

---

## STEP 1: Vercel Analytics (5 minutes)

### Access Dashboard
1. Go to: https://vercel.com/
2. Sign in with your account
3. Select project: **taxbridge** (or **cross-border-tax**)
4. Click **Analytics** tab in left sidebar

### Pull Data
**Filter:** Last 30 days

**Record These Numbers:**
```
Total Visitors: ____________
Total Page Views: ____________
Top Pages:
  1. ____________ (_____ views)
  2. ____________ (_____ views)
  3. ____________ (_____ views)

Top Referrers:
  1. ____________ (_____ visitors)
  2. ____________ (_____ visitors)
  3. ____________ (_____ visitors)

Traffic by Country:
  - United States: ____________
  - Canada: ____________
  - Other: ____________
```

**Screenshot:** Save screenshot of dashboard for reference

---

## STEP 2: Clerk Dashboard - Signups (5 minutes)

### Access Dashboard
1. Go to: https://dashboard.clerk.com/
2. Sign in with your account
3. Select application: **TaxBridge** (or cross-border-tax)
4. Click **Users** in left sidebar

### Pull Data
**Filter:** Created in last 30 days

**Record These Numbers:**
```
Total Signups (last 30 days): ____________

User Status:
  - Email Verified: ____________
  - Active (logged in recently): ____________
  - Inactive: ____________

Signup Trend:
  - Week 1 (Mar 1-7): ____________
  - Week 2 (Mar 8-14): ____________
  - Week 3 (Mar 15-21): ____________
  - Week 4 (Mar 22-28): ____________
```

**Export (Optional):**
- Click **Export** button to download CSV with full user list

---

## STEP 3: Stripe Dashboard - Payments (5 minutes)

### Access Dashboard
1. Go to: https://dashboard.stripe.com/
2. Sign in with your account
3. **IMPORTANT:** Check top-right corner - are you in:
   - ⚠️ **Test Mode** (orange banner) → Switch to **Live Mode**
   - ✅ **Live Mode** (no banner) → Proceed

### Pull Data - LIVE MODE
**Filter:** Last 30 days

**Record These Numbers:**
```
Total Paid Customers: ____________
Total Revenue (Gross): $____________
Total Revenue (Net, after Stripe fees): $____________

Subscription Breakdown:
  - Pro Plan ($49/year): ____________ customers
  - Enterprise Plan: ____________ customers

Payment Status:
  - Successful: ____________
  - Failed: ____________
  - Refunded: ____________

MRR (Monthly Recurring Revenue): $____________
ARR (Annual Recurring Revenue): $____________
```

### Pull Data - TEST MODE (For Comparison)
**Switch to Test Mode** (toggle in top-right)

**Record:**
```
Test Payments (last 30 days): ____________
Test Revenue: $____________
```

**Note:** Test payments = $0 real revenue

---

## STEP 4: Calculate Conversion Funnel (5 minutes)

### Conversion Rate Formula

**Step 1: Visitor → Signup**
```
Signup Rate = (Total Signups / Total Visitors) × 100%
            = (______ / ______) × 100%
            = ______%
```

**Step 2: Visitor → Paid Customer**
```
Paid Conversion Rate = (Paid Customers / Total Visitors) × 100%
                     = (______ / ______) × 100%
                     = ______%
```

**Step 3: Signup → Paid Customer**
```
Signup-to-Paid Rate = (Paid Customers / Total Signups) × 100%
                    = (______ / ______) × 100%
                    = ______%
```

### Revenue Metrics
```
Average Revenue Per Paid User = Total Revenue / Paid Customers
                              = $______ / ______
                              = $______

Customer Acquisition Cost (CAC) = Total Marketing Spend / Paid Customers
                                = $______ / ______
                                = $______ per customer

LTV:CAC Ratio = $49 (annual plan) / CAC
              = $______ / $______
              = ______ : 1
```

**Healthy LTV:CAC = 3:1 or higher**

---

## STEP 5: Compare to Industry Benchmarks

### SaaS Conversion Funnel Benchmarks

| Metric | Industry Average | TaxBridge (Your Data) | Status |
|--------|-----------------|---------------------|--------|
| **Visitor → Signup** | 2-5% | ______% | ✅ / ⚠️ / ❌ |
| **Visitor → Paid** | 0.5-2.0% | ______% | ✅ / ⚠️ / ❌ |
| **Signup → Paid** | 5-15% | ______% | ✅ / ⚠️ / ❌ |
| **MRR Growth** | 10-20%/month | ______% | ✅ / ⚠️ / ❌ |

**Status Key:**
- ✅ At or above benchmark
- ⚠️ Below benchmark but acceptable
- ❌ Critical - needs immediate optimization

---

## STEP 6: Identify Drop-Off Points

### Where Are We Losing Users?

**Check These Hypotheses:**

1. **Landing Page → Calculator**
   - Do visitors even click the calculator?
   - **Data:** Check Vercel top pages - is `/calculator` in top 3?
   - **Issue?** Landing page not compelling enough

2. **Calculator → Signup**
   - Do users complete calculator but not sign up?
   - **Data:** (Cannot measure without PostHog - see red flag below)
   - **Issue?** Calculator doesn't show enough value

3. **Signup → Paid**
   - Do users sign up but not upgrade?
   - **Data:** (Signups / Paid Customers) = ______%
   - **Benchmark:** Should be 5-15%
   - **Issue?** Pricing too high or free tier too generous

---

## EXPECTED RESULTS (Based on Production Status)

### Scenario 1: Site Just Went Live Recently
```
Visitors: 50-200
Signups: 5-20
Paid: 0-2
Conversion Rate: 0-1%
MRR: $0-$98
```

### Scenario 2: Site Has Been Down/Broken
```
Visitors: 10-50 (mostly internal team)
Signups: 0-5 (test accounts)
Paid: 0 (Stripe was in test mode)
Conversion Rate: 0%
MRR: $0
```

### Scenario 3: Site Has Real Traffic
```
Visitors: 200-500
Signups: 20-50
Paid: 2-5
Conversion Rate: 1-2%
MRR: $98-$245
```

**Most Likely:** Scenario 1 or 2 (based on production issues in previous sprints)

---

## RED FLAGS TO CHECK

### 🚩 Red Flag #1: Zero Traffic
**If Vercel shows <50 visitors in 30 days:**
- **Problem:** Site is not being promoted
- **Fix:** Reddit posts, LinkedIn shares, SEO content
- **Expected:** Should have 100+ visitors/day with basic marketing

### 🚩 Red Flag #2: High Bounce Rate
**If Vercel shows high page exits on calculator:**
- **Problem:** Calculator not engaging or has UX issues
- **Fix:** Session recordings (PostHog), user testing
- **Expected:** 50%+ should complete calculator

### 🚩 Red Flag #3: Signups But No Payments
**If Clerk shows 20+ signups but Stripe shows 0 payments:**
- **Problem:** Free tier too generous OR price objection OR payment flow broken
- **Fix:** Check Stripe integration, add upgrade prompts, A/B test pricing
- **Expected:** 5-15% of signups should convert to paid

### 🚩 Red Flag #4: Test Payments in Stripe
**If Stripe test mode has payments but live mode has 0:**
- **Problem:** Stripe keys not switched to production
- **Fix:** Update environment variables, redeploy
- **Expected:** ZERO test mode activity in production

---

## DELIVERABLE FORMAT

### Email to Engineering Team

**Subject:** Analytics Data Pull - Last 30 Days

**Body:**
```
Hey team,

Here are the actual numbers from our dashboards (last 30 days):

TRAFFIC (Vercel):
- Total Visitors: ______
- Top Page: ______ (______ views)
- Main Referrer: ______

SIGNUPS (Clerk):
- Total Signups: ______
- Email Verified: ______

REVENUE (Stripe):
- Mode: ✅ LIVE / ⚠️ TEST
- Paid Customers: ______
- Total Revenue: $______
- MRR: $______

CONVERSION RATES:
- Visitor → Signup: ______%
- Visitor → Paid: ______%
- Signup → Paid: ______%

RED FLAGS:
- [ ] Traffic too low (<100 visitors/day)
- [ ] No paid conversions (Stripe = $0)
- [ ] High signup but low conversion (free tier issue?)
- [ ] Stripe still in test mode

NEXT STEPS:
1. Fix analytics (GA4 + PostHog)
2. Focus on [traffic generation / conversion optimization / pricing]
3. Target: ______% conversion by end of month

Let me know if you need dashboard access.

- Michael
```

---

## TROUBLESHOOTING

### Issue: Can't Access Vercel Dashboard
**Solution:**
- Check email for Vercel invite
- Try: https://vercel.com/login
- Contact: Original person who deployed the site

### Issue: Can't Access Clerk Dashboard
**Solution:**
- Check email for Clerk invite
- Try: https://dashboard.clerk.com/
- Look for "TaxBridge" or "cross-border-tax" application

### Issue: Can't Access Stripe Dashboard
**Solution:**
- Check email for Stripe invite
- Try: https://dashboard.stripe.com/
- **CRITICAL:** Verify you're in LIVE MODE (not test mode)

### Issue: Vercel Shows 0 Visitors
**Possible Reasons:**
1. Analytics not enabled (need to upgrade Vercel plan)
2. Site was down during period
3. Wrong project selected
4. Date filter incorrect

**Solution:** Check deployment history, verify site is live

---

## TIMELINE

**Total Time:** 15-30 minutes

- Step 1 (Vercel): 5 min
- Step 2 (Clerk): 5 min
- Step 3 (Stripe): 5 min
- Step 4 (Calculations): 5 min
- Step 5 (Benchmarking): 5 min
- Step 6 (Analysis): 5 min

**Deliverable:** Email with actual numbers + identified red flags

---

**Created:** March 19, 2026
**Owner:** Michael Guo (CEO/CMO)
**Due:** TODAY (before EOD)
**Next Action:** Send results to engineering team for analytics fix prioritization
