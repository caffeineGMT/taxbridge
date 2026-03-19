# Pain-Point Headline A/B Test - Quick Reference

## 🎯 Test Overview
**3 Headline Variants Testing Pain Points:**
1. **Variant A:** "Save $5K+ on RSU Taxes" (💰 savings focus)
2. **Variant B:** "Cross-Border Tax Made Simple" (🎯 simplicity focus)
3. **Variant C:** "H1B/TN Workers: Calculate Your Tax Savings" (👥 audience + action)

**Goal:** 15%+ conversion rate lift | **Target:** 1,000+ visitors/variant | **Timeline:** 7 days

---

## 📊 Quick PostHog Analysis (5 Minutes)

### Step 1: Check if Tracking is Working (Day 1)
1. Go to PostHog → **Activity** → **Events**
2. Filter for event: `landing_page_viewed`
3. Look for property: `experimentName: "pain-point-headline-cro"`
4. **Expected:** You should see events firing with all 3 variants

### Step 2: Check Traffic Distribution (Day 2-3)
1. Go to **Insights** → **Trends**
2. Event: `landing_page_viewed`
3. Filter: `experimentName = "pain-point-headline-cro"`
4. **Breakdown by:** `headlineVariant`
5. **Expected:** ~33% each variant (A: 33%, B: 33%, C: 34%)

### Step 3: Calculate Conversion Rates (Day 5-7)
1. Go to **Insights** → **Funnels**
2. Create funnel:
   - **Step 1:** `landing_page_viewed` (filter: `experimentName = "pain-point-headline-cro"`)
   - **Step 2:** `cta_button_clicked` (filter: `experimentName = "pain-point-headline-cro"`)
3. **Breakdown by:** `headlineVariant`
4. **Read results:**
   - Variant A: __% conversion
   - Variant B: __% conversion
   - Variant C: __% conversion

### Step 4: Declare Winner
**Winner Criteria:**
- ✅ Highest conversion rate
- ✅ ≥15% lift vs lowest performer
- ✅ ≥1,000 visitors
- ✅ Statistically significant (PostHog shows confidence %)

---

## 🚀 What to Do After Test Completes

### If Clear Winner (≥15% lift):
1. **Update** `/app/page.tsx`: Replace test with winning headline hardcoded
2. **Remove** `/hooks/use-pain-point-headline-test.ts` (no longer needed)
3. **Document** learnings in `/docs/CRO_LEARNINGS.md`

### If No Clear Winner (<15% lift):
1. **Run longer:** Wait for 2,000+ visitors/variant
2. **Test new variants:** Try bolder messaging
3. **Check segments:** Maybe one variant wins for mobile vs desktop?

---

## 📈 Quick Math: Is It Working?

**Current Baseline (estimated):** 2.5% conversion rate

**Target with 15% lift:** 2.875% conversion rate

**At 500 daily visitors:**
- Baseline: 12.5 conversions/day
- With lift: 14.4 conversions/day
- **Gain:** +1.9 conversions/day = +57/month

**Revenue Impact @ $49/user:**
- Monthly: +$2,793
- Annual: +$33,516

---

## 🔍 Troubleshooting

**Problem:** No events showing in PostHog
- Check: Is production deployment live?
- Check: Is PostHog API key valid in `.env.production`?
- Check: Browser console for errors

**Problem:** Unequal traffic split
- Expected: 33/33/34 split may vary ±5% initially
- Action: Wait for 1,000+ total visitors, should equalize

**Problem:** Very low conversion rates (<1%)
- Check: Are users bouncing immediately? (check bounce rate)
- Check: Is calculator working? (test /dashboard manually)
- Check: Mobile responsive? (test on phone)

---

## 📞 Need Help?

**PostHog Dashboard:** [Your PostHog URL]
**Test Documentation:** `/docs/AB_TEST_PAIN_POINT_HEADLINE_CRO.md` (full details)
**Code Location:** `/hooks/use-pain-point-headline-test.ts` and `/app/page.tsx`

---

**Status:** ✅ LIVE (deployed with git push)
**Next Check-in:** Day 3 (verify 1,000+ visitors)
**Final Analysis:** Day 7 (declare winner)
