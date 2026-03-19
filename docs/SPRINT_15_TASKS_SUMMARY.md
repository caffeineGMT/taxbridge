# Sprint 15 Tasks - Quick Reference

**Sprint Goal:** ACTIVATE REVENUE + OPTIMIZE CONVERSION
**Timeline:** March 19-28, 2026 (10 days)
**Total Tasks:** 14
**Total Time:** 48 hours

---

## 🔴 P0-CRITICAL (3 tasks, 2.75 hours, Due: March 20)

### 1. Fix Production SEO Metadata Bug ⏱️ 30min
- **Issue:** Homepage shows "Nigeria e-invoicing platform" instead of "cross-border tax calculator"
- **Impact:** Google SEO + social sharing broken
- **Fix:** Force rebuild, verify metadata in production
- **Verification:** `curl -s https://taxbridge.vercel.app/ | grep description`

### 2. Replace Stripe Production Keys ⏱️ 2hrs
- **Variables:** 6 (SECRET_KEY, WEBHOOK_SECRET, BASIC/PRO/ENTERPRISE PRICE_IDs)
- **Impact:** REVENUE BLOCKER - $0 MRR until fixed
- **Deliverable:** Screenshot of successful test payment

### 3. Create PNG OG Image ⏱️ 15min
- **Issue:** `/og-image.png` missing (only SVG exists)
- **Impact:** Broken social previews (Twitter, LinkedIn, Facebook)
- **Fix:** Convert `og-image.svg` → `og-image.png` (1200x630px)
- **Verification:** Test Twitter card validator

---

## 🟠 P1-HIGH (5 tasks, 11.75 hours, Due: March 22-24)

### 4. Replace Clerk Production Keys ⏱️ 30min
- **Variables:** 2 (SECRET_KEY, WEBHOOK_SECRET)
- **Impact:** User authentication for paid features
- **Due:** March 22

### 5. Implement Live Savings Counter ⏱️ 4hrs
- **Pattern:** SimpleTax real-time tax savings display
- **Code:** Ready in docs/COMPETITOR_UX_IMPLEMENTATION_GUIDE.md
- **Impact:** +25% calculator completion rate
- **File:** `components/LiveSavingsCounter.tsx` (new)
- **Due:** March 23

### 6. Add API Error Handling ⏱️ 3hrs
- **Routes:** 10 without try/catch
- **Risk:** Production crashes on edge cases
- **Files:** user-interview, social-media/track, enterprise/demo-request, referrals/* (6), rsu/bulk, admin/pricing-experiment-stats, partners/* (2)
- **Due:** March 23

### 7. Activate PostHog Session Recording ⏱️ 15min
- **Replace:** `YOUR_PROJECT_ID` with real key
- **Impact:** Conversion funnel analysis enabled
- **Due:** March 22

### 8. Activate Sentry Error Monitoring ⏱️ 15min
- **Replace:** `YOUR_SENTRY_AUTH_TOKEN` + org/project
- **Impact:** Real-time error alerts
- **Due:** March 22

---

## 🔵 P2-MEDIUM (5 tasks, 15.5 hours, Due: March 25-28)

### 9. Implement Interview Wizard ⏱️ 8hrs
- **Pattern:** TurboTax one-question-at-a-time flow
- **Impact:** +30-40% mobile completion rate
- **Route:** `/calculator/wizard` (new)
- **Due:** March 26

### 10. Add Urgency Messaging ⏱️ 3hrs
- **Components:** Countdown timer, social proof counter
- **Location:** /pricing page
- **Impact:** +20-30% pricing→checkout conversion
- **Due:** March 25

### 11. Add Exit-Intent Popup ⏱️ 2hrs
- **Message:** "Wait! Get 20% off" when user tries to leave
- **Impact:** Recover 10-15% abandoning users
- **Due:** March 25

### 12. Integrate Live Chat ⏱️ 2hrs
- **Options:** Crisp ($25/mo) or Tawk.to (free)
- **Impact:** +5-10% conversion (answer questions real-time)
- **Due:** March 27

### 13. Create /api/health Endpoint ⏱️ 30min
- **Current:** 404
- **Checks:** DB connection, env vars loaded
- **Impact:** Uptime monitoring, proactive outages
- **Due:** March 28

---

## ⚪ P3-LOW (1 task, 16-24 hours, Due: March 30)

### 14. Improve ARIA Accessibility ⏱️ 2-3 days
- **Current:** 27 components (18% coverage)
- **Target:** 120+ components (80% coverage)
- **Impact:** WCAG 2.1 AA compliance, enterprise readiness
- **Attributes:** aria-label, role, aria-describedby

---

## 📊 SPRINT METRICS

### Time Breakdown:
- **P0-CRITICAL:** 2.75 hours (immediate revenue unblocking)
- **P1-HIGH:** 11.75 hours (conversion optimization)
- **P2-MEDIUM:** 15.5 hours (UX polish)
- **P3-LOW:** 16-24 hours (accessibility)
- **TOTAL:** 46-54 hours (1-1.5 weeks of engineering)

### Expected Impact:
- **Conversion Rate:** 1.5% → 3-6% (+100-300%)
- **MRR:** $0 → $1,200-$2,000
- **Grade:** B+ (85) → A- (90)

### Week-by-Week Plan:
- **Week 1 (Mar 19-21):** All P0s + P1s #4, #7, #8 = Revenue activated
- **Week 2 (Mar 22-25):** P1s #5, #6 + P2s #10, #11 = Conversion optimized
- **Week 3 (Mar 26-28):** P2s #9, #12, #13 = UX polished
- **Week 4 (Mar 29-30):** P3 #14 (optional, if time permits)

---

## 🚀 MILESTONE GATES

### Gate 1: Revenue Activation (March 20, EOD)
✅ Stripe production keys replaced
✅ Test payment successful
✅ SEO metadata fixed
✅ OG images working
**→ Ready to accept real payments**

### Gate 2: Conversion Baseline (March 23, EOD)
✅ PostHog + Sentry active
✅ Live savings counter deployed
✅ API error handling added
**→ Tracking real conversion data**

### Gate 3: UX Optimization (March 26, EOD)
✅ Urgency messaging live
✅ Exit-intent popup active
✅ Interview wizard deployed
**→ Competitor-level UX achieved**

### Gate 4: Product Hunt Ready (March 28, EOD)
✅ Live chat support active
✅ Health monitoring configured
✅ All P0/P1 tasks complete
**→ Cleared for Product Hunt launch**

---

## 🎯 SUCCESS CRITERIA

**Sprint 15 is successful if:**
1. ✅ First real payment received (Stripe live)
2. ✅ Conversion rate increases by 50%+ (1.5% → 2.25%+)
3. ✅ 3+ competitor UX patterns deployed (live counter, urgency, exit-intent)
4. ✅ Zero production crashes (error handling added)
5. ✅ Real-time analytics active (PostHog + Sentry)

**Bonus Success:**
- 🌟 MRR > $1,000 in Week 1
- 🌟 Conversion rate > 4% by end of sprint
- 🌟 Product Hunt launch scheduled

---

## 📁 KEY FILES

### Documentation:
- `docs/SPRINT_15_CEO_AUDIT.md` - Full audit (this summary's source)
- `docs/COMPETITOR_UX_IMPLEMENTATION_GUIDE.md` - Ready-to-deploy code
- `docs/SESSION_RECORDING_ANALYSIS_FINAL_SUMMARY.md` - Pricing shock analysis
- `.env.production` - 28 placeholder variables

### Code to Update:
- `app/api/user-interview/route.ts` - Add error handling
- `app/api/social-media/track/route.ts` - Add error handling
- `app/api/enterprise/demo-request/route.ts` - Add error handling
- `app/api/referrals/track-click/route.ts` - Add error handling
- `app/api/referrals/track-share/route.ts` - Add error handling
- `app/api/referrals/stats/route.ts` - Add error handling
- `app/api/rsu/bulk/route.ts` - Add error handling
- `app/api/admin/pricing-experiment-stats/route.ts` - Add error handling
- `app/api/partners/metrics/route.ts` - Add error handling
- `app/api/partners/route.ts` - Add error handling

### Components to Create:
- `components/LiveSavingsCounter.tsx` - Real-time savings display
- `components/InterviewWizard.tsx` - One-question-at-a-time flow
- `components/UrgencyTimer.tsx` - Countdown for pricing page
- `components/ExitIntentPopup.tsx` - Discount offer on exit
- `app/api/health/route.ts` - Health check endpoint

---

## 🎓 QUICK WINS (Do First)

### 15-Minute Wins:
1. Create PNG OG image (Task #3)
2. Activate PostHog (Task #7)
3. Activate Sentry (Task #8)

### 30-Minute Wins:
4. Fix SEO metadata (Task #1)
5. Replace Clerk keys (Task #4)
6. Create health endpoint (Task #13)

### 2-Hour Wins:
7. Replace Stripe keys (Task #2)
8. Add exit-intent popup (Task #11)
9. Integrate live chat (Task #12)

**Total Quick Wins:** 9 tasks, 8 hours, MASSIVE impact

---

For detailed task descriptions, see `docs/SPRINT_15_CEO_AUDIT.md`.
