# Sprint 13 - Quick Reference (Emergency Card)

**🚨 PRODUCTION CRISIS: Site DOWN for 5 consecutive sprints (35+ days)**

---

## THE SITUATION

- **Status:** 000 Connection Refused at taxbridgecpa.com
- **Revenue:** $0 (Stripe in test mode)
- **Impact:** $15K-$30K estimated loss
- **Action:** EMERGENCY ALL-HANDS

---

## TOP 4 PRIORITIES (BLOCKING REVENUE)

### 1. Fix Production Site (2-4 hrs) - DUE: TOMORROW 8AM
- Check Vercel dashboard
- Verify DNS settings
- Test SSL certificate
- Redeploy if needed

### 2. Activate Stripe (2 hrs) - DUE: THU EOD
- Get live keys from dashboard.stripe.com
- Run scripts/activate-stripe-production-annual.ts
- Create webhook
- Test with 4242 card, refund

### 3. Fix TypeScript (4-6 hrs) - DUE: FRI EOD
- 78 new errors (regression from 0)
- Add missing logger imports
- Fix variable names (req → request)
- Run `npx tsc --noEmit` to verify

### 4. PostgreSQL Migration (12-16 hrs) - DUE: SAT EOD
- SQLite won't scale to $1M ARR
- Set up Vercel Postgres
- Migrate 888KB database
- Test all queries

---

## TASK IDS (FOR SCHEDULER)

- **P0 #1:** af7cd1a0 (Production site)
- **P0 #2:** f50256fe (Stripe)
- **P0 #3:** 324e9127 (TypeScript)
- **P0 #4:** 396dfe28 (PostgreSQL)
- **P1 #5:** ff77cb8a (Console.logs)
- **P1 #6:** d7a6ee28 (Build size)
- **P1 #7:** 9e388f35 (Lighthouse)
- **P1 #8:** 08860a3c (E2E tests)
- **P2 #9:** 9701be6f (TODOs)
- **P2 #10:** aee2d5e0 (ARIA)

---

## DAILY STANDUP

**Time:** 9:00 AM PST starting March 20
**Focus:** Deployment fix progress
**Questions:**
1. Production site status?
2. Blockers?
3. ETA to revenue?

---

## SUCCESS = REVENUE UNBLOCKED

✅ Site live (200 OK)
✅ Stripe production tested
✅ First $49 customer possible

**Every day delayed = $400-$850 lost**

---

**Print this. Keep on desk. Check hourly.**
