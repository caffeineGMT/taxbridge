# 🚀 Product Hunt Launch Tracking Dashboard

**Launch Date:** March 19, 2026
**Product:** TaxBridge
**URL:** https://www.producthunt.com/posts/taxbridge (update after submission)
**UTM Campaign:** `?utm_source=producthunt&utm_medium=launch&utm_campaign=hunt2026`

---

## 📊 REAL-TIME METRICS

Update hourly during first 24 hours, then every 4 hours for next 48 hours.

### Hour-by-Hour Tracking

| Time (PT) | Upvotes | Comments | Website Visits | Signups | Paid Conversions | Revenue |
|-----------|---------|----------|----------------|---------|------------------|---------|
| 12:01 AM  | -       | -        | -              | -       | -                | $0      |
| 1:00 AM   | -       | -        | -              | -       | -                | $0      |
| 2:00 AM   | -       | -        | -              | -       | -                | $0      |
| 8:00 AM   | -       | -        | -              | -       | -                | $0      |
| 12:00 PM  | -       | -        | -              | -       | -                | $0      |
| 6:00 PM   | -       | -        | -              | -       | -                | $0      |
| 11:59 PM  | -       | -        | -              | -       | -                | $0      |

**Update this table manually by:**
1. Check Product Hunt page for upvotes/comments
2. Check Google Analytics for visitors (filter by utm_source=producthunt)
3. Check PostHog for signups (filter by referrer=producthunt)
4. Check Stripe dashboard for paid conversions with HUNT20 code

---

## 🎯 SUCCESS METRICS (24 Hours)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Upvotes** | 100+ | - | 🔴 Not Started |
| **Comments** | 20+ | - | 🔴 Not Started |
| **Website Visits** | 500+ | - | 🔴 Not Started |
| **Signups** | 50+ | - | 🔴 Not Started |
| **Paid Conversions** | 10+ | - | 🔴 Not Started |
| **Revenue (HUNT20)** | $2,390+ | $0 | 🔴 Not Started |
| **Avg Response Time** | <6 hours | - | 🔴 Not Started |

**Status Key:** 🔴 Not Started | 🟡 In Progress | 🟢 Target Met | 🟣 Exceeded

---

## 💬 COMMENT RESPONSE SLA TRACKER

**SLA:** Respond within 6 hours of comment posted
**Current Status:** 0/0 comments responded within SLA (N/A)

### Active Comments Needing Response

| Comment # | Author | Posted At | Deadline (6h) | Status | Priority |
|-----------|--------|-----------|---------------|--------|----------|
| - | - | - | - | ✅ No pending | Low |

**How to track:**
1. When a new comment appears, add row to table above
2. Calculate deadline = posted_at + 6 hours
3. Respond before deadline
4. Mark as ✅ when responded
5. Update `comment-sla-tracker.json` file

---

## 🔗 UTM TRACKING LINKS

Use these links for all Product Hunt-related promotion:

**Primary Product Hunt Link:**
```
https://taxbridge.vercel.app?utm_source=producthunt&utm_medium=launch&utm_campaign=hunt2026
```

**Calculator Direct Link:**
```
https://taxbridge.vercel.app/us-canada-tax-calculator?utm_source=producthunt&utm_medium=launch&utm_campaign=hunt2026
```

**Pricing Page (with HUNT20 promo):**
```
https://taxbridge.vercel.app/pricing?utm_source=producthunt&utm_medium=launch&utm_campaign=hunt2026&promo=HUNT20
```

**How to track in PostHog:**
1. Go to PostHog dashboard
2. Filter events by: `utm_source = producthunt`
3. View funnel: Landing → Calculator → Signup → Payment
4. Export data hourly for this dashboard

**How to track in Google Analytics:**
1. Acquisition → Campaigns → All Campaigns
2. Filter by Campaign = "hunt2026"
3. Check Users, Sessions, Bounce Rate, Conversions

---

## 📈 CONVERSION FUNNEL

Track drop-off at each stage:

| Stage | Count | Conversion % | Notes |
|-------|-------|--------------|-------|
| 1. PH Click | - | 100% | Baseline |
| 2. Landing View | - | -% | GA pageview |
| 3. Calculator Start | - | -% | PostHog event |
| 4. Calculator Complete | - | -% | PostHog event |
| 5. Signup | - | -% | PostHog event |
| 6. Payment | - | -% | Stripe + PostHog |

**Goal:** >15% conversion from PH click → Signup

---

## 🏆 RANKING TRACKER

| Metric | Current | Goal | Status |
|--------|---------|------|--------|
| Product of the Day Rank | - | Top 5 | - |
| Category Rank (Productivity) | - | Top 3 | - |
| Upvotes vs. #1 Product | - | Within 50 | - |

**Check ranking:** https://www.producthunt.com/leaderboard/daily/2026/3/19

---

## 🚨 ALERTS & THRESHOLDS

Monitor these and take action if thresholds crossed:

| Alert | Threshold | Action | Status |
|-------|-----------|--------|--------|
| Low upvote rate | <10 upvotes in first 2 hours | Email beta users, post on LinkedIn/Twitter | 🟢 OK |
| High bounce rate | >70% bounce from PH | Check site speed, fix homepage | 🟢 OK |
| Comment response delay | >4 hours to respond | Set phone alarm, drop everything to respond | 🟢 OK |
| Site down | HTTP 500 or timeout | Check Vercel, rollback deployment | 🟢 OK |
| Payment failure | HUNT20 not working | Fix Stripe promo code immediately | 🟢 OK |

---

## 📝 QUALITATIVE FEEDBACK

Track themes in comments:

### Positive Feedback
- [ ] "This solves a real problem"
- [ ] "Love the clean UI"
- [ ] "Pricing is fair"
- [ ] Other: ________________

### Negative Feedback / Feature Requests
- [ ] "Needs support for [country]"
- [ ] "Missing [feature]"
- [ ] "Too expensive"
- [ ] Other: ________________

### Questions Asked (for FAQ)
- [ ] "How does FTC optimizer work?"
- [ ] "Is my data secure?"
- [ ] "Do you support [feature]?"
- [ ] Other: ________________

---

## 📊 TRAFFIC SOURCES FROM PRODUCT HUNT

| Source | Clicks | Conversions | Notes |
|--------|--------|-------------|-------|
| Direct PH page | - | - | Main launch page |
| Twitter shares | - | - | Track via utm_medium=social |
| LinkedIn shares | - | - | Track via utm_medium=social |
| Email to PH voters | - | - | Track via utm_medium=email |
| PH newsletter | - | - | If featured |

---

## 🎬 NEXT STEPS BASED ON RESULTS

**If hitting targets (>100 upvotes in 24h):**
- [ ] Screenshot ranking and share on LinkedIn
- [ ] Email all beta users with "We're #X Product of the Day!"
- [ ] Write blog post about launch experience
- [ ] Reach out to tech press for coverage

**If underperforming (<50 upvotes in 24h):**
- [ ] Analyze what went wrong (timing? messaging? audience?)
- [ ] Focus on other channels (SEO, Reddit, paid ads)
- [ ] Don't over-invest in Product Hunt follow-up

**Regardless of outcome:**
- [ ] Thank every person who engaged
- [ ] Save all feedback for product roadmap
- [ ] Calculate true CAC and LTV from this channel
- [ ] Document learnings in `PRODUCT_HUNT_POSTMORTEM.md`

---

## 📁 FILES TO UPDATE

During launch, keep these files updated:

1. **This file** (`tracking-dashboard.md`) - Update hourly metrics
2. `comment-sla-tracker.json` - Log every comment + response time
3. `PRODUCT_HUNT_POSTMORTEM.md` - Write within 48h of launch end
4. PostHog events - Ensure all events are firing correctly
5. Stripe dashboard - Monitor HUNT20 promo code usage

---

**🚀 LAUNCH STATUS: NOT STARTED**

**Update this status when you submit:** LIVE | MONITORING | COMPLETED
