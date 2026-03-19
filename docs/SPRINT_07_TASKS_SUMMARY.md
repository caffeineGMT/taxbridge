# Sprint 07 - Quick Task Reference

**Created:** March 19, 2026
**Total Tasks:** 13 (6 P0-CRITICAL, 4 P1-HIGH, 3 P2-MEDIUM)
**Timeline:** 5-7 days (35-50 hours)
**Full Report:** See `SPRINT_07_CEO_AUDIT.md`

---

## 🔴 P0-CRITICAL (MUST FIX BEFORE LAUNCH)

### Task 1: Fix Build Failures [Due: Mar 20, 6pm]
**ID:** b8de338e
**Time:** 2-4 hours
- Fix ESLint circular dependency in .eslintrc.json
- Clean .next cache and rebuild
- Verify build passes with zero errors
- **Blocker:** Cannot deploy to production

### Task 2: Activate Stripe Live Mode [Due: Mar 20, 8pm]
**ID:** 6be7e1fd
**Time:** 2-3 hours
- Create Stripe live account, run `npm run setup:stripe`
- Update all env vars with live sk_live_* and pk_live_* keys
- Test $1 checkout, verify webhooks
- **Blocker:** ZERO revenue capability

### Task 3: Remove 188 console.log statements [Due: Mar 21, 12pm]
**ID:** 19cd6728
**Time:** 4-6 hours
- Remove all console.logs (PII exposure risk)
- Replace with Pino/Winston structured logging
- Add ESLint no-console rule
- **Blocker:** GDPR/CCPA security violation risk

### Task 4: Fix npm vulnerabilities [Due: Mar 21, 4pm]
**ID:** 9ed7bfed
**Time:** 3-5 hours
- Fix 2 CRITICAL (form-data, request), 2 HIGH, 11 MODERATE
- Run `npm audit fix --force`, review breaking changes
- Replace unmaintained packages
- **Blocker:** Exploitable security holes

### Task 5: Optimize build size 845MB → <150MB [Due: Mar 22, 12pm]
**ID:** 2a6007eb
**Time:** 6-8 hours
- Analyze bundle, lazy load Recharts charts
- Enable Next.js experimental optimizePackageImports
- Compress images, remove unused deps
- **Blocker:** 5-10 min deployments, OOM errors

### Task 6: Fix E2E test infrastructure [Due: Mar 21, 8pm]
**ID:** d79e1f66
**Time:** 1-2 hours
- Fix global-setup.ts:26 race condition
- Remove navigation or add retry logic
- Verify 100% pass rate (currently 0%)
- **Blocker:** Unknown production bugs

---

## 🟠 P1-HIGH (FIX BEFORE MARKETING)

### Task 7: Remove 9 placeholder tracking IDs [Due: Mar 22, 6pm]
**ID:** 41f18d1a
**Time:** 2 hours
- Replace AW-XXXXXXXXXX with real Google Ads IDs
- OR remove all placeholders if not launching ads
- **Impact:** Wasting ad spend

### Task 8: Set up Lighthouse CI [Due: Mar 23, 4pm]
**ID:** eb5837d1
**Time:** 4-5 hours
- Install @lhci/cli, create .lighthouserc.js
- Set up GitHub Actions workflow
- Target: Performance >85, Accessibility >95
- **Impact:** Unknown Core Web Vitals, poor SEO

### Task 9: Accessibility WCAG 2.1 AA [Due: Mar 24, 6pm]
**ID:** 5bcf1313
**Time:** 8-10 hours
- Increase ARIA coverage from 10.8% to 90%+
- Test with VoiceOver/NVDA, add keyboard nav
- **Impact:** Screen reader users cannot use product

### Task 10: Add API error handling [Due: Mar 24, 8pm]
**ID:** b999f17e
**Time:** 6-8 hours
- Wrap all 87 API routes in try/catch
- Add Sentry error tracking
- **Impact:** Production crashes

---

## 🔵 P2-MEDIUM (POLISH)

### Task 11: Review 34 TODO/FIXME comments [Due: Mar 25, 6pm]
**ID:** 8e49422a
**Time:** 2-3 hours

### Task 12: Image optimization [Due: Mar 26, 4pm]
**ID:** 263c1de5
**Time:** 2-3 hours

### Task 13: Bundle optimization (365KB chunk) [Due: Mar 27, 4pm]
**ID:** 71ee988e
**Time:** 3-4 hours

---

## ✅ LAUNCH GATES (ALL MUST BE GREEN)

- [ ] Build passes with zero errors
- [ ] Stripe in LIVE MODE with tested checkout
- [ ] Zero critical/high npm vulnerabilities
- [ ] .next build size <150MB
- [ ] E2E tests 100% passing
- [ ] Lighthouse Performance >85
- [ ] Lighthouse Accessibility >95
- [ ] Zero console.log statements
- [ ] All API routes have error handling

---

## OVERALL GRADE

**Current:** D+ (68/100) — NOT PRODUCTION-READY
**Target:** B+ (85/100) — PRODUCTION-READY

**DO NOT LAUNCH until all P0 tasks are complete.**
