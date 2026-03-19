# EVIDENCE AUDIT - QUICK REFERENCE
**Date:** March 19, 2026
**Status:** 🔴 CRITICAL FAILURE - 97% of tasks lack evidence

---

## 📊 THE NUMBERS

| Metric | Value |
|--------|-------|
| Tasks Claimed Done | 200+ |
| Tasks With Evidence | 6 (3%) |
| Tasks Falsely Marked Done | 194+ (97%) |
| Revenue Generated | $0 |
| Opportunity Cost | $40,000+ |

---

## 🔥 TOP 5 WORST OFFENDERS

1. **Stripe Production** - Claimed 10×, still in test mode, $40K lost
2. **Product Hunt Launch** - Claimed 10×, never launched, 0 growth
3. **Production Site Fix** - Claimed 5×, down 2+ months, 100% bounce
4. **PostHog Tracking** - Claimed 3×, placeholder keys, 0 data
5. **Google Ads** - Claimed 4×, placeholder IDs, 0 paid traffic

---

## ✅ ONLY 6 TASKS PROPERLY VERIFIED

1. Production Site Verification (March 19)
2. Free Tier Increase (1→10 RSU)
3. Clerk Auth Verification
4. Session Recording Analysis
5. Competitor Teardown
6. Build Quality Gate

**Success Rate:** 3%

---

## 🎯 IMMEDIATE ACTIONS

### TODAY (March 19)
- ✅ Audit complete
- ⚠️ Broadcast policy to engineers
- ⚠️ Mark 194 tasks INCOMPLETE
- ⚠️ Freeze "done" status

### By March 20 (P0 Tasks)
1. Verify Stripe production mode
2. Verify Clerk authentication
3. Verify PostHog tracking
4. Verify Sentry monitoring
5. Verify SendGrid email
6. Verify build quality
7. Verify npm security
8. Verify production site health

### By March 22 (P1 Tasks)
9. Verify Playwright E2E tests
10. Verify unit tests
11. Verify accessibility (WCAG 2.1 AA)
12. Verify mobile responsiveness
13. Verify cross-browser testing
14. Verify Lighthouse performance
15. Verify PostHog funnels

### By March 25 (P2 Tasks)
16. Verify SEO infrastructure
17. Verify 42 blog articles live
18. Launch Product Hunt
19. Launch Google Ads
20. Activate email drip campaign

---

## 📋 EVIDENCE REQUIREMENTS

### P0-CRITICAL (All 7 Required)
1. ✅ Code committed to Git
2. ✅ Pushed to GitHub
3. ✅ Deployed to production
4. ✅ HTTP 200 verification
5. ✅ Screenshots (desktop+mobile)
6. ✅ Verification report
7. ✅ Evidence committed

### P1-HIGH (5 of 7 Required)
1. ✅ Code committed
2. ✅ Production deploy
3. ✅ Screenshots OR logs
4. ✅ Verification report
5. ✅ HTTP 200 check

### P2/P3 (3 of 7 Required)
1. ✅ Code committed
2. ✅ Production deploy
3. ✅ Screenshot OR logs

---

## 🚀 HOW TO COMPLETE A TASK

### Automated (Recommended)
```bash
npm run verify:task -- \
  --task-id=P0-STRIPE \
  --feature-url=/pricing \
  --title="Stripe Production Mode"
```

### Manual Checklist
```
- [ ] Code committed to Git
- [ ] Pushed to GitHub (git push origin main)
- [ ] Deployed to production (Vercel auto-deploy)
- [ ] Production URL verified (HTTP 200)
- [ ] Screenshots captured (desktop + mobile if UI)
- [ ] Verification report generated
- [ ] Evidence committed to docs/
- [ ] Commit message includes "+ VERIFICATION"
```

---

## 📚 DOCUMENTS

**Read These:**
- `docs/TASK_COMPLETION_POLICY.md` - Full policy (mandatory)
- `docs/EVIDENCE_AUDIT_2026-03-19.md` - Full audit report (23 pages)
- `docs/EVIDENCE_AUDIT_EXECUTIVE_SUMMARY.md` - Executive summary (5 pages)
- `docs/TASK_RE_ASSIGNMENT_LIST.md` - 21 tasks to re-verify (15 pages)

**Use These:**
- `npm run verify:task` - Automated verification
- `scripts/verify-*.ts` - Verification scripts
- `docs/EVIDENCE_TEMPLATE.md` - Evidence report template

**Evidence Locations:**
- `docs/screenshots/` - Screenshot evidence
- `docs/verification-reports/` - Verification reports
- `docs/logs/` - Build/test/deployment logs

---

## 🚦 ENFORCEMENT

**Starting Immediately:**
- ❌ No tasks marked "done" without evidence
- ❌ PRs rejected without verification report
- ❌ Commits blocked if build fails (pre-commit hook)
- ✅ Weekly CEO evidence audit

**Compliance Targets:**
- Week 1: 50%
- Week 2: 80%
- Week 3: 100%

---

## 💡 EXAMPLES

### ✅ GOOD: Task with Evidence
```
Commit: [P0-STRIPE] Stripe Production Mode + VERIFICATION

Files:
  .env.production (sk_live_... keys)
  docs/screenshots/stripe-[DATE]/dashboard-live.png
  docs/screenshots/stripe-[DATE]/test-payment.png
  docs/verification-reports/stripe-[DATE].md

Report:
  ✅ HTTP 200: https://taxbridge.vercel.app/pricing
  ✅ Test payment: tx_abc123 ($1.00 charged)
  ✅ Build: PASSED
```

### ❌ BAD: Task without Evidence
```
Commit: "Enable Stripe production mode"

Files:
  .env.production (1 line)

Evidence: NONE

Result: REJECTED ❌
```

---

## ❓ FAQ

**Q: What if I already completed a task?**
A: It's now INCOMPLETE. Re-do with evidence or provide evidence retroactively.

**Q: Can I provide evidence retroactively?**
A: YES - if live in production, capture screenshots/logs now.

**Q: What if automated verification fails?**
A: Use manual checklist. Document why automation failed.

**Q: Do backend tasks need screenshots?**
A: YES - screenshot API response, DB state, or logs.

**Q: Can I skip verification for quick fixes?**
A: NO - Every task requires evidence.

---

## 🚨 BOTTOM LINE

**No evidence = Not done**

**Period.**

---

**Document:** `docs/EVIDENCE_AUDIT_QUICK_REFERENCE.md`
**Full Audit:** `docs/EVIDENCE_AUDIT_2026-03-19.md`
**Policy:** `docs/TASK_COMPLETION_POLICY.md`
**Re-Assignment:** `docs/TASK_RE_ASSIGNMENT_LIST.md`

**Effective:** March 19, 2026
**Enforcement:** MANDATORY
